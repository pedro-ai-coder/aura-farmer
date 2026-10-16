# Plano revisto — Mobile e drops aprovados (16-10-2026)

Base: `main` após integração do Anexo C do [GDD](./GDD.md). Este plano não altera as regras de Aura única, Flex individual, 3 armas, 5 passivas e caps de raridade.

## Decisão aprovada
- P1: Snack de Rua — drop raro de cura.
- P2: Aura Magnet — recolha de Aura e XP existentes no mapa, sem duplicação.
- P3: Safe Spot — local fixo de cura com cooldown longo.
- P4–P8: permanecem propostas, sem autorização para implementação.

## Ordem de PRs (um PR por iteração)

| PR previsto | Foco | Gate de aceitação |
| --- | --- | --- |
| #67 | Joystick flutuante, input robusto, landscape/fullscreen com fallback | Sem stuck movement; pointercancel/blur/pause; rotação e fallback testados |
| #68 | Legibilidade de Aura/XP, armas, habilidades, HUD e modais mobile | Contraste, layout, seleção/confirmar sempre visíveis; sem regressão desktop |
| #69 | Snack de Rua e Aura Magnet | Cura limitada, recolha sem duplicação, orçamento de partículas/entidades |
| #70 | Safe Spot | Cura e cooldown corretos, mapa coerente, sem exploração |
| #71 | Balanceamento e integração | Runs completas, impacto de drops, Flex e progressão revistos |
| #72 | Fecho QA da versão web | TypeScript, Vitest, build, Playwright, acessibilidade e desempenho |

## Requisitos transversais
1. Trabalhar sempre a partir de `main` atualizada, sem interferir em PRs paralelos.
2. Nenhuma imagem nova sem aprovação; reutilizar assets existentes.
3. Não introduzir serviços pagos.
4. Executar `npm run typecheck`, `npm test`, `npm run build` e `npm run test:browser` e registar commit e resultados.
5. Corrigir falhas antes de declarar o PR pronto; bloqueios de execução devem ser explícitos.
6. Não fazer merge sem aprovação do proprietário.

## Decisões de tuning a validar no PR funcional
- Snack: percentagem de HP, raridade, origem e número máximo de pickups.
- Magnet: velocidade de atração, alcance e frequência.
- Safe Spot: tempo de ativação, HP recuperado, cooldown e utilizações por run.

## Limites da plataforma
Fullscreen e `screen.orientation.lock()` podem exigir interação do utilizador e podem falhar no iOS e noutros browsers. O jogo deve apresentar orientação para rodar o dispositivo, sem bloquear completamente a jogabilidade.
