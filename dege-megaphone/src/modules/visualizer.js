// 音频可视化模块
class VisualizerModule {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.animationFrameId = null;
        this.isActive = false;
    }

    init(canvasElement, audioContext) {
        this.canvas = canvasElement;
        this.canvasCtx = canvasElement.getContext('2d');
        this.audioContext = audioContext;
        
        // 设置Canvas尺寸
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    startVisualization(audioStream) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
        }
        
        // 确保有音频流
        if (!audioStream) return;
        
        const source = this.audioContext.createMediaStreamSource(audioStream);
        source.connect(this.analyser);
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // 获取渐变颜色
        const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, this.canvas.height);
        const colors = ['#36CFC9', '#165DFF', '#722ED1'];
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        this.isActive = true;
        
        const draw = () => {
            if (!this.isActive) return;
            
            this.animationFrameId = requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            // 清除画布
            this.canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const barWidth = (this.canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            // 绘制波形
            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * this.canvas.height;
                
                // 使用渐变色
                this.canvasCtx.fillStyle = gradient;
                this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }

    stopVisualization() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        if (this.canvasCtx && this.canvas) {
            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    resize() {
        if (this.canvas) {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }
    }

    isActiveNow() {
        return this.isActive;
    }
}

export default VisualizerModule;