import { CAPS, PASSIVES, POWER, WAVES, WEAPONS, passiveById, weaponById, type Rarity, type Role } from '../catalog/content';
export interface Item {
    id: string;
    rarity: Rarity;
    level: number;
}
export interface Choice {
    item?: Item;
    kind: 'weapon' | 'passive' | 'heal' | 'shield';
    action: 'new' | 'upgrade' | 'promote' | 'replace' | 'recover';
}
const ranks: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
export class Inventory {
    weapons: Item[];
    passives: Item[] = [];
    legendarySpent = false;
    constructor(readonly role: Role, starter: string) { this.weapons = [{ id: starter, rarity: 'common', level: 1 }]; }
    level(id: string) { return this.passives.find(i => i.id === id)?.level ?? 0; }
    legal(item: Item): boolean {
        const w = weaponById(item.id), p = passiveById(item.id);
        if (!(item.rarity in CAPS) || !w && !p || !Number.isInteger(item.level) || item.level < 1 || item.level > CAPS[item.rarity])
            return false;
        if (w && w.role !== this.role || p && (p.role && p.role !== this.role || p.rarity !== item.rarity))
            return false;
        if (item.rarity === 'legendary' && this.legendarySpent)
            return false;
        return true;
    }
    apply(choice: Choice, replaceId?: string): boolean {
        const item = choice.item;
        if (!item || !this.legal(item))
            return false;
        const weapon = !!weaponById(item.id), list = weapon ? this.weapons : this.passives, cap = weapon ? 3 : 5;
        if (choice.kind !== (weapon ? 'weapon' : 'passive')) return false;
        const index = list.findIndex(i => i.id === item.id);
        if (index >= 0) {
            const old = list[index];
            const same = old.rarity === item.rarity && item.level === old.level + 1;
            const promotion = weapon && ranks.indexOf(item.rarity) > ranks.indexOf(old.rarity) && item.level === Math.min(old.level, CAPS[item.rarity]);
            if (!same && !promotion)
                return false;
            list[index] = { ...item };
        }
        else if (list.length < cap) {
            if (item.level !== 1)
                return false;
            list.push({ ...item });
        }
        else {
            const replacement = list.findIndex(i => i.id === replaceId);
            if (replacement < 0 || item.level !== 1)
                return false;
            list[replacement] = { ...item };
        }
        if (item.rarity === 'legendary')
            this.legendarySpent = true;
        return true;
    }
    normalChoices(wave: number, random: () => number): Choice[] {
        const candidates: Choice[] = [];
        for (const w of WEAPONS.filter(w => w.role === this.role)) {
            const old = this.weapons.find(i => i.id === w.id);
            if (old && old.level < CAPS[old.rarity])
                candidates.push({ kind: 'weapon', action: 'upgrade', item: { ...old, level: old.level + 1 } });
            for (const rarity of ranks.slice(0, 3)) {
                if (WAVES[wave - 1].weights[ranks.indexOf(rarity)] === 0)
                    continue;
                if (old && ranks.indexOf(rarity) <= ranks.indexOf(old.rarity))
                    continue;
                candidates.push({ kind: 'weapon', action: old ? 'promote' : this.weapons.length === 3 ? 'replace' : 'new', item: { id: w.id, rarity, level: old ? Math.min(old.level, CAPS[rarity]) : 1 } });
            }
        }
        for (const p of PASSIVES.filter(p => p.rarity !== 'legendary' && (!p.role || p.role === this.role))) {
            if (!WAVES[wave - 1].weights[ranks.indexOf(p.rarity)])
                continue;
            const old = this.passives.find(i => i.id === p.id);
            if (old && old.level >= CAPS[old.rarity])
                continue;
            candidates.push({ kind: 'passive', action: old ? 'upgrade' : this.passives.length === 5 ? 'replace' : 'new', item: { id: p.id, rarity: p.rarity, level: (old?.level ?? 0) + 1 } });
        }
        const result: Choice[] = [];
        // In early waves, keep a meaningful defensive or area-clear option in the
        // upgrade selection. This changes offer visibility, not inventory caps,
        // rarity eligibility, damage values, or the number of choices.
        if (wave <= 2) {
            const supportIds = new Set([
                'thick-skin', 'built-different', 'certified-w',
                'big-chad', 'homie-check', 'so-back',
            ]);
            const defensive = candidates.filter(c => c.kind === 'passive' && c.item && supportIds.has(c.item.id));
            if (defensive.length)
                result.push(defensive[Math.floor(random() * defensive.length)]);
        }
        const upgrades = candidates.filter(c => c.action === 'upgrade' && !result.some(o => o.item?.id === c.item?.id));
        if (upgrades.length)
            result.push(upgrades[Math.floor(random() * upgrades.length)]);
        while (result.length < 3) {
            const legal = candidates.filter(c => !result.some(o => o.item?.id === c.item?.id));
            if (!legal.length)
                break;
            // Select a legal category first, then redistribute rarity weights within it (§10).
            const categories = [...new Set(legal.map(c => c.action === 'replace' ? 'new' : c.action))];
            const category = categories[Math.floor(random() * categories.length)];
            const categoryPool = legal.filter(c => (c.action === 'replace' ? 'new' : c.action) === category);
            const present = ranks.slice(0, 3).filter(r => categoryPool.some(c => c.item?.rarity === r));
            const total = present.reduce((n, r) => n + WAVES[wave - 1].weights[ranks.indexOf(r)], 0);
            let roll = random() * total, rarity = present[0];
            for (const r of present) {
                roll -= WAVES[wave - 1].weights[ranks.indexOf(r)];
                if (roll <= 0) {
                    rarity = r;
                    break;
                }
            }
            const pool = categoryPool.filter(c => c.item?.rarity === rarity);
            result.push(pool[Math.floor(random() * pool.length)]);
        }
        while (result.length < 3)
            result.push({ kind: result.length % 2 ? 'shield' : 'heal', action: 'recover' });
        return result;
    }
    legendaryChoices(random: () => number): Choice[] {
        const pool = PASSIVES.filter(p => p.rarity === 'legendary').map(p => p.id);
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return [...pool.slice(0, 3).map(id => ({ kind: 'passive' as const, action: this.passives.length === 5 ? 'replace' as const : 'new' as const, item: { id, rarity: 'legendary' as const, level: 1 } })),
            ...WEAPONS.filter(w => w.role === this.role).map(w => ({ kind: 'weapon' as const, action: this.weapons.some(i => i.id === w.id) ? 'promote' as const : this.weapons.length === 3 ? 'replace' as const : 'new' as const, item: { id: w.id, rarity: 'legendary' as const, level: 1 } }))];
    }
}
export const itemPower = (item: Item) => POWER[item.rarity] * (1 + .15 * (item.level - 1));
export const itemInterval = (item: Item, frequency: number) => Math.max(.2, weaponById(item.id)!.interval * (1 - .05 * (item.level - 1)) / (1 + Math.min(1, Math.max(0, frequency))));
