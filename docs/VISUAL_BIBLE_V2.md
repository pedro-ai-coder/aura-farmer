# AURA FARMER · VISUAL BIBLE v2
**ID:** AF-ART-V2 · **Estado:** direção de produção proposta; aguarda aprovação visual do Gate A · **Data:** 2026-10-12  
**Prioridade:** arte de produção e identidade coesa **antes** de backend/login/rankings públicos.  
**Referências internas:** [Art Bible anterior](ART_BIBLE.md) · [Graphics Gate B](GRAPHICS_QUALITY_GATE_B.md) · [Art Overhaul Plan](ART_OVERHAUL_PLAN.md) · [Registo de assets](ART_ASSET_REGISTER.csv).

> **Regra de autoridade:** para *nova produção* artística esta Visual Bible v2 substitui as diretrizes visuais conflitantes da Art Bible anterior; as regras de combate e de engenharia em `DECISIONS.md`, `COMBAT_SPEC.md` e `TECH_PLAN.md` mantêm prioridade. As paletas e desenhos exatos aqui propostos ainda exigem prova visual in-game; **não afirmar que assets finais estão aprovados**. O facto de uma PR compilar não valida a sua arte.

## 1. Identidade e promessa visual

**Nome interno do estilo:** *Aura Farmer — Crafted Arcade Farm*.  
**Uma frase:** um pequeno herói absurdamente confiante enfrenta uma quinta encantada e corrompida; silhuetas cartoon memoráveis, pixel art de produção com animação intencional, VFX legíveis e menus como objetos do mesmo mundo.

Três pilares:
1. **Silhueta antes do detalhe.** O personagem precisa de ser reconhecido no tamanho real de jogo e em preto sólido. Uma pose sugere a personalidade, não um conjunto de brilhos.
2. **Ordem dentro do caos.** Chão calmo → inimigos legíveis → jogador dominante → ataques hostis sempre visíveis → recompensa distinguível. 90 inimigos não podem transformar a cena numa mancha.
3. **Carisma de arcade, não colagem de estilos.** Humor em expressão, timing e acessórios. Ornamentação de farm/madeira/folhas/cristais aparece como um vocabulário repetido com regras, não como decorações arbitrárias.

**Inspirações, sem copiar:** `Brotato` — legibilidade e shapes simples; `Vampire Survivors` — densidade e progressão; `Swarm` — impacto e hierarquia dos efeitos; `Brawl Stars` — poses/expressões e cards claros. Não reutilizar sprites, composições, UI exata, personagens, logos ou marcas de terceiros.

### O que NÃO é Aura Farmer
- Ilustração gerada como uma única imagem de ecrã e cortada em sprites.
- Gradient blur, bloom difuso em todos os elementos, luz sem fonte ou partículas decorativas permanentes.
- Faces diferentes entre poses, número de dedos/membros imprevisível, armas que mudam de tamanho e perspetiva sem intenção.
- Packs mistos: protagonista pixel-art e boss em pintura vetorial suave; inimigos com contornos de espessuras aleatórias.
- Fundos supertexturados, personagens demasiado pequenos, tipografia embutida em PNG, texturas genéricas sem modularidade.
- Referências a memes ou streamers reproduzidas como a imagem de pessoas reais.
- Falsos eventos/recursos desbloqueáveis que não existem no gameplay.

## 2. Gramática visual fechada para a prova Gate A

