# AURA FARMER — ART BIBLE

**ID:** AF-ART-001 · **Estado:** DIREÇÃO E PERSONAGEM APROVADOS; GATE A EM PREPARAÇÃO · **Data:** 2026-10-10  
**Direção aprovada:** *Pixel Cartoon Brainrot Arcade* · **Idioma do jogo:** inglês · **Paleta:** revisão clara em teste  
**Responsáveis:** Game Director (aprovação), Art Director/Pixel Artist (arte), Codex (integração técnica)

> **Decisão 2026-10-10:** direção visual aprovada, The Sigma com hoodie escuro, cabelo angular e símbolo dourado aprovado, paleta mais clara solicitada. É permitido preparar arte conceptual Gate A, **mas não produzir lote completo, alterar o jogo, fazer merge nem publicar** sem aprovação posterior do Gate A. O estilo atual do jogo é Cartoon 2D desenhado por código. Esta Art Bible propõe uma evolução para pixel cartoon. Foi elaborada com base em orientações públicas de Pedro Medeiros / Saint11 e documentação do Aseprite; **não** representa uma entrevista nem uma contratação de um pixel artist. Os sprites finais devem ser originais e com direitos de utilização comercial verificados.

## 1. Visão e identidade visual

**Tagline visual:** *Main-character energy in a cursed arcade.*

**Pilares:**
1. **Expressive chibi:** personagens cabeçudas, expressões ridículas, braços/poses exagerados, vista top-down em três quartos.
2. **Chaos with hierarchy:** visual exuberante mas legível durante 90 inimigos; jogador e ataques hostis sempre distinguíveis.
3. **Meme without dependence:** humor por silhouettes, 67, Aura, Flex e personagens originais; nunca copiar IP de LoL/Brotato, streamers ou marcas.

**Atmosfera revista:** arcade pastel luminoso, arena lavanda clara com outlines ameixa escura, contraste neon pontual e detalhes dourados de Aura; inimigos caricaturais e falsamente intimidadores. Ecrã cheio de ação mas não de ruído. O jogador deve entender o ataque de um Hater enquanto tenta um FLEX.

**Evitar:** realismo, gradient blur, inúmeros detalhes isolados, strobes/glitch agressivos, ataques escondidos por partículas e faces impossíveis de ler no telemóvel.

## 2. Design system

### Paleta CANDIDATA CLARA — Lavender Pop Arcade (Gate A)

Esta é a proposta concreta da versão **mais clara** escolhida pelo Game Director. O estilo e a personagem já estão aprovados; **valores HEX, contraste e leitura continuam sujeitos ao Art Test**.

| Papel | Cor visual | HEX | Uso |
|---|---|---|---|
| Cloud Cream | creme muito claro | `#F6F0EA` | exterior, painéis, luz ambiente |
| Lavender Field | lavanda pastel | `#DDD6F0` | chão principal da arena |
| Soft Lilac | lavanda média | `#C6B6E5` | tiles alternativos e sombras baixas |
| Plum Ink | ameixa escuro | `#302747` | outlines, texto escuro e HUD |
| Midnight Hoodie | violeta-escuro | `#44345F` | roupa do protagonista |
| Sigma Violet | violeta saturado | `#8B5BD8` | efeitos/identidade Sigma |
| Aura Gold | dourado luminoso | `#FFCC51` | símbolo do peito, recompensa; outline escuro |
| Hater Pink | rosa intenso | `#EA568A` | Hater e boss |
| Warning Coral | coral forte | `#E75154` | avisos hostis, sempre contornados |
| Beta Mint | menta moderada | `#69BFA8` | Beta Bro |
| Ohio Cyan | ciano vivo | `#2CB4C7` | glitch e Focus |
| XP Green | verde forte | `#24AF7A` | XP e cura; highlight claro |
| NPC Fog | cinza-lavanda | `#89839E` | NPC, outline escuro |
| Glow Ivory | creme claro | `#FFF8E7` | brilhos e centros de explosão |
| Electric Yellow | amarelo vivo | `#F5E75D` | eventos Six Seven, com sombra escura |

**Hierarquia de contraste**: (1) player hoodie escuro + símbolo dourado; (2) projéteis perigosos coral contornados; (3) XP verde forte; (4) arena desaturada e pouco detalhada. Nunca depender só da cor para ameaça/raridade. Texto da UI sobre panel Plum Ink ou em Plum Ink sobre creme; evitar branco sobre lavanda clara. HUD pode permanecer escuro para manter leitura.

