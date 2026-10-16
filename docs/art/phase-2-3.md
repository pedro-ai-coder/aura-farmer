# Fase 2.3 — Efeitos de combate e perigos

**Estado: especificação de implementação; código runtime ainda não alterado.** Esta iteração deve ser implementada e validada neste PR antes de ser apresentada para merge.

## Âmbito

- Dar feedback visual distinto aos impactos das nove armas existentes, com formas, cores e timings coerentes com a identidade cartoon aprovada, sem criar novas imagens.
- Reutilizar texturas, atlas, partículas e primitives Phaser já disponíveis. Usar placeholders desenhados por código quando não existir arte aprovada.
- Tornar legíveis preparação, área perigosa, impacto e recuperação dos ataques e eventos existentes, incluindo Big Hater.
- Sincronizar efeitos com eventos reais da simulação; não criar dano, colisões, procs, RNG ou cooldowns adicionais.
- Respeitar pausa, modais, fim de partida, mute quando aplicável, escala e câmara; evitar efeitos persistentes após restart.
- Limitar emissões simultâneas, pooling e lifetime dos efeitos para reduzir alocações e custo em mobile.

## Critérios de aceitação

1. Todas as nove armas mostram feedback visual reconhecível sem alterar o combate.
2. Os perigos existentes têm telegraph e impacto visual sincronizados com os timings da simulação.
3. Os efeitos congelam durante pausa e não se prolongam indevidamente após morte, vitória ou reinício.
4. Reutilização de assets documentada; **zero novas imagens geradas**.
5. Testes de regressão unitários e Chromium verificam sincronização, limpeza e ausência de alterações de regras.
6. CI passa: TypeScript, Vitest, build e Playwright. Registar commit e resultados exatos.

## Fora do âmbito

Novas armas, novos inimigos, balanceamento, novas imagens, redesign do HUD, controlos mobile e alterações ao save.

## Gates

Este documento **não representa implementação concluída**. Não converter em PR pronto para revisão nem fazer merge sem código, testes e aprovação explícita do criador.