| Elemento | Regra de produção |
|---|---|
| Projeção | Top-down 3/4 consistente: cabeça, peito, mãos e pés visíveis; chão e sombra em perspetiva única |
| Frames | 48×48 player / NPC / Hater; 64×64 Beta; 128×128 boss; 16×16 pickups/projéteis; 32×32 tiles; 32/64px VFX |
| Personagem | Cabeça ocupa ~35–45% da altura desenhada; pés no mesmo eixo entre frames; 1 acessório principal + 1 secundário |
| Outlines | Escuro colorido, normalmente 1–2 px no desenho nativo, espessura constante por família; sem black outline de 5 px em uns e nenhum nos outros |
| Cores | 5–8 cores dominantes por sprite além de contorno; 1 sombra e 1 highlight coerentes; transparência só para VFX |
| Luz | Uma fonte principal superior-esquerda, sombras inferiores-direitas; exceções documentadas apenas para magia/impactos |
| Volume | Silhuetas de 3 massas principais; textura só onde reforça material/superfície |
| Sombra | Elipse suave controlada no Phaser abaixo das entidades; não incorporar sombra que salte entre frames |
| Animação | Ações fortes com antecipação → impacto → recuperação. Interpolação suave não substitui key poses. 6–12 fps para sprite frame tags onde aplicável |
| Escalado | Nearest-neighbor apenas para sprites pixel art, sem filtragem que altere texto e HUD; escalas fracionárias só após teste |
| Colisão | Hitbox/hurtbox continuam definidas no core. Nenhum sprite altera raio, dano, movimento ou duração de habilidades |
| UI | Ícones do mesmo vocabulário, moldura partilhada, texto editável em HTML/Phaser; efeitos subtis, foco visível |

### Paleta funcional — proposta a validar lado a lado
A antiga `Lavender Pop Arcade` não deve ser misturada a meio com uma pintura escura aleatória. Testar em uma cena de farm **calma com contraste**; conservar a distinção semântica da UI já implementada.

| Papel semântico | HEX base | Uso e restrição |
|---|---|---|
| Ink | `#202638` | outlines / fundo de texto |
| Farm soil | `#66634A` | piso neutro, baixo contraste |
| Farm light | `#A9AD7B` | variação clara do chão, nunca cor de pickup |
| Deep sky/panel | `#152B44` | menus, HUD, inventário |
| Leaf | `#67BF62` | vegetação e cura (não exclusivamente comunicação de cura) |
| Aura gold | `#F9C954` | recompensas, skill/FX especiais; uso raro |
| XP jade | `#35D2A2` | cristais de XP, legíveis sobre ambos os pisos |
| Player cyan | `#57C7EE` | acentos do herói/Focus, controlado |
| Corruption magenta | `#C155D5` | ameaça corrompida e boss |
| Hostile coral | `#FF697A` | projéteis inimigos e avisos críticos |
| Ivory | `#FFF2D7` | texto sobre fundo escuro e brilho de ataque |
| Wood | `#9E683C` | UI ornamental, cercas, caixas |

**Paleta não é licença para usar todas as cores em cada sprite.** Cada personagem recebe uma paleta reduzida e os avisos mantêm forma distinta, não só cor. Contraste: texto regular ≥4.5:1, texto grande/ícones críticos ≥3:1, salvo elementos decorativos; medir no browser no estado efetivo. A paleta só congela após duas versões de estilo-frame comparadas sob o mesmo fundo/escala.

## 3. Direção específica de personagens

**Todos os heróis** precisam de corpo, cabeça, braços, mãos, arma e pés com relações invariantes entre poses. Retrato de menu é **desenho independente**, não o strip inteiro de animação apertado num círculo. Não recolorir a mesma face para fingir seis designs.

| ID | Forma/silhueta e acessório | Gesto-chave / identidade | A evitar |
|---|---|---|---|
| `sigma` The Sigma | cabeça angular; hoodie marinho, peito com selo dourado; ténis grandes | postura concentrada, FLEX firme com braços cruzados | gradiente no capuz; brilho permanente |
| `alpha` Alpha Chad | ombros largos e pernas compactas, luvas grandes, detalhes laranja | ataque corpo-a-corpo pesado, cabeça avança antes do soco | braço fino que perde massa ao bater |
| `rizzler` The Rizzler | silhueta esguia, óculos/grande expressão, fita magenta | cast rápido e carismático, leve pose teatral | aura cor-de-rosa constante e opaca |
| `ohio` Ohio Kid | corpo inclinado, sapatilhas longas, casaco/acento ciano assimétrico | sprint com inclinação evidente e shots de movimento | usar 6 frames de strip no retrato; glitched noise |
| `fanum` Fanum Lord | corpo redondo, mochila/bolsa de XP em menta, mãos rápidas | recolhe XP com gesto exagerado | retrato reciclado do NPC; excesso de verdes |
| `six-seven` Six Seven Kid | boné angular, símbolo 67 legível, dorsal dourado | abertura dos braços radial no proc | texto minúsculo que desaparece em 48 px |

