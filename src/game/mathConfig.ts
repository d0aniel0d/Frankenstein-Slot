/**
 * 数学参数：偏低 RTP、低波动演示（多数小赢小亏，收集特性少见）
 */

/** 蓝色奖金板 3×3（9 格），credits×bet ≈ 实机面额（$25 注 → 1000/500/300…） */
export const BOARD_BASE_VALUES: {
  credits: number;
  label: "credit";
  weight: number;
}[] = [
  { credits: 40, label: "credit", weight: 1 },
  { credits: 20, label: "credit", weight: 2 },
  { credits: 12, label: "credit", weight: 3 },
  { credits: 8, label: "credit", weight: 5 },
  { credits: 6, label: "credit", weight: 8 },
  { credits: 5, label: "credit", weight: 10 },
  { credits: 4, label: "credit", weight: 12 },
  { credits: 3, label: "credit", weight: 14 },
  { credits: 2.4, label: "credit", weight: 16 },
];

export const BOARD_JACKPOT_AS_BET_MULT = true;

export const JACKPOT_SEEDS = {
  grand: 50_000,
  major: 2_500,
  minor: 500,
  mini: 100,
};

/** 仅 10 条线，降低线奖频率 */
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 1, 0, 1],
];

export const LINE_PAY: Record<string, number[]> = {
  neon_a: [0, 0, 1, 3, 8],
  neon_j: [0, 0, 1, 3, 8],
  neon_q: [0, 0, 2, 4, 10],
  neon_k: [0, 0, 2, 4, 10],
  daisy: [0, 0, 2, 5, 12],
  brain: [0, 0, 3, 6, 14],
  castle: [0, 0, 3, 6, 14],
  assistant: [0, 0, 4, 8, 18],
  monster: [0, 0, 5, 12, 28],
  dr_frank: [0, 0, 6, 14, 32],
  wild: [0, 0, 8, 18, 40],
};

export const BOARD_SEED_MULT_CHANCE = 0.04;
export const BOARD_SEED_MULTS = [2, 2] as const;

export const POWER_UP_CELL_COUNT = [1, 2] as const;
export const POWER_UP_MULTS = [2, 2, 3] as const;

/** 每局扣款比例（额外 house edge，模拟实体机 hold） */
export const SPIN_HOLD_PERCENT = 0.08;
