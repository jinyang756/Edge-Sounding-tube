// 音频播放模块
class AudioPlayerModule {
    constructor() {
        this.audioContext = null;
        this.audioElement = null;
        this.isPlaying = false;
    }

    init(audioElement) {
        this.audioElement = audioElement;
        
        // 初始化音频上下文
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async play() {
        if (!this.audioElement || !this.audioElement.src) {
            throw new Error('没有可播放的音频');
        }

        // 确保音频上下文已初始化
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // 恢复音频上下文（处理浏览器 autoplay policy）
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            await this.audioElement.play();
            this.isPlaying = true;
            return Promise.resolve();
        } catch (error) {
            this.isPlaying = false;
            console.error('播放失败:', error);
            throw error;
        }
    }

    pause() {
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }

    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
        }
    }

    setVolume(volume) {
        if (this.audioElement) {
            this.audioElement.volume = volume;
        }
    }

    getVolume() {
        return this.audioElement ? this.audioElement.volume : 1;
    }

    isPlayingNow() {
        return this.isPlaying;
    }

    getCurrentTime() {
        return this.audioElement ? this.audioElement.currentTime : 0;
    }

    getDuration() {
        return this.audioElement ? this.audioElement.duration : 0;
    }

    seekTo(time) {
        if (this.audioElement) {
            this.audioElement.currentTime = time;
        }
    }
}

export default AudioPlayerModule;