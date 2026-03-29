import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Settings } from '@/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClearConversations: () => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
  onClearConversations,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);

  // Reset local settings when panel opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有对话数据吗？此操作不可撤销。')) {
      onClearConversations();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-lg max-h-[90vh] glass-strong rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold">设置</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg h-8 w-8">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              API 配置
            </h3>
            
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={localSettings.apiKey}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="输入您的 Moonshot API Key"
                  className="pr-10 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                您的 API Key 将安全地存储在本地浏览器中
              </p>
            </div>

            {/* API URL */}
            <div className="space-y-2">
              <Label htmlFor="apiUrl" className="text-sm">API URL</Label>
              <Input
                id="apiUrl"
                value={localSettings.apiUrl}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                placeholder="https://api.moonshot.cn/v1/chat/completions"
                className="text-sm"
              />
            </div>

            {/* Model Info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">模型：</span>
                kimi-k2.5（通过 thinking 参数控制思考能力）
              </p>
            </div>
          </div>

          <Separator />

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              外观
            </h3>
            
            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-sm">主题</Label>
              <Select
                value={localSettings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setLocalSettings(prev => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="system">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Default Mode */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              默认模式
            </h3>
            
            <div className="space-y-2">
              <Label className="text-sm">新建对话默认模式</Label>
              <Select
                value={localSettings.defaultMode}
                onValueChange={(value: 'fast' | 'thinking') => 
                  setLocalSettings(prev => ({ ...prev, defaultMode: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="选择默认模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">快速模式（禁用思考）</SelectItem>
                  <SelectItem value="thinking">思考模式（启用思考）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              数据管理
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
              <div>
                <p className="font-medium text-destructive text-sm">清除所有数据</p>
                <p className="text-xs text-muted-foreground">删除所有对话和设置</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearData}
                className="gap-2 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                清除
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose} size="sm" className="text-sm">
            取消
          </Button>
          <Button onClick={handleSave} className="gap-2 bg-blue-500 hover:bg-blue-600 text-sm" size="sm">
            <Save className="w-4 h-4" />
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
