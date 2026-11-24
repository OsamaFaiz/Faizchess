export type LessonStep = { text: string; fen: string; solution?: string[]; highlight?: string[] }
export type Lesson = { id: string; title: string; category: string; minutes: number; steps: LessonStep[] }

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const LESSONS: Lesson[] = [
  {
    id: 'rules', title: 'Chess Rules 101', category: 'Basics', minutes: 4,
    steps: [
      { text: 'Chess is played on an 8×8 board. Each side starts with 16 pieces. White always moves first.', fen: START },
      { text: 'The goal is checkmate: attack the enemy king so it has no escape. Open the game by pushing your e-pawn two squares to e4.', fen: START, solution: ['e4'], highlight: ['e2', 'e4'] },
      { text: 'Pieces capture by moving onto an enemy square. Control the centre early to give your pieces room.', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' },
    ],
  },
  { id: 'pawn', title: 'The Pawn', category: 'Pieces', minutes: 2, steps: [{ text: 'Pawns move forward one square, or two from their starting square. Move the pawn to e4.', fen: '7k/8/8/8/8/8/4P3/K7 w - - 0 1', solution: ['e4'], highlight: ['e4'] }] },
  { id: 'knight', title: 'The Knight', category: 'Pieces', minutes: 2, steps: [{ text: 'Knights jump in an L-shape and can leap over pieces. Tap the knight to see its moves, then jump to f5.', fen: '7k/8/8/8/3N4/8/8/K7 w - - 0 1', solution: ['Nf5'], highlight: ['f5'] }] },
  { id: 'bishop', title: 'The Bishop', category: 'Pieces', minutes: 2, steps: [{ text: 'Bishops slide diagonally any distance. Glide the bishop to a7.', fen: '7k/8/8/8/3B4/8/8/K7 w - - 0 1', solution: ['Ba7'], highlight: ['a7'] }] },
  { id: 'rook', title: 'The Rook', category: 'Pieces', minutes: 2, steps: [{ text: 'Rooks move in straight lines along ranks and files. Move to d8 to give check.', fen: '7k/8/8/8/3R4/8/8/K7 w - - 0 1', solution: ['Rd8+'], highlight: ['d8'] }] },
  { id: 'queen', title: 'The Queen', category: 'Pieces', minutes: 2, steps: [{ text: 'The queen combines rook and bishop — the most powerful piece. Move her to d7.', fen: '7k/8/8/8/3Q4/8/8/K7 w - - 0 1', solution: ['Qd7'], highlight: ['d7'] }] },
  { id: 'king', title: 'The King', category: 'Pieces', minutes: 2, steps: [{ text: 'The king steps one square in any direction and can never move into check. Step to e5.', fen: '7k/8/8/8/3K4/8/8/8 w - - 0 1', solution: ['Ke5'], highlight: ['e5'] }] },
  {
    id: 'castling', title: 'Castling', category: 'Special Moves', minutes: 3,
    steps: [
      { text: 'Castling moves the king two squares toward a rook, and the rook hops over. Castle kingside: move the king from e1 to g1.', fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', solution: ['O-O'], highlight: ['e1', 'g1'] },
      { text: 'Now castle queenside: king from e1 to c1. Neither piece may have moved, and the king cannot pass through check.', fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', solution: ['O-O-O'], highlight: ['e1', 'c1'] },
    ],
  },
  { id: 'enpassant', title: 'En Passant', category: 'Special Moves', minutes: 2, steps: [{ text: 'Black just pushed d7–d5, landing beside your pawn. Capture it "in passing" by moving e5 to d6 — only possible right now.', fen: '7k/8/8/3pP3/8/8/8/K7 w - d6 0 1', solution: ['exd6'], highlight: ['d5', 'd6'] }] },
  { id: 'promotion', title: 'Pawn Promotion', category: 'Special Moves', minutes: 2, steps: [{ text: 'A pawn reaching the last rank promotes. Push e7 to e8 and choose a Queen.', fen: '7k/4P3/8/8/8/8/8/K7 w - - 0 1', solution: ['e8=Q+'], highlight: ['e8'] }] },
  {
    id: 'italian', title: 'Italian Game', category: 'Openings', minutes: 5,
    steps: [{ text: 'Play the Italian Game: 1.e4 e5 2.Nf3 Nc6 3.Bc4 — fast development aiming at f7. Play the white moves.', fen: START, solution: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] }],
  },
  {
    id: 'qgambit', title: "Queen's Gambit", category: 'Openings', minutes: 5,
    steps: [{ text: "Offer a pawn to control the centre: 1.d4 d5 2.c4. Play the white moves.", fen: START, solution: ['d4', 'd5', 'c4'] }],
  },
  {
    id: 'london', title: 'London System', category: 'Openings', minutes: 5,
    steps: [{ text: 'A solid setup for any opponent: 1.d4 d5 2.Bf4 Nf6 3.e3. Play the white moves.', fen: START, solution: ['d4', 'd5', 'Bf4', 'Nf6', 'e3'] }],
  },
  { id: 'backrank', title: 'Back-Rank Mate', category: 'Checkmates', minutes: 2, steps: [{ text: "Black's king is trapped behind its own pawns. Deliver mate on the back rank.", fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', solution: ['Rd8#'] }] },
  { id: 'smothered', title: 'Smothered Mate', category: 'Checkmates', minutes: 2, steps: [{ text: 'The king is boxed in by its own pieces. Find the knight mate.', fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1', solution: ['Nf7#'] }] },
  { id: 'scholar', title: "Scholar's Mate", category: 'Checkmates', minutes: 2, steps: [{ text: 'Black forgot to defend f7. Strike with the queen.', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', solution: ['Qxf7#'] }] },
  { id: 'fork', title: 'Knight Fork', category: 'Puzzles', minutes: 3, steps: [{ text: 'White to move and win the queen. Look for a square that attacks two targets at once.', fen: '4k3/8/q7/1N6/8/8/8/4K3 w - - 0 1', solution: ['Nc7+', 'Kd7', 'Nxa6'] }] },
  { id: 'daily', title: 'Daily Challenge · Mate in 2', category: 'Puzzles', minutes: 3, steps: [{ text: 'White to move. Mate in 2 — the doubled rooks are the key.', fen: 'r5k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1', solution: ['Rd8+', 'Rxd8', 'Rxd8#'] }] },
]
export const lessonById = (id: string) => LESSONS.find((l) => l.id === id) ?? LESSONS[0]
