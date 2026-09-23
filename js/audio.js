// Web Audio API Retro 8-bit / 16-bit Sound Synthesizer & Dual-Track Music for Dragon Quest Survivors
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.currentTrack = null; // 'field', 'boss', or null
        this.bgmTimer = null;
        this.tempo = 140; // BPM
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
        if (!this.enabled) {
            this.stopBgm();
        } else if (this.currentTrack) {
            this.startTrack(this.currentTrack);
        }
        return this.enabled;
    }

    playTone(freq, duration, type = 'square', gainVal = 0.08, freqEnd = null) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(20, freq), this.ctx.currentTime);
        if (freqEnd !== null) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration, gainVal = 0.08, filterFreq = 1200) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
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
        filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start();
    }

    // --- SFX (Dragon Quest Iconic Sounds) ---

    playSelect() {
        this.playTone(880, 0.04, 'square', 0.08);
    }

    playSlash() {
        this.playTone(520, 0.11, 'sawtooth', 0.1, 100);
    }

    playCritical() {
        // High sparkling chime for critical strikes
        this.playTone(1318.51, 0.06, 'triangle', 0.12);
        setTimeout(() => this.playTone(1760.00, 0.12, 'triangle', 0.14), 40);
    }

    playMagic() {
        this.playTone(280, 0.18, 'sine', 0.12, 850);
    }

    playBoomerang() {
        this.playTone(587, 0.12, 'triangle', 0.09, 320);
    }

    playHit() {
        this.playTone(190, 0.07, 'sawtooth', 0.09, 70);
    }

    playInstantKill() {
        // High execution strike
        this.playTone(1200, 0.15, 'sawtooth', 0.16, 80);
        this.playNoise(0.2, 0.15, 2000);
    }

    playExplosion() {
        this.playNoise(0.4, 0.25, 900);
    }

    playExp() {
        const pitches = [987.77, 1174.66, 1318.51, 1567.98];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        this.playTone(pitch, 0.07, 'sine', 0.05);
    }

    playHurt() {
        this.playTone(140, 0.15, 'square', 0.16, 50);
    }

    playBossRoar() {
        // Terrifying low roar for boss spawn
        this.playTone(90, 0.6, 'sawtooth', 0.25, 40);
        this.playNoise(0.5, 0.2, 450);
    }

    playLevelUp() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 523.25, d: 0.1 },  // C5
            { f: 659.25, d: 0.1 },  // E5
            { f: 783.99, d: 0.1 },  // G5
            { f: 1046.50, d: 0.28 } // C6
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => this.playTone(n.f, n.d, 'square', 0.15), delay * 1000);
            delay += n.d * 0.85;
        });
    }

    playChest() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 440, d: 0.09 },
            { f: 554.37, d: 0.09 },
            { f: 659.25, d: 0.09 },
            { f: 880, d: 0.35 }
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => this.playTone(n.f, n.d, 'triangle', 0.16), delay * 1000);
            delay += n.d * 0.9;
        });
    }

    playEvolution() {
        if (!this.enabled) return;
        this.init();
        const chords = [
            [523.25, 659.25, 783.99],   // C Major
            [587.33, 739.99, 880.00],   // D Major
            [659.25, 830.61, 987.77],   // E Major
            [1046.50, 1318.51, 1567.98] // High C
        ];
        chords.forEach((chord, i) => {
            setTimeout(() => {
                chord.forEach(f => this.playTone(f, 0.4, 'square', 0.09));
            }, i * 220);
        });
    }

    playGameOver() {
        if (!this.enabled) return;
        this.init();
        const notes = [440, 415.30, 392, 369.99, 329.63, 293.66, 261.63];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.28, 'sawtooth', 0.13), i * 190);
        });
    }

    playVictory() {
        if (!this.enabled) return;
        this.init();
        const melody = [
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.15 },
            { f: 523.25, d: 0.45 },
            { f: 415.30, d: 0.3 },
            { f: 466.16, d: 0.3 },
            { f: 523.25, d: 0.7 }
        ];
        let delay = 0;
        melody.forEach(n => {
            setTimeout(() => this.playTone(n.f, n.d, 'square', 0.13), delay * 1000);
            delay += n.d * 0.9;
        });
    }

    // ==========================================
    // DUAL-TRACK CHIPTUNE MUSIC SYSTEM
    // ==========================================

    startTrack(trackName) {
        if (this.currentTrack === trackName && this.bgmTimer) return;
        this.stopBgm();
        this.currentTrack = trackName;
        if (!this.enabled) return;
        this.init();

        if (trackName === 'boss') {
            this.runBossBgm();
        } else {
            this.runFieldBgm();
        }
    }

    switchToBoss() {
        if (this.currentTrack !== 'boss') {
            this.playBossRoar();
            this.startTrack('boss');
        }
    }

    switchToField() {
        if (this.currentTrack !== 'field') {
            this.startTrack('field');
        }
    }

    // 1. Dragon Quest Field Adventure March (經典勇者踏上平原冒險曲)
    runFieldBgm() {
        // Melodic motives & walking bassline
        const bassNotes = [
            130.81, 130.81, 164.81, 196.00,  // C3, C3, E3, G3
            146.83, 146.83, 174.61, 220.00,  // D3, D3, F3, A3
            164.81, 196.00, 220.00, 246.94,  // E3, G3, A3, B3
            261.63, 196.00, 164.81, 130.81   // C4, G3, E3, C3
        ];
        const melodyNotes = [
            261.63, 0, 329.63, 392.00,
            440.00, 392.00, 329.63, 0,
            349.23, 392.00, 440.00, 523.25,
            392.00, 0, 0, 0
        ];
        let step = 0;

        const loop = () => {
            if (this.currentTrack !== 'field' || !this.enabled) return;

            // Bassline
            const b = bassNotes[step % bassNotes.length];
            this.playTone(b, 0.16, 'triangle', 0.04);

            // Lead Melody
            const m = melodyNotes[step % melodyNotes.length];
            if (m > 0) {
                this.playTone(m, 0.18, 'square', 0.035);
            }

            // Snare / Hi-hat
            if (step % 2 === 1) {
                this.playNoise(0.03, 0.015, 3200);
            }

            step++;
            this.bgmTimer = setTimeout(loop, 210);
        };
        loop();
    }

    // 2. Dragon Quest Epic Boss Battle Theme (激昂緊迫的魔王戰鬥曲)
    runBossBgm() {
        // Fast, aggressive minor-key battle ostinato (D minor / G minor)
        const bassOstinato = [
            146.83, 146.83, 220.00, 146.83,  // D3, D3, A3, D3
            138.59, 138.59, 207.65, 138.59,  // C#3, C#3, G#3, C#3
            130.81, 130.81, 196.00, 130.81,  // C3, C3, G3, C3
            123.47, 130.81, 138.59, 146.83   // B2, C3, C#3, D3
        ];
        const leadTension = [
            293.66, 311.13, 293.66, 0,
            277.18, 293.66, 277.18, 0,
            261.63, 277.18, 261.63, 0,
            349.23, 329.63, 311.13, 293.66
        ];
        let step = 0;

        const loop = () => {
            if (this.currentTrack !== 'boss' || !this.enabled) return;

            // Driving aggressive bass
            const b = bassOstinato[step % bassOstinato.length];
            this.playTone(b, 0.11, 'sawtooth', 0.055);

            // Screaming synth lead
            const l = leadTension[step % leadTension.length];
            if (l > 0) {
                this.playTone(l, 0.13, 'square', 0.045);
            }

            // Heavy double-kick and rapid snare
            if (step % 2 === 0) {
                this.playTone(85, 0.06, 'triangle', 0.08, 30); // Kick drum
            } else {
                this.playNoise(0.04, 0.03, 1800); // Sharp Snare
            }

            step++;
            this.bgmTimer = setTimeout(loop, 150); // Faster, intense battle tempo!
        };
        loop();
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundFx = new SoundFX();
