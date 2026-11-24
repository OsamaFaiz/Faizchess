# PROJECT AUDIT — Chess Mate

**Audit Date:** 2026-11-24  
**Audited Path:** `c:\Users\mdosa\Desktop\Premium Offline Chess Game App`  
**Current Stack:** React 19 + TypeScript 5.7 + Vite 8 + Tailwind CSS v4 + `chess.js` v1.4.0 + `lucide-react`

---

## 1. Repository & Directory Inventory

### Root & Public Files
| Path | Status | Notes |
|---|---|---|
| `index.html` | Cleaned | Standard HTML5 shell (`<title>Chess Mate</title>`, `/favicon.png`). Figma Make comment slots removed. |
| `package.json` | Needs Migration | Still named `"figma-make-app"`; lists web-only deps (`react-dom`, `vite`, `@tailwindcss/vite`, `oxfmt`). |
| `pnpm-lock.yaml` | Retain for Web Ref | Lockfile for web prototype; `node_modules/` is not installed locally. |
| `tsconfig.json` | Web Config | Targets `ES2020`, `react-jsx`, `@/* -> ./src/*`, `"types": ["node"]`. |
| `vite.config.ts` | Cleaned | Figma Make plugins removed; kept minimal Vite + React + Tailwind config. |
| `.gitignore` | Cleaned | Standard Node/Vite ignore entries. |
| `public/favicon.png` | Retain / Convert | App icon reference for web; Android adaptive icon/splash assets must be generated for Expo. |

### Figma-Specific Code & Files
- **Already Removed:** `.figma/` (`.figma/README.md`, `.figma/make/*`), `.mise.toml`, `.gitattributes`, `public/.gitattributes`, `AGENTS.md`, `CLAUDE.md`, and the 5 Figma Make Vite plugins previously in `vite.config.ts`.
- **Remaining Figma / Prototype Artifacts:**
  - `package.json`: `"name": "figma-make-app"`, `"format": "oxfmt"`, devDependency `oxfmt` (`^0.76.0`).
  - `src/App.tsx`: `FlowPanel` (lines 54–86, desktop `"Android · Material 3 prototype"` quick-jump sidebar), simulated phone bezel wrapper (`sm:rounded-[48px]`), and fake `StatusBar` (lines 26–35, hardcodes `WifiOff`, `Signal`, `BatteryFull`).

---

## 2. Existing Screens, Components & Utilities

### Application Core (`src/app/`)
| File | Exports / Responsibilities | Notes |
|---|---|---|
| `src/app/store.tsx` | `StoreProvider`, `useStore`, `ScreenName`, `Settings`, `GameConfig`, `GameResult` | Custom array-based navigation stack (`go`, `back`, `reset`); `localStorage` persistence (`cm:settings`, `cm:progress`). |
| `src/app/data.ts` | `ME`, `LEVELS`, `TIME_CONTROLS`, `tc`, `NEARBY_DEVICES`, `SAMPLE_MATCHES`, `BASE_STATS`, `RATING_HISTORY`, `BOARD_THEMES`, `PIECE_STYLES`, `ACHIEVEMENTS` | Contains both static configuration (`LEVELS`, `TIME_CONTROLS`, `BOARD_THEMES`, `PIECE_STYLES`) and hardcoded mock user/demo data. |
| `src/app/ai.ts` | `evaluate`, `pickMove` | Custom synchronous JS negamax + alpha-beta search (depths 1–3) using `chess.js`. |
| `src/app/feedback.ts` | `moveSound`, `buzz` | Web Audio API (`AudioContext`) synthesized oscillator tones and `navigator.vibrate`. |
| `src/app/lessons.ts` | `LESSONS`, `lessonById` | 18 structured lessons/puzzles across Basics, Pieces, Special Moves, Openings, Checkmates, Puzzles. |

