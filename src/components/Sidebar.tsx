import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Moon, 
  Sun,
  Sparkles,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isDark: boolean;
  onCreateConversation: () => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onCloseSidebar?: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  isDark,
  onCreateConversation,
  onSwitchConversation,
  onDeleteConversation,
  onOpenSettings,
  onToggleTheme,
  onCloseSidebar,
}: SidebarProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-72 h-full glass-strong border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Kimi Chat</span>
          </div>
          
          {/* Close button for mobile */}
          {onCloseSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseSidebar}
              className="lg:hidden h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <Button
          onClick={onCreateConversation}
          className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4" />
          新建对话
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                currentConversationId === conversation.id
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground"
              )}
              onClick={() => onSwitchConversation(conversation.id)}
            >
              <div className="flex-shrink-0">
                {conversation.mode === 'thinking' ? (
                  <Sparkles className={cn(
                    "w-4 h-4",
                    currentConversationId === conversation.id && "text-blue-500"
                  )} />
                ) : (
                  <Zap className={cn(
                    "w-4 h-4",
                    currentConversationId === conversation.id && "text-blue-500"
                  )} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {conversation.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(conversation.updatedAt)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无对话</p>
            <p className="text-xs mt-1">点击上方按钮开始新对话</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm"
          onClick={onOpenSettings}
        >
          <Settings className="w-4 h-4" />
          设置
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm"
          onClick={onToggleTheme}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4" />
              切换浅色模式
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              切换深色模式
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
