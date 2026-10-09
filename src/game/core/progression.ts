export function xpToNextLevel(level: number): number { return 20 + Math.max(0, level - 1) * 13; }
export class Progression {
  level = 1;
  xp = 0;
  gain(amount: number): number {
    this.xp += Math.max(0, amount);
    let levels = 0;
    while (this.xp >= xpToNextLevel(this.level)) {
      this.xp -= xpToNextLevel(this.level);
      this.level++;
      levels++;
    }
    return levels;
  }
}
