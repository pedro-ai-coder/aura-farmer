import { describe, expect, it } from 'vitest';
import { visiblePlayfieldBounds } from './touch-playfield';

const world = { width: 1448, height: 1086 };

describe('mobile joystick visible-map bounds', () => {
    it('fits a full world inside the displayed canvas without spilling into app padding', () => {
        expect(visiblePlayfieldBounds(
            { left: 100, top: 20, width: 724, height: 543 },
            { left: 80, top: 10 },
            { topLeft: { x: 0, y: 0 }, bottomRight: { x: 1448, y: 1086 } },
            world
        )).toEqual({ left: 20, top: 10, width: 724, height: 543 });
    });

    it('excludes the blue letterbox when the world occupies only part of a wide canvas', () => {
        expect(visiblePlayfieldBounds(
            { left: 0, top: 0, width: 1200, height: 600 },
            { left: 0, top: 0 },
            { topLeft: { x: 0, y: 0 }, bottomRight: { x: 2896, y: 1448 } },
            world
        )).toEqual({ left: 0, top: 0, width: 600, height: 450 });
    });

    it('clips to the current camera view after the player moves', () => {
        const viewport = { topLeft: { x: 724, y: 400 }, bottomRight: { x: 2172, y: 1486 } };
        expect(visiblePlayfieldBounds(
            { left: 50, top: 30, width: 720, height: 540 },
            { left: 30, top: 20 },
            viewport, world
        )).toEqual({ left: 20, top: 10, width: 362, height: 343 });
    });

    it('never returns negative or non-finite dimensions when the world is off-screen', () => {
        expect(visiblePlayfieldBounds(
            { left: 0, top: 0, width: 600, height: 400 },
            { left: 0, top: 0 },
            { topLeft: { x: 3000, y: 3000 }, bottomRight: { x: 3600, y: 3400 } },
            world
        )).toEqual({ left: 0, top: 0, width: 0, height: 0 });
        expect(visiblePlayfieldBounds(
            { left: 0, top: 0, width: 0, height: 0 },
            { left: 0, top: 0 },
            { topLeft: { x: 0, y: 0 }, bottomRight: { x: 0, y: 0 } },
            world
        )).toEqual({ left: 0, top: 0, width: 0, height: 0 });
    });
});
