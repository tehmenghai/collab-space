import http from "node:http";
import { WebSocketServer } from "ws";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import * as Y from "yjs";

// y-websocket/bin/utils handles Yjs doc management, persistence, and sync
// @ts-expect-error — no type declarations
import { setupWSConnection, setPersistence, docs } from "y-websocket/bin/utils";

const PORT = parseInt(process.env.PORT || "4444", 10);
const BUCKET = process.env.S3_BUCKET || "mhteh-my-work-space";
const S3_PREFIX = "collab-docs/";
const REGION = process.env.AWS_REGION || "ap-southeast-1";

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

async function saveToS3(docName: string, ydoc: Y.Doc): Promise<void> {
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
  bindState: async (docName: string, ydoc: Y.Doc) => {
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
  writeState: async (docName: string, ydoc: Y.Doc) => {
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
          const data = await loadFromS3(id);
          if (data) {
            const tempDoc = new Y.Doc();
            Y.applyUpdate(tempDoc, data);
            title = tempDoc.getMap("meta").get("title") as string | undefined ?? null;
            tempDoc.destroy();
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

  res.writeHead(200);
  res.end("Collab Space WebSocket Server");
});

// --- WebSocket ---

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", setupWSConnection);

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`S3 persistence: s3://${BUCKET}/${S3_PREFIX}`);
});
