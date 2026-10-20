/**
 * Opt-in instrumentation: ?fps=1 shows actually observed render cadence.
 * Uses performance.now (not recording frame rate or sim ticks) and samples
 * p95 frame interval. Never affects game balance or frame scheduling.
 */
export class RenderFrameMeter {
    private readonly element: HTMLDivElement;
    private readonly samples: number[] = [];
    private previous = 0;
    private refreshed = 0;

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

    sample(enemyCount: number, projectileCount: number) {
        const now = performance.now();
        if (this.previous > 0) {
            const elapsed = now - this.previous;
            if (elapsed > 0 && elapsed < 500) {
                this.samples.push(elapsed);
                if (this.samples.length > 180) this.samples.shift();
            }
        }
        this.previous = now;
        if (now - this.refreshed < 1000 || this.samples.length < 4) return;
        this.refreshed = now;
        const sorted = [...this.samples].sort((a,b) => a-b);
        const average = this.samples.reduce((sum,ms) => sum+ms,0)/this.samples.length;
        const p95 = sorted[Math.ceil(sorted.length*.95)-1];
        this.element.textContent =
            'FPS observado: ' + (1000/average).toFixed(1) +
            '\nFrame p95: ' + p95.toFixed(1) + ' ms' +
            '\nInimigos: ' + enemyCount +
            ' · Projéteis: ' + projectileCount;
    }
}
