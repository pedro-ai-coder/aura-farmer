# AURA FARMER — Cartoon 2D Roguelite

Protótipo solo para browser, desenvolvido em Phaser 3, TypeScript e Vite. Sobrevive a cinco vagas de 50 segundos, recolhe XP, escolhe upgrades e derrota o Big Hater na última vaga.

## Experimentar

Requer Node.js 22 (`.nvmrc`) e npm. Num clone deste repositório:

```bash
nvm use                 # se utilizares nvm
npm ci
npm run dev
```

Abre no browser o endereço apresentado pelo Vite. Não são necessários login, chaves de API ou serviços externos. Para experimentar os ficheiros de produção, executa `npm run build` seguido de `npm run preview`.

| Tecla | Ação |
| --- | --- |
| ENTER | Começar, avançar de vaga ou reiniciar |
| WASD / setas | Mover; o disparo aponta automaticamente ao inimigo mais próximo |
| E | FLEX: fica imóvel e sem novos ataques durante 1 s; precisas de 3 inimigos a até 145 px para ganhar 25 Aura |
| ESPAÇO | Sigma Focus: abranda os inimigos durante 3 s |
| 1 / 2 / 3 | Escolher upgrade; a simulação fica em pausa |
| F3 | Mostrar FPS e estado da simulação |

Recolhe os cristais verdes para obter XP. Receber dano interrompe o FLEX e retira 20 Aura. O FLEX tem 15 s de cooldown após terminar/interromper. Atingir 100 Aura inicia um Burst de +20% de dano durante 6 s e repõe a Aura em 40. O relógio da última vaga chegar a zero não chega para vencer: o boss também tem de morrer.

## Validação

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Em Linux, `npx playwright install --with-deps chromium` instala também as dependências do browser, quando necessário. A suite usa `/usr/bin/chromium` se existir; `CHROMIUM_PATH` permite selecionar outro executável. Os testes de browser iniciam o seu próprio Vite na porta 4174. Capturas e traces ficam em `test-results/` e não são versionados.

Resultados, limites dos testes e parâmetros do protótipo: [docs/VALIDATION.md](docs/VALIDATION.md). A lógica de combate é independente do Phaser e está em `src/game/core/arena.ts`; a cena trata dos controlos e desenho.

O balanceamento ainda precisa de playtesting humano. Multiplayer, Discord, loja, mobile e persistência estão fora desta versão.