**Arte obrigatória por herói:** folha de silhuetas A/B/C, pose principal neutra, 1 key pose da habilidade, retrato 96×96 (ou 48×48 se aprovado e legível), chart de escala lado-a-lado, folha de expressões (feliz/concentrado/dano). O desenho no retrato mantém o mesmo cabelo, roupa, rosto e formas do sprite.

**Mínimo de animação recomendado por personagem:** `idle`4, `move`6, `hurt`2, `flex_charge`4, `flex_success`3, `death`6. Ataque próprio/cast/skill apenas se presente na mecânica; pelo menos Alpha `punch` e Rizzler `cast`. As tags B1/B2/B3 existentes continuam funcionais até substituição aprovada; nenhuma substituição por uma imagem estática pode ser promovida a release.

## 4. Direção de inimigos e boss

| Tipo de jogo | Leitura em um segundo | Arquitetura de forma | Sinalização |
|---|---|---|---|
| `npc` | ameaça básica / lenta | bloco arredondado simples, olhos vazios; pouco detalhe | animação pequena, sem brilho |
| `hater` | atacante à distância | triângulos/spikes e cabeça inclinada, coral | pose de windup e círculo/cone de aviso preciso |
| `beta` | tanque lento | trapézio largo, tronco pesado, braços baixos | compressão no passo, hit com massa |
| `boss` BIG HATER | ameaça de palco, absolutamente distinto | massa vertical e coroa torta, mãos enormes, boca icónica | windup ≥ tempo real do core, boss bar clara, death com conclusão visual |

A versão `Witherroot` desenhada como vegetais de floresta em PR #27 **não substitui silenciosamente** o elenco NPC/Hater/Beta/BIG HATER. A ficção da farm corrompida pode inspirar materiais, olhos e foliage, mas as funções mecânicas e os nomes só mudam mediante decisão de game design separada. A PR #27 é uma experiência de SVG estáticos **sem aprovação artística final**.

**Boss 128×128:** `idle`4/`move`4/`attack`5/`hurt`2/`death`8; antecipação de ataque tem de coincidir com o timing real, sem criar falsos avisos. Comparar com NPC/Hater/Beta à escala do campo e com 40–90 inimigos.

## 5. Arena, bioma e composição

**Bioma único P0:** `Enchanted Farm / Witherroot Edge`. O ecrã deve parecer um palco construído, não uma ilustração de fantasia genérica.

- Chão em **tiles 32×32**: base, alternativo, fenda, marca de aura; repetição disfarçada com poucos clusters manuais, 2–3 níveis tonais.
- Props: cerca/portão, caixa, pedra, árvore, rebentos, espantalho/tótem de Aura, cristais corrompidos, vegetação, sinal. Cada um possui escala, bounding box visual e sombra coerentes.
- **Centro limpo:** não pôr cristais gigantes no meio onde os pickups e projéteis aparecem. Props de decoração encostam a zonas periféricas, sem colisões novas.
- Corruption progressiva por zonas / waves pode ser tint discreto de tiles e VFX, mas **não** efeitos falsos com hitbox implícita.
- Não usar background raster enorme com texturas painterly, transições impossíveis ou dezenas de objetos sem fonte modular. O chão pode ser gerado a partir do tileset, nunca um poster estático indistinto.
- Se os props existentes forem meramente cenográficos, permanecerão não-colisores. Não adicionar sistemas de harvesting/interação ao core neste trabalho.

