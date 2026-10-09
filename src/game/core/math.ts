export interface Vec2 { x: number; y: number }
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
export function normalized(dx: number, dy: number): Vec2 {
  const len = Math.hypot(dx, dy);
  return len < 0.0001 ? { x: 0, y: 0 } : { x: dx / len, y: dy / len };
}
