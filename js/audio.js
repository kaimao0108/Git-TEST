// Authentic Dragon Quest Chiptune Synthesizer & Dual-Track Music (Field & Boss)
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.currentTrack = null; // 'field', 'boss', or null
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
        if (!this.enabled) {
            this.stopBgm();
        } else if (this.currentTrack) {
            this.startTrack(this.currentTrack);
        }
        return this.enabled;
    }

    playTone(freq, duration, type = 'square', gainVal = 0.08, freqEnd = null) {
        if (!this.enabled || freq <= 0) return;
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

    playNoise(duration, gainVal = 0.07, filterFreq = 1200) {
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

    // --- SFX (Authentic Dragon Quest Sound Effects) ---

    playSelect() {
        this.playTone(880, 0.05, 'square', 0.09);
    }

    playSlash() {
        this.playTone(550, 0.10, 'sawtooth', 0.11, 90);
    }

    playCritical() {
        // High sparkling bell chime for critical hit
        this.playTone(1318.51, 0.06, 'triangle', 0.14);
        setTimeout(() => this.playTone(1760.00, 0.14, 'triangle', 0.16), 45);
    }

    playMagic() {
        this.playTone(300, 0.18, 'sine', 0.13, 900);
    }

    playBoomerang() {
        this.playTone(620, 0.11, 'triangle', 0.10, 320);
    }

    playHit() {
        this.playTone(200, 0.06, 'sawtooth', 0.10, 70);
    }

    playInstantKill() {
        this.playTone(1300, 0.16, 'sawtooth', 0.18, 90);
        this.playNoise(0.2, 0.16, 2200);
    }

    playExplosion() {
        this.playNoise(0.42, 0.28, 900);
    }

    playExp() {
        const pitches = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        this.playTone(pitch, 0.08, 'sine', 0.07);
    }

    playHurt() {
        this.playTone(140, 0.16, 'square', 0.16, 50);
    }

    playBossRoar() {
        this.playTone(95, 0.7, 'sawtooth', 0.28, 40);
        this.playNoise(0.55, 0.25, 450);
    }

    // Classic DQ Level Up Fanfare (C5 - E5 - G5 - C6)
    playLevelUp() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 523.25, d: 0.1 },
            { f: 659.25, d: 0.1 },
            { f: 783.99, d: 0.1 },
            { f: 1046.50, d: 0.3 }
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => this.playTone(n.f, n.d, 'square', 0.16), delay * 1000);
            delay += n.d * 0.85;
        });
    }

    // Classic DQ Treasure Chest Fanfare
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
            [523.25, 659.25, 783.99],
            [587.33, 739.99, 880.00],
            [659.25, 830.61, 987.77],
            [1046.50, 1318.51, 1567.98]
        ];
        chords.forEach((chord, i) => {
            setTimeout(() => {
                chord.forEach(f => this.playTone(f, 0.42, 'square', 0.1));
            }, i * 220);
        });
    }

    playGameOver() {
        if (!this.enabled) return;
        this.init();
        const notes = [440, 415.30, 392, 369.99, 329.63, 293.66, 261.63];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.28, 'sawtooth', 0.14), i * 190);
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
            setTimeout(() => this.playTone(n.f, n.d, 'square', 0.14), delay * 1000);
            delay += n.d * 0.9;
        });
    }

    // =========================================================================
    // AUTHENTIC DRAGON QUEST FIELD THEME & BOSS BATTLE THEME
    // =========================================================================

    startTrack(trackName) {
        if (this.currentTrack === trackName && this.bgmTimer) return;
        this.stopBgm();
        this.currentTrack = trackName;
        if (!this.enabled) return;
        this.init();

        if (trackName === 'boss') {
            this.runDqBossTheme();
        } else {
            this.runDqFieldTheme();
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

    // 1. Dragon Quest Classic Overworld Field Theme (勇者鬥惡龍經典原野冒險曲)
    // Famous Koichi Sugiyama noble march: Sol-Do-Re-Mi-Re-Do-Re-Sol / Mi-Fa-Sol-La...
    runDqFieldTheme() {
        const C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
        const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;

        // Iconic Melody Steps (16-step phrase)
        const melody = [
            G4,  0, C5,  0,  D5,  0, E5,  0,
            D5, C5, D5,  0,  G4,  0,  0,  0,
            E5,  0, F5,  0,  G5,  0, A5,  0,
            G5, F5, E5,  0,  D5,  0,  0,  0
        ];
        // Full majestic walking bassline
        const bass = [
            C3, G3, C3, G3,  D3, A3, D3, A3,
            B3, G3, B3, G3,  C3, E3, G3, C3,
            C3, G3, C3, G3,  F3, C4, F3, C4,
            G3, D3, G3, D3,  G3, B3, D4, G3
        ];

        let step = 0;
        const stepTime = 160; // ms per 16th beat

        const loop = () => {
            if (this.currentTrack !== 'field' || !this.enabled) return;

            const idx = step % melody.length;
            const melNote = melody[idx];
            const bassNote = bass[idx];

            // Lead Melody (Square wave with warm retro tone)
            if (melNote > 0) {
                this.playTone(melNote, 0.22, 'square', 0.045);
            }

            // Bassline (Triangle wave)
            if (bassNote > 0) {
                this.playTone(bassNote, 0.18, 'triangle', 0.06);
            }

            // March snare on beats 4 and 8
            if (idx % 4 === 2) {
                this.playNoise(0.04, 0.02, 3000);
            }

            step++;
            this.bgmTimer = setTimeout(loop, stepTime);
        };
        loop();
    }

    // 2. Dragon Quest Epic BOSS Battle Theme (勇者鬥惡龍熱血魔王決戰曲)
    // Driving minor-key ostinato with aggressive staccato brass fanfares!
    runDqBossTheme() {
        const D3 = 146.83, Cs3 = 138.59, C3 = 130.81, B2 = 123.47, A2 = 110.00;
        const D4 = 293.66, F4 = 349.23, G4 = 392.00, Gs4 = 415.30, A4 = 440.00, C5 = 523.25, D5 = 587.33;

        // Driving Battle Ostinato (Aggressive rapid 16th notes)
        const bass = [
            D3, D3, A2, D3,  Cs3, Cs3, A2, Cs3,
            C3, C3, G3, C3,  B2,  B2,  A2, B2,
            D3, D3, F3, D3,  G3,  G3,  Gs3, G3,
            A3, A3, G3, F3,  E3,  F3,  E3, Cs3
        ];
        // Dramatic heroic brass melody
        const brass = [
            D4,  0, F4,  0,  Gs4,  0, A4,  0,
            D5,  0, C5, A4,  F4,   0, G4,  0,
            D4,  0, F4, G4,  Gs4,  0, A4,  0,
            D5, D5, C5, A4,  Gs4, A4, Gs4, F4
        ];

        let step = 0;
        const stepTime = 135; // Fast and driving tempo!

        const loop = () => {
            if (this.currentTrack !== 'boss' || !this.enabled) return;

            const idx = step % bass.length;
            const b = bass[idx];
            const m = brass[idx];

            // Driving Sawtooth Bass
            if (b > 0) {
                this.playTone(b, 0.10, 'sawtooth', 0.065);
            }

            // Punchy Brass Lead
            if (m > 0) {
                this.playTone(m, 0.15, 'square', 0.06);
            }

            // Heavy Battle Drums
            if (idx % 4 === 0) {
                this.playTone(75, 0.08, 'triangle', 0.12, 25); // Heavy Kick
            } else if (idx % 2 === 1) {
                this.playNoise(0.04, 0.035, 1800); // Crisp Snare
            }

            step++;
            this.bgmTimer = setTimeout(loop, stepTime);
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
