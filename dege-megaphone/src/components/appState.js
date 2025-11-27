// 应用状态管理组件
class AppState {
    constructor() {
        this.state = {
            recording: false,
            playing: false,
            audioLoaded: false,
            effectPanelOpen: false,
            recordingTime: 0
        };
        
        this.listeners = [];
    }

    // 获取状态
    getState() {
        return { ...this.state };
    }

    // 更新状态
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // 通知监听器
        this.listeners.forEach(listener => {
            listener(this.state, prevState);
        });
    }

    // 订阅状态变化
    subscribe(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
            
            // 返回取消订阅函数
            return () => {
                const index = this.listeners.indexOf(listener);
                if (index > -1) {
                    this.listeners.splice(index, 1);
                }
            };
        }
    }

    // 重置状态
    reset() {
        this.setState({
            recording: false,
            playing: false,
            audioLoaded: false,
            effectPanelOpen: false,
            recordingTime: 0
        });
    }

    // 获取特定状态值
    get(key) {
        return this.state[key];
    }

    // 设置特定状态值
    set(key, value) {
        this.setState({ [key]: value });
    }

    // 检查是否正在录音
    isRecording() {
        return this.state.recording;
    }

    // 检查是否正在播放
    isPlaying() {
        return this.state.playing;
    }

    // 检查是否有音频加载
    isAudioLoaded() {
        return this.state.audioLoaded;
    }

    // 检查音效面板是否打开
    isEffectPanelOpen() {
        return this.state.effectPanelOpen;
    }
}

// 导出单例实例
export default new AppState();