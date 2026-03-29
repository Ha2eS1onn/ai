import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Conversation, Message } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

const createNewConversation = (mode: 'fast' | 'thinking' = 'fast'): Conversation => ({
  id: generateId(),
  title: '新对话',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  mode,
});

export function useConversations(defaultMode: 'fast' | 'thinking') {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('kimi-conversations', []);
  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>('kimi-current-conversation', null);

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;

  // Create new conversation
  const createConversation = useCallback((mode: 'fast' | 'thinking' = defaultMode) => {
    const newConversation = createNewConversation(mode);
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  }, [defaultMode, setConversations, setCurrentConversationId]);

  // Switch to conversation
  const switchConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, [setCurrentConversationId]);

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (currentConversationId === id) {
        setCurrentConversationId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [currentConversationId, setConversations, setCurrentConversationId]);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        
        const updatedMessages = [...c.messages, newMessage];
        
        // Auto-generate title from first user message if title is default
        let title = c.title;
        if (title === '新对话' && message.role === 'user' && c.messages.length === 0) {
          title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        
        return {
          ...c,
          messages: updatedMessages,
          title,
          updatedAt: Date.now(),
        };
      })
    );

    return newMessage;
  }, [setConversations]);

  // Update message (for streaming)
  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
          updatedAt: Date.now(),
        };
      })
    );
  }, [setConversations]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setCurrentConversationId(null);
  }, [setConversations, setCurrentConversationId]);

  // Ensure there's always a current conversation
  useEffect(() => {
    if (!currentConversationId && conversations.length === 0) {
      createConversation(defaultMode);
    } else if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [currentConversationId, conversations, createConversation, defaultMode, setCurrentConversationId]);

  return {
    conversations,
    currentConversation,
    currentConversationId,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    updateMessage,
    clearAllConversations,
  };
}
