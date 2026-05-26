export function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function pick<T>(arr: T[]): T {
  return arr[randomInt(arr.length)]!;
}

export function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1]!.value;
}
