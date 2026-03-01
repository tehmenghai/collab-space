import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { WebSocketServer } from "ws";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

import type { Doc } from "yjs";

// Use createRequire to load yjs via CJS — same instance as y-websocket
// This avoids the "Yjs was already imported" dual-instance bug
const require = createRequire(import.meta.url);
const Y = require("yjs") as typeof import("yjs");

// y-websocket/bin/utils handles Yjs doc management, persistence, and sync
const { setupWSConnection, setPersistence, docs } = require("y-websocket/bin/utils") as {
  setupWSConnection: (conn: import("ws").WebSocket, req: http.IncomingMessage) => void;
  setPersistence: (persistence: { provider: null; bindState: (docName: string, ydoc: import("yjs").Doc) => Promise<void>; writeState: (docName: string, ydoc: import("yjs").Doc) => Promise<void> }) => void;
  docs: Map<string, import("yjs").Doc>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const PORT = parseInt(process.env.PORT || "4444", 10);
const BUCKET = process.env.S3_BUCKET || "mhteh-my-work-space";
const S3_PREFIX = "collab-docs/";
const REGION = process.env.AWS_REGION || "ap-southeast-1";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const s3 = new S3Client({ region: REGION });

// --- S3 Persistence ---

async function loadFromS3(docName: string): Promise<Uint8Array | null> {
  try {
    const res = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: `${S3_PREFIX}${docName}` })
    );
    const body = await res.Body?.transformToByteArray();
    return body ? new Uint8Array(body) : null;
  } catch (err: any) {
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

async function saveToS3(docName: string, ydoc: Doc): Promise<void> {
  const update = Y.encodeStateAsUpdate(ydoc);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${S3_PREFIX}${docName}`,
      Body: update,
      ContentType: "application/octet-stream",
    })
  );
}

async function deleteFromS3(docName: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: `${S3_PREFIX}${docName}` })
  );
}

// Disable LevelDB — we use custom S3 persistence
delete process.env.YPERSISTENCE;

setPersistence({
  provider: null,
  bindState: async (docName: string, ydoc: Doc) => {
    const stored = await loadFromS3(docName);
    if (stored) {
      Y.applyUpdate(ydoc, stored);
    }
    // Save to S3 on every update (debounced)
    let timer: ReturnType<typeof setTimeout> | null = null;
    ydoc.on("update", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveToS3(docName, ydoc).catch((err) =>
          console.error(`Failed to save ${docName} to S3:`, err)
        );
      }, 2000);
    });
  },
  writeState: async (docName: string, ydoc: Doc) => {
    await saveToS3(docName, ydoc);
  },
});

// --- HTTP Server ---

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // GET /api/docs — list all documents from S3
  if (req.method === "GET" && req.url === "/api/docs") {
    try {
      const list = await s3.send(
        new ListObjectsV2Command({ Bucket: BUCKET, Prefix: S3_PREFIX })
      );
      const results: { id: string; title: string | null; lastModified: string | null }[] = [];

      for (const obj of list.Contents || []) {
        const id = obj.Key!.replace(S3_PREFIX, "");
        if (!id) continue;

        let title: string | null = null;
        try {
          // Prefer live in-memory doc (has unsaved changes) over S3
          const liveDoc = docs.get(id);
          if (liveDoc) {
            title = liveDoc.getMap("meta").get("title") as string | undefined ?? null;
          } else {
            const data = await loadFromS3(id);
            if (data) {
              const tempDoc = new Y.Doc();
              Y.applyUpdate(tempDoc, data);
              title = tempDoc.getMap("meta").get("title") as string | undefined ?? null;
              tempDoc.destroy();
            }
          }
        } catch {
          // skip title extraction on error
        }

        results.push({
          id,
          title,
          lastModified: obj.LastModified?.toISOString() ?? null,
        });
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
    } catch (err) {
      console.error("Failed to list docs:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to list documents" }));
    }
    return;
  }

  // DELETE /api/docs/:id — delete a document
  const deleteMatch = req.method === "DELETE" && req.url?.match(/^\/api\/docs\/(.+)$/);
  if (deleteMatch) {
    const docId = decodeURIComponent(deleteMatch[1]);
    try {
      // Remove from in-memory docs map
      const inMemDoc = docs.get(docId);
      if (inMemDoc) {
        inMemDoc.destroy();
        docs.delete(docId);
      }
      // Remove from S3
      await deleteFromS3(docId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error(`Failed to delete doc ${docId}:`, err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to delete document" }));
    }
    return;
  }

  // Serve static frontend files at /collab/
  if (req.method === "GET" && req.url?.startsWith("/collab")) {
    const urlPath = req.url.split("?")[0];
    const relativePath = urlPath.replace(/^\/collab\/?/, "");
    let filePath = path.join(PUBLIC_DIR, relativePath);

    // Try to serve the exact file
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback: serve index.html for any /collab/* route
    const indexPath = path.join(PUBLIC_DIR, "index.html");
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
  }

  res.writeHead(404);
  res.end("Not Found");
});

// --- WebSocket ---

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  // Strip /ws/ prefix so y-websocket receives the doc ID as the room name
  if (request.url?.startsWith("/ws/")) {
    request.url = "/" + request.url.slice(4);
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", setupWSConnection);

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`S3 persistence: s3://${BUCKET}/${S3_PREFIX}`);
});
