import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Info } from 'lucide-react';
import { WebhookConfig } from '../types';

interface SettingsViewProps {
  onClose: () => void;
  config: WebhookConfig;
  onSave: (config: WebhookConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<WebhookConfig>(config);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    onSave(localConfig);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-white">
      <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Integration Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
           <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
           <p className="text-xs text-blue-800 leading-relaxed">
             Bind your enterprise group bots to enable 1-click sharing. 
             Paste the <strong>Webhook URL</strong> from your bot settings below.
           </p>
        </div>

        {/* WeChat Work */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#07C160]"></div>
                Enterprise WeChat (WeCom)
            </label>
            <input 
                type="text" 
                placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/..."
                value={localConfig.wechat || ''}
                onChange={(e) => setLocalConfig({...localConfig, wechat: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
        </div>

        {/* DingTalk */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0089FF]"></div>
                DingTalk
            </label>
            <input 
                type="text" 
                placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
                value={localConfig.dingtalk || ''}
                onChange={(e) => setLocalConfig({...localConfig, dingtalk: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
        </div>

        {/* Lark/Feishu */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3370FF]"></div>
                Lark / Feishu
            </label>
            <input 
                type="text" 
                placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                value={localConfig.lark || ''}
                onChange={(e) => setLocalConfig({...localConfig, lark: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
        </div>

      </div>

      <div className="p-4 border-t border-gray-100">
        <button 
            onClick={handleSave}
            className={`w-full py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold shadow-lg transition-all text-sm text-white ${showSuccess ? 'bg-green-500' : 'bg-gray-900 hover:bg-black'}`}
        >
            <Save size={18} />
            <span>{showSuccess ? 'Saved Successfully!' : 'Save Configurations'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsView;