# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
