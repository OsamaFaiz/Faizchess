# DEVELOPMENT ROADMAP — Chess Mate

This roadmap follows the phased execution order from the Master Development Prompt, preserving the existing UI design while replacing all prototype/simulated logic with production implementations.

---

## Current Environment Readiness Check (Observed 2026-11-24)
- **Available Locally:** Node.js `v24.16.0`, pnpm `12.15.0`, npm `11.13.0`, Git, Java `24.0.2`.
- **Missing Locally (Needed for Later Phases):**
  - Android SDK (`ANDROID_HOME` / `adb` / `gradle` not found; `%LOCALAPPDATA%\Android\Sdk` absent) — required for Phase 2/7/14 local APK/AAB builds and native Kotlin testing.
  - Docker / PostgreSQL / Redis (`docker`, `psql`, `redis-server` not found) — required for Phase 8/9/15 local backend & DB execution.
  - Two physical Android devices — required for Phase 7 & Phase 14 real Bluetooth and Wi-Fi Direct verification.

---

## Phased Execution Plan

### Phase 1 — Codebase Audit & Architecture *(Current Phase)*
- Inspect all existing files, UI tokens, components, screens, chess logic, and simulated flows.
- Produce `PROJECT_AUDIT.md`, `SYSTEM_ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_DOCUMENTATION.md`, `DEVELOPMENT_ROADMAP.md`.

### Phase 2 — Monorepo & Expo Android Foundation
- Initialize pnpm workspace (`apps/mobile`, `apps/backend`, `packages/shared`) while preserving existing web prototype reference until migration parity is verified.
- Configure Expo Custom Dev Client (`expo-dev-client`), `app.json` / `app.config.ts` (package name, adaptive icon, splash screen, Android permissions), `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, and Android `BackHandler`.
- Load `Manrope`, `Playfair Display`, and `Noto Sans Symbols 2` via `expo-font`.

### Phase 3 — UI Migration (100% Visual Parity)
- Port Dark & Light theme tokens, typography, and `ui.tsx` primitives.
- Port `Board.tsx`, `Piece.tsx`, `Chart.tsx`, `MatchRow.tsx`, `TimePicker.tsx` using RN + SVG + Reanimated.
- Port all 15 screens (`Splash`, `Onboarding`, `Home`, `PlayModes`, `AISetup`, `LocalSetup`, `Nearby`, `Game`, `Result`, `Review`, `Profile`, `Stats`, `Learn`, `Lesson`, `Settings`) to React Navigation without altering layout, colors, or flows.

### Phase 4 — Complete Chess Engine & SQLite Offline Persistence
- Build `@chess-mate/shared` chess service over `chess.js`: legal moves, castling, en passant, promotion, check/checkmate, stalemate, threefold repetition, insufficient material, 50-move and 75-move rules, SAN/FEN, PGN import/export, undo/redo, active-game crash recovery.
- Implement `expo-sqlite` schema & repositories for settings, guest/user profile, games, moves, lessons, and achievements.

### Phase 5 — Stockfish AI Integration (Offline)
- Bundle Stockfish binary/JNI via custom Android Kotlin NativeModule (`StockfishModule`) running on a background thread.
- Wire UCI protocol for all 6 difficulty levels (`Beginner` → `Master`), configurable thinking time, Hints, and `Review.tsx` centipawn/mate evaluation bar.
- Document Stockfish GPLv3 licensing & attribution.

### Phase 6 — Real Same-Device Pass & Play
- Wire `LocalSetup` → `Game` → `Result` → `Review` with SQLite persistence, auto-flip, clocks, captured pieces, rematch, and computed local statistics.

### Phase 7 — Real Nearby Multiplayer (Bluetooth & Wi-Fi Direct)
- Implement native Kotlin modules: `BluetoothClassicModule` (RFCOMM) and `WifiDirectModule` (`WifiP2pManager` + TCP socket).
- Handle Android 12/13+ runtime permissions cleanly.
- Connect the existing 7-step `Nearby.tsx` UI and `Game.tsx` to real peer discovery, hosting, request accept/reject, ready handshake, live validated move sync, disconnect overlay, and reconnection recovery.
- Verify end-to-end on two physical Android devices without internet.

### Phase 8 — NestJS Backend & PostgreSQL / Prisma
- Implement all 13 NestJS modules, Prisma schema (16 tables), migrations, seed scripts (`Achievement` catalog), Swagger docs, DTO validation, rate limiting, and health check.

### Phase 9 — Online Multiplayer Gateway
- Implement Socket.IO Gateway with JWT auth, Redis presence, matchmaking queues, private rooms with 6-char codes, game invitations, server-authoritative move/clock validation, and 45s reconnection recovery.
- Connect `PlayModes` Online card to a UI-consistent Online Lobby modal/flow.

### Phase 10 — Authentication, Profiles & Statistics
- Implement email/password auth, Argon2 hashing, JWT + refresh token rotation (`expo-secure-store`), password reset, profile editing (`Profile.tsx` edit action), and live database-backed statistics (`Stats.tsx` real mode & color win rates, real streaks).

### Phase 11 — Learning & Puzzle Modules
- Expand/verify all 18+ lessons, piece movement demos, openings, checkmates, and daily puzzles with real chess.js validation and SQLite/cloud progress tracking.

### Phase 12 — Offline Data Synchronization
- Implement `SyncService` with `NetInfo`, `sync_queue` exponential backoff, `operationId` idempotency, guest-to-account migration option, and non-blocking UI sync status indicator.

### Phase 13 — Security Hardening & Automated Testing
- Mobile unit/component/navigation/SQLite/AI tests (Jest + React Native Testing Library).
- Backend unit, integration, auth, DB transaction, and WebSocket e2e tests.
- Security review (token storage, input validation, server move authority, replay protection).

### Phase 14 — Android Builds (APK / AAB) & Deployment
- Configure `Dockerfile`, `docker-compose.yml`, `.env.example`, backup & deployment docs.
- Generate Debug APK, Release APK, and Play Store Release AAB via Gradle/EAS, and execute full device QA checklist.

