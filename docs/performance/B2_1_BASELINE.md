# Aura Farmer — B2.1: performance baseline (Ruin Alley)

**Estado:** instrumentação e cenários reproduzíveis. Os resultados medidos no CI ficam no artefacto Playwright: test-results/b2-1-*-baseline.json. Não assumimos FPS reais do utilizador nem ganhos de performance antes de B2.2.

## O que esta iteração entrega

- Diagnóstico opcional: abrir o preview com **?fps=1** e jogar normalmente. Apresenta FPS, percentis **p95/p99** do intervalo entre frames, p95 do tempo de simulação JavaScript, p95 da atualização/desenho JavaScript da cena, e contadores de inimigos/projéteis/áreas/drops.
- Mede o ciclo real de **BrowserScene.update**, não um loop de gravação de vídeo ou um requestAnimationFrame isolado.
- Ring buffer limitado a **240 frames**; pausas de separador de 500 ms ou mais reiniciam o período amostrado; a interface atualiza aproximadamente uma vez por segundo.
- Custos da simulação e do desenho da cena são medidos separadamente. **Desenho da cena JS não inclui apresentação/rasterização GPU, composição ou layout do browser.**
- Testes Playwright posicionam **exatamente 20, 50 e 100 modelos de inimigos reais** em coordenadas caminháveis, com seed 39022 e wave 4.
- Desktop **1280×720**, efeitos normais e reduzidos; mobile landscape **915×412 emulado**, efeitos normais. Um teste adicional com 50 inimigos avança a **simulação real**, além da renderização.
- **Não há limites de aprovação baseados em FPS absolutos na máquina virtual GitHub Actions**. O desempenho nesse Chromium pode variar bastante.

## Matriz de medição

| Cenário | Viewport | Inimigos | Simulação | Efeitos |
|---|---|---:|---|---|
| Desktop normal | 1280×720 | 20 / 50 / 100 | Congelada | Normais |
| Desktop reduzido | 1280×720 | 20 / 50 / 100 | Congelada | Reduzidos |
| Desktop com jogo ativo | 1280×720 | 50 | Real | Normais |
| Landscape emulado | 915×412 | 20 / 50 / 100 | Congelada | Normais |
| Landscape ativo | 915×412 | 50 | Real | Normais |

O modo congelado apenas impede o avanço do combate; **o Phaser continua a renderizar todos os frames**. Nos modos ativos há movimento real de IA, disparos e possível mudança do número de inimigos; os contadores ficam guardados no relatório. São guardadas capturas de ecrã dos cenários de 100 inimigos.

Cada JSON contém FPS observados, frame mean/p50/p95/p99, JS p95 de simulação e desenho, percentagem de frames acima de 16,7/33,3 ms, nº de frames amostrados, inimigos/projéteis, viewport, DPR, renderer e user agent. O artefacto de CI é conservado por 3 dias.

## Verificação em hardware real

1. Abrir a versão Vercel do PR com **?fps=1** no desktop; entrar em Ruin Alley.
2. Registar FPS e p95/p99 em waves normais, densas e boss; deixar alguns segundos para a janela estabilizar.
3. Repetir num **telemóvel físico** em landscape e registar modelo, navegador e opção Movimento Reduzido.
4. Comparar os mesmos cenários no **mesmo equipamento** após B2.2. FPS de Chromium headless não equivalem a FPS de um telemóvel.
5. Verificar também quebras visíveis, aquecimento e resposta ao joystick. Uma média de FPS não descreve toda a fluidez.

## O que não muda

Este PR **não** cria personagens, sprites, mapas ou câmara dinâmica. Não otimiza ainda gameplay, não altera RNG, hitboxes, dano, drops nem regras de combate. O objetivo é medir antes de decidir quais as otimizações com maior retorno.

## Hipóteses para B2.2 (a confirmar com medições)

- Redesenho completo por frame de geometrias estáticas e dinâmicas em Graphics
- Efeitos, labels e partículas durante waves densas
- Inimigos fora da viewport que continuam a receber trabalho visual
- Alocações por frame na simulação/armas/spawns
- Fill rate/resolução efetiva do canvas no mobile

## Critérios de aceitação B2.1

- TypeScript, Vitest, build e Playwright Chromium no HEAD final.
- Artefactos JSON para as contagens e modos especificados.
- Diagnóstico desligado por defeito e valores corretamente identificados.
- Sem alterações de gameplay nem PNGs aprovados.
- **Merge apenas depois de aprovação expressa do criador.**