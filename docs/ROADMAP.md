# Roadmap — Aura Farmer

## Sprint 0 (AF-000 first)
- [x] AF-000 Verify install, typecheck, tests, build, browser smoke test; update validation
- [x] AF-001 Basic Phaser/Vite/TypeScript scaffold
- [x] AF-002 Movement, auto shooting, health
- [x] AF-003 NPC, Hater, Beta Bro and boss
- [x] AF-004 Risk FLEX
- [x] AF-005 Aura ranks and Aura Burst
- [x] AF-006 XP and upgrade choices
- [x] AF-007 Five waves and game over/victory loop
- [ ] AF-008 Gameplay QA and balancing
- [ ] AF-009 FX, controls and UI polish
- [x] AF-010 Host HTTPS web preview

AF-000 now has executed validation recorded in docs/VALIDATION.md. AF-001–007 have automated logic/browser coverage; AF-008 human balancing remains open.

## Sprint 1
AF-101 Refactor ArenaScene into systems; AF-102 Shop + coins; AF-103 Aura Challenges; AF-104 Alpha/Rizzler; AF-105 mobile touch controls (implemented in a PR; physical-device QA pending).

## Sprint 2
AF-201 Network contracts; AF-202 Colyseus 2 players; AF-203 4-player coop; AF-204 Discord Activity; AF-205 performance/reconnections.

## v0.3 — Brainrot Invasion (AF-301, issue #8)
Proposed content spec: [BRAINROT_CONTENT_V03.md](BRAINROT_CONTENT_V03.md).
This is the next content priority; #7 (AF-008) can be resumed later. If both progress in parallel, coordinate overlapping combat/UI changes.
- [ ] PR 1: 6 new buffs (Crash Out, Skibidi Bounce, Delulu, Touch Grass, Mogged, Rizz Aura), Ultimate 67 synergy
- [ ] PR 2: Yap Goblin, Ohio Glitch, Fanum Thief with telegraphed behaviors and XP refunds
- [ ] PR 3: Fanum Tax Raid (wave 2) and SIX SEVEN SURGE (wave 3), mobile-friendly HUD and tests
- [ ] Real Android playtest and balancing


## Art Overhaul v2 — quality before backend (2026-10-12)
- Production direction / measurable acceptance: [Visual Bible v2](VISUAL_BIBLE_V2.md)
- Small-PR execution, gates A–D and responsibilities: [Art Overhaul Plan](ART_OVERHAUL_PLAN.md)
- Source/export inventory: [Art Asset Register](ART_ASSET_REGISTER.csv)
- [x] PR #28: crop six-frame Ohio/Fanum/Six-Seven portraits in character cards (merged)
- [ ] Gate A: Sigma + NPC/Hater + tiles/XP/hit VFX style test, explicit approval
- [ ] Gate B: 6 animated playable characters, enemies and boss
- [ ] Gate C: combat VFX, arena, props, all UI screens reviewed
- [ ] Gate D: complete 5-wave / mobile visual + rights / performance approval
- [ ] Backend design phase resumes only after Gate D visual signoff; PR #27 is optional **rejected-style experiment**, not final art