**Comparativo Gate A**: apresentar paleta clara e uma variante ligeiramente mais saturada da mesma família; não regressar à versão noite-púrpura. Testar leitura em escala real no Android portrait/landscape, acessibilidade e grayscale.

A paleta final é congelada apenas depois da aprovação visual **Gate A**. Cada sprite com 4–6 cores dominantes (+ outline), luz do topo esquerdo, 1 sombra base e 1 highlight. Reduzir *orphan pixels* e dithering; distinguir silhuetas sem cor.

### Perspetiva, resolução e pivots

- Vista **top-down 3/4**, corpo chibi. Cabeça aproximadamente 35–45% da altura desenhada; mãos/olhos ampliados.
- Unidade visual de referência 32×32 px. **Frames player/NPC/Hater 48×48 px** com corpo de ~28–36 px e margem transparente. **Beta Bro 64×64 px** e **Big Hater 128×128 px**. A dimensão do frame não é a dimensão de colisão.
- Boss corpo visual ~90px de largura; comparação de hitbox com o raio existente é obrigatória. Não alterar hitboxes para fazer a arte “encaixar”.
- Pickups e projéteis 16×16 px; ícones 16×16 ou 24×24; VFX 32×32/64×64; ondas de grandes dimensões podem continuar desenhadas no Phaser.
- Sombra elíptica desenhada no motor de jogo, sem multiplicar os frames. **Pivots** para personagens: `feet_center` constante; projéteis/UI: `center`.
- Na versão web atual, a resolução lógica é **960×600**. A proposta é sampling nearest-neighbor para *sprite art*, com alterações globais ao Phaser só depois de medir impacto no HUD e mobile. Escalas inteiras onde praticável, mas não sacrificar a legibilidade responsiva.
- Paleta de perigo é consistente: coral/rosa = ameaças; dourado = recompensas e Aura; verde = XP/cura.

## 3. Fichas dos protagonistas e inimigos

### The Sigma (player único da versão atual — LOOK APROVADO)
Hoodie escuro Midnight Hoodie com outline Plum Ink, cabelo angular curto apontado para cima, símbolo dourado Aura Gold no peito, ténis volumosos. Expressão de “main character” sem ser retrato de ninguém. Em FLEX cruza os braços e faz pose imóvel; se for interrompido, olhos aumentam; se tiver GOD AURA, a aura brilha **fora** do sprite, não numa nova versão de 20 frames.

**Player sheet:** `player_sigma`, frame 48×48; tags `idle` 4f/6fps, `move` 6f/10fps, `hurt` 2f, `flex_charge` 4f/6fps, `flex_success` 3f, `death` 6f. Focus/Shield/Aura Burst são efeitos reutilizáveis externos.

### NPC (`npc`)
Quadrado macio com olhos vazios e corpo simétrico, cinza/lavanda, aparência sem iniciativa. Frame 48×48. Tags `idle` 2, `move` 4, `hit` 1, `death` 4.

### Hater (`hater`)
Silhueta serrilhada, sobrancelha furiosa, bico/spike no topo, magenta/coral. Frame 48×48. Tags `idle` 2, `move` 4, `attack` 4, `hit` 1, `death` 4. Ataque ranged comunica direção antes do projétil hostil.

### Beta Bro (`beta`)
Largo, ombros exagerados, braços pendurados, sorriso frágil ou expressão desconfortável, verde menta/cinza. Frame 64×64. Tags `idle` 2, `move` 4, `hit` 1, `death` 4. É preciso reconhecer que é lento/pesado só pela silhueta.

### Big Hater (`boss`)
Boss final: forma de Hater enorme, coroa torta original, mandíbula forte, expressão teatral. Magenta/coral, highlights dourados sujos. Frame 128×128. Tags `idle` 4, `move` 4, `attack` 5, `hurt` 2, `death` 8. `summon` e ataque alternativo só quando os respetivos comportamentos existirem no core.

