# API DOCUMENTATION — Chess Mate

**Base URL:** `/api/v1`  
**Protocol:** HTTPS REST + Socket.IO WebSockets (`/ws`)  
**Swagger Docs:** `/api/docs`  
**Standard Error Format:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["validation error message"],
  "timestamp": "2026-11-24T18:00:00.000Z",
  "path": "/api/v1/..."
}
```

---

## 1. REST Endpoints

### Health (`/health`)
- `GET /api/v1/health` — Public. Returns `{ status: "ok", db: "up", redis: "up", timestamp }`.

### Auth (`/auth`) — Rate-limited
- `POST /api/v1/auth/register` — Body: `{ email, password, username, displayName, guestMatchOperationIds? }`. Returns `{ user, accessToken, refreshToken }`.
- `POST /api/v1/auth/login` — Body: `{ email, password, deviceInfo? }`. Returns `{ user, accessToken, refreshToken }`.
- `POST /api/v1/auth/refresh` — Body: `{ refreshToken }`. Rotates refresh token; returns new `{ accessToken, refreshToken }`.
- `POST /api/v1/auth/logout` — Auth required. Body: `{ refreshToken }`. Revokes current session.
- `POST /api/v1/auth/logout-all` — Auth required. Revokes all user refresh token families.
- `POST /api/v1/auth/password-reset/request` — Body: `{ email }`. Issues time-limited reset token.
- `POST /api/v1/auth/password-reset/confirm` — Body: `{ token, newPassword }`.

### Users & Profiles (`/users`, `/profiles`)
- `GET /api/v1/users/me` — Auth required. Returns user + profile + current ratings.
- `GET /api/v1/users/search?q=...` — Auth required. Search players by username.
- `PATCH /api/v1/profiles/me` — Auth required. Body: `{ displayName?, username?, bio?, hue?, avatarUrl? }`.
- `GET /api/v1/profiles/:username` — Auth required. Public profile & summary stats.

### Settings (`/settings`)
- `GET /api/v1/settings` — Auth required. Returns `UserSettings`.
- `PATCH /api/v1/settings` — Auth required. Updates theme, board, pieces, toggles, preferred link.

### Games & History (`/games`, `/history`)
- `POST /api/v1/games/sync` — Auth required. Idempotent ingestion of completed offline games (`AI`, `LOCAL`, `NEARBY`). Body: `{ operationId, mode, timeControl, myColor, opponentName, opponentRating?, result, reason, durationSeconds, moves: [...], startedAt, endedAt }`. Returns `{ gameId, alreadySynced, ratingDelta, newRating }`.
- `GET /api/v1/history?cursor=...&limit=20&mode=...` — Auth required. Paginated match history.
- `GET /api/v1/games/:id` — Auth required. Full game details, `GamePlayer`s, normalized `GameMove`s, and PGN.
- `GET /api/v1/games/:id/pgn` — Auth required. Downloads `.pgn` text.

### Rooms & Invitations (`/rooms`)
- `POST /api/v1/rooms` — Auth required. Body: `{ timeControl, hostColor }`. Creates 6-char room code (`code`).
- `POST /api/v1/rooms/:code/join` — Auth required. Joins an open private room and initializes an active `Game`.
- `DELETE /api/v1/rooms/:code` — Auth required (host only). Closes room.
- `POST /api/v1/rooms/:code/invite` — Auth required. Body: `{ friendUserId }`. Creates `GameInvitation` + sends WS notification.
- `POST /api/v1/rooms/invitations/:id/respond` — Auth required. Body: `{ accept: boolean }`.

### Friends (`/friends`)
- `GET /api/v1/friends` — Auth required. Returns friends with live online presence (`online` | `in_game` | `offline`).
- `GET /api/v1/friends/requests` — Auth required. Incoming & outgoing pending requests.
- `POST /api/v1/friends/requests` — Auth required. Body: `{ username }`.
- `POST /api/v1/friends/requests/:id/respond` — Auth required. Body: `{ accept: boolean }`.
- `DELETE /api/v1/friends/:friendId` — Auth required.

### Statistics, Ratings, Achievements & Notifications
- `GET /api/v1/statistics/me?range=1M|3M|6M|ALL` — Auth required. Returns totals, W/D/L, mode breakdown, White vs Black win rates, streaks.
- `GET /api/v1/ratings/me?range=1M|3M|6M` — Auth required. Current rating, peak rating, progression points.
- `GET /api/v1/achievements/me` — Auth required. All achievements with `unlocked` + `unlockedAt`.
- `GET /api/v1/notifications` — Auth required. List notifications.
- `PATCH /api/v1/notifications/:id/read` — Auth required. Mark notification read.

---

## 2. WebSocket Events (`/ws` Namespace)

**Authentication:** Client connects with `auth: { token: "<JWT>" }`. Unauthenticated sockets are rejected immediately.

### Client → Server Events
| Event | Payload | Description |
|---|---|---|
| `presence:heartbeat` | `{}` | Refreshes Redis presence TTL. |
| `matchmaking:join` | `{ timeControl: string }` | Enters Redis matchmaking queue. |
| `matchmaking:leave` | `{}` | Leaves queue. |
| `room:subscribe` | `{ code: string }` | Joins private room channel. |
| `game:join` | `{ gameId: string }` | Subscribes to active match room & requests full state. |
| `game:move` | `{ gameId, from, to, promotion?, clientMoveSeq }` | Submits move for server-authoritative `chess.js` + clock validation. |
| `game:draw_offer` | `{ gameId }` | Sends draw offer to opponent. |
| `game:draw_respond` | `{ gameId, accept: boolean }` | Accepts or declines draw offer. |
| `game:resign` | `{ gameId }` | Resigns active match. |

### Server → Client Events
| Event | Payload | Description |
|---|---|---|
| `matchmaking:queued` | `{ timeControl, queuedAt }` | Confirms queue entry. |
| `matchmaking:matched` | `{ gameId, white, black, timeControl }` | Match found; both clients transition to `Game`. |
| `game:state` | `{ gameId, fen, pgn, moves, clocks: { wMs, bMs }, turn, status, seq, drawOfferFrom? }` | Full authoritative state (initial load & reconnection recovery). |
| `game:move_applied` | `{ gameId, move, fen, clocks: { wMs, bMs }, turn, seq, inCheck }` | Broadcast valid move to both players. |
| `game:move_rejected` | `{ gameId, reason, expectedSeq, fen }` | Rejects illegal/out-of-turn/stale move and resyncs client. |
| `game:draw_offered` | `{ gameId, byColor }` | Notifies opponent of draw offer. |
| `game:draw_declined` | `{ gameId }` | Notifies offerer of decline. |
| `game:opponent_status` | `{ gameId, connected: boolean, graceSecondsRemaining? }` | Live disconnect/reconnect notice. |
| `game:ended` | `{ gameId, winner, reason, ratingChanges, pgns }` | Finalizes game & triggers transition to `Result`. |
| `notification:new` | `{ id, type, title, body, payload }` | Real-time friend request or game invitation alert. |