### Shared UI Components (`src/components/`)
| File | Exports | Notes |
|---|---|---|
| `src/components/Board.tsx` | `Board`, `BoardProps` | 8×8 grid, piece animation via `diff()`, legal move dots/rings, check radial glow, last-move & hint highlights, promotion modal, 5 themes. |
| `src/components/Piece.tsx` | `Piece` | Layered Unicode chess glyphs (`\u265A`–`\u265F` + `\u2654`–`\u2659` + `\uFE0E`) with 3 visual styles (`classic`, `gilded`, `flat`). |
| `src/components/ui.tsx` | `cx`, `Avatar`, `Btn`, `IconBtn`, `TopBar`, `Card`, `Toggle`, `Chip`, `Section`, `OfflineBadge`, `Sheet`, `Dialog`, `BottomNav`, `Logo`, `fmtClock`, `fmtDur` | Complete Material-inspired component library in dark (`#101319` / `#202631` / `#171A21`) and light (`#F5F3EF`) themes with gold accent (`#D6A85F`). |
| `src/components/Chart.tsx` | `LineChart`, `Ring` | Inline SVG rating progression chart and circular win-rate ring. |
| `src/components/MatchRow.tsx` | `MatchRow` | Match summary row linking to `review` screen. |
| `src/components/TimePicker.tsx` | `TimePicker` | Grouped time control selector (`Bullet`, `Blitz`, `Rapid`, `Classical`, `Unlimited`). |

### Screens (`src/screens/` — 15 Total)
| Screen | Route ID | Functional Status |
|---|---|---|
| `Splash.tsx` | `splash` | Uses `src/assets/splash.png` (1.34 MB), `Logo`, animated loading bar; auto-routes via `cm:onboarded`. |
| `Onboarding.tsx` | `onboarding` | 3-slide carousel (`Master the Game`, `Play Anywhere`, `Challenge Yourself`), writes `cm:onboarded`. |
| `Home.tsx` | `home` | Rating card, Play CTA, 2×2 quick tiles, Daily Challenge card, Stats Ring, Recent Matches. **Gap:** Notification `Bell` button has no action; streak/monthly delta/stats base are hardcoded. |
| `PlayModes.tsx` | `play` | Mode selector list. **Gap:** Online Multiplayer card is disabled and shows `"Online play is coming in a future update"`. |
| `AISetup.tsx` | `ai-setup` | 6 AI levels, `TimePicker`, color choice (`White`, `Random`, `Black`), Hints & Takebacks toggles. |
| `LocalSetup.tsx` | `local-setup` | Pass & Play player names, color swap, `TimePicker`, Auto-flip & legal moves toggles. |
| `Nearby.tsx` | `nearby` | 7-step UI (`hub`, `host`, `hosting`, `scan`, `requesting`, `match`, `ready`) + incoming request dialog. **Gap:** 100% simulated with `setTimeout` and `NEARBY_DEVICES`. |
| `Game.tsx` | `game` | Live chessboard, clocks with increment, captured pieces & material diff, move strip, pause sheet, move history sheet, resign/draw/exit dialogs. **Gap:** Nearby opponent uses `pickMove` AI; `"Simulate connection loss"` button in pause sheet; draw offer in nearby always declines via timeout; no PGN export/import or move-list scrubbing. |
| `Result.tsx` | `result` | Victory/Defeat/Draw summary, Elo delta calculation, rematch, review, new game, home. |
| `Review.tsx` | `review` | Step-by-step replay (`<<`, `<`, `>`, `>>`) and clickable move table. **Gap:** No Stockfish engine evaluation/analysis bar or PGN export. |
| `Profile.tsx` | `profile` | Avatar, rating badges, 4-stat grid, 6-month chart, 8 achievements, recent matches. **Gap:** `Edit profile` button has no handler; achievements & base stats are static. |
| `Stats.tsx` | `stats` | Rating chart (`1M`/`3M`/`6M`), W/D/L bar, Win rate by mode, White vs Black win rate, full match list. **Gap:** Mode breakdown & White/Black win rates are hardcoded constants. |
| `Learn.tsx` | `learn` | Lesson progress bar (`cm:lessons`), Daily Challenge card, Basics, 6 Piece cards, Special Moves, Openings, Checkmates, Puzzles. **Gap:** `"12-day streak"` is hardcoded. |
| `Lesson.tsx` | `lesson` | Interactive step-by-step move validation with auto-reply, hint highlight, shake animation on wrong move, completion persistence. |
| `Settings.tsx` | `settings` | Theme (`dark`/`light`), 5 board themes, 3 piece styles, coordinates, sound/music/vibration toggles, legal moves, auto-queen, default timer, offline AI/auto-reconnect/preferred link/keep-awake, language/privacy/about. **Gap:** `music`, `offlineAI`, `autoReconnect`, `keepAwake`, and `language` have no underlying native/runtime effect; Privacy & About only show toasts. |