### Inimigos aprováveis para futuro P1 (ainda não implementados na `main`)
- **Yap Goblin:** corpo triangular/pêra, boca e dentes exagerados, cartoon amarelo/rosa; `idle`2, `move`4, `windup`3, `attack`3, `death`4. Aviso de cone procedural.
- **Ohio Glitch:** contorno desalinhado com elemento neon cyan, `idle`3, `move`4, `teleport_start`3, `teleport_end`3, `death`4. Sem flashes fotossensíveis.
- **Fanum Thief:** ladrão compacto, pernas rápidas, saco de XP verde, `idle`2, `move`4, `steal`3, `escape`4, `death`4.
Todos usam frames 48×48. **Cringe Runner, Doomscroller e Brute são conceitos de backlog**, sem sprites a produzir já.

## 4. Regras de visualização dos buffs

Há **16 buffs no jogo** atualmente; nenhum requer uma sheet completa nova do protagonista. Cada buff tem ícone e os efeitos observáveis são tint, aura, pequenas partículas ou sprites específicos reutilizáveis. Priorizar estes overlays:

- **Sigma / Alpha:** halo roxo/dourado em volta da personagem.
- **Crash Out:** pulso vermelho discreto só com vida baixa.
- **Touch Grass:** pequenas folhas verdes quando cura.
- **Rizz Aura:** onda rosa curta e reconhecível ao disparar efeito.
- **Skibidi Bounce:** pequeno spark no ricochete, sem cadeia de efeitos.
- **Delulu:** um escudo que parte no golpe letal salvo.
- **Ultimate 67:** “67” pequeno acima do player no primeiro proc de sinergia, não permanente.

Os efeitos só comunicam mecânicas existentes. Buffs não devem alterar a hitbox nem a velocidade real do personagem via animação.


## 5. Armas, efeitos e feedback

| Asset | Tamanho / frames | Identidade |
|---|---|---|
| `projectile_aura_shot` | 16px / 2f | amarelo com cauda curta |
| `vfx_mewing_swipe` | 64px / 4f | arcada de mandíbula cartoon |
| `weapon_ohio_orbiter` | 24px / 4f | objeto orbital ciano |
| `projectile_six_seven` | 16px / 2f | distinto do tiro principal |
| `vfx_bounce_spark` | 32px / 4f | faísca de ricochete |
| `projectile_hater` | 16px / 2f | coral/rosa de ameaça |
| `vfx_hit` | 32px / 4f | impacto curto |
| `vfx_crit` | 32px / 5f | estrela dourada angular |
| `vfx_death_poof` | 32px / 5f | nuvem cartoon sem gore |
| `vfx_flex_charge` | 32px / 4f | indicação de pose de risco |
| `vfx_flex_success` | 64px / 5f | clarão e onda dourada |
| `vfx_flex_fail` | 32px / 4f | pequeno efeito de falha |
| `vfx_aura_burst` | 64px / 6f | halo poderoso e breve |
| `vfx_focus` | 32px / 4f | pulso de energia ciano |
| `vfx_levelup` | 32px / 5f | faíscas verdes/douradas |
| `vfx_heal` | 32px / 4f | pixels verdes de recuperação |

**Segurança visual:** zonas de ataque e cone de Yap Goblin são desenhados proceduralmente pelo Phaser para coincidirem com a área real de dano. Manter a duração de cada VFX independente das regras do core. Evitar FX persistentes que tornem telegraphs invisíveis. A onda FLEX não deve esconder jogadores nem inimigos.

## 6. Pickups, ícones, UI e arena

### Pickups
Obrigatório agora: `pickup_xp_small` (16px, 2 frames, verde). Reservar `pickup_xp_medium`, `pickup_xp_large`, `pickup_heart`, `pickup_shield` para quando existirem diferenças reais de drops/pickups no core. Não pagar arte que ainda não tem lógica implementada.

### Buff icons
Produzir 16 ícones de 16×16 px, com possibilidade de usar 24×24 se os testes mobile justificarem: `icon_sigma`, `icon_alpha`, `icon_mewing`, `icon_locked_in`, `icon_drip`, `icon_speed`, `icon_six_seven`, `icon_thick_skin`, `icon_mewing_jaw`, `icon_ohio_orbiter`, `icon_crash_out`, `icon_skibidi_bounce`, `icon_delulu`, `icon_touch_grass`, `icon_mogged`, `icon_rizz_aura`. Adicionar `icon_ultimate_67` como símbolo da sinergia.

As raridades dos buffs usam moldura e etiqueta, não apenas cor: COMMON cinza/azul, RARE violeta, EPIC dourado. O ícone deve ser reconhecível sem depender da cor.

