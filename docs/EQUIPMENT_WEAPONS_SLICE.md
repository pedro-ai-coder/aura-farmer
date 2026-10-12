# Equipment & Weapons — 3 + 3 gameplay slice

**Implemented:** replace the unlimited buff acquisition behavior with a strictly enforced inventory of **3 weapons + 3 passives**. The old FLEX stays outside the six loadout slots.

## Weapon registry

- **Aura Shot:** default automatic targeted projectile on every hero; occupies weapon slot one and levels 1–4.
- **Mewing Jaw:** close-range sweep with level-scaled damage, range and frequency.
- **Ohio Orbiter:** moving orb with level-scaled radius, frequency and damage.
- **67 Volley:** automatically fires radial projectile waves with level-scaled count, damage and frequency; original 67-kill surprise remains.
- **Rizz Pulse:** new short-range crowd-control shockwave with a visual ring and level-scaled damage, radius and frequency.

Weapon offers always obey slot limit, and upgrading an equipped weapon never costs a second slot. Existing passives are preserved as passives (capped to their original maximum, no more than Lv3).

## UX

In-game panels show **WEAPONS 0–3** and **PASSIVES 0–3**, with six occupied/empty cells, icon, name and current level. Upgrade cards identify their category and next level. FLEX remains prominent in the center, independent of loadout.

## Correct behavior

The engine validates the chosen upgrade against the canonical registry even if the UI tries to submit an illegal/stale option. When a category is full, only upgrades to already-held items are available in that category. Once all items are maxed, further level-up credits become small HP/Aura rewards without an empty menu softlock. XP and Aura stay separate; no server or payment features were added.

## Design still pending

**One miniboss/guaranteed Aura Core each of five waves, weapon evolution forms Giga Chad/Sigma Kid, fully specialized class kits, heals as pickups, Mastery and the larger follow-camera obstacle map are not included in this slice.** This is functional weapons and slot enforcement, not the full Game Design v1.0.
