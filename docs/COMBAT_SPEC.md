> **Current legacy implementation baseline, not the next-release specification.** For agreed future gameplay direction (3 weapons + 3 passives, ~5-minute run with five minibosses, evolution, healing, Character Mastery and larger obstacles/camera), see [Game Design v1.0](GAME_DESIGN_V1_LOCKED.md). Do not change combat code merely by editing this document.

# Combat specification — Aura Farmer v0.1

Arena 960x600, top HUD 82px, 5 waves of 50 seconds. 90 enemy cap.
Controls: WASD / arrows move; auto attack; E FLEX; SPACE Sigma Focus; 1/2/3 upgrades; ENTER start / next wave; F3 debug.

Player starts at 100 HP, 205 px/sec, 19px radius. Weapon auto targets nearest enemy (18 damage, 470px/sec projectile, approx 420ms cooldown). XP gains from collected drops.

FLEX: triggered by E if ready, immobilizes and disables auto-attacking for 1000ms. At completion, at least three enemies within radius 145px reward +25 Aura and push enemies away. Otherwise no Aura; damage interrupts FLEX. Cooldown 15000ms. Being hit costs 20 Aura; avoid double-penalizing interrupts unless approved explicitly.

Aura range 0-100: rank 25 = +5% move; 50 = +10% damage; 75 = +10% rate. At 100, trigger Aura Burst (+20% attack damage for 6s), reset Aura to 40. Aura is not currency.
Sigma Focus: enemy slow for 3s, 22s cooldown.
On XP level-up choose 1 of 3 buffs; simulation pauses until choice.
Last wave has Big Hater boss; win/loss and restart states.
All timing, interactions and cooldowns must be verified by browser playtesting and tests.