---

## 3. Chess Logic & AI Audit

- **Chess Rules (`chess.js` v1.4.0):**
  - Currently supports legal move generation/validation, check/checkmate, stalemate, insufficient material, threefold repetition, 50-move draw (`c.isDraw()`), pawn promotion (with modal or auto-queen), castling, en passant, SAN, and FEN.
  - **Missing for Production:** Explicit 75-move rule enforcement/labeling, PGN export & import, game-state persistence across app kill/backgrounding, redo stack after undo (where allowed), and server-authoritative move validation for online play.
- **AI Implementation (`src/app/ai.ts`):**
  - Currently a lightweight synchronous JS negamax search (depth 1–3) with material + basic center-square heuristics and intentional randomness (`random: 0.45` on Beginner, `0.15` on Easy).
  - Runs on the JS main thread inside `setTimeout` (`Game.tsx:123`), which blocks UI frames if depth increases.
  - **Missing for Production:** Real Stockfish UCI engine running off the JS main thread (native C++/JNI/worker integration), configurable UCI skill level / Elo / depth / movetime, live evaluation score for `Review.tsx`, and Stockfish-powered hints.

---

## 4. Incomplete Multiplayer Audit

1. **Nearby Multiplayer (`src/screens/Nearby.tsx` & `src/screens/Game.tsx`):**
   - Device discovery uses `NEARBY_DEVICES` static array revealed via `setTimeout`.
   - Table hosting uses a hardcoded `"K7-Q2"` code and fakes an incoming join request after 3.2 seconds.
   - Gameplay in `mode === 'nearby'` uses local `pickMove(..., 'medium')` instead of Bluetooth/Wi-Fi Direct packet exchange.
   - Connection loss is triggered manually by a `"Simulate connection loss"` button in the Pause sheet.
2. **Online Multiplayer (`src/screens/PlayModes.tsx`):**
   - Disabled button displaying `"Coming soon"` and triggering a toast. No backend, WebSocket client, auth, rooms, matchmaking, or friends exist yet.

---

## 5. Unused Files & Dependencies Assessment

- **Unused Files in `src/`:** None — every file and asset (`splash.png`) under `src/` is imported and rendered.
- **Unnecessary Web Dependencies (for React Native target):** `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `react-dom`, `@types/react-dom`, `oxfmt`, `@types/node` (only needed in the legacy web reference or backend, not in the Expo Android app).
- **Retained Core Dependencies:** `chess.js`, `react`, `typescript`.

---

## 6. React + Vite → React Native + Expo Migration Plan

1. **Workspace Restructure (Monorepo):**
   - Preserve the existing web code under a reference folder or migrate cleanly into:
     - `apps/mobile/` (Expo Custom Dev Client + React Native + TypeScript)
     - `apps/backend/` (NestJS + Prisma + PostgreSQL + Redis)
     - `packages/shared/` (Shared TypeScript types, chess helpers, Elo/rating math, constants, protocol schemas)
2. **Visual Fidelity Mapping:**
   - Port CSS variables from `src/index.css` into a typed `Theme` object (`dark` & `light` palettes, `Playfair Display`, `Manrope`, `Noto Sans Symbols 2` via `expo-font`).
   - Replace HTML/Tailwind primitives (`div`, `button`, `input`) with `View`, `Pressable`, `TextInput`, `ScrollView`, `Modal`, `@gorhom/bottom-sheet` / native modals, and `react-native-reanimated` + `react-native-gesture-handler` for board animations and drag/tap moves.
   - Replace `lucide-react` with `lucide-react-native` + `react-native-svg` (also used for `LineChart` and `Ring`).
   - Replace `src/app/feedback.ts` (`AudioContext` + `navigator.vibrate`) with `expo-av` / `expo-audio` sound assets and `expo-haptics`.
   - Replace `localStorage` with `expo-sqlite` (relational offline DB + sync queue) and `expo-secure-store` (JWT access/refresh tokens).
   - Remove `FlowPanel` and simulated `StatusBar` / phone bezel in favor of real `react-native-safe-area-context`, `expo-status-bar`, `expo-navigation-bar`, and Android hardware back-button handling (`BackHandler`).

