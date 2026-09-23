// Web Audio API Retro 8-bit Sound Synthesizer for Dragon Quest Survivors
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.bgmPlaying = false;
        this.bgmTimer = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.bgmPlaying) {
            this.stopBgm();
        }
        return this.enabled;
    }

    // Classic 8-bit tone generator
    playTone(freq, duration, type = 'square', gainVal = 0.1, freqEnd = null) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (freqEnd !== null) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration, gainVal = 0.1, filterFreq = 1000) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
    }

    // UI Click / Cursor
    playSelect() {
        this.playTone(880, 0.05, 'square', 0.08);
    }

    // Attack Whoosh / Slash
    playSlash() {
        this.playTone(450, 0.12, 'sawtooth', 0.1, 120);
    }

    // Fireball / Magic
    playMagic() {
        this.playTone(300, 0.2, 'sine', 0.12, 700);
    }

    // Boomerang
    playBoomerang() {
        this.playTone(550, 0.15, 'triangle', 0.08, 300);
    }

    // Enemy Hit
    playHit() {
        this.playTone(180, 0.08, 'sawtooth', 0.09, 80);
    }

    // Explosion
    playExplosion() {
        this.playNoise(0.35, 0.2, 800);
    }

    // Gem Pickup
    playExp() {
        const pitches = [987.77, 1174.66, 1318.51, 1567.98];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        this.playTone(pitch, 0.08, 'sine', 0.06);
    }

    // Player Hurt
    playHurt() {
        this.playTone(150, 0.15, 'square', 0.15, 60);
    }

    // Level Up Fanfare (Classic DQ style quick arpeggio)
    playLevelUp() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 523.25, d: 0.1 },  // C5
            { f: 659.25, d: 0.1 },  // E5
            { f: 783.99, d: 0.1 },  // G5
            { f: 1046.50, d: 0.25 } // C6
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => {
                this.playTone(n.f, n.d, 'square', 0.15);
            }, delay * 1000);
            delay += n.d * 0.85;
        });
    }

    // Treasure Chest Fanfare
    playChest() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 440, d: 0.1 },
            { f: 554.37, d: 0.1 },
            { f: 659.25, d: 0.1 },
            { f: 880, d: 0.3 }
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => {
                this.playTone(n.f, n.d, 'triangle', 0.15);
            }, delay * 1000);
            delay += n.d * 0.9;
        });
    }

    // Evolution Fanfare (Epic Victory chord)
    playEvolution() {
        if (!this.enabled) return;
        this.init();
        const chords = [
            [523.25, 659.25, 783.99],   // C Major
            [587.33, 739.99, 880.00],   // D Major
            [659.25, 830.61, 987.77],   // E Major
            [1046.50, 1318.51, 1567.98] // High C Major
        ];
        chords.forEach((chord, i) => {
            setTimeout(() => {
                chord.forEach(f => this.playTone(f, 0.35, 'square', 0.08));
            }, i * 220);
        });
    }

    // Game Over Theme (Sad descent)
    playGameOver() {
        if (!this.enabled) return;
        this.init();
        const notes = [440, 415.30, 392, 369.99, 329.63, 293.66, 261.63];
        notes.forEach((f, i) => {
            setTimeout(() => {
                this.playTone(f, 0.25, 'sawtooth', 0.12);
            }, i * 180);
        });
    }

    // Victory Fanfare
    playVictory() {
        if (!this.enabled) return;
        this.init();
        const melody = [
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.4 },
            { f: 415.30, d: 0.3 },
            { f: 466.16, d: 0.3 },
            { f: 523.25, d: 0.6 }
        ];
        let delay = 0;
        melody.forEach(n => {
            setTimeout(() => {
                this.playTone(n.f, n.d, 'square', 0.12);
            }, delay * 1000);
            delay += n.d * 0.9;
        });
    }

    // Chiptune Retro BGM Generator (Field March)
    startBgm() {
        if (!this.enabled || this.bgmPlaying) return;
        this.init();
        this.bgmPlaying = true;

        const bassline = [
            130.81, 130.81, 164.81, 196.00,
            130.81, 130.81, 174.61, 196.00,
            146.83, 146.83, 174.61, 220.00,
            130.81, 164.81, 196.00, 261.63
        ];
        let step = 0;

        const loop = () => {
            if (!this.bgmPlaying || !this.enabled) return;
            const f = bassline[step % bassline.length];
            this.playTone(f, 0.12, 'triangle', 0.035);

            // subtle snare/hi-hat every 2 beats
            if (step % 2 === 1) {
                this.playNoise(0.03, 0.015, 3000);
            }

            step++;
            this.bgmTimer = setTimeout(loop, 220);
        };
        loop();
    }

    stopBgm() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundFx = new SoundFX();
