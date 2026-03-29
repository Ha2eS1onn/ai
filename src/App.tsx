import { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { MessageList } from '@/components/MessageList';
import { ChatInput } from '@/components/ChatInput';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/hooks/useTheme';
import { useConversations } from '@/hooks/useConversations';
import { useChat } from '@/hooks/useChat';
import { DEFAULT_SETTINGS } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { Attachment } from '@/types';

function App() {
  // Settings
  const [settings, setSettings] = useLocalStorage('kimi-settings', DEFAULT_SETTINGS);
  
  // Theme
  const { isDark, toggleTheme } = useTheme(settings);
  
  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Conversations
  const {
    conversations,
    currentConversation,
    currentConversationId,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    clearAllConversations,
  } = useConversations(settings.defaultMode);

  // Current mode for the conversation
  const [currentMode, setCurrentMode] = useState<'fast' | 'thinking'>(
    currentConversation?.mode || settings.defaultMode
  );

  // Update current mode when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setCurrentMode(currentConversation.mode);
    }
  }, [currentConversation]);

  // Settings panel
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat
  const { isLoading, error, sendMessage, stopGeneration } = useChat({
    settings,
    conversation: currentConversation,
    addMessage,
    updateMessage,
  });

  // Handle mode change
  const handleModeChange = useCallback((mode: 'fast' | 'thinking') => {
    setCurrentMode(mode);
  }, []);

  // Handle send message with attachments
  const handleSendMessage = useCallback(async (
    content: string, 
    mode: 'fast' | 'thinking',
    attachments?: Attachment[]
  ) => {
    if (!settings.apiKey) {
      toast.error('请先配置 API Key', {
        description: '点击左下角的设置按钮进行配置',
      });
      setIsSettingsOpen(true);
      return;
    }

    await sendMessage(content, mode, attachments);
  }, [settings.apiKey, sendMessage]);

  // Handle save settings
  const handleSaveSettings = useCallback((newSettings: typeof settings) => {
    setSettings(newSettings);
    toast.success('设置已保存');
  }, [setSettings]);

  // Handle toggle theme with save
  const handleToggleTheme = useCallback(() => {
    const newTheme = toggleTheme();
    setSettings(prev => ({ ...prev, theme: newTheme as 'light' | 'dark' }));
  }, [toggleTheme, setSettings]);

  // Handle create conversation and close sidebar on mobile
  const handleCreateConversation = useCallback(() => {
    createConversation();
    setIsSidebarOpen(false);
  }, [createConversation]);

  // Handle switch conversation and close sidebar on mobile
  const handleSwitchConversation = useCallback((id: string) => {
    switchConversation(id);
    setIsSidebarOpen(false);
  }, [switchConversation]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error('发送消息失败', {
        description: error,
      });
    }
  }, [error]);

  return (
    <div className="h-screen w-screen flex gradient-bg overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          isDark={isDark}
          onCreateConversation={handleCreateConversation}
          onSwitchConversation={handleSwitchConversation}
          onDeleteConversation={deleteConversation}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsSidebarOpen(false);
          }}
          onToggleTheme={handleToggleTheme}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <span className="font-semibold text-sm">
            {currentConversation?.title || 'Kimi Chat'}
          </span>
          
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>

        {/* Messages */}
        <MessageList
          messages={currentConversation?.messages || []}
          isDark={isDark}
          isLoading={isLoading}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
          mode={currentMode}
          onModeChange={handleModeChange}
          disabled={!settings.apiKey}
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onClearConversations={clearAllConversations}
      />

      {/* Toast notifications */}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
