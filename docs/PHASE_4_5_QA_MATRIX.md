# Fases 4–5 — protocolo de QA de partidas completas

> Referência: `docs/GDD.md`. Este documento descreve critérios de aceitação e recolha de evidência, não aprova novos valores de balanceamento.

## Matriz mínima

Executar Sigma, Cool Kid e Alpha Chad, pelo menos três partidas completas por personagem, com seeds registadas e reproduzíveis. Registar versão/commit, browser, viewport, personagem, seed e se houve intervenção manual.

Em cada partida registar: tempo de sobrevivência; wave e causa da derrota ou vitória; nível e XP; vida recebida/perdida; curas de Snack de Rua e Safe Spot; Aura Magnet; cargas e ativações de Flex; armas e passivas escolhidas; encontro com Big Hater e berserk; erros de consola.

Não simular vitórias nem desligar o dano para declarar uma partida completa. Distinguir claramente dados de telemetria real, testes unitários e observações manuais.

## Critérios de aceitação

- [ ] Os três personagens iniciam e concluem partidas sem bloqueio de input, crash ou estado impossível.
- [ ] Cinco waves de 180 s, boss e berserk respeitam o GDD; temporizadores param durante pausa/seleção.
- [ ] XP, níveis, escolhas, slots e substituições mantêm regras e limites do catálogo aprovado.
- [ ] Dano, invulnerabilidade, morte e resultados são consistentes com o estado da simulação.
- [ ] Flex, Snack de Rua, Aura Magnet e Safe Spot não duplicam efeitos, recursos ou cura.
- [ ] Desktop e mobile landscape: movimento, mira, pausa, escolhas, HUD e resultados legíveis e operáveis.
- [ ] Repetir uma seed com a mesma sequência de inputs produz resultados de simulação equivalentes.
- [ ] Registar FPS, consumo de memória e anomalias em dispositivo/browser identificados; não alegar metas de performance sem medição.
- [ ] TypeScript, Vitest, build, Playwright, Vercel e revisão funcional verdes no HEAD final.

## Relatório por partida

| Commit | Browser / viewport | Personagem | Seed | Duração / wave | Resultado | XP / nível | HP / curas | Flex | Boss | Falhas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pendente | pendente | pendente | pendente | pendente | pendente | pendente | pendente | pendente | pendente | pendente |

## Bloqueios de aprovação

Nenhum resultado está preenchido ou validado neste documento. A checklist só fica concluída após execução real e evidência associada ao commit do PR. Não fazer merge com testes inconclusivos ou regressões conhecidas.
