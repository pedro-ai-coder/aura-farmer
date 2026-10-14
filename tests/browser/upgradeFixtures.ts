import type { Page } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';
import type { BuffId } from '../../src/game/data/buffs';

/** Keep reward object identity in the browser's registry: Arena rejects copied rewards. */
export async function offerCatalogUpgrades(page: Page, ids: BuffId[]): Promise<void> {
  await page.evaluate(async choiceIds => {
    const catalogPath = '/src/game/data/buffs.ts';
    const equipmentPath = '/src/game/core/equipment.ts';
    const { BUFFS, availableBuffs } = await import(catalogPath) as typeof import('../../src/game/data/buffs');
    const { canEquip } = await import(equipmentPath) as typeof import('../../src/game/core/equipment');
    const arena = (window.__game.scene.scenes[0] as ArenaScene).arena;
    const choices = choiceIds.map(id => {
      const buff = BUFFS.find(candidate => candidate.id === id);
      if (!buff || !canEquip(arena.buffs, buff) || !availableBuffs(arena.buffs,arena.xp.level).includes(buff)) throw new Error(`Illegal Combat V2 upgrade fixture: ${id}`);
      return buff;
    });
    arena.enemies = []; arena.shots = []; arena.drops = [];
    arena.mode = 'upgrades'; arena.pendingUpgrades = 1;
    arena.choices = choices;
  }, ids);
}
