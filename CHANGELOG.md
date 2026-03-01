# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.5] - 2026-03-01

### Fixed
- Root cause fix: dual Yjs instance causing meta map corruption — server ESM `import` and y-websocket CJS `require` loaded separate Yjs copies, causing title data to be lost during sync/persistence. Now both use CJS via `createRequire` to share one Yjs instance

## [1.1.4] - 2026-03-01

### Fixed
- Document title not loading on re-open — switched from meta map observer to ydoc-level update listener which reliably fires on WebSocket sync

## [1.1.3] - 2026-03-01

### Fixed
- Document title reverts to "Untitled" on re-open — added provider sync listener to re-read title after initial WebSocket sync completes

## [1.1.2] - 2026-03-01

### Fixed
- Renamed document title not reflected in toolbar breadcrumb and home page list (falsy empty string checks)
- `/api/docs` endpoint now reads title from live in-memory doc instead of stale S3 data

## [1.1.1] - 2026-03-01

### Fixed
- Document title could not be renamed — clearing the name snapped back to "Untitled" due to falsy empty string check (`||` → `??`)

## [1.1.0] - 2026-02-27

### Added
- ECS Fargate deployment with ALB for production hosting
- CloudFormation template (ECR, ECS cluster, task definition, ALB, IAM roles)
- GitHub Actions CI/CD workflow (build, push to ECR, deploy to ECS)
- Multi-stage Dockerfile bundling frontend static files into server container
- Server serves frontend static files at `/collab/` with SPA fallback
- WebSocket `/ws/` path stripping for ALB-compatible routing
- Auto-detect `ws://` vs `wss://` protocol for WebSocket connections

### Removed
- Old server-only Dockerfile (replaced by root multi-stage Dockerfile)

## [1.0.0] - 2026-02-26

### Added
- Real-time collaborative document editing with BlockNote + Yjs
- WebSocket server with y-websocket for CRDT sync
- S3 persistence for durable document storage (survives redeployments)
- Editable document titles stored in Yjs shared map (real-time sync)
- Document list page with S3-backed listing (`GET /api/docs`)
- Delete documents from home page (`DELETE /api/docs/:id`)
- Live presence avatars showing online collaborators
- Copy link button for sharing documents
- Platform-consistent UI matching s3-file-manager design system
