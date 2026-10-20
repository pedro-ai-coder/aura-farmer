/** B2.1: diagnostics only. Never drives simulation or frame scheduling. */
export interface FrameTimingSummary {
    sampleCount: number;
    observedFps: number;
    meanFrameMs: number;
    p50FrameMs: number;
    p95FrameMs: number;
    p99FrameMs: number;
    worstFrameMs: number;
    p95SimulationMs: number;
    p95SceneDrawMs: number;
    over16MsPercent: number;
    over33MsPercent: number;
}

export interface FrameSceneCounts {
    enemies: number;
    shots: number;
    areas: number;
    drops: number;
    effects: number;
}

const round = (value: number) => Math.round(value * 10) / 10;
const percentile = (sorted: readonly number[], proportion: number) =>
    sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * proportion) - 1)] : 0;

/**
 * Rolling, bounded, allocation-free-on-push frame sampler. Each entry
 * corresponds to one REAL BrowserScene.update call (not a separate RAF).
 * Long background-tab gaps are discarded rather than reported as 0 FPS.
 *
 * Simulation and scene-draw cost measure JS execution only; they do NOT
 * measure GPU rasterization, frame presentation, or browser layout work.
 */
export class FrameTimingBuffer {
    private readonly intervals: Float32Array;
    private readonly simulation: Float32Array;
    private readonly sceneDraw: Float32Array;
    private previous = Number.NaN;
    private next = 0;
    private count = 0;

    constructor(readonly capacity = 240) {
        if (!Number.isSafeInteger(capacity) || capacity < 4)
            throw new Error('Invalid frame timing capacity');
        this.intervals = new Float32Array(capacity);
        this.simulation = new Float32Array(capacity);
        this.sceneDraw = new Float32Array(capacity);
    }

    reset() {
        this.previous = Number.NaN;
        this.next = 0;
        this.count = 0;
    }

    push(start: number, simulationMs: number, sceneDrawMs: number) {
        if (!Number.isFinite(start) || !Number.isFinite(simulationMs) ||
            !Number.isFinite(sceneDrawMs) || simulationMs < 0 || sceneDrawMs < 0)
            return;
        const elapsed = start - this.previous;
        this.previous = start;
        if (!Number.isFinite(elapsed)) return;
        if (elapsed >= 500) {
            // A tab suspended for seconds must not poison the rolling sample.
            this.reset();
            this.previous = start;
            return;
        }
        if (elapsed <= 0) return;
        this.intervals[this.next] = elapsed;
        this.simulation[this.next] = simulationMs;
        this.sceneDraw[this.next] = sceneDrawMs;
        this.count = Math.min(this.capacity, this.count + 1);
        this.next = (this.next + 1) % this.capacity;
    }

    snapshot(): FrameTimingSummary {
        const n = this.count;
        if (!n) {
            return {
                sampleCount: 0, observedFps: 0, meanFrameMs: 0, p50FrameMs: 0,
                p95FrameMs: 0, p99FrameMs: 0, worstFrameMs: 0,
                p95SimulationMs: 0, p95SceneDrawMs: 0,
                over16MsPercent: 0, over33MsPercent: 0,
            };
        }
        const intervals = Array.from(this.intervals.subarray(0, n)).sort((a,b) => a-b);
        const sim = Array.from(this.simulation.subarray(0, n)).sort((a,b) => a-b);
        const draw = Array.from(this.sceneDraw.subarray(0, n)).sort((a,b) => a-b);
        const sum = intervals.reduce((total, ms) => total + ms, 0);
        const average = sum / n;
        const over = (budget: number) =>
            round(intervals.filter(ms => ms > budget).length * 100 / n);
        return {
            sampleCount: n,
            observedFps: round(1000 / average),
            meanFrameMs: round(average),
            p50FrameMs: round(percentile(intervals, .50)),
            p95FrameMs: round(percentile(intervals, .95)),
            p99FrameMs: round(percentile(intervals, .99)),
            worstFrameMs: round(intervals[n - 1]),
            p95SimulationMs: round(percentile(sim, .95)),
            p95SceneDrawMs: round(percentile(draw, .95)),
            over16MsPercent: over(1000 / 60),
            over33MsPercent: over(1000 / 30),
        };
    }
}

/** Opt-in UI from ?fps=1. No DOM or sampling work in ordinary gameplay. */
export class RenderFrameMeter {
    private readonly element: HTMLDivElement;
    private readonly timings = new FrameTimingBuffer();
    private refreshed = 0;
    private counts: FrameSceneCounts = { enemies: 0, shots: 0, areas: 0, drops: 0, effects: 0 };

    constructor() {
        this.element = document.createElement('div');
        this.element.id = 'render-frame-meter';
        this.element.setAttribute('role', 'status');
        this.element.setAttribute('aria-label', 'Performance diagnostics');
        this.element.style.cssText = [
            'position:fixed', 'right:12px', 'bottom:12px', 'z-index:2500',
            'pointer-events:none', 'background:rgba(20,32,52,.88)',
            'color:#fff3d9', 'border:1px solid #8bb9cb', 'border-radius:8px',
            'padding:8px 12px', 'font:12px/1.5 ui-monospace,SFMono-Regular,monospace',
            'font-variant-numeric:tabular-nums', 'white-space:pre', 'max-width:98vw',
        ].join(';');
        this.element.textContent = 'FPS: a recolher dados…';
        document.body.appendChild(this.element);
    }

    /** Called once per actual Phaser scene update. */
    sample(start: number, simulationMs: number, sceneDrawMs: number, counts: FrameSceneCounts) {
        this.timings.push(start, simulationMs, sceneDrawMs);
        this.counts = counts;
        if (start - this.refreshed < 1000) return;
        this.refreshed = start;
        const s = this.timings.snapshot();
        if (s.sampleCount < 4) return;
        this.element.textContent =
            'FPS observado: ' + s.observedFps.toFixed(1) +
            '\nFrame p95: ' + s.p95FrameMs.toFixed(1) + ' ms' +
            ' · p99: ' + s.p99FrameMs.toFixed(1) + ' ms' +
            '\nSimulação p95: ' + s.p95SimulationMs.toFixed(1) + ' ms' +
            ' · cena JS p95: ' + s.p95SceneDrawMs.toFixed(1) + ' ms' +
            '\n>16,7 ms: ' + s.over16MsPercent.toFixed(1) + '%' +
            ' · >33,3 ms: ' + s.over33MsPercent.toFixed(1) + '%' +
            '\nInimigos: ' + counts.enemies +
            ' · projéteis: ' + counts.shots +
            ' · áreas: ' + counts.areas +
            ' · drops: ' + counts.drops;
    }

    /** Readable from browser QA using __app.scene.frameMeter.snapshot(). */
    snapshot(): FrameTimingSummary & FrameSceneCounts {
        return { ...this.timings.snapshot(), ...this.counts };
    }

    /** Exclude warm-up / setup from a deterministic stress scenario. */
    reset() {
        this.timings.reset();
        this.refreshed = 0;
        this.element.textContent = 'FPS: a recolher dados…';
    }
}
