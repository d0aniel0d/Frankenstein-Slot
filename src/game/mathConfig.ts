/**
 * 数学参数：偏低 RTP、低波动演示（多数小赢小亏，收集特性少见）
 */

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
