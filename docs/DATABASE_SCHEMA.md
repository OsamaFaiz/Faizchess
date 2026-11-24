# DATABASE SCHEMA — Chess Mate

Chess Mate uses **PostgreSQL + Prisma ORM** for the backend cloud database and **SQLite (`expo-sqlite`)** on Android for offline-first storage and synchronization.

---

## 1. PostgreSQL Schema (Prisma)

All primary keys use `UUID` (`@id @default(uuid())`). All entities include `createdAt` and `updatedAt` timestamps where mutable, explicit foreign keys, cascading deletes where appropriate, and composite indexes for hot queries.

### Core Models (16 Required Tables)

1. **`User`**
   - `id` (UUID PK), `email` (unique), `passwordHash`, `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`
2. **`UserProfile`**
   - `id` (UUID PK), `userId` (UUID unique FK -> `User` onDelete Cascade), `username` (unique), `displayName`, `initials`, `avatarUrl`, `hue` (Int), `bio`, `createdAt`, `updatedAt`
3. **`UserSettings`**
   - `id` (UUID PK), `userId` (UUID unique FK -> `User` onDelete Cascade), `theme` (`dark` | `light`), `boardTheme`, `pieceStyle`, `language`, `defaultTime`, `sound` (Bool), `music` (Bool), `vibration` (Bool), `showLegal` (Bool), `showCoords` (Bool), `autoQueen` (Bool), `offlineAi` (Bool), `autoReconnect` (Bool), `keepAwake` (Bool), `preferredLink` (`bluetooth` | `wifi`), `updatedAt`
4. **`RefreshToken`**
   - `id` (UUID PK), `userId` (UUID FK -> `User` onDelete Cascade), `tokenHash` (unique), `familyId` (UUID), `deviceInfo`, `expiresAt`, `revokedAt`, `replacedByTokenId`, `createdAt`
   - Index: `(userId, revokedAt)`, `(familyId)`
5. **`Game`**
   - `id` (UUID PK), `clientOperationId` (UUID nullable unique — for idempotent offline sync), `mode` (`AI` | `LOCAL` | `NEARBY` | `ONLINE`), `status` (`WAITING` | `ACTIVE` | `PAUSED` | `COMPLETED` | `ABORTED`), `timeControl`, `baseSeconds` (Int nullable), `incrementSeconds` (Int), `initialFen`, `currentFen`, `pgn`, `winnerColor` (`w` | `b` | `draw` | null), `terminationReason` (`CHECKMATE` | `STALEMATE` | `RESIGNATION` | `TIMEOUT` | `AGREEMENT` | `INSUFFICIENT_MATERIAL` | `THREEFOLD_REPETITION` | `FIFTY_MOVE_RULE` | `SEVENTY_FIVE_MOVE_RULE` | `DISCONNECTED` | null), `totalMoves` (Int), `durationSeconds` (Int), `startedAt`, `endedAt`, `createdAt`, `updatedAt`
   - Index: `(status, createdAt)`, `(mode, endedAt)`
6. **`GamePlayer`**
   - `id` (UUID PK), `gameId` (UUID FK -> `Game` onDelete Cascade), `userId` (UUID nullable FK -> `User` onDelete SetNull), `guestName` (nullable), `color` (`w` | `b`), `isBot` (Bool), `botLevel` (nullable), `ratingBefore` (Int nullable), `ratingAfter` (Int nullable), `ratingDelta` (Int nullable), `remainingMs` (Int nullable), `result` (`WIN` | `LOSS` | `DRAW` | null), `capturesCount` (Int), `checksCount` (Int)
   - Unique: `(gameId, color)`
   - Index: `(userId, gameId)`
7. **`GameMove`** (Normalized relational move table — never stored as an unstructured JSON blob)
   - `id` (UUID PK), `gameId` (UUID FK -> `Game` onDelete Cascade), `ply` (Int), `moveNumber` (Int), `color` (`w` | `b`), `fromSquare`, `toSquare`, `promotion` (nullable), `san`, `lan`, `fenAfter`, `capturedPiece` (nullable), `isCheck` (Bool), `isCheckmate` (Bool), `clockAfterMs` (Int nullable), `playedAt`
   - Unique: `(gameId, ply)`
   - Index: `(gameId, moveNumber)`
8. **`GameRoom`**
   - `id` (UUID PK), `code` (unique 6-char uppercase), `hostUserId` (UUID FK -> `User`), `guestUserId` (UUID nullable FK -> `User`), `gameId` (UUID nullable unique FK -> `Game`), `timeControl`, `hostColor` (`w` | `b` | `random`), `status` (`OPEN` | `MATCHED` | `STARTED` | `EXPIRED` | `CLOSED`), `expiresAt`, `createdAt`, `updatedAt`
   - Index: `(status, expiresAt)`
9. **`GameInvitation`**
   - `id` (UUID PK), `roomId` (UUID FK -> `GameRoom` onDelete Cascade), `senderId` (UUID FK -> `User`), `recipientId` (UUID FK -> `User`), `status` (`PENDING` | `ACCEPTED` | `DECLINED` | `EXPIRED`), `expiresAt`, `createdAt`, `updatedAt`
   - Index: `(recipientId, status)`
