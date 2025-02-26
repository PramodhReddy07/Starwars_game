export class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Create laser sound (synthesized)
            const laserBuffer = await this.createLaserSound();
            this.sounds.set('laser', laserBuffer);

            // Create engine sound (synthesized)
            const engineBuffer = await this.createEngineSound();
            this.sounds.set('engine', engineBuffer);

            // Create boost sound (synthesized)
            const boostBuffer = await this.createBoostSound();
            this.sounds.set('boost', boostBuffer);

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing sounds:', error);
        }
    }

    async createLaserSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Combine a high frequency with a lower one for a "pew" effect
            const high = Math.sin(2 * Math.PI * 1800 * t);
            const low = Math.sin(2 * Math.PI * 180 * t);
            // Add decay
            const decay = Math.exp(-8 * t);
            data[i] = (high * 0.7 + low * 0.3) * decay;
        }

        return buffer;
    }

    async createEngineSound() {
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Create a rumbling sound with multiple frequencies
            const noise = Math.random() * 2 - 1;
            const base = Math.sin(2 * Math.PI * 100 * t);
            data[i] = (noise * 0.3 + base * 0.7) * 0.5;
        }

        return buffer;
    }

    async createBoostSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            // Create a whoosh effect
            const freq = 200 + 1000 * t; // Increasing frequency
            const whoosh = Math.sin(2 * Math.PI * freq * t);
            const decay = Math.exp(-2 * t);
            data[i] = whoosh * decay * 0.5;
        }

        return buffer;
    }

    playSound(soundName, loop = false) {
        if (!this.initialized || !this.sounds.has(soundName)) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.get(soundName);
        source.loop = loop;
        
        // Add volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.3; // Adjust volume (0.0 to 1.0)
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
        
        return source;
    }

    stopSound(source) {
        if (source) {
            source.stop();
        }
    }
} 