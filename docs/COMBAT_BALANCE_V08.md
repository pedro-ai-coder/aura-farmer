# Combat balance iteration v0.8 — Game Design implementation slice

**Context:** after merging 3 weapons + 3 passives, playtesting found normal builds made survival nearly trivial and both Alpha FLEX heroes behaved identically. This document records the first targeted balancing changes. **All numeric coefficients remain provisional and require playtesting.**

## Implemented in feature branch
- **Bounded build power:** Sigma and Alpha passive bonuses add rather than multiply, with an upper damage multiplier of 1.75 before hero/weapon-specific effects. Locked In, Mewing and Crash Out bonuses reduced. Four-level weapon upgrades still improve each skill, but the increases per level and frequency are less explosive.
- **Enemies scale across waves:** relative to wave 1, typical enemy HP +24% per subsequent wave, damage +11% per subsequent wave and speed +3.5% per subsequent wave. Final boss HP rises +30% per wave step, meaning its wave-5 base max HP differs from the old fixed 800. The health-bar renderer uses actual spawned max HP.
- **Reduced free sustain:** transition heal = 10% of max HP instead of +20 flat. HP pickups and miniboss healing remain separate, future features.
- **FLEX identity:** Cool Kid + Alpha is **Giga Chad Rampage** — player-steered speed, invulnerability and trampling for 5 seconds. Alpha Chad + Alpha is **Unstoppable Chad** — no invulnerable trample; instead ~72% incoming damage reduction with protective 140px shockwaves every 750ms and normal equipped weapons still able to attack. Other Alpha-affinity heroes get a weaker, more mobile damage-reduction charge. Styles are captured when FLEX is triggered, and the HUD now shows the effect and distinct VFX.
- **Boss safeguards:** per-activation Alpha-specific trample/shockwave damage capped to approximately 22% of the spawned boss's maximum HP; regular weapon damage remains normal. FLEX never auto-triggers and cannot charge from its own kills while active.

## QA contract
- Unit coverage: capped cumulative passive power; enemy HP/damage wave scaling; different Cool Kid and Alpha Chad FLEX identities, mitigated tank damage and shockwave pulse; 10% transition heal; no duplicate FLEX activation.
- Browser coverage: Alpha Chad has an ability-description HUD different from Cool Kid, using the normal character selection and E key.
- Runtime QA still required: 5-wave run completion under multiple hero/build seeds, time-to-kill against late-wave enemies and BIG HATER, screenshot inspection on desktop/portrait, 2–4 meaningful FLEX activations in typical play, physical mobile performance and collision safety. Numbers may be tuned after user review.
- Merge gate: tests must actually pass; a GitHub Actions run that fails before a runner starts is NOT a successful test run.

## Explicitly still missing from the complete approved Game Design v1.0
- Five wave miniboss encounters + guaranteed ability/evolution Aura Cores; minibosses must be present before the FINAL BIG HATER on wave 5.
- Compatible weapon/passive recipes and **actual** Cool Kid→Giga Chad / Nerd→Sigma Kid full-form transformations via Core; temporary FLEX pose is not a permanent-for-run evolved form.
- Dedicated HP heal pickups, complete class passives, character Mastery progression/unlocks, larger scrolling obstacle map with camera, balance simulation and user rules review.

Backend, purchases and monetization remain out of scope.
