import { describe, expect, it } from 'vitest';
import { FrameTimingBuffer } from '../src/browser/render-frame-meter';

describe('B2.1 frame telemetry is bounded, reliable and gameplay-independent', () => {
    it('starts empty and never invents an FPS without frames', () => {
        const meter = new FrameTimingBuffer(8);
        expect(meter.snapshot()).toEqual({
            sampleCount: 0, observedFps: 0, meanFrameMs: 0,
            p50FrameMs: 0, p95FrameMs: 0, p99FrameMs: 0,
            worstFrameMs: 0, p95SimulationMs: 0, p95SceneDrawMs: 0,
            over16MsPercent: 0, over33MsPercent: 0,
        });
    });

    it('records actual frame intervals and JS phases with nearest-rank percentiles', () => {
        const meter = new FrameTimingBuffer(8);
        const times = [100, 110, 120, 130, 140, 160, 180, 200, 220];
        for (let i = 0; i < times.length; i++)
            meter.push(times[i], 1 + i, 2 + i);
        const stats = meter.snapshot();
        expect(stats.sampleCount).toBe(8);
        expect(stats.meanFrameMs).toBe(15);
        expect(stats.observedFps).toBe(66.7);
        expect(stats.p50FrameMs).toBe(10);
        expect(stats.p95FrameMs).toBe(20);
        expect(stats.p99FrameMs).toBe(20);
        expect(stats.worstFrameMs).toBe(20);
        expect(stats.p95SimulationMs).toBe(9);
        expect(stats.p95SceneDrawMs).toBe(10);
        expect(stats.over16MsPercent).toBe(50);
        expect(stats.over33MsPercent).toBe(0);
    });

    it('overwrites old frames in a fixed-size ring without growing memory', () => {
        const meter = new FrameTimingBuffer(4);
        meter.push(100, 1, 2);
        for (let i = 1; i <= 20; i++) meter.push(100 + 20 * i, 2, 3);
        const summary = meter.snapshot();
        expect(summary.sampleCount).toBe(4);
        expect(summary.observedFps).toBe(50);
        expect(summary.p95FrameMs).toBe(20);
    });

    it('excludes suspended tabs and warm-up gaps from FPS estimates', () => {
        const meter = new FrameTimingBuffer(8);
        meter.push(100, 1, 2);
        meter.push(116, 1, 2);
        meter.push(132, 1, 2);
        expect(meter.snapshot().sampleCount).toBe(2);
        meter.push(1800, 2, 3);
        expect(meter.snapshot().sampleCount).toBe(0);
        meter.push(1816, 2, 3);
        expect(meter.snapshot().sampleCount).toBe(1);
        meter.reset();
        expect(meter.snapshot().sampleCount).toBe(0);
    });

    it('ignores impossible timestamps and invalid measurements', () => {
        const meter = new FrameTimingBuffer(4);
        meter.push(100, 0, 2);
        meter.push(Number.NaN, 1, 1);
        meter.push(116, -1, 2);
        meter.push(116, 1, 1);
        expect(meter.snapshot().sampleCount).toBe(1);
        expect(() => new FrameTimingBuffer(2)).toThrow();
    });
});
