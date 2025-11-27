// 应用配置组件
export const AppConfig = {
    // 音频设置
    audio: {
        constraints: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        },
        mimeType: 'audio/webm'
    },

    // 可视化设置
    visualization: {
        fftSize: 256,
        smoothingTimeConstant: 0.8,
        colors: ['#36CFC9', '#165DFF', '#722ED1']
    },

    // UI设置
    ui: {
        recordingTimeout: 300, // 5分钟超时提醒
        animationDuration: 500,
        progressUpdateInterval: 100
    },

    // 文件设置
    file: {
        defaultDownloadName: '传声筒录音.mp3',
        supportedTypes: ['audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/m4a']
    },

    // 音效设置
    effects: {
        pitch: {
            min: -12,
            max: 12,
            step: 1
        },
        reverb: {
            min: 0,
            max: 100,
            step: 1
        }
    }
};

export default AppConfig;