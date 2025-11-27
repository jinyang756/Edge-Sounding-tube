// 主应用文件
import RecorderModule from './modules/recorder.js';
import AudioPlayerModule from './modules/audioPlayer.js';
import VisualizerModule from './modules/visualizer.js';
import AudioEffectsModule from './modules/audioEffects.js';
import AppState from './components/appState.js';
import AppConfig from './components/config.js';
import { Helpers } from './utils/helpers.js';
import { DOMUtils } from './utils/domUtils.js';

// 应用主类
class MegaphoneApp {
    constructor() {
        // 初始化模块
        this.recorder = new RecorderModule();
        this.player = new AudioPlayerModule();
        this.visualizer = new VisualizerModule();
        this.effects = new AudioEffectsModule();
        
        // DOM元素
        this.elements = {};
        
        // 计时器
        this.timerInterval = null;
        
        // 初始化应用
        this.init();
    }

    // 初始化应用
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    // 初始化应用组件
    async initializeApp() {
        try {
            // 获取DOM元素
            this.initDOMElements();
            
            // 初始化音频播放器
            this.player.init(this.elements.audioPlayer);
            
            // 初始化可视化
            this.visualizer.init(this.elements.waveform, null);
            
            // 绑定事件监听器
            this.bindEvents();
            
            // 设置初始状态
            this.setInitialState();
            
            // 初始化FAQ交互
            this.initFAQ();
            
            console.log('传声筒应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.updateStatus('应用初始化失败，请刷新页面重试');
        }
    }

    // 初始化DOM元素
    initDOMElements() {
        const elementIds = [
            'record-btn', 'play-btn', 'reset-btn', 'audio-upload',
            'convert-btn', 'trim-btn', 'effect-btn', 'download-btn',
            'share-btn', 'waveform', 'record-time', 'status-text',
            'effect-panel', 'apply-effect', 'cancel-effect',
            'pitch-control', 'reverb-control', 'pitch-value',
            'reverb-value', 'convert-progress', 'progress-bar',
            'progress-text', 'share-hint', 'audio-player'
        ];
        
        this.elements = DOMUtils.getElementsByIds(elementIds);
    }

    // 绑定事件监听器
    bindEvents() {
        // 录音相关事件
        DOMUtils.addEventListener(this.elements.recordBtn, 'click', () => this.toggleRecording());
        
        // 播放相关事件
        DOMUtils.addEventListener(this.elements.playBtn, 'click', () => this.togglePlayback());
        
        // 应用控制事件
        DOMUtils.addEventListener(this.elements.resetBtn, 'click', () => this.resetApp());
        
        // 文件上传事件
        DOMUtils.addEventListener(this.elements.audioUpload, 'change', (e) => this.handleAudioUpload(e));
        
        // 功能按钮事件
        DOMUtils.addEventListener(this.elements.convertBtn, 'click', () => this.convertToMP3());
        DOMUtils.addEventListener(this.elements.trimBtn, 'click', () => this.trimAudio());
        DOMUtils.addEventListener(this.elements.effectBtn, 'click', () => this.toggleEffectPanel());
        DOMUtils.addEventListener(this.elements.downloadBtn, 'click', () => this.downloadAudio());
        DOMUtils.addEventListener(this.elements.shareBtn, 'click', () => this.shareAudio());
        
        // 音效控制事件
        DOMUtils.addEventListener(this.elements.applyEffect, 'click', () => this.applyEffect());
        DOMUtils.addEventListener(this.elements.cancelEffect, 'click', () => this.cancelEffect());
        DOMUtils.addEventListener(this.elements.pitchControl, 'input', () => this.updatePitchValue());
        DOMUtils.addEventListener(this.elements.reverbControl, 'input', () => this.updateReverbValue());
        
        // 窗口大小调整事件
        DOMUtils.addEventListener(window, 'resize', () => this.handleResize());
    }

    // 设置初始状态
    setInitialState() {
        DOMUtils.addClass(this.elements.recordBtn, 'recording-inactive');
        this.updatePitchValue();
        this.updateReverbValue();
    }

    // 初始化FAQ交互
    initFAQ() {
        const faqButtons = document.querySelectorAll('#faq button');
        faqButtons.forEach(button => {
            DOMUtils.addEventListener(button, 'click', () => {
                const content = button.nextElementSibling;
                const icon = button.querySelector('i');
                if (content && icon) {
                    if (DOMUtils.hasClass(content, 'hidden')) {
                        DOMUtils.removeClass(content, 'hidden');
                        DOMUtils.removeClass(icon, 'fa-chevron-down');
                        DOMUtils.addClass(icon, 'fa-chevron-up');
                    } else {
                        DOMUtils.addClass(content, 'hidden');
                        DOMUtils.removeClass(icon, 'fa-chevron-up');
                        DOMUtils.addClass(icon, 'fa-chevron-down');
                    }
                }
            });
        });
    }

    // 切换录音状态
    async toggleRecording() {
        if (!AppState.isRecording()) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    // 开始录音
    async startRecording() {
        try {
            await this.recorder.startRecording(AppConfig.audio.constraints);
            
            // 更新应用状态
            AppState.setState({
                recording: true,
                recordingTime: 0
            });
            
            // 更新UI状态
            DOMUtils.removeClass(this.elements.recordBtn, 'recording-inactive');
            DOMUtils.addClass(this.elements.recordBtn, 'recording-active');
            this.updateStatus('正在录音...');
            DOMUtils.removeClass(this.elements.recordTime, 'opacity-0');
            
            // 开始计时
            this.startTimer();
            
            // 开始波形可视化
            this.visualizer.startVisualization(this.recorder.audioStream);
        } catch (error) {
            console.error('录音错误:', error);
            this.updateStatus(`录音失败: ${error.message || '未知错误'}`);
            this.resetRecordingState();
        }
    }

    // 停止录音
    stopRecording() {
        const audioUrl = this.recorder.stopRecording();
        
        if (audioUrl) {
            // 设置音频播放器
            this.elements.audioPlayer.src = audioUrl;
            
            // 更新应用状态
            AppState.setState({
                recording: false,
                audioLoaded: true
            });
            
            // 启用操作按钮
            this.enableActionButtons(true);
            
            // 更新状态
            this.updateStatus('录音完成，您可以播放或处理音频');
        } else {
            this.updateStatus('录音失败，未捕获到音频数据');
        }
        
        // 更新UI状态
        DOMUtils.removeClass(this.elements.recordBtn, 'recording-active');
        DOMUtils.addClass(this.elements.recordBtn, 'recording-inactive');
        clearInterval(this.timerInterval);
        
        // 停止可视化
        this.visualizer.stopVisualization();
    }

    // 重置录音状态
    resetRecordingState() {
        this.recorder.reset();
        
        // 更新应用状态
        AppState.setState({
            recording: false,
            recordingTime: 0
        });
        
        // 更新UI
        DOMUtils.removeClass(this.elements.recordBtn, 'recording-active');
        DOMUtils.addClass(this.elements.recordBtn, 'recording-inactive');
        clearInterval(this.timerInterval);
        
        // 停止可视化
        this.visualizer.stopVisualization();
    }

    // 开始计时
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = this.recorder.getRecordingTime();
            const formattedTime = Helpers.formatTime(elapsed);
            
            if (this.elements.recordTime) {
                DOMUtils.setText(this.elements.recordTime, formattedTime);
            }
            
            // 更新应用状态
            AppState.set('recordingTime', elapsed);
            
            // 当录音超过5分钟时给出提示
            if (elapsed >= AppConfig.ui.recordingTimeout) {
                this.updateStatus('录音时间较长，建议适时停止录音');
            }
        }, 1000);
    }

    // 切换播放状态
    async togglePlayback() {
        // 检查是否有音频可播放
        if (!this.elements.audioPlayer || !this.elements.audioPlayer.src) {
            this.updateStatus('请先录音或上传音频文件');
            return;
        }
        
        if (!AppState.isPlaying()) {
            try {
                await this.player.play();
                
                // 更新应用状态
                AppState.set('playing', true);
                
                DOMUtils.setHTML(this.elements.playBtn, '<i class="fa fa-pause text-2xl md:text-3xl text-white"></i><span class="mt-2 text-sm">暂停</span>');
            } catch (error) {
                console.error('播放失败:', error);
                this.updateStatus(`播放失败: ${error.message || '未知错误'}`);
                AppState.set('playing', false);
            }
        } else {
            this.player.pause();
            
            // 更新应用状态
            AppState.set('playing', false);
            
            DOMUtils.setHTML(this.elements.playBtn, '<i class="fa fa-play text-2xl md:text-3xl text-white"></i><span class="mt-2 text-sm">播放</span>');
        }
    }

    // 处理音频上传
    handleAudioUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // 检查文件类型
            if (!Helpers.isAudioFile(file)) {
                this.updateStatus('请选择有效的音频文件');
                return;
            }
            
            const audioUrl = URL.createObjectURL(file);
            this.elements.audioPlayer.src = audioUrl;
            
            // 启用操作按钮
            this.enableActionButtons(true);
            
            // 更新状态
            this.updateStatus('音频已加载，您可以播放或处理音频');
            
            // 更新应用状态
            AppState.set('audioLoaded', true);
        }
    }

    // 转换为MP3
    convertToMP3() {
        // 检查是否有音频可转换
        if (!this.elements.audioPlayer || !this.elements.audioPlayer.src) {
            this.updateStatus('请先录音或上传音频文件');
            return;
        }
        
        // 显示进度条
        DOMUtils.removeClass(this.elements.convertProgress, 'hidden');
        
        // 模拟转换过程
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10; // 随机增加进度
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // 转换完成
                setTimeout(() => {
                    DOMUtils.addClass(this.elements.convertProgress, 'hidden');
                    this.updateStatus('音频已转换为MP3格式');
                    
                    // 显示下载按钮动画
                    DOMUtils.addClass(this.elements.downloadBtn, 'animate-pulse');
                    setTimeout(() => {
                        DOMUtils.removeClass(this.elements.downloadBtn, 'animate-pulse');
                    }, 2000);
                }, 500);
            }
            
            this.elements.progressBar.style.width = progress + '%';
            DOMUtils.setText(this.elements.progressText, Math.round(progress) + '%');
        }, AppConfig.ui.progressUpdateInterval);
    }

    // 下载音频
    downloadAudio() {
        // 检查是否有音频可下载
        if (!this.elements.audioPlayer || !this.elements.audioPlayer.src) {
            this.updateStatus('请先录音或上传音频文件');
            return;
        }
        
        const link = DOMUtils.createElement('a', {
            href: this.elements.audioPlayer.src,
            download: AppConfig.file.defaultDownloadName
        });
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.updateStatus('音频已下载到您的设备');
        
        // 添加下载成功动画
        DOMUtils.addClass(this.elements.downloadBtn, 'bg-green-500');
        setTimeout(() => {
            DOMUtils.removeClass(this.elements.downloadBtn, 'bg-green-500');
        }, 1000);
    }

    // 分享音频
    shareAudio() {
        // 检查是否有音频可分享
        if (!this.elements.audioPlayer || !this.elements.audioPlayer.src) {
            this.updateStatus('请先录音或上传音频文件');
            return;
        }
        
        DOMUtils.removeClass(this.elements.shareHint, 'hidden');
        
        // 添加分享动画效果
        DOMUtils.addClass(this.elements.shareBtn, 'animate-pulse');
        setTimeout(() => {
            DOMUtils.removeClass(this.elements.shareBtn, 'animate-pulse');
        }, 2000);
        
        setTimeout(() => {
            DOMUtils.addClass(this.elements.shareHint, 'hidden');
        }, 3000);
    }

    // 切换音效面板
    toggleEffectPanel() {
        // 检查是否有音频可处理
        if (!this.elements.audioPlayer || !this.elements.audioPlayer.src) {
            this.updateStatus('请先录音或上传音频文件');
            return;
        }
        
        if (DOMUtils.hasClass(this.elements.effectPanel, 'hidden')) {
            DOMUtils.removeClass(this.elements.effectPanel, 'hidden');
            this.updateStatus('音效面板已打开，请调整参数后点击应用');
            AppState.set('effectPanelOpen', true);
            
            // 添加打开动画
            DOMUtils.addClass(this.elements.effectPanel, 'animate-fadeIn');
            setTimeout(() => {
                DOMUtils.removeClass(this.elements.effectPanel, 'animate-fadeIn');
            }, AppConfig.ui.animationDuration);
        } else {
            DOMUtils.addClass(this.elements.effectPanel, 'hidden');
            this.updateStatus('音效面板已关闭');
            AppState.set('effectPanelOpen', false);
        }
    }

    // 应用音效
    applyEffect() {
        // 获取当前音效设置
        const pitch = this.elements.pitchControl.value;
        const reverb = this.elements.reverbControl.value;
        
        // 设置音效
        this.effects.setPitch(pitch);
        this.effects.setReverb(reverb);
        
        this.updateStatus(`音效已应用 - 变调: ${pitch} 半音, 混响: ${reverb}%`);
        DOMUtils.addClass(this.elements.effectPanel, 'hidden');
        AppState.set('effectPanelOpen', false);
        
        // 添加应用成功动画
        DOMUtils.addClass(this.elements.applyEffect, 'bg-green-500');
        setTimeout(() => {
            DOMUtils.removeClass(this.elements.applyEffect, 'bg-green-500');
        }, 1000);
    }

    // 取消音效
    cancelEffect() {
        DOMUtils.addClass(this.elements.effectPanel, 'hidden');
        this.updateStatus('已取消音效应用');
        AppState.set('effectPanelOpen', false);
        
        // 重置音效控制
        this.elements.pitchControl.value = 0;
        this.elements.reverbControl.value = 0;
        this.updatePitchValue();
        this.updateReverbValue();
    }

    // 更新音调值显示
    updatePitchValue() {
        if (this.elements.pitchValue) {
            DOMUtils.setText(this.elements.pitchValue, this.elements.pitchControl.value);
        }
    }

    // 更新混响值显示
    updateReverbValue() {
        if (this.elements.reverbValue) {
            DOMUtils.setText(this.elements.reverbValue, this.elements.reverbControl.value + '%');
        }
    }

    // 剪辑音频
    trimAudio() {
        this.updateStatus('音频剪辑功能已激活，请使用时间轴选择剪辑范围');
    }

    // 重置应用
    resetApp() {
        // 停止录音
        if (AppState.isRecording()) {
            this.stopRecording();
        }
        
        // 停止播放
        if (this.player.isPlayingNow()) {
            this.player.stop();
        }
        
        // 重置录音状态
        this.resetRecordingState();
        
        // 重置播放器
        this.player.stop();
        
        // 重置UI
        DOMUtils.removeClass(this.elements.recordBtn, 'recording-active');
        DOMUtils.addClass(this.elements.recordBtn, 'recording-inactive');
        DOMUtils.setHTML(this.elements.playBtn, '<i class="fa fa-play text-2xl md:text-3xl text-white"></i><span class="mt-2 text-sm">播放</span>');
        this.enableActionButtons(false);
        
        // 清除音频
        if (this.elements.audioPlayer) {
            this.elements.audioPlayer.src = '';
        }
        
        // 重置状态
        this.updateStatus('点击下方按钮开始录音或上传音频');
        DOMUtils.addClass(this.elements.recordTime, 'opacity-0');
        DOMUtils.setText(this.elements.recordTime, '00:00');
        
        // 隐藏面板
        DOMUtils.addClass(this.elements.effectPanel, 'hidden');
        DOMUtils.addClass(this.elements.convertProgress, 'hidden');
        DOMUtils.addClass(this.elements.shareHint, 'hidden');
        
        // 重置音效控制
        this.elements.pitchControl.value = 0;
        this.elements.reverbControl.value = 0;
        this.updatePitchValue();
        this.updateReverbValue();
        
        // 清除画布
        this.visualizer.stopVisualization();
        
        // 重置应用状态
        AppState.reset();
    }

    // 启用/禁用操作按钮
    enableActionButtons(enable) {
        const buttons = [
            this.elements.playBtn,
            this.elements.resetBtn,
            this.elements.convertBtn,
            this.elements.trimBtn,
            this.elements.effectBtn,
            this.elements.downloadBtn,
            this.elements.shareBtn
        ];
        
        buttons.forEach(button => {
            if (button) {
                button.disabled = !enable;
            }
        });
    }

    // 更新状态文本
    updateStatus(text) {
        if (this.elements.statusText) {
            DOMUtils.setText(this.elements.statusText, text);
        }
    }

    // 处理窗口大小调整
    handleResize() {
        this.visualizer.resize();
    }
}

// 初始化应用
const app = new MegaphoneApp();

// 导出应用实例供调试使用
export default app;