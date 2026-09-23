// Symphonic Suite Dragon Quest - High-Fidelity Orchestral Audio Engine
// Non-8bit: Features Concert Hall Reverb, Realistic Multi-Voice Strings, Resonant Brass, and Acoustic Timpani

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

        // Acoustic Concert Hall Nodes
        this.masterGain = null;
        this.reverbNode = null;
        this.reverbGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && !this.masterGain) {
            try {
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                // Build Concert Hall Acoustic Reverb
                this.reverbNode = this.ctx.createConvolver();
                this.reverbNode.buffer = this.createConcertHallImpulse(this.ctx.sampleRate, 1.8, 2.4);

                this.reverbGain = this.ctx.createGain();
                this.reverbGain.gain.setValueAtTime(0.35, this.ctx.currentTime); // 35% wet reverb

                this.reverbNode.connect(this.reverbGain);
                this.reverbGain.connect(this.masterGain);
            } catch (e) {
                console.warn('Concert hall reverb init:', e);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    // Generate natural acoustic concert hall impulse response
    createConcertHallImpulse(sampleRate = 44100, duration = 1.8, decay = 2.4) {
        const length = Math.floor(sampleRate * duration);
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / length;
            const env = Math.exp(-t * decay);
            // Stereo spread with randomized acoustic early reflections
            left[i] = (Math.random() * 2 - 1) * env * (1 - t * 0.4);
            right[i] = (Math.random() * 2 - 1) * env * (1 - t * 0.4);
        }
        return impulse;
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

    // =========================================================================
    // HIGH-DEFINITION ORCHESTRAL INSTRUMENTS (NON-8BIT ACOUSTIC SYNTHESIS)
    // =========================================================================

    // 1. Symphonic Strings Ensemble (小提琴與大提琴管弦弦樂組)
    // Warm detuned multi-oscillator chorus with natural vibrato and resonant body filter
    playStrings(freq, duration, gainVal = 0.085, hasVibrato = true) {
        if (!this.enabled || freq <= 0) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const out = this.masterGain || this.ctx.destination;

            // Dual detuned oscillators for lush string ensemble unison
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'sawtooth';
            osc2.type = 'triangle';

            osc1.frequency.setValueAtTime(freq, t);
            osc2.frequency.setValueAtTime(freq, t);
            osc1.detune.setValueAtTime(7, t);  // +7 cents
            osc2.detune.setValueAtTime(-7, t); // -7 cents

            // Natural Violin Vibrato LFO
            if (hasVibrato && duration > 0.18) {
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.setValueAtTime(5.4, t); // 5.4 Hz natural vibrato
                lfoGain.gain.setValueAtTime(4.5, t);
                lfo.connect(lfoGain);
                lfoGain.connect(osc1.frequency);
                lfoGain.connect(osc2.frequency);
                lfo.start(t + 0.06);
                lfo.stop(t + duration);
            }

            // Warm Wooden Instrument Body Filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1150, t);
            filter.Q.setValueAtTime(1.1, t);

            // Smooth bowed string envelope (Soft attack + warm acoustic release)
            const gain = this.ctx.createGain();
            const attackTime = 0.045;
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(gainVal, t + attackTime);
            gain.gain.setValueAtTime(gainVal * 0.9, t + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.12);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(out);

            // Send to Concert Hall Reverb Bus
            if (this.reverbNode) {
                gain.connect(this.reverbNode);
            }

            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + duration + 0.14);
            osc2.stop(t + duration + 0.14);
        } catch (e) {}
    }

    // 2. Orchestral Brass Fanfare (交響銅管小號與法國號組)
    // Rich harmonic presence with dynamic lip articulation filter sweep
    playBrass(freq, duration, gainVal = 0.095) {
        if (!this.enabled || freq <= 0) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const out = this.masterGain || this.ctx.destination;

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';

            osc1.frequency.setValueAtTime(freq, t);
            osc2.frequency.setValueAtTime(freq, t);
            osc2.detune.setValueAtTime(11, t); // Rich brass chorus

            // Dynamic brass lip-articulation filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, t);
            // Fanfare 'Ta-Da' swelling open
            filter.frequency.exponentialRampToValueAtTime(2600, t + 0.038);
            filter.frequency.exponentialRampToValueAtTime(1400, t + duration);
            filter.Q.setValueAtTime(1.4, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(gainVal, t + 0.025);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.08);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(out);

            if (this.reverbNode) {
                gain.connect(this.reverbNode);
            }

            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + duration + 0.09);
            osc2.stop(t + duration + 0.09);
        } catch (e) {}
    }

    // 3. Acoustic Orchestral Timpani (交響樂定音鼓)
    // Deep sub-bass acoustic membrane punch with pitch-drop resonance
    playTimpani(freq = 115, gainVal = 0.16) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const out = this.masterGain || this.ctx.destination;

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            // Classic Timpani pitch drop envelope
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.52, t + 0.38);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(gainVal, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(out);

            if (this.reverbNode) {
                gain.connect(this.reverbNode);
            }

            osc.start(t);
            osc.stop(t + 0.56);
        } catch (e) {}
    }

    // 4. Orchestral Snare & Marching Drums (管弦軍鼓)
    playMarchSnare(gainVal = 0.045) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const duration = 0.07;
            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            // Bandpass filter for crisp acoustic snare wires
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800, t);
            filter.Q.setValueAtTime(2.0, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(gainVal, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);

            noise.start(t);
        } catch (e) {}
    }

    // 5. Orchestral Shimmer Cymbal (交響銅鈸)
    playCymbal(gainVal = 0.055) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const duration = 0.65;
            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(5500, t);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(gainVal, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);

            if (this.reverbNode) {
                gain.connect(this.reverbNode);
            }

            noise.start(t);
        } catch (e) {}
    }

    // --- SFX (Dragon Quest Sound Effects) ---

    playTone(freq, duration, type = 'sine', gainVal = 0.08, freqEnd = null) {
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
            gain.connect(this.masterGain || this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
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
            gain.connect(this.masterGain || this.ctx.destination);

            whiteNoise.start();
        } catch (e) {}
    }

    playSelect() {
        this.playTone(880, 0.06, 'triangle', 0.12);
    }

    playSlash() {
        this.playTone(550, 0.10, 'sawtooth', 0.12, 90);
    }

    playCritical() {
        this.playTone(1318.51, 0.06, 'sine', 0.16);
        setTimeout(() => this.playTone(1760.00, 0.14, 'sine', 0.18), 45);
    }

    playMagic() {
        this.playTone(320, 0.20, 'sine', 0.15, 1100);
    }

    playBoomerang() {
        this.playTone(620, 0.11, 'triangle', 0.12, 320);
    }

    playHit() {
        this.playTone(200, 0.07, 'triangle', 0.12, 70);
    }

    playInstantKill() {
        this.playBrass(880, 0.25, 0.18);
        this.playNoise(0.2, 0.18, 2400);
    }

    playExplosion() {
        this.playTimpani(90, 0.28);
        this.playNoise(0.42, 0.25, 800);
    }

    playExp() {
        const pitches = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        const pitch = pitches[Math.floor(Math.random() * pitches.length)];
        this.playTone(pitch, 0.08, 'sine', 0.09);
    }

    playHurt() {
        this.playTone(130, 0.18, 'triangle', 0.18, 50);
    }

    playBossRoar() {
        this.playTimpani(75, 0.32);
        this.playTone(95, 0.7, 'sawtooth', 0.30, 40);
        this.playNoise(0.55, 0.28, 450);
    }

    // Classic DQ Level Up Fanfare (C5 - E5 - G5 - C6)
    playLevelUp() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.12 },
            { f: 783.99, d: 0.12 },
            { f: 1046.50, d: 0.38 }
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => this.playBrass(n.f, n.d, 0.16), delay * 1000);
            delay += n.d * 0.88;
        });
    }

    // Classic DQ Treasure Chest Fanfare
    playChest() {
        if (!this.enabled) return;
        this.init();
        const notes = [
            { f: 440, d: 0.10 },
            { f: 554.37, d: 0.10 },
            { f: 659.25, d: 0.10 },
            { f: 880, d: 0.40 }
        ];
        let delay = 0;
        notes.forEach(n => {
            setTimeout(() => this.playBrass(n.f, n.d, 0.16), delay * 1000);
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
                chord.forEach(f => this.playBrass(f, 0.48, 0.12));
                this.playCymbal(0.04);
            }, i * 220);
        });
    }

    playGameOver() {
        if (!this.enabled) return;
        this.init();
        const notes = [440, 415.30, 392, 369.99, 329.63, 293.66, 261.63];
        notes.forEach((f, i) => {
            setTimeout(() => this.playStrings(f, 0.35, 0.15), i * 200);
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
            { f: 523.25, d: 0.85 }
        ];
        let delay = 0;
        melody.forEach(n => {
            setTimeout(() => this.playBrass(n.f, n.d, 0.18), delay * 1000);
            delay += n.d * 0.9;
        });
    }

    // =========================================================================
    // SYMPHONIC SUITE DRAGON QUEST (FULL ORCHESTRA SOUNDTRACK)
    // 1. "冒險的旅程" (Adventure / 冒険の旅 - DQ3 Overworld Symphonic Suite)
    // 2. "勇者的挑戰" (Hero's Challenge / 勇者の挑戦 - DQ3 Boss Battle Symphonic Suite)
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

    // 1. Dragon Quest III Symphonic Overworld: "冒險的旅程" (Adventure / 冒険の旅)
    // Composed by Koichi Sugiyama - Full Orchestra Performance
    runDqFieldTheme() {
        const lead = [
            'G4', 'G4', 'C5', 'C5', 'D5', 'D5', 'E5', 'E5',  'E5', 'E5', 'D5', 'D5', 'C5', 'C5', 'D5', 'D5',
            'G4', 'G4', 'G4', 'G4', 0, 0, 'G4', 'G4',        'A4', 'A4', 'B4', 'B4', 'C5', 'C5', 'D5', 'D5',
            'E5', 'E5', 'F5', 'F5', 'G5', 'G5', 'G5', 'G5',  'C6', 'C6', 'C6', 'C6', 'B5', 'B5', 'A5', 'A5',
            'G5', 'G5', 'G5', 'G5', 'G5', 'G5', 'G5', 'G5',  'A5', 'A5', 'G5', 'G5', 'F5', 'F5', 'E5', 'E5',
            'D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'D5',  'E5', 'E5', 'D5', 'D5', 'C5', 'C5', 'B4', 'B4',
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
        const stepTime = 124; // Allegro March Tempo (~120 BPM)

        const loop = () => {
            if (this.currentTrack !== 'field' || !this.enabled) return;

            const idx = step % lead.length;
            const lNote = getFreq(lead[idx]);
            const hNote = getFreq(harmony[idx]);
            const bNote = getFreq(bass[idx]);

            // Brass Section on Triumphant Lead Melody
            if (lNote > 0) {
                this.playBrass(lNote, 0.22, 0.095);
            }

            // String Section on Harmonic Counterpoint
            if (hNote > 0) {
                this.playStrings(hNote, 0.20, 0.075);
            }

            // Double Bass & Cello Section on Walking Bassline
            if (bNote > 0) {
                this.playStrings(bNote, 0.18, 0.085, false);
            }

            // Concert Timpani & Orchestral Snare Percussion
            if (idx % 16 === 0) {
                this.playTimpani(110, 0.18); // Downbeat Timpani Punch
            } else if (idx % 4 === 2) {
                this.playMarchSnare(0.04);   // Concert Snare Backbeat
            }

            step++;
            this.bgmTimer = setTimeout(loop, stepTime);
        };
        loop();
    }

    // 2. Dragon Quest III Symphonic Boss Battle: "勇者的挑戰" (Hero's Challenge / 勇者の挑戦)
    // Towering Brass, Galloping Double Basses, Thunderous Timpani & Crash Cymbals
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
        const stepTime = 106; // Presto dramatic tempo

        const loop = () => {
            if (this.currentTrack !== 'boss' || !this.enabled) return;

            const idx = step % bass.length;
            const lNote = getFreq(lead[idx % lead.length]);
            const hNote = getFreq(harmony[idx % harmony.length]);
            const bNote = getFreq(bass[idx]);

            // Low Cellos and Double Basses on Galloping Ostinato
            if (bNote > 0) {
                this.playStrings(bNote, 0.12, 0.10, false);
            }

            // Trumpet & French Horn Lead Fanfare
            if (lNote > 0) {
                this.playBrass(lNote, 0.18, 0.11);
            }

            // Trombone & Woodwind Harmony Counterpoint
            if (hNote > 0) {
                this.playBrass(hNote, 0.15, 0.06);
            }

            // Heavy Orchestral Timpani Strikes on Strong Beats
            if (idx % 8 === 0) {
                this.playTimpani(95, 0.22);
            } else if (idx % 4 === 2) {
                this.playMarchSnare(0.05);
            }

            // Dramatic Orchestral Crash Cymbal on Fanfare Peaks
            if (idx === 0 || idx === 32 || idx === 56) {
                this.playCymbal(0.065);
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
