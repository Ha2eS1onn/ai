import { useState, useCallback, useRef } from 'react';
import type { Message, Conversation, Settings, StreamResponse, Attachment } from '@/types';
import { KIMI_MODEL } from '@/types';

interface UseChatOptions {
  settings: Settings;
  conversation: Conversation | null;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
}

export function useChat({ settings, conversation, addMessage, updateMessage }: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    mode: 'fast' | 'thinking',
    attachments?: Attachment[]
  ) => {
    if (!conversation || !settings.apiKey) {
      setError('请先配置 API Key');
      return;
    }

    // Don't send if content is empty and no attachments
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build message content with attachments
    let messageContent = content;
    if (attachments && attachments.length > 0) {
      const attachmentText = attachments.map(att => {
        if (att.type.startsWith('image/')) {
          return `![${att.name}](${att.url})`;
        }
        return `[${att.name}](${att.url})`;
      }).join('\n');
      messageContent = content ? `${content}\n\n${attachmentText}` : attachmentText;
    }

    // Add user message
    addMessage(conversation.id, {
      role: 'user',
      content: messageContent,
      attachments,
    });

    // Add placeholder for assistant message
    const assistantMessage = addMessage(conversation.id, {
      role: 'assistant',
      content: '',
      isStreaming: true,
    });

    // Prepare conversation history
    const messages = conversation.messages
      .filter(m => m.id !== assistantMessage.id)
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    abortControllerRef.current = new AbortController();

    let fullContent = '';
    let fullThinking = '';

    try {
      // Build request body
      // kimi-k2.5: temperature must be 1
      // thinking: default enabled, use {"type": "disabled"} to disable
      const requestBody: any = {
        model: KIMI_MODEL,
        messages,
        stream: true,
        // temperature: 1.0, // kimi-k2.5 only supports temperature = 1
      };

      // Disable thinking for fast mode
      if (mode === 'fast') {
        requestBody.thinking = { type: 'disabled' };
      }

      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed: StreamResponse = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              const delta = parsed.choices?.[0]?.delta;
              if (delta) {
                if (delta.content) {
                  fullContent += delta.content;
                }
                if (delta.thinking) {
                  fullThinking += delta.thinking;
                }
              }

              // Update message in real-time
              updateMessage(conversation.id, assistantMessage.id, {
                content: fullContent,
                thinking: fullThinking || undefined,
                isStreaming: true,
              });
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }

      // Mark streaming as complete
      updateMessage(conversation.id, assistantMessage.id, {
        isStreaming: false,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage === 'The user aborted a request.') {
        updateMessage(conversation.id, assistantMessage.id, {
          isStreaming: false,
        });
      } else {
        setError(errorMessage);
        updateMessage(conversation.id, assistantMessage.id, {
          content: fullContent || '抱歉，发生了错误。请检查您的 API 配置并重试。',
          isStreaming: false,
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [conversation, settings, addMessage, updateMessage]);

  return {
    isLoading,
    error,
    sendMessage,
    stopGeneration,
  };
}
