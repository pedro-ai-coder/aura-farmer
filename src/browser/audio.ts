/** Tiny synthesized cues; no downloaded audio, autoplay or network dependency. */
export class AudioCues {
    private context?: AudioContext;
    enabled = true;
    unlock() { if (!this.context)
        this.context = new AudioContext(); void this.context.resume(); }
    play(kind: 'warning' | 'upgrade' | 'flex' | 'berserk') {
        if (!this.enabled || !this.context || this.context.state !== 'running')
            return;
        const ctx = this.context, osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = kind === 'berserk' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(kind === 'berserk' ? 90 : kind === 'warning' ? 180 : kind === 'flex' ? 330 : 660, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(kind === 'berserk' ? 45 : kind === 'warning' ? 100 : 880, ctx.currentTime + .18);
        gain.gain.setValueAtTime(.035, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + .23);
    }
}
