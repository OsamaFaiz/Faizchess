export type Color = 'w' | 'b'
export type Player = { name: string; rating: number | null; hue: number; initials: string; device?: string }

export const ME = { name: 'Arjun Mehta', handle: '@arjun_plays', initials: 'AM', hue: 38, rating: 1486, best: 1532, since: 'Mar 2023' }

export const LEVELS = [
  { id: 'beginner', name: 'Beginner', rating: 400, desc: 'Makes casual mistakes. Perfect for your very first games.', bot: 'Pip' },
  { id: 'easy', name: 'Easy', rating: 800, desc: 'Knows the basics, misses simple tactics now and then.', bot: 'Rowan' },
  { id: 'medium', name: 'Medium', rating: 1200, desc: 'Solid club player. Punishes hanging pieces.', bot: 'Vera' },
  { id: 'hard', name: 'Hard', rating: 1600, desc: 'Strong tactics and steady positional play.', bot: 'Magnus Jr.' },
  { id: 'expert', name: 'Expert', rating: 2000, desc: 'Calculates deeply. Expect a real fight.', bot: 'Kasimir' },
  { id: 'master', name: 'Master', rating: 2400, desc: 'Near-flawless engine play. Bring your best.', bot: 'Grandmaster' },
] as const
export type LevelId = (typeof LEVELS)[number]['id']

export type TimeControl = { id: string; group: string; base: number | null; inc: number }
export const TIME_CONTROLS: TimeControl[] = [
  { id: '1+0', group: 'Bullet', base: 1, inc: 0 },
  { id: '2+1', group: 'Bullet', base: 2, inc: 1 },
  { id: '3+0', group: 'Blitz', base: 3, inc: 0 },
  { id: '3+2', group: 'Blitz', base: 3, inc: 2 },
  { id: '5+0', group: 'Blitz', base: 5, inc: 0 },
  { id: '10+0', group: 'Rapid', base: 10, inc: 0 },
  { id: '15+10', group: 'Rapid', base: 15, inc: 10 },
  { id: '30+0', group: 'Classical', base: 30, inc: 0 },
  { id: '∞', group: 'Unlimited', base: null, inc: 0 },
]
export const tc = (id: string) => TIME_CONTROLS.find((t) => t.id === id) ?? TIME_CONTROLS[5]

export const NEARBY_DEVICES = [
  { id: 'd1', name: 'Priya Sharma', device: 'Pixel 8 Pro', rating: 1512, hue: 330, initials: 'PS', signal: 4, dist: '1 m' },
  { id: 'd2', name: 'Rohan Iyer', device: 'Galaxy S23', rating: 1288, hue: 200, initials: 'RI', signal: 3, dist: '3 m' },
  { id: 'd3', name: 'Meera Nair', device: 'OnePlus 12', rating: 1730, hue: 150, initials: 'MN', signal: 2, dist: '6 m' },
  { id: 'd4', name: 'Kabir Singh', device: 'Nothing Phone (2)', rating: 1105, hue: 260, initials: 'KS', signal: 1, dist: '9 m' },
]

export type MatchRecord = {
  id: string
  mode: 'ai' | 'local' | 'nearby' | 'puzzle'
  opponent: string
  oppRating: number | null
  myColor: Color
  result: 'win' | 'loss' | 'draw'
  reason: string
  moves: number
  duration: number
  delta: number | null
  date: string
  time: string
  sans: string[]
}

const ITALIAN = 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 Nxe4 O-O Bxc3 d5 Bf6 Re1 Ne7 Rxe4 d6 Bg5 Bxg5 Nxg5 h6 Qe2 hxg5 Re1 Be6 dxe6 f6 Re3 c6 Rh3 Rxh3 gxh3 g6 Qf3 Qa5 Rxe7+ Kxe7 Qxb7+ Kxe6 Qb3+ Kf5 Qb7 Qd2 Qxa8'.split(' ').slice(0, 40)
const SICILIAN = 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7 g4 b5 g5 b4 Ne2 Ne8 f4 a5 f5 a4 Nbd4 exd4 Nxd4 b3 Kb1 bxc2+ Nxc2 Bb3 axb3 axb3 Na3 Rxa3'.split(' ')
const QGD = 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6 cxd5 Nxd5 Bxe7 Qxe7 Nxd5 exd5 Rc1 Be6 Qa4 c5 Qa3 Rc8 Bb5 a6 dxc5 bxc5 O-O Qa7 Be2 Nd7 Nd4 Qf8 Nxe6 fxe6 e4'.split(' ').slice(0, 35)

export const SAMPLE_MATCHES: MatchRecord[] = [
  { id: 's1', mode: 'nearby', opponent: 'Priya Sharma', oppRating: 1512, myColor: 'w', result: 'win', reason: 'Resignation', moves: 20, duration: 1164, delta: 14, date: 'Today', time: '10+0', sans: ITALIAN },
  { id: 's2', mode: 'ai', opponent: 'Vera · Medium', oppRating: 1200, myColor: 'b', result: 'loss', reason: 'Resignation', moves: 21, duration: 712, delta: -6, date: 'Yesterday', time: '5+0', sans: SICILIAN },
  { id: 's3', mode: 'local', opponent: 'Dev Mehta', oppRating: null, myColor: 'w', result: 'draw', reason: 'Agreement', moves: 18, duration: 2210, delta: null, date: 'Mon', time: '15+10', sans: QGD },
  { id: 's4', mode: 'ai', opponent: 'Magnus Jr. · Hard', oppRating: 1600, myColor: 'w', result: 'win', reason: 'Time out', moves: 20, duration: 598, delta: 18, date: 'Sun', time: '3+2', sans: ITALIAN },
]

export const BASE_STATS = { total: 248, wins: 142, losses: 81, draws: 25 }
export const RATING_HISTORY = [1402, 1395, 1410, 1424, 1418, 1431, 1445, 1440, 1452, 1466, 1459, 1471, 1488, 1502, 1532, 1519, 1507, 1498, 1490, 1481, 1494, 1478, 1472, 1486]

export const BOARD_THEMES = [
  { id: 'walnut', name: 'Walnut', light: '#ecd7b4', dark: '#a9784f' },
  { id: 'onyx', name: 'Gold Onyx', light: '#d9c08f', dark: '#3b404c' },
  { id: 'midnight', name: 'Midnight', light: '#cdd5e0', dark: '#4c5c76' },
  { id: 'tournament', name: 'Tournament', light: '#eeeed2', dark: '#769656' },
  { id: 'marble', name: 'Marble', light: '#ebe8e2', dark: '#948d86' },
] as const
export type BoardThemeId = (typeof BOARD_THEMES)[number]['id']

export const PIECE_STYLES = [
  { id: 'classic', name: 'Staunton' },
  { id: 'gilded', name: 'Gilded' },
  { id: 'flat', name: 'Minimal' },
] as const
export type PieceStyleId = (typeof PIECE_STYLES)[number]['id']

export const ACHIEVEMENTS = [
  { id: 'a1', name: 'First Blood', desc: 'Win your first game', icon: 'swords', got: true },
  { id: 'a2', name: 'On Fire', desc: '5-game win streak', icon: 'flame', got: true },
  { id: 'a3', name: 'Tactician', desc: 'Solve 100 puzzles', icon: 'target', got: true },
  { id: 'a4', name: 'Off the Grid', desc: 'Win 10 nearby games', icon: 'bluetooth', got: true },
  { id: 'a5', name: 'Speed Demon', desc: 'Win a bullet game', icon: 'zap', got: false },
  { id: 'a6', name: 'Giant Slayer', desc: 'Beat the Master AI', icon: 'crown', got: false },
  { id: 'a7', name: 'Iron Wall', desc: 'Draw vs Expert AI', icon: 'shield', got: false },
  { id: 'a8', name: 'Scholar', desc: 'Finish every lesson', icon: 'book', got: false },
]