### UI
- Frames de upgrades `ui_upgrade_common` / `ui_upgrade_rare` / `ui_upgrade_epic`: preferir 9-slice.
- `ui_aura_bar`: frame e ornamentação; texto/número da Aura renderizados via código.
- `ui_wave_banner` e `ui_boss_warning`: curtos, claros, margem de segurança no ecrã.
- Botões Android PLAY/FLEX/FOCUS/RETRY e escolhas por toque: **skin apenas**; preservar o tamanho e as áreas táteis atuais.
- Todo o texto apresentado ao jogador é **inglês**, desenhado pela UI, nunca incorporado permanentemente numa imagem.

### Arena P0
Quatro tiles 32×32: `tile_floor_base`, `tile_floor_alt`, `tile_floor_crack`, `tile_floor_aura_stain`. Três props 32×32: `prop_phone_debris`, `prop_crate`, `prop_aura_totem`. Props apenas decorativos, sem nova colisão. Chão escuro/subtil para destacar projéteis, XP e avisos hostis.

**P1**, após eventos implementados: `ui_six_seven_surge`, `ui_fanum_tax_raid`, markers de evento, mais 2 tiles e 3 props.

## 7. Inventário para aprovação e produção

### Gate A — Art Test (começar por aqui, antes de animar tudo)

| ID | Entrega | Verificação |
|---|---|---|
| ART-001 | Style frame de arena com HUD 960×600 | snapshot desktop + crops Android |
| ART-002a | The Sigma estático | rosto/silhueta/escala/paleta |
| ART-003a | NPC e Hater estáticos | distinguir silhuetas sem cor |
| ART-006a | FLEX efeito exemplo | ação de risco visualmente legível |

Primeiro elaborar 3 thumbnails de silhueta de Sigma, NPC e Hater; aprovar um por personagem. **Não encomendar sheets completas antes de Gate A ser aprovado.**

### P0 — Primeiro upgrade visual jogável

| ID | Entrega | Âmbito |
|---|---|---|
| ART-002 | Sigma animado | 48px, idle4/move6/hurt2/flex4+3/death6 |
| ART-003 | NPC / Hater / Beta Bro animados | 48/48/64px, 11–15f por personagem |
| ART-004 | Big Hater animado | 128px, idle4/move4/attack5/hurt2/death8 |
| ART-005 | Armas e projéteis | 6 assets curtos do `5 |
| ART-006 | Combat feedback | 10 VFX do `5 |
| ART-007 | XP pequeno | 16px/2f |
| ART-008 | Ícones | 16 buffs atuais + Ultimate 67 |
| ART-009 | UI e banners | frames upgrade, Aura e warnings |
| ART-010 | Arena e props | 4 tiles e 3 props |
| ART-011 | Integração em Phaser | atlasses, animações, fallback, testes |

### P1 — Quando o gameplay novo estiver pronto

| ID | Entrega | Pré-requisito |
|---|---|---|
| ART-101 | Yap Goblin / Ohio Glitch / Fanum Thief | AI e telegraphs implementados |
| ART-102 | Fanum Tax / SIX SEVEN banners e markers | eventos implementados |
| ART-103 | Overlays especiais de Aura | necessidade provada por playtest |
| ART-104 | Decoração extra | budget/performance testada em Android |
| ART-105 | Skins e vistas adicionais | aprovação de produto |

**Backlog sem orçamento nesta fase:** Cringe Runner, Doomscroller, Brute, outras personagens jogáveis, bosses extras, loja e biomas.

## 8. Formatos, estrutura e pipeline

Estrutura sugerida de fontes/exports (Codex confirma antes de criar):

