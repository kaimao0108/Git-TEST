// Symphonic Suite Dragon Quest I - High-Fidelity Orchestral Audio Engine
// Non-8bit: Realistic Multi-Voice Strings, Oboe/Woodwinds, Resonant Brass, Concert Timpani, and Stereo Hall Reverb
// 100% Authentic Koichi Sugiyama DQ1 Scores: "広野を行く" (Unknown World) & "戦闘" (Fight)

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
    C6: 1046.50, Cs6: 1108.73, D6: 1174.66, Ds6: 1244.51, E6: 1318.51, F6: 1396.91, Fs6: 1479.98, G6: 1567.98
};

const getFreq = (n) => {
    if (!n) return 0;
    if (typeof n === 'number') return n;
    const clean = n.replace('#', 's');
    return NOTES[clean] || NOTES[n] || 0;
};

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

    // Synthesize a realistic stereophonic impulse response for a majestic cathedral / concert hall
    createConcertHallImpulse(sampleRate, duration, decay) {
        const length = Math.floor(sampleRate * duration);
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // Exponential energy decay envelope
            const envelope = Math.exp(-t * decay);
            // Early reflections + dense diffuse reverberation tail
            const diffusion = (Math.random() * 2 - 1) * 0.85 + (Math.sin(i * 0.04) * 0.15);
            left[i] = diffusion * envelope;
            right[i] = ((Math.random() * 2 - 1) * 0.85 + (Math.cos(i * 0.04) * 0.15)) * envelope;
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
    playStrings(freq, duration, gainVal = 0.085, hasVibrato = true) {
        if (!this.enabled || freq <= 0) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const out = this.masterGain || this.ctx.destination;

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'sawtooth';
            osc2.type = 'triangle';

            osc1.frequency.setValueAtTime(freq, t);
            osc2.frequency.setValueAtTime(freq, t);
            osc1.detune.setValueAtTime(7, t);
            osc2.detune.setValueAtTime(-7, t);

            if (hasVibrato && duration > 0.18) {
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.setValueAtTime(5.4, t);
                lfoGain.gain.setValueAtTime(4.5, t);
                lfo.connect(lfoGain);
                lfoGain.connect(osc1.frequency);
                lfoGain.connect(osc2.frequency);
                lfo.start(t + 0.06);
                lfo.stop(t + duration);
            }

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1150, t);
            filter.Q.setValueAtTime(1.1, t);

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

            if (this.reverbNode) {
                gain.connect(this.reverbNode);
            }

            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + duration + 0.14);
            osc2.stop(t + duration + 0.14);
        } catch (e) {}
    }

    // 2. Symphonic Oboe & Woodwinds (交響木管雙簧管與長笛 - DQ1 原野曲主旋律標誌)
    playWoodwind(freq, duration, gainVal = 0.09) {
        if (!this.enabled || freq <= 0) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const out = this.masterGain || this.ctx.destination;

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'triangle';
            osc2.type = 'sine';

            osc1.frequency.setValueAtTime(freq, t);
            osc2.frequency.setValueAtTime(freq, t);

            // Natural woodwind vibrato
            if (duration > 0.22) {
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.setValueAtTime(5.1, t);
                lfoGain.gain.setValueAtTime(3.8, t);
                lfo.connect(lfoGain);
                lfoGain.connect(osc1.frequency);
                lfoGain.connect(osc2.frequency);
                lfo.start(t + 0.08);
                lfo.stop(t + duration);
            }

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1450, t);
            filter.Q.setValueAtTime(1.8, t);

            const gain = this.ctx.createGain();
            const attackTime = 0.038;
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(gainVal, t + attackTime);
            gain.gain.setValueAtTime(gainVal * 0.95, t + duration * 0.75);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.15);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(out);

            if (this.reverbNode) {
                gain.connect(this.reverbNode);
            }

            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + duration + 0.16);
            osc2.stop(t + duration + 0.16);
        } catch (e) {}
    }

    // 3. Orchestral Brass Fanfare (交響銅管小號與法國號組)
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
            osc2.detune.setValueAtTime(11, t);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, t);
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

    // 4. Acoustic Orchestral Timpani (交響樂定音鼓)
    playTimpani(freq = 115, gainVal = 0.16) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const out = this.masterGain || this.ctx.destination;

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
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

    // 5. Orchestral Snare & Marching Drums (管弦軍鼓)
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

    // 6. Orchestral Shimmer Cymbal (交響銅鈸)
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

    playAttack() {
        this.playTone(330, 0.04, 'triangle', 0.08, 160);
    }

    playHit() {
        this.playNoise(0.06, 0.09, 800);
        this.playTone(150, 0.05, 'sawtooth', 0.06, 50);
    }

    playEnemyHit() {
        this.playNoise(0.04, 0.07, 1000);
    }

    playKill() {
        this.playTone(400, 0.08, 'triangle', 0.09, 80);
    }

    playExp() {
        const t = this.ctx ? this.ctx.currentTime : 0;
        const freqs = [784, 880, 1046];
        const f = freqs[Math.floor((t * 10) % freqs.length)];
        this.playTone(f, 0.04, 'sine', 0.06);
    }

    playFireball() {
        this.playNoise(0.22, 0.14, 600);
        this.playTone(280, 0.18, 'sawtooth', 0.08, 90);
    }

    playLightning() {
        this.playNoise(0.32, 0.16, 2800);
        this.playTone(700, 0.22, 'sawtooth', 0.10, 120);
    }

    playHoly() {
        this.playTone(587.33, 0.28, 'sine', 0.09);
        setTimeout(() => this.playTone(880.00, 0.28, 'sine', 0.07), 60);
    }

    playSwordBeam() {
        this.playTone(440, 0.14, 'triangle', 0.09, 880);
    }

    playBoomerang() {
        this.playTone(350, 0.08, 'sine', 0.06, 550);
    }

    playBossRoar() {
        this.playNoise(0.65, 0.20, 300);
        this.playTone(120, 0.55, 'sawtooth', 0.15, 45);
        this.playTimpani(90, 0.25);
    }

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
    // SYMPHONIC SUITE DRAGON QUEST I (AUTHENTIC REMAKE ORCHESTRA SOUNDTRACK)
    // 1. "広野を行く" (Unknown World - DQ1 Overworld Symphonic Suite)
    // 2. "戦闘" (Fight / Battle - DQ1 Battle Theme Symphonic Suite)
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

    // 1. Dragon Quest I Symphonic Overworld: "広野を行く" (Unknown World / 走向廣闊的原野)
    // Composed by Koichi Sugiyama - Full Orchestra Performance (D Dorian Mode)
    runDqFieldTheme() {
        const lead = ["D5",0,"A5",0,"G5",0,0,0,0,0,"F5","E5","D5",0,"C5","A#4","C5","A4","E5",0,"D5",0,0,0,0,0,0,0,0,0,0,0,"A5",0,"C6",0,"B5",0,0,0,0,0,"G5","F5","E5",0,"F5","G5","A5",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        const leadDur = [2,1,2,1,6,1,1,1,1,1,1,1,2,1,1,1,1,1,2,1,12,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,6,1,1,1,1,1,1,1,2,1,1,1,16,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
        const counter = ["D4","A4","F4","A4","D4","B4","G4","B4","D4","C5","A4","C5","D4","A#4","F4","A#4","E4","C5","A4","C5","D4","A4","F#4","A4","D4","A4","F#4","A4","G4","A#4","A4","C5","D4","C5","A4","C5","D4","B4","G4","B4","D4","B4","G4","B4","D4","A#4","G#4","A#4","C#4","A4","E4","A4","D4","A4","E4","A4","C#4","A4","E4","A4","B3","A4","C#4","A4"];
        const bass = ["D3",0,0,0,"G2",0,0,0,"F2",0,0,0,"A#2",0,0,0,"A2",0,0,0,"D3",0,0,0,0,0,0,0,"G2",0,"A2",0,"D3",0,0,0,"G2",0,0,0,0,0,0,0,"E2",0,0,0,"A2",0,0,0,0,0,0,0,"A2",0,0,0,0,0,0,0];
        const bassDur = [4,1,1,1,4,1,1,1,4,1,1,1,4,1,1,1,4,1,1,1,8,1,1,1,1,1,1,1,2,1,2,1,4,1,1,1,8,1,1,1,1,1,1,1,4,1,1,1,8,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1];

        let step = 0;
        const beatTime = 550; // Majestic Wandering Tempo (~109 BPM)

        const loop = () => {
            if (this.currentTrack !== 'field' || !this.enabled) return;

            const idx = step % 64;

            // 1. Lead Melody: Oboe/Woodwind solo with soft Violin reinforcement
            if (lead[idx]) {
                const f = getFreq(lead[idx]);
                const durSec = (leadDur[idx] || 1) * 0.52;
                this.playWoodwind(f, durSec, 0.095);
                this.playStrings(f, durSec, 0.065, true);
            }

            // 2. Counterpoint Arpeggios: Weaving string & harp arpeggio
            if (counter[idx]) {
                const cf = getFreq(counter[idx]);
                this.playStrings(cf, 0.42, 0.06, false);
            }

            // 3. Deep Foundation Bass: Contrabass & Cello
            if (bass[idx]) {
                const bf = getFreq(bass[idx]);
                const bDur = (bassDur[idx] || 2) * 0.50;
                this.playStrings(bf, bDur, 0.085, false);
            }

            // 4. Subtle Orchestral Accents
            if (idx === 0 || idx === 32) {
                this.playTimpani(110, 0.12);
            } else if (idx === 20 || idx === 48) {
                this.playCymbal(0.035);
            }

            step++;
            this.bgmTimer = setTimeout(loop, beatTime);
        };
        loop();
    }

    // 2. Dragon Quest I Symphonic Battle: "戦闘" (Fight / Battle Theme)
    // Composed by Koichi Sugiyama - Diminished Runs, Driving Brass, Walking Bass & Snare March
    runDqBossTheme() {
        const introLead = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"C3","D#3","F#3","A3","C4","D#4","F#4","A4","C5","A4","F#4","D#4","C4","A3","F#3","D#3","C3","D#3","F#3","A3","C4","D#4","F#4","A4","C5","A4","F#4","D#4","C4","A3","F#3","D#3","C4",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,"C3",0,"C#3",0,"D3",0,"E3",0];
        const introBass = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        const loopLead = ["F4",0,0,0,0,0,"G4","A4","B4",0,0,0,0,0,"F#4","G#4","A#4",0,0,0,0,0,"F4","G4","A4",0,0,0,0,0,"G#4","A#4","C5",0,0,0,0,0,"F#4","G#4","A#4",0,0,0,0,0,"F#4","G#4","A#4",0,0,0,0,0,"F4","G4","A4",0,0,0,0,0,"D#4","F4","G4",0,0,0,0,0,"C#5","D#5","F5",0,0,0,0,0,"C5","D5","E5",0,0,0,0,0,"B4","C#5","D#5",0,0,0,0,0,"B4","C#5","D#5",0,0,0,0,0,"A#4","C5","D5",0,0,0,0,0,"A4","B4","C#5",0,0,0,0,0,"A#4","C5","D5",0,0,0,0,0,"D#5","F5","G5",0,"D5","G5","F#5",0,"D#5","F#5","F5",0,"D5","F5","E5",0,"C#5","E5","D#5",0,"C5","A4","F#4",0,"D#4","C4","C#4",0,"E3","G3","A#3",0,"C#4","E4","F4",0,0,0,0,0,"G4","A4","B4",0,0,0,0,0,"F#4","G#4","A#4",0,0,0,0,0,"F4","G4","A4",0,0,0,0,0,"G#4","A#4","C5",0,0,0,0,0,"F#4","G#4","A#4",0,0,0,0,0,"F#4","G#4","A#4",0,0,0,0,0,"F4","G4","A4",0,0,0,0,0,"D#4","F4","G4",0,0,0,0,0,"C#5","D#5","F5",0,0,0,0,0,"C5","D5","E5",0,0,0,0,0,"B4","C#5","D#5",0,0,0,0,0,"B4","C#5","D#5",0,0,0,0,0,"A#4","C5","D5",0,0,0,0,0,"A4","B4","C#5",0,0,0,0,0,"A#4","C5","D5",0,0,0,0,0,"D#5","F5","G5",0,"D5","G5","F#5",0,"D#5","F#5","F5",0,"D5","F5","E5",0,"C#5","E5","D#5",0,"C5","A4","F#4",0,"D#4","C4","C#4",0,"E3","G3","A#3",0,"C#4","E4"];
        const loopLeadDur = [1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,1.375,0.25,0.25,0.25,0.25,0.25,0.125,0.125,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375,0.375,0.25,0.375,0.375];
        const loopBass = ["F3","G#3","C4",0,0,0,"D4",0,"F3","G#3","B3",0,0,0,"D4",0,"G3","A#3","C#4",0,0,0,"E4",0,"D3","F3","A3",0,0,0,"C4",0,"A3","C4","D#4",0,0,0,"G4",0,"D#3","G3","C#4",0,0,0,"E4",0,"F#3","A#3","D4",0,0,0,"F#4",0,"D3","F#3","A3",0,0,0,"D4",0,"G3","A#3","D4",0,0,0,"E4",0,"G3","B3","D4",0,0,0,"F4",0,"C3","G3","A#3",0,0,0,"C#4",0,"F3","F#3","A3",0,0,0,"C4",0,"B2","F3","G#3",0,0,0,"D#4",0,"B2","F3","G#3",0,0,0,"D4",0,"A2","E3","G3",0,0,0,"A#3",0,"D3","F#3","A3",0,0,0,"D4",0,"A#4",0,"G4","A#4","A4",0,"F#4","A4","G#4",0,"F4","G#4","G4",0,"E4","G4","F#4",0,"A4","F#4","D#4",0,"C4","A3","A#3",0,"D3","E3","G3",0,"A#3","C#4","F3","G#3","C4",0,0,0,"D4",0,"F3","G#3","B3",0,0,0,"D4",0,"G3","A#3","C#4",0,0,0,"E4",0,"D3","F3","A3",0,0,0,"C4",0,"A3","C4","D#4",0,0,0,"G4",0,"D#3","G3","C#4",0,0,0,"E4",0,"F#3","A#3","D4",0,0,0,"F#4",0,"D3","F#3","A3",0,0,0,"D4",0,"G3","A#3","D4",0,0,0,"E4",0,"G3","B3","D4",0,0,0,"F4",0,"C3","G3","A#3",0,0,0,"C#4",0,"F3","F#3","A3",0,0,0,"C4",0,"B2","F3","G#3",0,0,0,"D#4",0,"B2","F3","G#3",0,0,0,"D4",0,"A2","E3","G3",0,0,0,"A#3",0,"D3","F#3","A3",0,0,0,"D4",0,"A#4",0,"G4","A#4","A4",0,"F#4","A4","G#4",0,"F4","G#4","G4",0,"E4","G4","F#4",0,"A4","F#4","D#4",0,"C4","A3","A#3",0,"D3","E3","G3",0,"A#3","C#4"];

        let inIntro = true;
        let introStep = 0;
        let loopStep = 0;
        const introStepTime = 105; // Fast diminished cascade
        const loopStepTime = 100;  // 16th note step at ~150 BPM

        const playIntro = () => {
            if (this.currentTrack !== 'boss' || !this.enabled) return;

            if (introStep < introLead.length) {
                const l = introLead[introStep];
                const b = introBass[introStep];
                if (l) {
                    this.playStrings(getFreq(l), 0.12, 0.085, false);
                }
                if (b) {
                    this.playStrings(getFreq(b), 0.12, 0.09, false);
                }
                if (introStep === 0) {
                    this.playTimpani(120, 0.22);
                    this.playCymbal(0.06);
                }
                introStep++;
                this.bgmTimer = setTimeout(playIntro, introStepTime);
            } else {
                inIntro = false;
                playMainLoop();
            }
        };

        const playMainLoop = () => {
            if (this.currentTrack !== 'boss' || !this.enabled) return;

            const idx = loopStep % loopLead.length;
            const l = loopLead[idx];
            const dur = (loopLeadDur[idx] || 0.25) * 0.40;
            const b = loopBass[idx];

            // Triumphant Brass Lead
            if (l) {
                this.playBrass(getFreq(l), dur, 0.11);
            }

            // Cellos & Bass Ostinato
            if (b) {
                this.playStrings(getFreq(b), 0.14, 0.095, false);
            }

            // March Snare & Timpani Accents
            if (idx % 4 === 2) {
                this.playMarchSnare(0.045);
            }
            if (idx % 16 === 0) {
                this.playTimpani(98, 0.18);
            }
            if (idx === 0 || idx === 128) {
                this.playCymbal(0.055);
            }

            loopStep++;
            this.bgmTimer = setTimeout(playMainLoop, loopStepTime);
        };

        playIntro();
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.soundFx = new SoundFX();
