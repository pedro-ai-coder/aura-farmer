# B2.3 — Acompanhamento de câmara e sensação de deslocação

## Âmbito

Implementar a sensação de atravessar Ruin Alley **com o mapa e as personagens já aprovados**, antes de ampliar a arena no B2.4.

- **Desktop:** câmara segue Sigma, Cool Kid e Alpha Chad durante a run, com enquadramento pretendido de ~1040×585 unidades de mundo em formato 16:9. A imagem do mapa continua dentro dos limites físicos definidos em `WORLD`.
- **Mobile landscape:** enquadramento pretendido ~1120×510 unidades, adaptado ao joystick e à área de jogo; o joystick nunca pode ocupar a barra HUD nem o fundo fora do mapa.
- **Suavização baseada em tempo** (`1 - exp(-10*dt)`) e não no nº de frames. A câmara acompanha `Run.pos` mas não altera `Run.pos`, velocidade, colisões ou resposta do input.
- **Pausa, upgrade, legendary e derrota:** acompanhamento parado. O modo Reduced Motion acompanha a posição diretamente, sem lag/interpolação visual.
- **Menus:** mantêm o enquadramento original do mapa inteiro no desktop e comportamento original em mobile landscape; o modo portrait mobile mantém a indicação para rodar.
- **Fullscreen/resizes:** recálculo de zoom e limites com `#hud` fixo ao canvas e projeção dos pontos do joystick em coordenadas de mundo; nenhum zoom é aplicado diretamente a objetos de jogo.
- O cálculo de zoom cobre a área visual do mundo em game landscape para evitar faixas azuis; mantém `Camera.setBounds` e `getWorldPoint` para mira/joystick.

## Fórmulas e verificações

A função pura `chooseCameraZoom` seleciona um zoom para cada viewport e só o aplica quando existe uma run. A função `followCameraCenter` calcula a interpolação entre a posição visual anterior da câmara e a posição real do herói; valores de 10 e 60 FPS produzem a mesma posição após o mesmo tempo acumulado.

O estado `cameraFocus` é exclusivo da interface BrowserApp. Ao iniciar/reiniciar uma run, a câmara começa na posição real do herói para não fazer uma viagem desde o menu. Ao voltar ao menu, regressa ao centro do mapa e ao zoom de apresentação inicial.

## Não incluído neste PR

- Sem expansão do mundo, novo mapa ou nova decoração: isso pertence ao B2.4.
- Sem alteração às 3 personagens, atlas PNG, animações, velocidade de movimento, armas, AI, drops, spawn, RNG ou balanceamento.
- Sem alterações à telemetria e otimizações aprovadas no PR #100.

## Critérios de aceitação

- `tests/camera-follow.test.ts` valida zoom responsivo e interpolação independente dos FPS, limites e modos menu/portrait.
- `tests/browser/b2-3-camera-follow.spec.ts` observa deslocação real por teclado, deslocação do cenário, pausa, regresso ao menu, zoom landscape e intersecção do joystick com o campo visível.
- Regressões TypeScript, Vitest, build, **toda** a suite Playwright, gitleaks e Vercel verdes.
- Capturas: `test-results/b2-3-desktop-camera-follow.png` e `test-results/b2-3-landscape-camera-joystick.png`.
- Testar manualmente: sprint lateral e diagonal, aproximação às paredes, mira por rato, reinício, fullscreen, orientação, joystick e HUD em telemóvel físico.

**O objetivo é a sensação de deslocação, não prometer aumento de FPS nesta iteração.** A ampliação real do cenário só acontece no B2.4.
