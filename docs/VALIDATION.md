# Validation — Aura Farmer v0.1

## Brainrot Invasion v0.3 — PR 1 (issue #8)

Scope: six new catalog buffs and the existing Six Seven + Skibidi Bounce synergy. No new enemies or wave events are included. The original ten buff entries, English UI, five-wave lifecycle and touch input implementation remain intact.

Validation on Node 22.23.3 and Chromium 151 (headless/SwiftShader):

| Command | Result |
| --- | --- |
| `npm ci` | Passed with the existing lockfile |
| `npm run typecheck` | Passed |
| `npm test` | 54 tests passed across 6 files |
| `npm run build` | Passed; existing Phaser bundle-size warning remains |
| `npm run test:browser` | 11 scenarios passed, including existing desktop/mobile regressions |

New unit coverage includes all six catalog rarities/stack limits and acquisition through XP upgrades; Crash Out thresholds and damage; Delulu's one-use charge, exact invulnerability boundary and wave reset; Touch Grass timing, damage reset, pause and HP cap; Mogged's first-hit behavior on mobs/bosses/melee; bounce range, target exclusion, killing blows and chain prevention; Rizz range/duration/boss cap and Focus interaction; seven eligible radial projectiles, one-time Ultimate 67 feedback and run reset.

New browser scenarios select all six buffs through real level-up choices using keyboard or touch, in desktop, 390×844 portrait and 844×390 landscape layouts. They also exercise an Ultimate 67 volley/ricochet and visible English feedback, plus Delulu survival, upgrade pause and next-wave recharge. The original movement/FLEX/FOCUS, upgrade, five-wave boss victory and defeat/retry scenarios passed. The Ultimate 67 screenshot was visually inspected.

These tests use controlled enemy/XP fixtures and simulation times alongside real keyboard/touch events. Mobile results are Chromium emulation, not physical Android-device playtesting; balance and real-device performance remain unverified.

Implementation details for review (where interactions were not specified):

- Crash Out checks HP against current maximum HP. Incoming amplification applies after Drip's armor/minimum damage; outgoing projectile damage is captured at firing, as with existing buffs.
- Touch Grass first heals at eight damage-free active seconds, then every five seconds. Acquisition after an existing clean streak permits one immediate tick, never retroactive accumulated healing. Actual damage, including a lethal hit saved by Delulu, restarts the delay; invulnerable hits do not.
- Delulu ignores damage/Aura loss/FLEX interruption during its 1.25s invulnerability. Its charge resets on entering the next wave; upgrades do not reset it. Starting a new run clears all buff state.
- Mogged is evaluated on each enemy's first player impact at full base HP, including bosses and secondary weapons. Ricochets scale the projectile's damage by 55% before applying the new target's own first-hit modifier.
- A bounce selects the closest different living enemy within 145px of the original target. It cannot hit the original enemy, intercept another target or bounce again. If its selected target dies, it expires normally. A ricochet continues an already-fired projectile during FLEX; new auto-attacks remain disabled.
- Rizz slows refresh rather than stack; Rizz and Focus use the stronger active slow, preserving existing Focus values. Rizz alone slows ordinary enemies by 25% and bosses by 15%.
- Ultimate 67 uses the existing seven-projectile volley, with feedback once per run on the first volley after both buffs are equipped. It adds no extra volley or active ability.

## AF-000 — 2026-10-09

Validação executada no ambiente cloud com Node **22.23.3**, npm **11.9.0** e Chromium **151.0.7922.173** em modo headless/SwiftShader. O lockfile foi gerado e a instalação limpa com `npm ci` passou.

| Verificação | Resultado |
| --- | --- |
| `npm install` / `npm ci` | Passaram; `package-lock.json` incluído |
| `npm run typecheck` | Passou, TypeScript strict |
| `npm test` | 30 testes passaram em 5 ficheiros |
| `npm run build` | Passou; aviso não bloqueante de bundle >500 kB (Phaser incluído) |
| `npm run test:browser` | 4 cenários passaram, sem erros JavaScript |
| `npm run preview` + Chromium | Build de produção carregou, desenhou o jogo e aceitou ENTER, sem erros HTTP/JavaScript; sem global de testes |

### Cobertura de lógica