10. **`FriendRequest`**
    - `id` (UUID PK), `senderId` (UUID FK -> `User` onDelete Cascade), `receiverId` (UUID FK -> `User` onDelete Cascade), `status` (`PENDING` | `ACCEPTED` | `DECLINED` | `CANCELED`), `createdAt`, `updatedAt`
    - Unique: `(senderId, receiverId)`
    - Index: `(receiverId, status)`
11. **`Friend`**
    - `id` (UUID PK), `userId` (UUID FK -> `User` onDelete Cascade), `friendId` (UUID FK -> `User` onDelete Cascade), `createdAt`
    - Unique: `(userId, friendId)`
12. **`PlayerRating`**
    - `id` (UUID PK), `userId` (UUID FK -> `User` onDelete Cascade), `category` (`OVERALL` | `BULLET` | `BLITZ` | `RAPID` | `CLASSICAL`), `rating` (Int default 1200), `peakRating` (Int default 1200), `gamesPlayed` (Int default 0), `updatedAt`, `createdAt`
    - Unique: `(userId, category)`
    - Additional `RatingHistory` or query via `GamePlayer`: `PlayerRating` stores current & peak; historical points derive transactionally from `GamePlayer` (`ratingAfter`, `endedAt`) or an indexed snapshot.
13. **`GameStatistics`**
    - `id` (UUID PK), `userId` (UUID unique FK -> `User` onDelete Cascade), `totalGames`, `wins`, `losses`, `draws`, `whiteGames`, `whiteWins`, `blackGames`, `blackWins`, `aiGames`, `aiWins`, `localGames`, `localWins`, `nearbyGames`, `nearbyWins`, `onlineGames`, `onlineWins`, `puzzlesSolved`, `lessonsCompleted`, `currentStreak`, `bestStreak`, `updatedAt`, `createdAt`
14. **`Achievement`**
    - `id` (UUID PK), `code` (unique — e.g. `first_blood`, `on_fire`, `tactician`, `off_the_grid`, `speed_demon`, `giant_slayer`, `iron_wall`, `scholar`), `name`, `description`, `icon`, `criteriaJson`
15. **`UserAchievement`**
    - `id` (UUID PK), `userId` (UUID FK -> `User` onDelete Cascade), `achievementId` (UUID FK -> `Achievement` onDelete Cascade), `unlockedAt`
    - Unique: `(userId, achievementId)`
16. **`Notification`**
    - `id` (UUID PK), `userId` (UUID FK -> `User` onDelete Cascade), `type` (`FRIEND_REQUEST` | `GAME_INVITE` | `ACHIEVEMENT` | `SYSTEM`), `title`, `body`, `payload` (JsonB nullable), `readAt` (nullable), `createdAt`
    - Index: `(userId, readAt, createdAt)`

---

## 2. Transaction-Safe Game Completion

When an online game ends (or an offline game is synced), `GamesService.completeGame()` executes inside `prisma.$transaction(async (tx) => { ... })`:
1. Lock/verify `Game.status !== 'COMPLETED'` (prevents double-awarding ratings/stats).
2. Update `Game` (`status = COMPLETED`, `winnerColor`, `terminationReason`, `pgn`, `durationSeconds`, `endedAt`).
3. Update both `GamePlayer` rows (`result`, `ratingBefore`, `ratingAfter`, `ratingDelta`).
4. Update `PlayerRating` (`rating`, `peakRating`, `gamesPlayed`) for ranked modes.
5. Increment `GameStatistics` counters (`totalGames`, `wins`/`losses`/`draws`, mode counters, color counters, `currentStreak`, `bestStreak`).
6. Evaluate & insert newly unlocked `UserAchievement` + `Notification` rows.

---

## 3. Android Local SQLite Schema (`apps/mobile`)

SQLite mirrors core offline entities and adds a synchronization outbox:

- `local_profile` (`id`, `user_id`, `is_guest`, `username`, `display_name`, `initials`, `hue`, `rating`, `best_rating`, `created_at`, `updated_at`)
- `local_settings` (`id`, `theme`, `board_theme`, `piece_style`, `language`, `default_time`, `sound`, `music`, `vibration`, `show_legal`, `show_coords`, `auto_queen`, `offline_ai`, `auto_reconnect`, `keep_awake`, `preferred_link`, `onboarded`, `updated_at`)
- `local_games` (`id`, `operation_id`, `server_game_id`, `mode`, `opponent_name`, `opponent_rating`, `my_color`, `result`, `reason`, `moves_count`, `duration_seconds`, `rating_delta`, `time_control`, `initial_fen`, `final_fen`, `pgn`, `white_captures`, `black_captures`, `checks_count`, `sync_status` [`PENDING` | `SYNCED` | `FAILED`], `created_at`, `ended_at`)
- `local_game_moves` (`id`, `game_id`, `ply`, `color`, `from_sq`, `to_sq`, `promotion`, `san`, `fen_after`, `clock_after_ms`)
- `local_lesson_progress` (`lesson_id` PK, `completed`, `completed_at`, `synced`)
- `local_achievements` (`code` PK, `unlocked`, `unlocked_at`)
- `sync_queue` (`id` PK, `operation_id` UNIQUE, `entity_type`, `entity_id`, `payload_json`, `attempts`, `last_error`, `next_retry_at`, `created_at`)

