# Collab Space — Project Guide

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must use this format:

```
<type>: <short description>

<optional body with more detail>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Commit Types

| Type | When to use | Version bump |
|------|-------------|--------------|
| `feat` | New feature or capability | **MINOR** (x.Y.0) |
| `fix` | Bug fix | **PATCH** (x.y.Z) |
| `refactor` | Code restructure, no behavior change | **PATCH** (x.y.Z) |
| `style` | UI/CSS changes only | **PATCH** (x.y.Z) |
| `docs` | Documentation only | No bump |
| `chore` | Build, config, dependencies | No bump |
| `perf` | Performance improvement | **PATCH** (x.y.Z) |
| `test` | Adding or fixing tests | No bump |

**Breaking changes:** Add `BREAKING CHANGE:` in the commit body or `!` after type (e.g., `feat!:`). This triggers a **MAJOR** bump (X.0.0).

### Examples
```
feat: add document titles with real-time sync
fix: WebSocket reconnection failing on page refresh
refactor: extract S3 persistence into separate module
style: match UI to platform design system
chore: update yjs to v13.7
```

## Versioning (Semantic Versioning)

Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, incompatible API changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward-compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, small improvements, refactors

### Version Bump Checklist (must do ALL of these)

1. Update `version` in `package.json`
2. Add new section to `CHANGELOG.md` with date and changes
3. Commit with appropriate type prefix
4. Tag the commit: `git tag vX.Y.Z`
5. Push with tags: `git push && git push origin vX.Y.Z`

## Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/). New entries go at the top, below the header:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features
```

Only include sections that have entries. Use past tense or imperative mood consistently.

## Project Structure
```
packages/
  frontend/         — React + Vite SPA (BlockNote editor, Yjs collab)
    src/
      components/   — Editor, Toolbar, PresenceAvatars
      routes/       — Home, Document pages
      hooks/        — useYjsProvider, usePresence
      lib/          — Yjs setup, colors, names
  server/           — Node.js WebSocket server (y-websocket + S3 persistence)
    src/index.ts    — HTTP + WS server, S3 CRUD, REST API
package.json        — Workspace root (version source of truth)
CHANGELOG.md        — Release notes
CLAUDE.md           — This file
```

## Architecture
- **Frontend:** React SPA served via Vite (base path `/collab/`)
- **Server:** Node.js HTTP + WebSocket server on port 4444
- **Collaboration:** Yjs CRDT with y-websocket provider
- **Persistence:** S3 (`s3://mhteh-my-work-space/collab-docs/{docId}`)
- **Gateway:** Served through gateway on port 3000 (proxies `/collab/` → Vite, `/ws/` → WS server, `/api/` → REST API)
