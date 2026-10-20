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

## Review

Open the Vercel PR preview and compare to main with Sigma, Cool Kid and Alpha Chad. Test starting/stopping, diagonal switches and joystick, colliding with cover, attacking, hurt, Flex, pause, reduce motion and defeat. Browser screenshots are generated as CI artifacts.

Unit regression: \`tests/hero-motion.test.ts\`. Browser regression: \`tests/browser/b1-motion-review.spec.ts\`. Existing hero animation/contact-sheet Playwright and Vitest suites remain required.

This PR stays **draft** until checks pass and the owner explicitly approves its visual feel and merge.
