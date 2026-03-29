import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Sparkles, Zap, Paperclip, X, FileText, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Attachment } from '@/types';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/types';

interface ChatInputProps {
  onSend: (message: string, mode: 'fast' | 'thinking', attachments?: Attachment[]) => void;
  onStop: () => void;
  isLoading: boolean;
  mode: 'fast' | 'thinking';
  onModeChange: (mode: 'fast' | 'thinking') => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  mode,
  onModeChange,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim();
    
    // Allow send if there's text OR attachments
    if ((!trimmedInput && attachments.length === 0) || isLoading || disabled) {
      return;
    }
    
    onSend(trimmedInput, mode, attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, attachments, isLoading, disabled, mode, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`文件 ${file.name} 过大`, {
          description: '单个文件最大支持 100MB',
        });
        continue;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.type.startsWith('text/')) {
        toast.error(`不支持的文件类型: ${file.name}`, {
          description: '支持图片、文档、代码文件等',
        });
        continue;
      }

      try {
        // Convert file to base64 for preview
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const newAttachment: Attachment = {
          id: Math.random().toString(36).substring(2, 15),
          name: file.name,
          type: file.type,
          size: file.size,
          url: base64,
          base64: base64.split(',')[1],
        };

        setAttachments(prev => [...prev, newAttachment]);
        
        toast.success(`已添加文件: ${file.name}`);
      } catch (error) {
        toast.error(`上传文件失败: ${file.name}`);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Film className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canSend = (input.trim() || attachments.length > 0) && !isLoading && !disabled;

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto">
        {/* Mode Switcher - Mobile friendly */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => onModeChange('fast')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
              mode === 'fast'
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>快速模式</span>
          </button>
          
          <button
            onClick={() => onModeChange('thinking')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
              mode === 'thinking'
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>思考模式</span>
          </button>
          
          <span className="text-xs text-muted-foreground ml-1 hidden md:inline">
            {mode === 'fast' ? '响应迅速，适合日常对话' : '深度思考，适合复杂问题'}
          </span>
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs group"
              >
                {getFileIcon(att.type)}
                <span className="max-w-[100px] sm:max-w-[150px] truncate">{att.name}</span>
                <span className="text-muted-foreground">({formatFileSize(att.size)})</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex items-end gap-2">
          {/* File upload button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept={ALLOWED_FILE_TYPES.join(',')}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || disabled}
            className="flex-shrink-0 h-10 w-10 rounded-xl"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "请先配置 API Key" : "输入消息..."}
              disabled={disabled || isLoading}
              className={cn(
                "min-h-[44px] max-h-[150px] sm:max-h-[200px] pr-12 py-2.5 sm:py-3 resize-none rounded-xl text-sm sm:text-base",
                "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-1.5">
              {isLoading ? (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={onStop}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200",
                    mode === 'thinking' 
                      ? "bg-purple-500 hover:bg-purple-600" 
                      : "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
