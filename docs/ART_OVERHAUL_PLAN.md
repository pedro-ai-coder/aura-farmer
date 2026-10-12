# AURA FARMER · ART OVERHAUL PLAN
**ID:** AF-ART-OVERHAUL · **Estado:** Gate A reiniciada após rejeição do desvio botânico · **Data:** 2026-10-12  
**Requisito principal:** retirar o “AI-generated look” de **toda a arte**, sem transformar 'Farmer' em agricultura. O jogo consiste em **farmar Aura** por combate/FLEX, não cultivar hortas.  
**Autoridade visual:** [Visual Bible v2](VISUAL_BIBLE_V2.md) · **Lista controlável:** [Art Asset Register](ART_ASSET_REGISTER.csv).

## 0. Estado real verificado no GitHub

- `main`: menus, HUD, pausa/settings, results, upgrades, loading e wave complete com identidade anterior (PR #26); PixelWorld usa base procedural/pixel-art e sheets B1/B2/B3 para Sigma/Alpha/Rizzler.
- **PR #28:** correção de portrait strips Ohio/Fanum/Six-Seven está **integrada em main**. Resolve o bug de seis sprites num círculo, **não** constitui o portrait final.
- **PR #27:** 10 ficheiros SVG alternativos (herói, NPC, Hater, Beta, boss, armas/pickups, FX/arena) mais loader opt-in `?runtimeArt=1`. CI verde, mas **arte rejeitada por feedback**. Não fazer merge desta alternativa estática como se fosse arte final.
- `docs/ART_BIBLE.md` e `docs/SPRITE_PRODUCTION_P0.md` documentam anteriores testes e tamanhos. A [Visual Bible v2](VISUAL_BIBLE_V2.md) assume as regras de produção da próxima geração. Não eliminar os registos históricos.
- Backend, Supabase/login/global leaderboards fora do scope. Nenhum valor de combat stats, input, run progression ou persistência deve mudar neste plano.

## 1. Definição de “revisão total”

**Correção de direção — vinculativa:** a primeira proposta Gate A de quinta encantada, hortas, raízes e florestas foi rejeitada pelo Game Director. A identidade passa a **Aura Arena / stylized meme-combat arcade**. Toda a arte de produção segue [Visual Bible v2.1](VISUAL_BIBLE_V2.md). Não produzir boss vegetal, tiles de terra agrícola, flores/folhagem decorativa, sinais de madeira ou casas como tema central. A antiga arte conceptual não passa automaticamente a sprites de produção.

Auditar e classificar **cada superfície que o jogador vê**, mesmo as que tecnicamente já funcionam:

| Área | O que se substitui/revê | Resultado do lote |
|---|---|---|
| 6 heróis | 6 sheets animadas + 6 retratos, armas/acessórios coerentes | cada um com silhueta única e poses consistentes |
| 3 inimigos + boss | NPC, Hater, Beta, BIG HATER: sheets, telegraphs e boss readability | ameaça identificável e animação combinada com core |
| Ataques/pickups/VFX | projectiles, XP, orbs, hit/crit, death, FLEX, Aura Burst, Focus, heal, wave effects | clara distinção de friendly, hostile, XP e recompensas |
| Cenário | ground 32px modular, painéis de arena, marcas geométricas, blocos de treino, props periféricos e sombras | farm visualmente coerente sem bloquear a ação |
| Menus e HUD | logo, backgrounds, 9-slice, botões, cards, ícones, badges, rankings, loading | a mesma linguagem e materiais em todas as telas |
| Transições | select, wave complete, boss spawn, victory/death e level-up | entradas/saídas curtas com foco e reduzido movimento |

**Não aumentar scope:** não inventar harvesting, chests, NPCs interactivos, novos inimigos, multiplayer, compras ou quests antes de existirem regras concretas. Arte especulativa fica `BACKLOG` no registo.

## 2. Como usar o registo de assets

`docs/ART_ASSET_REGISTER.csv` é uma lista importável num board/spreadsheet; cada linha = 1 asset ou família que exige revisão. Campos: `id,grupo,asset,estado_atual,acao,prioridade,gate,frame_spec,source_atual,export_alvo,criterio`. **As linhas são tarefas planeadas**, não prova de que PNGs finais existam.

Estados:
- `LEGACY`: imagem/frame no jogo mas carece de revisão e/ou fonte final.
- `PROTOTYPE`: desenho SVG/PNG temporário, mockup ou arte funcional sem master.
- `PLANNED`: ainda não existe asset de produção, ou é uma variação prevista.
- `UI_PRESENT`: componente funcional, estilo/proveniência ainda por aprovar.
- `NOT_IMPLEMENTED`: visual dependente de mecânica ausente — não trabalhar neste ciclo.

Cada linha só passa a `APPROVED` após obter source/exports, aprovação Gate A/B/C, captura in-game e testes. **Sem inventar aprovação retroativa.**

## 3. Etapas de trabalho com PRs pequenas

### AF-ART-V2-00 — Documentação, auditoria e referência comum (esta PR)
**Entregáveis:** Visual Bible v2, Art Overhaul Plan, inventário CSV, ligação no Roadmap. **Sem assets falsamente marcados como “final”**.  
**Critério de fecho:** revisor concorda com estilo, paleta proposta (ou corrige), frame sizes e prova Gate A.

### AF-ART-V2-01 — Gate A: Style Test jogável (única fonte para todas as famílias)
**Produzir só:** (1) Sigma em pose idle/move e retrato, (2) NPC + Hater como rivais humanos/caricaturais (não criaturas vegetais), (3) tiles geométricos de arena base/alt, (4) pequeno XP crystal e `fx_hit`, (5) captura de combate com o HUD existente.  
**Exigir:** masters editáveis originais, folhas de silhuetas, 1× / 4×, composições com/sem efeitos; duas variantes de paleta no mesmo enquadramento.  
**Teste obrigatório:** desktop 960×600 e 1440×900, Android landscape 844×390, portrait 390×844; comparar antes/depois no mesmo save/seed quando possível.  
**Bloqueio:** não escalar produção se o look continuar genérico ou se a leitura do jogador piorar.

### AF-ART-V2-02 — Seis protagonistas + portraits
**Ordem:** Sigma → Alpha Chad → Rizzler → Ohio Kid → Fanum Lord → Six Seven Kid.  
**Por herói:** master, sprite sheet tagged, `idle/move/hurt/flex_charge/flex_success/death`; skills específicas quando efetivamente usadas; portrait separado; fallback atual mantido.  
**Segurança técnica:** nenhum uso de strip de animação no componente `.meta-avatar`; separar UI portrait dos frames de jogo.  
**Critério de fecho:** seis poses/silhuetas únicas e reconhecíveis no mobile real; animações sem saltos de pivots ou deformações inexplicadas.

### AF-ART-V2-03 — Inimigos, elites e boss
**Ordem:** NPC → Hater → Beta → BIG HATER.  
**Por enemy:** atlas nativo, `idle/move/hit/death`, `attack` apenas onde aplicável; boss com `windup/attack/hurt/death`.  
**Teste:** 90 inimigos, invulnerabilidade/flash, boss HP bar, hostile bullet telegraph fiel, hitboxes originais.  
**Critério de fecho:** três classes e boss diferenciados por silhueta, peso, cor e ameaça, sem efeitos a mascarar tiros.

### AF-ART-V2-04 — Combat VFX, pickups, armas
**Prioridade 1:** `xp_small`, `projectile_aura_shot`, `projectile_hater`, `weapon_ohio_orbiter`, `fx_hit`, `fx_crit`, `fx_death_poof`.  
**Prioridade 2:** FLEX charge/success/fail, Focus, Aura Burst, heal, Mewing swipe, bounce spark, radial 67 shot.  
**Critério de fecho:** partículas limitadas, leitura em swarm, `prefers-reduced-motion`, zero alteração de danos, FX desaparecem quando suposto.

### AF-ART-V2-05 — Arena modular + props
**Prioridade:** tiles de arena 32px base/alt/seam/warning, linhas, blocos de treino, marcas no piso e props de perímetro (sem natureza), XP mais brilhante que o chão.  
**Entregar:** source tiles editáveis, atlas/padding, padrões discretos, organização em camadas e preview com/sem props artificiais de arena.  
**Critério de fecho:** chão geométrico quieto no centro e legível em mobile; nenhum novo collider; mínimo de 90 inimigos testado.

### AF-ART-V2-06 — Revisão completa de UI e telas
**Ordem:** Character selection → HUD → Upgrade & rarity cards → Wave/boss/level-up → Pause/settings → Main menu/loading → Results/achievements/rankings.  
**Integrar:** portraits finais, ícones reais de 16 buffs + ultimate, 9-slice artesanal, botão MENU, hierarquia coerente, loading real, states focus/hover/pressed/disabled e responsive.  
**Critério de fecho:** screenshots de todos os estados sem sobreposição, texto em inglês acessível, inputs existentes intactos.

### AF-ART-V2-07 — Polish, audit e sign-off
**Entregar:** corrida de cinco waves, boss, victory/death, estados de todos os seis heróis, vídeo curto desktop/mobile, matriz de capturas antes/depois, medição de FPS/memória, licenças/proveniência, changelog visual.  
**Gate D:** aprovação explícita do Game Director → só depois merge final e autorização para planear backend.

## 4. Definição de pronto por asset (DoD)

O elemento só sai de “em trabalho” quando **todas** as condições aplicáveis passam:

- [ ] identidade/silhueta validada a 1×, sem cor e com 90 inimigos próximos quando relevante
- [ ] desenho original verificado com master em camadas, fontes/licenças explícitas
- [ ] formato correto: RGBA PNG, JSON tags/offset/pivot, padding/extrude, nomenclatura `snake_case`
- [ ] frame/pose consistente: proporções, roupa, acessórios e linha de solo idênticos
- [ ] textura carregada por Phaser, fallback preservado, nenhuma regressão no core
- [ ] preview comparável com captura no desktop, landscape e portrait
- [ ] `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser` verdes
- [ ] retrato real não é strip; disabled/locked cards mantêm legibilidade e accesibilidade
- [ ] perf comparada com baseline no hardware alvo; critério consensual de frame rate e memória
- [ ] assinatura visual (screenshot + versão do asset + aprovação) anexada à PR

## 5. Critérios de passagem e bloqueios

| Gate | Quem aprova | Evidência mínima | Se falhar |
|---|---|---|---|
| A — Design test | Game Director | sheet de silhuetas, paleta, 3 assets, preview in-game | refazer poses/paleta, não encomendar dezenas de sheets |
| B — Runtime | Game Director + integração | 6 heróis, NPC/Hater/Beta/boss animados, gameplay real | corrigir atlas/escala/telegraph |
| C — Polimento | Game Director + QA | VFX, arena, telas responsive e performance | reduzir FX, repetir composição de cena |
| D — Release | Game Director | run completa + anexos e direitos + CI verde | manter preview; não fazer merge nem ir para backend |

**Qualidade do “não parece IA”:** o teste é *concreto*: proporções e poses estáveis, materiais/luz consistentes, escolhas de shape repetíveis, paleta restrita, sprites modulares e masters editáveis. Não é “adicionar mais detalhe” nem afirmar uma origem humana que não esteja demonstrada.

## 6. Organização das PRs #27 e #28

- **#28 — concluída:** correção dos 3 retratos foi testada e integrada em `main` (squash SHA `e1c4f322`). Essa PR **não encerra** o trabalho artístico dos retratos.
- **#27 — experimental / NÃO FAZER MERGE:** os SVGs estáticos não satisfazem a qualidade desejada. Manter o preview opcional para comparação técnica, ou fechar a PR depois de migrar apenas o loader útil, sem promover os SVGs a ativos finais. A revisão artística nunca depende de fazer merge de #27.
- **Nova sequência:** esta documentação → Style Test → heróis → inimigos → VFX → arena → UI completo → polimento. Cada fase numa PR revisável, sem PR monolítica que esconde decisões visuais.
- **Backend #18:** mantém-se isolado/draft; autenticação, tabelas e leaderboard online não se iniciam com base numa PR de arte.

## 7. Ordem da próxima semana de trabalho (tarefas já accionáveis)

1. Fazer um **screenshot base** no desktop + mobile landscape de Sigma, NPC, Hater, boss, cards e menu, com a mesma resolução em cada comparação.
2. Desenhar 3 thumbnails de Sigma, NPC e Hater **em silhueta pura**, sem folhagem/raízes; reter 1 por tipo após revisão.
3. Produzir 1 personagem, 2 inimigos, 2 tiles de arena e 1 FX em master editável; provar continuidade de outlines, paleta e proporção.
4. Exportar PNG + JSON, criar um toggle visual de QA sem reescrever o core; gerar imagens antes/depois.
5. Obter aprovação Gate A. Se rejeitado, rever arte e **não** abrir fase massiva de atlases.

Os tempos de sprint devem ser estimados quando existirem artista, master de referência e feedback de Gate A. Este documento não assume contratação, orçamento, ou que os assets finais já foram produzidos.

## 8. Lista de QA para aceite de cada PR

**Desktop:** 960×600, 1440×900, 5-wave loop, 90 enemies/stopwatch, core combat untouched.  
**Mobile:** 844×390 landscape full bleed, 390×844 portrait, 2 tamanhos de toque relevantes, overlays sem clipping.  
**Visuais:** sem screenshot gerado convertido diretamente em sprite, sem duplas sombras, sem ícones fora de estilo, sem texto baked-in.  
**Persistência:** localStorage e unlocks mantidos, 6 cards carregam retratos corretos, pontuação local mantém honestidade “offline”.  
**Motion:** reduced-motion passa; sem flash intenso; principal telegraph visível.  
**Aprovação:** screenshot + GIF/MP4 + inventário atualizado + PR assinada.

**Estado de entrega:** a Gate A botânica foi rejeitada e substituída por uma proposta arcade não-botânica. O plano e os gates orientam novas PRs; os assets finais **ainda não estão produzidos nem aprovados**.
