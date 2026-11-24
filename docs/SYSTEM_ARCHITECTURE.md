# SYSTEM ARCHITECTURE — Chess Mate

## 1. High-Level Monorepo Architecture

```text
chess-mate/
├── apps/
│   ├── mobile/                 # React Native + Expo Custom Dev Client (Android)
│   │   ├── android/            # Prebuilt native Android project (Kotlin modules, Stockfish JNI, BLE/RFCOMM, Wi-Fi P2P)
│   │   └── src/
│   │       ├── ai/             # Stockfish UCI bridge & lifecycle manager
│   │       ├── assets/         # Fonts (Manrope, Playfair Display, Noto Sans Symbols 2), audio, splash/icons
│   │       ├── chess/          # Wrapper over @chess-mate/shared + chess.js (PGN, 75-move, undo/redo)
│   │       ├── components/     # Pixel-faithful RN ports of Board, Piece, Chart, MatchRow, TimePicker, ui
│   │       ├── database/       # SQLite schema, migrations, repositories, sync outbox
│   │       ├── hooks/          # Network state, AppState lifecycle, BackHandler, KeepAwake
│   │       ├── multiplayer/
│   │       │   ├── transport.ts        # Unified Transport interface
│   │       │   ├── bluetooth/          # Android Bluetooth Classic RFCOMM / BLE Gatt transport
│   │       │   ├── wifi-direct/        # Android WifiP2pManager + local TCP socket transport
│   │       │   └── online/             # Socket.IO client + REST API client
│   │       ├── navigation/     # React Navigation native stack + bottom tabs matching existing 15 screens
│   │       ├── screens/        # All 15 screens + Auth / Online Lobby modals preserving existing UI
│   │       ├── services/       # Audio, Haptics, SyncService, AuthService
│   │       ├── store/          # Zustand slices (auth, settings, game, stats, sync, nearby)
│   │       └── theme/          # Dark/Light design tokens from src/index.css
│   └── backend/                # NestJS Modular Monolith
│       ├── prisma/             # PostgreSQL schema, migrations, seed
│       ├── src/
│       │   ├── common/         # Guards, decorators, filters, interceptors, rate limiting, logging
│       │   ├── config/         # Typed env validation (Zod/Joi)
│       │   ├── database/       # PrismaService + RedisService
│       │   ├── gateways/       # Online chess & presence WebSocket Gateway
│       │   └── modules/        # 13 domain modules (Auth, Users, Profiles, Games, etc.)
│       └── test/               # Jest unit & e2e integration tests
├── packages/
│   └── shared/                 # Pure TypeScript shared across mobile & backend
│       ├── chess/              # Move validation, 75-move rule, PGN helpers, Elo formula
│       ├── constants/          # Time controls, AI levels, board/piece enums, achievement defs
│       └── types/              # DTO contracts, WS event payloads, P2P wire protocol
├── docs/                       # Audit, Architecture, DB Schema, API Docs, Roadmap
├── docker-compose.yml          # PostgreSQL 16 + Redis 7 + NestJS API
└── package.json                # pnpm workspace configuration
```

---

## 2. Mobile Application Architecture (`apps/mobile`)

### 2.1 Offline-First Data Flow
1. **Immediate Local Persistence:** Every game played (AI, Pass & Play, Nearby, Lessons) writes directly to **SQLite (`expo-sqlite`)** without requiring network connectivity or login.
2. **Guest Mode by Default:** First launch after Onboarding enters a local Guest profile stored in SQLite. Users can optionally sign in or register later and trigger an idempotent sync of eligible offline games.
3. **Sync Outbox (`sync_queue` table):** Local mutations (completed games, lesson completions, settings updates, rating snapshots) receive a client-generated `operationId` (UUIDv4). When `@react-native-community/netinfo` detects connectivity and valid auth tokens exist in `expo-secure-store`, `SyncService` flushes queued items idempotently to the NestJS API.

### 2.2 State Management (Zustand)
- `useAppStore`: Onboarding flag, theme (`dark` | `light`), active user / guest identity, network & sync status.
- `useSettingsStore`: Persisted in SQLite `local_settings`, synchronized to server when authenticated. Controls board theme, piece style, coordinates, sound, music, haptics, legal moves, auto-queen, default time control, keep-awake, language, preferred nearby link.
- `useGameStore`: Active `Chess` engine instance, move history (`san`, `fen`, timestamps), undo/redo stacks, clocks (`wMs`, `bMs`), hint state, pause/resign/draw state, connection state for nearby/online modes.
- `useAuthStore`: Auth state (`guest` | `authenticated`), profile summary, token refresh coordinator (tokens stored exclusively in `expo-secure-store`).

### 2.3 Chess & Stockfish Engine Architecture
- **Rules & Notation:** `@chess-mate/shared` wraps `chess.js` and adds explicit 75-move rule draw detection (if `halfmoveClock >= 150` and not checkmate), PGN import/export, and deterministic move replay.
- **Stockfish Native Engine:**
  - Embedded Stockfish engine compiled for Android ABIs (`arm64-v8a`, `armeabi-v7a`, `x86_64`) exposed via a Kotlin TurboModule/NativeModule (`StockfishModule`) running on a dedicated background thread (`ExecutorService` / native thread) with stdin/stdout UCI streams.
  - **Lifecycle:** Initialized lazily on AI/Hint/Review demand; emits `uciok` / `readyok`; properly `stop`s search on navigation/backgrounding and `quit`s on cleanup.
  - **Difficulty Mapping:** Maps all 6 UI levels (`Beginner` 400 → `Master` 2400) to `UCI_LimitStrength`, `UCI_Elo` / `Skill Level` (0–20), search `depth`, and `movetime` ms.

