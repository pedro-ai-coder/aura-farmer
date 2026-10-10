# AURA FARMER — ART BIBLE

**ID:** AF-ART-001 · **Estado:** PROPOSTA PARA APROVAÇÃO · **Data:** 2026-10-10  
**Direção proposta:** *Pixel Cartoon Brainrot Arcade* · **Idioma do jogo:** inglês  
**Responsáveis:** Game Director (aprovação), Art Director/Pixel Artist (arte), Codex (integração técnica)

> **Não executar implementação gráfica ou merge em produção sem aprovação explícita.** O estilo atual do jogo é Cartoon 2D desenhado por código. Esta Art Bible propõe uma evolução para pixel cartoon. Foi elaborada com base em orientações públicas de Pedro Medeiros / Saint11 e documentação do Aseprite; **não** representa uma entrevista nem uma contratação de um pixel artist. Os sprites finais devem ser originais e com direitos de utilização comercial verificados.

## 1. Visão e identidade visual

**Tagline visual:** *Main-character energy in a cursed arcade.*

**Pilares:**
1. **Expressive chibi:** personagens cabeçudas, expressões ridículas, braços/poses exagerados, vista top-down em três quartos.
2. **Chaos with hierarchy:** visual exuberante mas legível durante 90 inimigos; jogador e ataques hostis sempre distinguíveis.
3. **Meme without dependence:** humor por silhouettes, 67, Aura, Flex e personagens originais; nunca copiar IP de LoL/Brotato, streamers ou marcas.

**Atmosfera:** fundo noite-púrpura de arcade; contraste neon pontual; ícones e pequenos efeitos dourados de Aura; inimigos caricaturais e falsamente intimidadores. Ecrã cheio de ação mas não de ruído. O jogador deve entender o ataque de um Hater enquanto tenta um FLEX.

**Evitar:** realismo, gradient blur, inúmeros detalhes isolados, strobes/glitch agressivos, ataques escondidos por partículas e faces impossíveis de ler no telemóvel.

## 2. Design system

### Paleta candidata

| Papel | Cor | HEX |
|---|---|---|
| Night Ink, fundo | azul-noite | `#171126` |
| Arcade Plum, arena | roxo | `#302447` |
| Velvet Outline | contorno escuro | `#21172F` |
| Cream Pixel | luz / olhos / texto | `#F4E7D5` |
| Aura Gold | protagonista e recompensa | `#FFD36C` |
| Sigma Violet | identidade Sigma | `#A684FF` |
| Hater Pink | inimigos ofensivos | `#FF648E` |
| Danger Coral | telegraphs hostis | `#FF6C5A` |
| Beta Mint | Beta Bro | `#93DDB0` |
| Ohio Cyan | teleporte / glitch | `#65D9E7` |
| XP Lime | cristais e cura | `#84F6B2` |
| NPC Fog | NPC base | `#A9A4BA` |
| Electric Yellow | eventos 67, breve | `#FFF090` |
| Deep Violet | sombra interior | `#4D385F` |

A paleta só fica definitiva quando o **Art Test A** for aprovado. Cada sprite com 4–6 cores dominantes (+ outline), luz do topo esquerdo, 1 sombra base e 1 highlight. Reduzir *orphan pixels* e dithering; distinguir silhuetas sem cor.

### Perspetiva, resolução e pivots

- Vista **top-down 3/4**, corpo chibi. Cabeça aproximadamente 35–45% da altura desenhada; mãos/olhos ampliados.
- Unidade visual de referência 32×32 px. **Frames player/NPC/Hater 48×48 px** com corpo de ~28–36 px e margem transparente. **Beta Bro 64×64 px** e **Big Hater 128×128 px**. A dimensão do frame não é a dimensão de colisão.
- Boss corpo visual ~90px de largura; comparação de hitbox com o raio existente é obrigatória. Não alterar hitboxes para fazer a arte “encaixar”.
- Pickups e projéteis 16×16 px; ícones 16×16 ou 24×24; VFX 32×32/64×64; ondas de grandes dimensões podem continuar desenhadas no Phaser.
- Sombra elíptica desenhada no motor de jogo, sem multiplicar os frames. **Pivots** para personagens: `feet_center` constante; projéteis/UI: `center`.
- Na versão web atual, a resolução lógica é **960×600**. A proposta é sampling nearest-neighbor para *sprite art*, com alterações globais ao Phaser só depois de medir impacto no HUD e mobile. Escalas inteiras onde praticável, mas não sacrificar a legibilidade responsiva.
- Paleta de perigo é consistente: coral/rosa = ameaças; dourado = recompensas e Aura; verde = XP/cura.

## 3. Fichas dos protagonistas e inimigos

### The Sigma (player único da versão atual)
Hoodie escuro de duas tonalidades, cabelo angular curto apontado para cima, detalhe Aura Gold no peito, ténis volumosos. Expressão de “main character” sem ser retrato de ninguém. Em FLEX cruza os braços e faz pose imóvel; se for interrompido, olhos aumentam; se tiver GOD AURA, a aura brilha **fora** do sprite, não numa nova versão de 20 frames.

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

