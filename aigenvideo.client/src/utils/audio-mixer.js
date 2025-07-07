export class AudioMixer {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.videoSources = new Map();
    this.destination = null;
  }

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.destination = this.audioContext.createMediaStreamDestination();

      this.masterGain.connect(this.destination);

      console.log('🎵 Audio mixer initialized');
      return this.destination.stream;
    } catch (error) {
      console.error('❌ Failed to initialize audio mixer:', error);
      return null;
    }
  }

  addVideoSource(videoElement, id, volume = 1.0) {
    if (!this.audioContext || !this.masterGain) return;

    try {
      this.removeVideoSource(id);

      const source = this.audioContext.createMediaElementSource(videoElement);
      const gainNode = this.audioContext.createGain();

      gainNode.gain.value = volume;
      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      this.videoSources.set(id, source);
      console.log(`🎵 Added audio source: ${id}`);
    } catch (error) {
      console.warn(`Failed to add audio source ${id}:`, error);
    }
  }

  removeVideoSource(id) {
    const source = this.videoSources.get(id);
    if (source) {
      try {
        source.disconnect();
        this.videoSources.delete(id);
        console.log(`🔇 Removed audio source: ${id}`);
      } catch (error) {
        console.warn(`Failed to remove audio source ${id}:`, error);
      }
    }
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getAudioStream() {
    return this.destination?.stream || null;
  }

  cleanup() {
    this.videoSources.forEach((source, id) => {
      this.removeVideoSource(id);
    });

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log('🧹 Audio mixer cleaned up');
  }
}