## 6. VFX, feedback e animação de eventos

A sensação de impacto vem de **timing e shape**, não de bloom. Para cada evento, definir key frames, prioridade, duração e efeito informativo.

| Evento | Silhueta, animação e prioridade |
|---|---|
| hit simples | 4 frames de impacto angular, 100–170ms, ligeiro flash no inimigo |
| crit | estrela de 5 frames, 150–240ms, sem ocultar telegraph |
| morte inimigo | poof de 4–5 frames + queda curta, sempre atrás de tiros importantes |
| pickup XP | minúsculo magnet + brilho controlado, verde jade |
| Aura Burst | anel exterior dourado/ciano 6 frames, uma vez por proc, sem flash de ecrã |
| FLEX charge / success | transição de pose + 4/5 frames de energia, sucesso com impacto claro |
| Focus | linha/pulso ciano só durante ativação, não iluminar o chão inteiro |
| boss spawn | sombra/marcador por baixo + banner curto + som futuro; telegraph fiel à simulação |
| wave complete | texto/coroa/moldura de celebração, sem tapar feedback de ações ainda ativas |
| chest/reward | apenas se existir mecânica; primeiro desenhar states, não anunciar funcionalidade inexistente |

**Ordem de camadas:** chão → decoração → sombras → pickups → inimigos/jogador → ataques/telegraphs → VFX críticos → UI. Hostile shots distinguem-se por shape pontudo + coral; tiros aliados, shape redondo/serrilhado + dourado. Respeitar `prefers-reduced-motion` e opção de settings. Meta de não exceder o orçamento atual de FX: até 24 impactos ativos e 64 trails visuais; medir no hardware. Não bloquear visão do boss ou sinais de dano.

## 7. UI, iconografia e tipografia — revisão de todas as telas

O redesign da interface já integrado em `main` é **base funcional, não garantia de arte final**.

Uma **família de componentes única**: madeira escura (estrutura), chapa azul-marinho (área legível), liga dourada (recompensa), folha verde (destaque orgânico) e cristal (energia). Repetir cantos, espessuras e sombras sempre da mesma maneira. Reduzir gradientes e ornamentos que hoje se sobrepõem e criam aspeto pré-fabricado. Fazer 9-slice real para painéis, sem imagens inteiras esticadas.

| Tela / componente | Assinatura visual e prioridade |
|---|---|
| Main menu | Logo desenhado como marca, herói integrado na quinta, PLAY protagonista; evento real ou rotulado como teaser |
| Character select | retrato próprio por personagem, 6 cartões iguais, lock legível, seleção clara e cards responsivos |
| HUD | HP/XP/Aura/wave sempre legíveis; ilustrações na moldura, não debaixo de números |
| Pause / settings | mesmos materiais, estados hover/pressed/focus, controlo de movimento reduzido |
| Upgrade | 16 ícones únicos por semântica + raridades por shape/moldura, nomes e efeitos legíveis |
| Wave complete / boss intro | grande momento de celebração, 1 modal por vez e input funcional |
| Results / achievements / rankings | distintivos e medalhas desenhados à mão, preservando labels de informação offline |
| Loading | duas key arts do mesmo mundo, texto em HTML, progresso **real** e dicas válidas |
| Mobile controls | alvos táteis inalterados, área de HUD protegida em portrait/landscape |

**Tipografia:** máximo 2 famílias (display e UI), pesos definidos; números tabulares no HUD; 1 escala tipográfica por breakpoint. Não desenhar texto funcional em imagens. Estados disabled distinguíveis por opacity, padrão e ícone, sem tornar conteúdo ilegível. Testar contraste/long strings dos botões.

## 8. Pipeline de ficheiros, animações e proveniência