- Movimento normalizado e limites da arena; disparo no alvo mais próximo; colisões, armadura, dano e morte com prioridade sobre XP/vitória.
- Hater com projéteis; Sigma Focus com redução de velocidade, duração de 3 s e cooldown de 22 s.
- FLEX de 1 s sem movimento/novos ataques; pelo menos 3 inimigos no raio de 145 px; +25 Aura e empurrão; falha sem plateia, interrupção com uma única penalização de Aura e cooldown de 15 s.
- Ranks de Aura e Burst: reset para 40, +20% de dano durante 6 s e renovação se ocorrer outro Burst.
- XP apenas após recolher drops, escolhas únicas, limites de stacks, múltiplos níveis em fila e pausa de toda a simulação durante upgrades.
- Efeitos dos dez buffs: dano Sigma/Alpha, críticos Mewing, cadência Locked In, Drip, velocidade, vida máxima/cura, Six Seven, Mewing Jaw e Ohio Orbiter. Dano, críticos e cadência são também verificados nos ataques emitidos pela simulação.
- Cinco vagas, boss único, exigência de tempo + boss derrotado, vitória, morte e limpeza de todos os estados ao reiniciar.
- Equivalência de movimento entre tamanhos de frame e limite de recuperação após separadores inativos.

### Browser: o que foi exercitado

1. Intro/canvas, ENTER, WASD/setas, ataques e eliminações naturais, drop real de XP, recolha, menu de upgrades, pausa, seleção por teclado e F3.
2. FLEX com sucesso, imobilização, cooldown, interrupção por colisão e Aura Burst.
3. Transições das cinco vagas, spawn do boss, ausência de vitória com boss vivo, morte do boss por disparo, vitória e reinício.
4. Colisão letal, derrota e reinício com HP e upgrades repostos.

Os testes combinam teclado real com cenários controlados: posicionam inimigos/drops e avançam os relógios para chegar às condições de fronteira sem esperar uma partida inteira. Não representam uma vitória natural de cinco vagas nem uma avaliação humana do balanceamento. A referência à instância Phaser é injetada apenas na resposta HTTP pelo teste; não é publicada na aplicação.

As capturas de intro, combate, upgrades, boss, Burst, vitória e derrota foram produzidas. As capturas de combate e upgrades foram inspecionadas visualmente; os rótulos das barras foram alinhados durante esta revisão. Uma falha de toques curtos em frames lentos foi corrigida com uma fila de eventos de tecla e verificada novamente, incluindo um toque curto em F3. Os quatro testes passaram após a correção.

### Correções e parâmetros explícitos

A cena original atribuía XP diretamente, ignorava nove efeitos de upgrades, não aplicava o dano temporário do Burst e permitia vencer com o boss vivo. A simulação agora é independente do Phaser, permite regressões automatizadas e implementa essas regras.

Valores de afinação onde a documentação não os fixava:

- Mantido o ganho original de +10 Aura a cada cinco eliminações e a cura de 20 HP entre vagas, agora respeitando a vida máxima dos buffs.
- Críticos causam 2× dano; categorias de multiplicadores de dano multiplicam entre si e stacks da mesma categoria somam. Drip mantém um mínimo de 1 dano por impacto.
- XP é atraído a menos de 100 px e recolhido a menos de 26 px. Drops por recolher são limpos ao iniciar a vaga seguinte.
- FLEX empurra 85 px, respeitando a arena. O cooldown começa no fim/interrupção, como no sistema original. Projéteis já lançados continuam em voo, mas FLEX impede novos ataques, incluindo armas secundárias.
- Mewing Jaw: 26 dano, raio de 95 px, intervalo de 1,1 s. Ohio Orbiter: 14 dano, órbita de 76 px, intervalo de dano de 350 ms. Six Seven: sete projéteis de dano base 18.
- Hater para a 235 px e dispara a cada 1,8 s; boss dispara a cada 1,2 s; projéteis hostis a 165 px/s. Focus mantém o fator de velocidade original de 0,62.
- Ataques principais usam os 470 px/s da especificação. Boss aparece aos 12 s da quinta vaga; novos inimigos deixam de aparecer após 50 s, permitindo terminar o combate contra o boss.
- Cooldowns, buffs temporários e streaks usam tempo de simulação; ficam pausados em menus/entre vagas. Frames são divididos em passos de até 1/60 s e intervalos de inatividade superiores a 250 ms são descartados.

### Limitações

- Não foi feito playtesting humano completo de dificuldade, builds ou equilíbrio do boss.
- Desempenho em GPU real, browsers móveis e outros motores de browser não foi medido; SwiftShader neste ambiente é lento.
- O CI foi configurado para executar também Playwright, mas a execução remota só pode ser confirmada no GitHub.
- A API do GitHub devolveu HTTP 403 no proxy durante a leitura da issue #1. O âmbito seguido foi o pedido do utilizador e `docs/CODEX_TASK_001.md`.
