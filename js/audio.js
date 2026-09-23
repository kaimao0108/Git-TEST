// Authentic Dragon Quest Chiptune Synthesizer & Dual-Track Music (Field & Boss)
// Powered by Web Audio API - Zero External Dependencies

const NOTES = {
    // Octave 2
    C2: 65.41, Cs2: 69.30, D2: 73.42, Ds2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Gs2: 103.83, A2: 110.00, As2: 116.54, B2: 123.47,
    // Octave 3
    C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00, As3: 233.08, B3: 246.94,
    // Octave 4
    C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
    // Octave 5
    C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00, As5: 932.33, B5: 987.77,
    // Octave 6
    C6: 1046.50, D6: 1174.66, E6: 1318.51
};

const getFreq = (n) => typeof n === 'number' ? n : (NOTES[n] || 0);

class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.currentTrack = null; // 'field', 'boss', or null
        this.bgmTimer = null;
        this.onTrackChange = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
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

        try {
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
        } catch (e) {
            // Safe fallback
        }
    }

    playNoise(duration, gainVal = 0.07, filterFreq = 1200) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
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
        } catch (e) {
            // Safe fallback
        }
    }

    // --- SFX (Authentic Dragon Quest Sound Effects) ---

    playSelect() {
        this.playTone(880, 0.05, 'square', 0.10);
    }

    playSlash() {
        this.playTone(550, 0.10, 'sawtooth', 0.12, 90);
    }

    playCritical() {
        this.playTone(1318.51, 0.06, 'triangle', 0.15);
        setTimeout(() => this.playTone(1760.00, 0.14, 'triangle', 0.18), 45);
    }

    playMagic() {
        this.playTone(300, 0.18, 'sine', 0.14, 900);
    }

    playBoomerang() {
        this.playTone(620, 0.11, 'triangle', 0.11, 320);
    }

    playHit() {
        this.playTone(200, 0.06, 'sawtooth', 0.11, 70);
    }

    playInstantKill() {
        this.playTone(1300, 0.16, 'sawtooth', 0.20, 90);
        this.playNoise(0.2, 0.18, 2200);
    }

    playExplosion() {
        this.playNoise(0.42, 0.28, 900);
    }

    playExp() {
        const pitches = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        this.playTone(pitch, 0.08, 'sine', 0.08);
    }

    playHurt() {
        this.playTone(140, 0.16, 'square', 0.18, 50);
    }

    playBossRoar() {
        this.playTone(95, 0.7, 'sawtooth', 0.30, 40);
        this.playNoise(0.55, 0.28, 450);
    }

    // Classic DQ Level Up Fanfare (C5 - E5 - G5 - C6)
    playLevelUp() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 523.25, d: 0.1 },
            { f: 659.25, d: 0.1 },
            { f: 783.99, d: 0.1 },
            { f: 1046.50, d: 0.32 }
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => this.playTone(n.f, n.d, 'square', 0.18), delay * 1000);
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
            setTimeout(() => this.playTone(n.f, n.d, 'triangle', 0.18), delay * 1000);
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
                chord.forEach(f => this.playTone(f, 0.45, 'square', 0.12));
            }, i * 220);
        });
    }

    playGameOver() {
        if (!this.enabled) return;
        this.init();
        const notes = [440, 415.30, 392, 369.99, 329.63, 293.66, 261.63];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.30, 'sawtooth', 0.16), i * 190);
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
            { f: 523.25, d: 0.75 }
        ];
        let delay = 0;
        melody.forEach(n => {
            setTimeout(() => this.playTone(n.f, n.d, 'square', 0.16), delay * 1000);
            delay += n.d * 0.9;
        });
    }

    // =========================================================================
    // AUTHENTIC DRAGON QUEST DUAL-TRACK BGM SYSTEM
    // 1. Dragon Quest III Overworld March: "冒險的旅程" (冒険の旅)
    // 2. Dragon Quest III Final Boss Battle: "勇者的挑戰" (勇者の挑戦)
    // =========================================================================

    startTrack(trackName) {
        if (this.currentTrack === trackName && this.bgmTimer) return;
        this.stopBgm();
        this.currentTrack = trackName;

        if (this.onTrackChange) {
            this.onTrackChange(trackName);
        }

        if (!this.enabled) return;
        this.init();

        try {
            if (trackName === 'boss') {
                this.runDqBossTheme();
            } else {
                this.runDqFieldTheme();
            }
        } catch (e) {
            console.warn('Audio playback notice:', e);
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

    // 1. Dragon Quest Signature Overworld Theme: "冒險的旅程" (Adventure / 冒険の旅)
    // Composed by Koichi Sugiyama - Noble, triumphant adventure march in C major
    runDqFieldTheme() {
        const lead = [
            // Phrase 1: Sol-Do-Re-Mi-Re-Do-Re
            'G4', 'G4', 'C5', 'C5', 'D5', 'D5', 'E5', 'E5',  'E5', 'E5', 'D5', 'D5', 'C5', 'C5', 'D5', 'D5',
            // Phrase 2: Sol... Sol-La-Si-Do-Re
            'G4', 'G4', 'G4', 'G4', 0, 0, 'G4', 'G4',        'A4', 'A4', 'B4', 'B4', 'C5', 'C5', 'D5', 'D5',
            // Phrase 3: Mi-Fa-Sol-Do(high)-Si-La-Sol
            'E5', 'E5', 'F5', 'F5', 'G5', 'G5', 'G5', 'G5',  'C6', 'C6', 'C6', 'C6', 'B5', 'B5', 'A5', 'A5',
            // Phrase 4: Sol... La-Sol-Fa-Mi
            'G5', 'G5', 'G5', 'G5', 'G5', 'G5', 'G5', 'G5',  'A5', 'A5', 'G5', 'G5', 'F5', 'F5', 'E5', 'E5',
            // Phrase 5: Re... Mi-Re-Do-Si
            'D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'D5',  'E5', 'E5', 'D5', 'D5', 'C5', 'C5', 'B4', 'B4',
            // Phrase 6: Do (Resolution)
            'C5', 'C5', 'C5', 'C5', 'C5', 'C5', 'C5', 'C5',  0, 0, 0, 0, 0, 0, 0, 0
        ];

        const harmony = [
            'E4', 'E4', 'G4', 'G4', 'B4', 'B4', 'C5', 'C5',  'C5', 'C5', 'B4', 'B4', 'A4', 'A4', 'B4', 'B4',
            'D4', 'D4', 'D4', 'D4', 0, 0, 'E4', 'E4',        'F4', 'F4', 'G4', 'G4', 'A4', 'A4', 'B4', 'B4',
            'C5', 'C5', 'D5', 'D5', 'E5', 'E5', 'E5', 'E5',  'A5', 'A5', 'A5', 'A5', 'G5', 'G5', 'F5', 'F5',
            'E5', 'E5', 'E5', 'E5', 'E5', 'E5', 'E5', 'E5',  'F5', 'F5', 'E5', 'E5', 'D5', 'D5', 'C5', 'C5',
            'B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'B4',  'C5', 'C5', 'B4', 'B4', 'A4', 'A4', 'G4', 'G4',
            'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4',  0, 0, 0, 0, 0, 0, 0, 0
        ];

        const bass = [
            'C3', 'G3', 'C3', 'G3', 'C3', 'G3', 'C3', 'G3',  'C3', 'G3', 'C3', 'G3', 'D3', 'A3', 'D3', 'A3',
            'G3', 'D3', 'G3', 'D3', 'G3', 'D3', 'G3', 'D3',  'G3', 'D3', 'G3', 'D3', 'G3', 'B3', 'D4', 'G3',
            'C3', 'G3', 'C3', 'G3', 'C3', 'G3', 'C3', 'G3',  'F3', 'C4', 'F3', 'C4', 'F3', 'C4', 'F3', 'C4',
            'C3', 'G3', 'C3', 'G3', 'C3', 'G3', 'C3', 'G3',  'F3', 'C4', 'F3', 'C4', 'C3', 'G3', 'C3', 'G3',
            'G3', 'D3', 'G3', 'D3', 'G3', 'D3', 'G3', 'D3',  'G3', 'D3', 'G3', 'D3', 'G3', 'B3', 'D4', 'G3',
            'C3', 'G3', 'E3', 'G3', 'C3', 'G3', 'E3', 'G3',  'C3', 0, 0, 0, 0, 0, 0, 0
        ];

        let step = 0;
        const stepTime = 120; // March tempo (~125 BPM)

        const loop = () => {
            if (this.currentTrack !== 'field' || !this.enabled) return;

            const idx = step % lead.length;
            const lNote = getFreq(lead[idx]);
            const hNote = getFreq(harmony[idx]);
            const bNote = getFreq(bass[idx]);

            // Lead Melody (Square wave, clear retro presence)
            if (lNote > 0) {
                this.playTone(lNote, 0.20, 'square', 0.085);
            }

            // Harmony (Softer square wave)
            if (hNote > 0) {
                this.playTone(hNote, 0.18, 'square', 0.045);
            }

            // Walking Bass (Triangle wave)
            if (bNote > 0) {
                this.playTone(bNote, 0.16, 'triangle', 0.09);
            }

            // Snare / Hi-hat on backbeats
            if (idx % 4 === 2) {
                this.playNoise(0.045, 0.035, 3200);
            } else if (idx % 8 === 0) {
                this.playTone(65, 0.08, 'triangle', 0.10, 28); // Gentle kick
            }

            step++;
            this.bgmTimer = setTimeout(loop, stepTime);
        };
        loop();
    }

    // 2. Dragon Quest Epic BOSS Battle Theme: "勇者的挑戰" (Hero's Challenge / 勇者の挑戦)
    // Driving chromatic ostinato with heroic minor brass fanfares in D minor
    runDqBossTheme() {
        const lead = [
            'D4', 0, 'F4', 0, 'G4', 0, 'Gs4', 0,   'A4', 0, 0, 0, 'D5', 0, 'C5', 0,
            'A4', 0, 'F4', 0, 'G4', 0, 0, 0,       'D4', 0, 'F4', 'G4', 'Gs4', 0, 'A4', 0,
            'D5', 0, 'D5', 0, 'C5', 0, 'A4', 0,    'Gs4', 0, 'A4', 0, 'F4', 0, 'D4', 0,
            'F4', 0, 'G4', 0, 'A4', 0, 'C5', 0,    'D5', 'D5', 'C5', 'A4', 'Gs4', 'A4', 'D5', 0
        ];

        const harmony = [
            'A3', 0, 'D4', 0, 'E4', 0, 'F4', 0,    'F4', 0, 0, 0, 'A4', 0, 'G4', 0,
            'F4', 0, 'D4', 0, 'E4', 0, 0, 0,       'A3', 0, 'D4', 'E4', 'F4', 0, 'F4', 0,
            'A4', 0, 'A4', 0, 'G4', 0, 'F4', 0,    'E4', 0, 'F4', 0, 'D4', 0, 'A3', 0,
            'D4', 0, 'E4', 0, 'F4', 0, 'G4', 0,    'A4', 'A4', 'G4', 'F4', 'E4', 'F4', 'A4', 0
        ];

        const bass = [
            'D3', 'D3', 'A2', 'D3',  'D3', 'D3', 'A2', 'D3',  'Cs3', 'Cs3', 'A2', 'Cs3',  'Cs3', 'Cs3', 'A2', 'Cs3',
            'C3', 'C3', 'G2', 'C3',  'C3', 'C3', 'G2', 'C3',  'B2',  'B2',  'Fs2', 'B2',  'B2',  'B2',  'Fs2', 'B2',
            'As2', 'As2', 'F2', 'As2',  'As2', 'As2', 'F2', 'As2',  'A2', 'A2', 'E2', 'A2',  'A2', 'A2', 'E2', 'A2',
            'Gs2', 'Gs2', 'Ds2', 'Gs2',  'Gs2', 'Gs2', 'Ds2', 'Gs2',  'A2', 'A2', 'Cs3', 'E3',  'A3', 'A3', 'A2', 0
        ];

        let step = 0;
        const stepTime = 104; // Rapid and intense battle tempo!

        const loop = () => {
            if (this.currentTrack !== 'boss' || !this.enabled) return;

            const idx = step % bass.length;
            const lNote = getFreq(lead[idx % lead.length]);
            const hNote = getFreq(harmony[idx % harmony.length]);
            const bNote = getFreq(bass[idx]);

            // Driving Sawtooth Bass
            if (bNote > 0) {
                this.playTone(bNote, 0.10, 'sawtooth', 0.09);
            }

            // Punchy Heroic Brass Lead
            if (lNote > 0) {
                this.playTone(lNote, 0.16, 'square', 0.095);
            }

            // Brass Counterpoint Harmony
            if (hNote > 0) {
                this.playTone(hNote, 0.14, 'square', 0.05);
            }

            // Heavy Battle Drums
            if (idx % 4 === 0) {
                this.playTone(75, 0.09, 'triangle', 0.14, 25); // Heavy Kick
            } else if (idx % 2 === 1) {
                this.playNoise(0.045, 0.045, 2000); // Crisp Snare
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
