import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AIAnalysisResult, SocialPlatform, WebhookConfig } from '../types';
import { Share2, Copy, Check, MessageCircle, Download, ExternalLink, Loader2 } from 'lucide-react';
import { uploadAudio } from '../services/uploadService';
import { sendToWebhook } from '../services/webhookService';

interface ShareViewProps {
  analysis: AIAnalysisResult | null;
  audioDuration: string;
  audioUrl: string | undefined; 
  audioBlob: Blob | undefined;
  webhookConfig: WebhookConfig;
  onReset: () => void;
}

const ShareView: React.FC<ShareViewProps> = ({ analysis, audioDuration, audioUrl, audioBlob, webhookConfig, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [realShareUrl, setRealShareUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Automatically upload when entering ShareView if not already uploaded
  useEffect(() => {
    const performUpload = async () => {
        if (audioBlob && !realShareUrl && !isUploading) {
            setIsUploading(true);
            try {
                const url = await uploadAudio(audioBlob);
                setRealShareUrl(url);
            } catch (err) {
                console.error("Auto upload failed", err);
                setUploadError("Could not generate link. Please retry.");
            } finally {
                setIsUploading(false);
            }
        }
    };
    performUpload();
  }, [audioBlob]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = async (platform: SocialPlatform) => {
    // 1. Check if we have a real URL
    if (!realShareUrl) {
       setUploadError("Waiting for link generation...");
       return;
    }

    // 2. Identify config key
    let webhookUrl = '';
    if (platform === SocialPlatform.WECHAT) webhookUrl = webhookConfig.wechat || '';
    if (platform === SocialPlatform.DINGTALK) webhookUrl = webhookConfig.dingtalk || '';
    if (platform === SocialPlatform.LARK) webhookUrl = webhookConfig.lark || '';

    // 3. Prepare content
    const title = analysis?.title || "New Voice Recording";
    const summary = analysis?.summary || "Check out this audio recording.";
    
    // 4. IF Webhook configured -> Send to Webhook
    if (webhookUrl) {
        setActivePlatform(platform);
        const success = await sendToWebhook(platform, webhookUrl, {
            title,
            text: summary,
            url: realShareUrl
        });

        if (success) {
             // Toast handled by activePlatform state mostly, can add specific success msg
             setTimeout(() => setActivePlatform(null), 2000);
        } else {
             alert(`Failed to send to ${platform}. Please check your Webhook URL.`);
             setActivePlatform(null);
        }
    } 
    // 5. ELSE -> Copy Text fallback
    else {
        const shareText = `🎙️ ${title}\n📝 ${summary}\n🔗 ${realShareUrl}`;
        copyToClipboard(shareText);
        setActivePlatform(platform); // Show "Copied" toast
        setTimeout(() => setActivePlatform(null), 2000);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `dege-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const displayUrl = realShareUrl || "Generating link...";

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-fade-in space-y-6 pb-8">
      
      {/* Toast */}
      {activePlatform && (
         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-2 px-4 rounded-full shadow-lg z-50 animate-fade-in flex items-center gap-2">
            <Check size={12} />
            {webhookConfig[activePlatform.toLowerCase() as keyof WebhookConfig] 
                ? `Sent to ${activePlatform}!` 
                : `Copied text for ${activePlatform}!`}
         </div>
      )}

      {/* Share Card */}
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative group">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                {analysis?.title || "Voice Message"}
            </h2>
            <p className="text-gray-500 text-xs mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                "{analysis?.summary || "Listen to this voice recording."}"
            </p>
            
            <div className="flex flex-col items-center my-4 space-y-2">
                 <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-100 relative min-h-[160px] flex items-center justify-center">
                    {isUploading ? (
                        <div className="flex flex-col items-center text-gray-400">
                            <Loader2 size={32} className="animate-spin mb-2 text-blue-500" />
                            <span className="text-[10px]">Creating Public Link...</span>
                        </div>
                    ) : realShareUrl ? (
                        <QRCodeSVG 
                            value={realShareUrl} 
                            size={140}
                            level="M"
                        />
                    ) : (
                        <div className="text-red-400 text-xs text-center px-4">
                            {uploadError || "Upload Failed"}
                        </div>
                    )}
                 </div>
                 <a href={realShareUrl || '#'} target="_blank" rel="noreferrer" className={`text-[10px] flex items-center gap-1 ${realShareUrl ? 'text-blue-500 hover:underline' : 'text-gray-300 pointer-events-none'}`}>
                    {realShareUrl ? 'Open Link' : 'Waiting for link...'} <ExternalLink size={10} />
                 </a>
            </div>
        </div>
        
        {/* Footer Info */}
        <div className="bg-gray-50 p-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    D
                </div>
                <div className="text-xs font-medium text-gray-600">Dege Plugin</div>
            </div>
            <div className="text-xs font-mono text-gray-400">
                {audioDuration}
            </div>
        </div>
      </div>

      {/* Share Actions Grid */}
      <div className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Share via</p>
            {!webhookConfig.lark && !webhookConfig.dingtalk && !webhookConfig.wechat && (
                <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                    Setup in Settings for 1-click
                </span>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2 w-full px-2">
            <button 
                onClick={() => handleSocialShare(SocialPlatform.WECHAT)}
                className="flex flex-col items-center space-y-1 group p-2 hover:bg-gray-50 rounded-xl transition-colors relative"
            >
                <div className="w-10 h-10 bg-[#07C160] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                    <MessageCircle size={20} />
                </div>
                <span className="text-[10px] text-gray-500 font-medium">WeChat</span>
                {webhookConfig.wechat && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 border border-white rounded-full"></div>}
            </button>
            <button 
                onClick={() => handleSocialShare(SocialPlatform.DINGTALK)}
                className="flex flex-col items-center space-y-1 group p-2 hover:bg-gray-50 rounded-xl transition-colors relative"
            >
                <div className="w-10 h-10 bg-[#0089FF] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.08 24C5.08 24 0 19.2 0 11.2S6.3 0 12.5 0s11.5 5.58 11.5 11.5c0 6.64-5.3 12.5-11.92 12.5zM6.9 7.42c-.22-.3-.52-.45-.87-.45a1.27 1.27 0 0 0-1.07.6 2.06 2.06 0 0 0-.15 1.57l2.8 9.2a1.45 1.45 0 0 0 1.35 1.05h.07a1.4 1.4 0 0 0 1.28-1l2.55-8.25-3.08 3.52c-.45.53-1.05.68-1.5.38-.45-.3-.45-1.05.15-1.72l-1.54-4.9zm10.74 3.23l-3.23 2.1a.75.75 0 0 1-1.05-.23.75.75 0 0 1 .23-1.05l3.22-2.1a.75.75 0 0 1 1.05.23.75.75 0 0 1-.22 1.05z"/></svg>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">DingTalk</span>
                {webhookConfig.dingtalk && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 border border-white rounded-full"></div>}
            </button>
            <button 
                onClick={() => handleSocialShare(SocialPlatform.LARK)}
                className="flex flex-col items-center space-y-1 group p-2 hover:bg-gray-50 rounded-xl transition-colors relative"
            >
                <div className="w-10 h-10 bg-[#3370FF] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 12a10.5 10.5 0 1 1-21 0 10.5 10.5 0 0 1 21 0z" opacity="0.2"/><path d="M11.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-5.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Lark</span>
                {webhookConfig.lark && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 border border-white rounded-full"></div>}
            </button>
            <button 
                onClick={() => copyToClipboard(realShareUrl || '')}
                disabled={!realShareUrl}
                className="flex flex-col items-center space-y-1 group p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-all ${copied ? 'bg-gray-800 scale-110' : 'bg-gray-400 group-hover:bg-gray-500'}`}>
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{copied ? 'Copied' : 'Link'}</span>
            </button>
          </div>
      </div>

      {/* Secondary Actions */}
      <div className="flex space-x-4 pt-4 border-t border-gray-100 w-full justify-center">
         <button 
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
         >
            <Download size={14} />
            <span>Save .webm</span>
         </button>
         <button onClick={onReset} className="px-4 py-2 text-gray-400 hover:text-gray-600 text-xs underline">
            Start New Recording
         </button>
      </div>

    </div>
  );
};

export default ShareView;