~~~text
art/source/characters/player_sigma.aseprite
art/source/enemies/npc.aseprite
art/source/enemies/hater.aseprite
art/source/enemies/beta_bro.aseprite
art/source/bosses/big_hater.aseprite
art/source/vfx/*.aseprite
art/source/ui/*.aseprite
art/exports/characters/*.png + *.json
art/exports/enemies/*.png + *.json
art/exports/ui/*.png + *.json
public/assets/pixel/     # atlases da versão web, sem ficheiros-fonte
src/game/render/         # loader + animation registry
~~~

**Entregas do artist:** `.aseprite` original, `.png` com alpha, `.json` com frames/tags/pivots, visualização a 1x e screenshot no jogo, licença de uso comercial explícita. Nomes em inglês e snake_case. Tags `idle` / `move` / `attack` / `hurt` / `death` / `flex_charge` (apenas onde se aplicam). 6–12 fps, duração definida por animação. 2 px de padding entre frames e pivots invariantes (`feet_center` nos characters, `center` em projéteis/VFX). Não cortar frames arbitrariamente sem guardar offsets.

O Aseprite suporta export de sprite sheets, tags e JSON. Exemplo orientador:

~~~bash
aseprite -b art/source/characters/player_sigma.aseprite \
  --sheet art/exports/characters/player_sigma.png \
  --data art/exports/characters/player_sigma.json \
  --sheet-type packed --sheet-pack
~~~

**Codex/Phaser:** criar renderer que lê atlasses sem reescrever `src/game/core/arena.ts`. Manter Graphics como fallback, não criar/destroy GameObjects para cada frame, sincronizar por ID estável, separar layers e manter warnings procedurais. A versão atual usa `pixelArt: false` / `antialias: true`; nearest-neighbor deve ser validado primeiro para não degradar HUD/texto e layout mobile. Não tocar em colisões, dano, XP, timings de Flex ou balanceamento.

## 9. Qualidade e regras de aprovação

**Gate A — Aprovação da execução visual da paleta clara:** silhuetas reconhecíveis sem cor, um frame Sigma/NPC/Hater, mockup arena e um VFX de FLEX; legível nos tamanhos 390×844 (portrait) e 844×390 (landscape). Direção geral e roupa/cabelo/símbolo do Sigma já aprovados; a paleta clara exata e os concepts precisam de aprovação própria.

**Gate B — Produção:** sheets com alpha limpo, animações sem jitter, tags e pivots corretos, fontes editáveis e direitos comerciais documentados; ícones reconhecíveis em tamanho natural.

**Gate C — QA no jogo:** WASD/joystick, PLAY, auto-fire, E/FLEX, Focus, XP, upgrades, cinco vagas, Big Hater, morte e vitória funcionam como antes. Executar `npm run typecheck`, `npm test`, `npm run build` e `npm run test:browser`. Teste Android real e desktop; medir FPS, tamanho do bundle e memória sem prometer números não medidos.

**Gestão:** dividir trabalho em PRs curtos: `art-test` → `characters` → `weapons-vfx` → `ui-environment`. Não alterar produção nem aprovar visual automaticamente. A Vercel Hobby pode bloquear previews de autores sem permissão; quem faz merge precisa de garantir autoria e autorização corretas, sem disfarçar identidade.

**Checklist para cada sprite:** silhueta, outline/luz consistente, expressão legível, hitbox visual coerente, pivot estável, animação suave, dados de export, legibilidade Android, trabalho original e licença comercial verificada.

## 10. Registo de decisões do Game Director — 2026-10-10

- [x] **Aprovada**: identidade Pixel Cartoon Brainrot Arcade em substituição futura à arte vetorial atual.
- [x] **Aprovado**: Sigma com hoodie escuro, cabelo angular e símbolo de Aura dourado no peito.
- [x] **Escolhido**: desenvolver uma **paleta mais clara**, não a versão noite-púrpura original.
- [x] **Autorizado**: preparar exclusivamente o **Art Test Gate A**, sem integrar sprites novos no jogo.
- [ ] **Pendente**: aprovar os valores e contraste da paleta Lavender Pop Arcade em arte visual.
- [ ] **Pendente**: aprovar Sigma, NPC, Hater, arena e VFX FLEX como mockup Gate A.
- [ ] **Pendente**: autorizar produção dos sprites P0 após Art Test.

**Aprovação do documento NÃO equivale a autorização de merge, implementação de assets em Phaser ou deployment em produção.**

## 11. Referências públicas

Material técnico e artístico consultado, sem entrevista/contratação:
- Pedro Medeiros / Saint11 — https://saint11.art/blog/pixel-art-tutorials/
- Clusters — https://saint11.art/pixel_art_articles/article2/
- Shading — https://saint11.art/pixel_art_articles/article4/
- Scaling — https://saint11.art/blog/scaling/
- Aseprite Sprite Sheets — https://www.aseprite.org/docs/sprite-sheet/
- Aseprite Tags — https://www.aseprite.org/docs/tags/
- Aseprite CLI — https://www.aseprite.org/docs/cli/
