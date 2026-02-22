/**
 * Minimal sound manager using the Web Audio API.
 * No external files needed — tones are synthesised on demand.
 */

type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

const NOTE_FREQUENCIES: Record<NoteName, number> = {
    C: 261.63,
    'C#': 277.18,
    D: 293.66,
    'D#': 311.13,
    E: 329.63,
    F: 349.23,
    'F#': 369.99,
    G: 392.00,
    'G#': 415.30,
    A: 440.00,
    'A#': 466.16,
    B: 493.88,
};

class SoundManager {
    private ctx: AudioContext | null = null;

    private getCtx(): AudioContext {
        if (!this.ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.ctx;
    }

    playPianoKey(note: string): void {
        try {
            const ctx = this.getCtx();
            const freq = NOTE_FREQUENCIES[note as NoteName] ?? 440;

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

            gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 1.2);
        } catch {
            // Ignore if audio context isn't available
        }
    }
}

export const soundManager = new SoundManager();
