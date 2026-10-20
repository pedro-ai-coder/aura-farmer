# B2.4 — Ruin Alley expandido, mantendo a arte Cartoon Arcade

**Objetivo:** passar de uma arena que cabe quase toda num ecrã para um terreno genuinamente percorrível, sem gerar personagens nem substituir os sprites já aprovados.

## Mapa e pipeline visual

- Dimensão do mundo: **3500 × 2650 unidades** (versão anterior: 1448 × 1086).
- A câmara do B2.3 enquadra aproximadamente **1040 × 585** unidades em desktop; existem mais de **três larguras** e quatro alturas de câmara disponíveis. A área caminhável tem doze vértices e recorte dos cantos. O limite da arena é um traço visível sobre o pavimento, não uma parede invisível sem feedback.
- Ilustração `ruin-alley.png` original **mantida no centro à escala nativa**, centrada no mundo expandido em coordenadas de mundo **inalteradas** (0,0); a área adicional estende-se para x negativos até -1026 e y negativos até -782; sem esticar casas, vegetação ou pedras. Textura misturada nas margens em canvas transparente, para que os antigos limites não acabem repetidos.
- Para o restante chão, **extrai-se um fragmento do próprio PNG aprovado**, cria-se uma textura repetível de **768 × 768** com espelhamento nas duas direções e utiliza-se um único `TileSprite` Phaser sobre a área toda. A repetição do chão não duplica as paredes/edifícios.
- Desgaste em tinta/pedra de distribuição determinística e discretas marcações de limites: uma geometria estática desenhada no arranque, **sem objetos animados ou colisões falsas**. Paleta e arte dos heróis intactas.
- Os dois caixotes/coberturas anteriores conservam exatamente as coordenadas físicas originais (600,550) e (940,680). Juntam-se nove pontos de cobertura com sprite já aprovado; **todos** correspondem à mesma lista `COVER` usada nas colisões, visibilidade de tiro e desenho.
- Evita-se iniciar Phaser com uma superfície de 3500 × 2650 píxeis antes de receber o resize: o canvas inicial é 1280 × 720 e continua gerido pelo `Phaser.Scale.RESIZE`.

## Geometria e âncoras

- O ponto inicial dos heróis **(724,610)**, a estação de cura **(1100,565)** e a entrada do boss **(724,445)** mantêm as posições originais de simulação. Apenas os limites e o pavimento se alargam **à volta** do distrito; os pontos antigos não são transladados. Não muda o raio de cura, timings ou dano.
- Na região central original, o nascimento mantém **a sequência seeded e os limites anteriores de Ruin Alley**, para preservar a pressão e o balanceamento já aprovados. Ao sair para as regiões novas, escolhe coordenadas caminháveis numa coroa **275–640 unidades** em redor do jogador. Mantém a RNG seeded, densidade, inimigos possíveis e timings. É a adaptação **mínima necessária** para não tornar a expansão do mapa um espaço sem combate.
- **B2.5** continua reservado à afinação do gameplay para a área maior (dispersão de drops, densidade de inimigos por área, boss, safe spot e balanceamento). B2.4 não anuncia o balanceamento como finalizado.

## Verificações

- `tests/b2-4-expanded-ruin-alley.test.ts`: dimensões, três larguras de câmara, textura 100% proveniente do PNG original, âncoras, 11 obstáculos reais, caminho superior a 2700 unidades e spawns determinísticos em distritos afastados.
- `tests/browser/b2-4-expanded-ruin-alley.spec.ts`: textura repetida e distrito original verificados no Phaser real, viagem para o extremo leste, screenshot da região antiga/nova, touch landscape.
- `tests/browser/v5-ruin-alley.spec.ts` e `tests/browser/b2-3-camera-follow.spec.ts`: os testes anteriores passam a usar os novos limites físicos sem mudar os seus critérios funcionais.
- `tests/gdd.test.ts` / teste de boss: as verificações de combate e cobertura usam a posição real do jogador e do boss em vez de coordenadas antigas.
- TypeScript, Vitest, build, auditoria gitleaks, Playwright Chromium e deploy Vercel obrigatoriamente verdes.

## Limitações a validar

O chão contínuo reutiliza uma região da pintura original: os padrões espelhados podem tornar-se visíveis em viagens prolongadas. Os novos distritos são intencionalmente mais abertos do que a região central. No B2.5 validamos também mobilidade de bosses e recursos; o polimento da ambientação e arte de novos biomas é trabalho futuro. As capturas automatizadas não substituem a avaliação visual em hardware real, sobretudo no telemóvel.

**Sem novos personagens e sem imagens artificiais/novos atlas de heróis.**
