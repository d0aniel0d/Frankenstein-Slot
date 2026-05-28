/** 赌注档位对应的顶奖 + 蓝格面额（$5 / $20 独立配置，$50 为 $5×10） */

export const BET_OPTIONS = [5, 20, 50] as const;
export type BetAmount = (typeof BET_OPTIONS)[number];

export interface BetTierConfig {
  jackpots: {
    grandStart: number;
    super: number;
    major: number;
    maxi: number;
    minor: number;
    mini: number;
  };
  /** 9 格：左上 → 右下 */
  boardDollars: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  /** GRAND 累进上限（超过后回到起点附近） */
  grandRollCap: number;
}

/** GRAND：每秒增加 $0.45–$0.98（全赌注档位相同） */
export const GRAND_TICK_PER_SECOND_MIN = 0.45;
export const GRAND_TICK_PER_SECOND_MAX = 0.98;

/** SUPER / MAJOR：每 2 秒各 +$0.09 */
export const SUPER_MAJOR_TICK_AMOUNT = 0.09;
export const SUPER_MAJOR_TICK_INTERVAL_MS = 2000;
export const GRAND_TICK_INTERVAL_MS = 1000;

/** 蓝格抽中权重（索引 0 = 左上最高格） */
export const BOARD_CELL_WEIGHTS = [1, 2, 3, 5, 8, 10, 12, 14, 16] as const;

const TIER_5: BetTierConfig = {
  jackpots: {
    grandStart: 11286.24,
    super: 3614.44,
    major: 1851.27,
    maxi: 500,
    minor: 250,
    mini: 150,
  },
  boardDollars: [150, 80, 50, 40, 30, 20, 15, 10, 5],
  grandRollCap: 24999.99,
};

const TIER_20: BetTierConfig = {
  jackpots: {
    grandStart: 101628.63,
    super: 7228.88,
    major: 2702.54,
    maxi: 1500,
    minor: 750,
    mini: 450,
  },
  boardDollars: [450, 240, 150, 120, 90, 60, 40, 30, 20],
  grandRollCap: 149999.99,
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function scaleTier(base: BetTierConfig, mult: number): BetTierConfig {
  return {
    jackpots: {
      grandStart: roundMoney(base.jackpots.grandStart * mult),
      super: roundMoney(base.jackpots.super * mult),
      major: roundMoney(base.jackpots.major * mult),
      maxi: roundMoney(base.jackpots.maxi * mult),
      minor: roundMoney(base.jackpots.minor * mult),
      mini: roundMoney(base.jackpots.mini * mult),
    },
    boardDollars: base.boardDollars.map((v) => roundMoney(v * mult)) as unknown as BetTierConfig["boardDollars"],
    grandRollCap: roundMoney(base.grandRollCap * mult),
  };
}

const TIER_50: BetTierConfig = {
  ...scaleTier(TIER_5, 10),
  jackpots: {
    ...scaleTier(TIER_5, 10).jackpots,
    grandStart: 850341.11,
  },
  grandRollCap: 999999.99,
};

export const BET_TIER_CONFIG: Record<BetAmount, BetTierConfig> = {
  5: TIER_5,
  20: TIER_20,
  50: TIER_50,
};

export function normalizeBet(bet: number): BetAmount {
  if (bet === 20 || bet === 50) return bet;
  return 5;
}

export function getBetTier(bet: number): BetTierConfig {
  return BET_TIER_CONFIG[normalizeBet(bet)];
}

export interface JackpotDisplay {
  grand: number;
  super: number;
  major: number;
  maxi: number;
  minor: number;
  mini: number;
}

export function getFixedJackpots(bet: number): Omit<JackpotDisplay, "grand"> {
  const j = getBetTier(bet).jackpots;
  return {
    super: j.super,
    major: j.major,
    maxi: j.maxi,
    minor: j.minor,
    mini: j.mini,
  };
}