### 2.4 Real Offline Device-to-Device Multiplayer (Bluetooth & Wi-Fi Direct)
Both transports implement a single TypeScript interface `NearbyTransport`:
```ts
interface NearbyTransport {
  startAdvertising(hostMeta: PeerMeta): Promise<void>;
  stopAdvertising(): Promise<void>;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  requestConnection(peerId: string): Promise<void>;
  acceptConnection(peerId: string): Promise<void>;
  rejectConnection(peerId: string): Promise<void>;
  send(packet: NearbyPacket): Promise<void>;
  disconnect(): Promise<void>;
  onEvent(cb: (event: TransportEvent) => void): () => void;
}
```
- **Bluetooth Transport (`Kotlin BluetoothClassicModule`):** Uses `BluetoothAdapter`, `BluetoothServerSocket.listenUsingRfcommWithServiceRecord` (host), `BluetoothDevice.createRfcommSocketToServiceRecord` (client) with a dedicated Chess Mate service UUID, plus runtime permission handling for Android 12+ (`BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_ADVERTISE`) and Android ≤11 (`ACCESS_FINE_LOCATION`).
- **Wi-Fi Direct Transport (`Kotlin WifiDirectModule`):** Uses Android `WifiP2pManager` (`discoverPeers`, `connect`, `requestConnectionInfo`) to establish group owner (GO) IP (`192.168.49.1`) and opens a framing TCP `ServerSocket`/`Socket` over port `8988`, requesting `NEARBY_WIFI_DEVICES` (Android 13+) or `ACCESS_FINE_LOCATION` (Android ≤12).
- **Wire Protocol (`NearbyPacket`):** Length-prefixed JSON frames with monotonic `seq` numbers, `HELLO`, `READY`, `START`, `MOVE { from, to, promotion, san, fen, seq, clockMs }`, `MOVE_ACK { seq }`, `DRAW_OFFER`, `DRAW_RESPONSE`, `RESIGN`, `PAUSE`, `PING`/`PONG`, and `SYNC_STATE` (full move list + FEN + clocks for reconnection recovery).
- **Validation:** Every incoming `MOVE` packet is verified for turn ownership, sequence monotonicity (`seq === expectedSeq`), and legality via `chess.js` before updating state; invalid or out-of-turn packets are rejected and trigger `SYNC_STATE`.

---

## 3. Backend Architecture (`apps/backend` — NestJS)

### 3.1 Modular Layout
1. `AuthModule`: Register, login, Argon2 password hashing, JWT access tokens (15m), opaque refresh tokens with rotation & reuse detection, logout / logout-all, password reset tokens.
2. `UsersModule`: Account lookup, guest-to-registered upgrade, search players.
3. `ProfilesModule`: Avatar, handle, bio, display name updates.
4. `GamesModule`: Server-authoritative game creation, move validation via `chess.js`, clock enforcement, draw/resign/timeout resolution, PGN generation.
5. `GameHistoryModule`: Paginated match history, full move list retrieval, offline match sync ingestion (`operationId` idempotency).
6. `MatchmakingModule`: Redis-backed rating-bucket queue (`1+0`, `3+0`, `5+0`, `10+0`, `15+10`, `30+0`), match pairing, timeout expansion.
7. `FriendsModule`: Friend requests (send/accept/decline), friend list, online status visibility.
8. `RoomsModule`: Private room creation with 6-char invite codes (`ABC123`), join room, game invitations, room expiration in Redis.
9. `RatingsModule`: Transactional Elo rating calculation, peak rating updates, rating history series.
10. `AchievementsModule`: Rule evaluator run on game completion (First Blood, On Fire, Speed Demon, Giant Slayer, etc.).
11. `StatisticsModule`: Aggregated W/D/L, mode breakdown, White vs Black win rates, streaks.
12. `NotificationsModule`: In-app notifications & game/friend invites over WebSocket + REST read-state.
13. `HealthModule`: `/api/v1/health` checking PostgreSQL & Redis connectivity.

### 3.2 Real-Time WebSocket Architecture & Server Authority
- **Gateway (`/ws` namespace):** Authenticated during handshake via JWT (`socket.handshake.auth.token`).
- **Presence & Room State in Redis:** Active user sockets (`presence:user:{id}`), matchmaking queues (`mm:queue:{timeControl}`), and active game clocks/grace timers live in Redis so state survives restarts/scaling.
- **Authoritative Validation:** Clients submit `{ gameId, from, to, promotion, clientMoveSeq }`. The server acquires a per-game Redis lock, loads authoritative FEN/turn/clocks, validates turn + elapsed clock + `chess.js` legality, persists `GameMove` + updated clocks inside PostgreSQL/Redis, and broadcasts `game:move_applied` to both players.
- **Reconnection:** Disconnecting starts a 45-second grace timer; if the player reconnects within the grace window, `game:sync_state` restores full moves, FEN, and remaining clocks.

---

## 4. Security Architecture

- **Passwords:** Argon2id hashing (`argon2` package).
- **Tokens:** Short-lived JWT access tokens (RS256/HS256 via env secret) + cryptographically random 64-byte refresh tokens stored hashed (SHA-256) in `RefreshToken` table with family rotation; reuse of a rotated token revokes the entire session family.
- **API Hardening:** `@nestjs/throttler` rate limiting, global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`, Helmet headers, CORS allowlist, parameterized Prisma queries, zero secrets committed or bundled in mobile app.

