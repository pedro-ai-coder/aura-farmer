# B1 — Approved Cartoon Arcade sprites; animation polish

**Decision 20 October 2026:** The owner rejected the low-detail SVG replacement sprites. They were removed from the PR. All previously approved Option A PNG portraits and runtime animation atlases remain completely unchanged.

## Implementation

- **Direction selection:** A small 8-direction hysteresis prevents flickering around joystick direction boundaries. Large turns take effect immediately, independent of automatic aim.
- **Run:** Already approved stride sprites keep their displacement-driven timing. Subtle lift, directional tilt and squash/stretch reflect travel, not merely pressed keys; running against a wall does not produce extra bounce.
- **Idle:** Gentle breathing is layered on top of existing illustrated poses.
- **Attack and hit:** Small recoil and recovery synchronized with simulation attack and damage windows, without extra attacks.
- **Flex:** Subtle emphasis on existing character-specific Flex poses. No new scripted slams, fake attack effects, or damage.
- **Transitions:** Frame-rate-independent interpolation softens abrupt motion changes and returns the visual body to its resting pose.
- **Pause and accessibility:** Upgrade/legendary selections and pause freeze secondary motion; Reduce Motion makes all supplementary transforms neutral. Restart resets state.

## Invariants

- The PNG files, source frame coordinates, approved style, gameplay hitboxes, player position, RNG, damage, wave progression, drops, saves and input mappings are unchanged.
- All new motion is presentation-only in Phaser; ground shadows remain at the real actor contact point.
- No paid services, dependency additions or newly generated art.

## Galeria interativa — apenas os três personagens existentes

O utilizador confirmou que os outros seis personagens **não devem ser criados agora**. A galeria em `/assets/cartoon/option-a-v1/animation-gallery.html` mostra apenas Sigma, Cool Kid e Alpha Chad, diretamente a partir dos PNG já aprovados em `/assets/runtime/`.

- Pré-visualização de idle, corrida em oito direções, ataque, dano, Flex e derrota.
- Seleção de personagem, direção, velocidade, escala, pausa, frame a frame, efeitos secundários e movimento reduzido.
- `animation-gallery-data.json` replica os recortes exatos das folhas em `src/browser/hero-frames.json`, `hero-rear-frames.json` e `hero-flex-frames.json`. A suite valida a paridade.
- A galeria é um **visualizador**, não um novo catálogo, implementação dos restantes heróis ou novo sistema de gameplay.

## FPS e renderização

- `?fps=1` na URL do jogo mostra FPS de frames reais do browser, percentil 95 do intervalo de frames, número de inimigos e projéteis. Sem parâmetro, a instrumentação fica inativa.
- Ao renderizar inimigos, evita-se chamar `setTexture` quando a textura e o frame são os mesmos; um `Set` reutilizável substitui a alocação de um novo conjunto a cada frame; avisos de spawn dispensam alocação de objetos `Phaser.Geom.Line`.
- Estas medidas reduzem trabalho potencialmente redundante, mas a melhoria real de FPS **depende de medição comparativa no mesmo dispositivo**, especialmente em waves densas e mobile. Os vídeos gravados a 30 FPS não provam a taxa real do motor.

## Review

Open the Vercel PR preview and compare to main with Sigma, Cool Kid and Alpha Chad. Test starting/stopping, diagonal switches and joystick, colliding with cover, attacking, hurt, Flex, pause, reduce motion and defeat. Browser screenshots are generated as CI artifacts.

Unit regression: \`tests/hero-motion.test.ts\`. Browser regression: \`tests/browser/b1-motion-review.spec.ts\`. Existing hero animation/contact-sheet Playwright and Vitest suites remain required.

This PR stays **draft** until checks pass and the owner explicitly approves its visual feel and merge.