1. **Source of truth:** ficheiro realmente editável por layers (`.aseprite` ou equivalente), master de cada asset, construído pose a pose. Os antigos concept boards gerados são **referência**; não são prova de sprite final.
2. **Export:** PNG RGBA transparente e JSON de frame rects/tags, pivots por frame, duração em ms; 2px extrude/padding quando empacotado.
3. **Manifest:** indicar `id`, versão, tipo, dimensões, tags, pivot, caminho do master, caminho de exports, licença/proveniência, estado de aprovação, autor (se confirmado), última revisão e imagens de QA.
4. **Naming:** `char_sigma`, `enemy_hater`, `boss_big_hater`, `fx_aura_burst`, `pickup_xp_small`, `tile_floor_base`; snake_case para ficheiros, tags em inglês (`idle`, `move`, `attack`, `hurt`, `death`, `flex_charge`, `flex_success`).
5. **Textures:** Phaser usa 1 atlas/palette compartilhado quando fizer sentido. Nunca recriar objetos por frame nem desalinhar pivots para simular movimento. `px-` original mantém-se como fallback até o novo atlas estar validado.
6. **Compatibilidade:** respeitar `src/game/core/arena.ts` e contrato de personagens. O renderer implementa visual; o core continua a definir todos os timings, hitboxes, kills, XP e Aura.
7. **Direitos:** origem própria verificada para uso comercial. Nunca declarar uma ilustração como “hand-drawn” sem master, processo e confirmação reais. Se houver uso de ferramentas generativas numa fase de ideação, rotular honestamente; não entregar a imagem como asset de produção.
8. **QA arte:** anexar PNG recortado transparente, sprite sheet visto a 1× e 4×, GIF/MP4 curto de estados e screenshots no jogo desktop + Android landscape + portrait.

Estrutura alvo (criar pastas à medida que há arte real, não diretórios vazios):
```text
art/source/characters/char_sigma.aseprite
art/source/enemies/enemy_hater.aseprite
art/source/ui/ui_upgrade_panel.aseprite
art/source/environment/tile_floor_base.aseprite
public/assets/art/v2/characters/char_sigma.png
public/assets/art/v2/characters/char_sigma.json
public/assets/art/v2/enemies/enemy_hater.png
public/assets/art/v2/vfx/fx_aura_burst.png
src/game/render/    # loader, atlas metadata adapter, animation registry
docs/ART_ASSET_REGISTER.csv
```

## 9. Quality gates — sem “parece mais bonito” como único critério

**Gate A — identidade:** 1 Sigma + NPC + Hater + 32px tile + XP + um hit FX, com sheet de silhuetas e 2 style frames lado a lado. Cinco minutos de gameplay demonstram leitura. Direção e paleta explicitamente aprovadas **antes** de produzir os restantes heróis.

**Gate B — heróis / inimigos:** seis protagonistas e quatro tipos de inimigo com frames legíveis e correspondência entre retratos e sprites. Silhuetas distinguíveis numa impressão sem cor; comparação ao tamanho real a 844×390. Sem arte colada de concept boards.

**Gate C — efeitos / mundo / menus:** FPS comparável à baseline em 90 enemies, avisos hostis sempre visíveis, gameplay completo sem se perderem picks, cards ou menus. UI 390×844 e 844×390 sem clipping, cada asset de produção com master verificado.

**Gate D — release visual:** run completa com cinco waves, boss, upgrades, morte/vitória, loading, pausa e achievements com qualidade uniforme; acessibilidade, direitos, perf e aprovação explícita do game director. Apenas depois retomar backend.

**Critérios de rejeição imediata:** partes anatómicas inconsistentes entre frames, arte esticada/baixa resolução, sprite ilegível em movimento, frame atlas com margens erradas, fonte/texto queimado em PNG, ameaça mascarada por FX, asset sem proveniência, ou UI funcional bloqueada.

---

**Aprovação:** este documento define um método e uma proposta estética. Não é um certificado de que os assets atuais foram redesenhados nem de que a direção de cores exata foi aprovada. Ver [Art Overhaul Plan](ART_OVERHAUL_PLAN.md) para execução e PRs.
