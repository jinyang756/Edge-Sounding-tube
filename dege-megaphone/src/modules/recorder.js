// 录音模块
class RecorderModule {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioStream = null;
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
    }

    async startRecording(audioConstraints = { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }) {
        try {
            // 检查浏览器支持
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('您的浏览器不支持录音功能，请使用现代浏览器');
            }
            
            // 请求麦克风权限
            this.audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: audioConstraints
            });
            
            // 更新状态
            this.isRecording = true;
            
            // 初始化媒体录制器
            this.mediaRecorder = new MediaRecorder(this.audioStream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            // 开始录制
            this.mediaRecorder.start();
            
            // 开始计时
            this.startTime = Date.now();
            
            return Promise.resolve();
        } catch (error) {
            console.error('录音错误:', error);
            return Promise.reject(error);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        // 停止音频流
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }
        
        // 更新状态
        this.isRecording = false;
        clearInterval(this.timerInterval);
        
        // 创建音频Blob
        if (this.audioChunks.length > 0) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            return audioUrl;
        }
        
        return null;
    }

    reset() {
        // 停止音频流
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        
        // 重置录制器
        if (this.mediaRecorder) {
            if (this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            this.mediaRecorder = null;
        }
        
        // 重置状态
        this.isRecording = false;
        this.audioChunks = [];
        this.startTime = null;
        clearInterval(this.timerInterval);
    }

    getRecordingTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    isCurrentlyRecording() {
        return this.isRecording;
    }
}

export default RecorderModule;