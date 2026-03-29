import { useRef, useEffect } from 'react';
import { User, Bot, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Message, Attachment } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageListProps {
  messages: Message[];
  isDark: boolean;
  isLoading: boolean;
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      <span className="ml-2 text-sm text-muted-foreground">思考中...</span>
    </div>
  );
}

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type.startsWith('image/');
  
  if (isImage) {
    return (
      <div className="relative group">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-[200px] sm:max-w-[300px] max-h-[200px] rounded-lg object-cover border border-slate-200 dark:border-slate-700"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
          {attachment.name}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <FileText className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm max-w-[150px] sm:max-w-[200px] truncate">{attachment.name}</span>
    </div>
  );
}

function MessageContent({ content, isDark }: { content: string; isDark: boolean }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={isDark ? oneDark : oneLight}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={cn(
              "bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono",
              className
            )} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-5 mb-2">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-5 mb-2">{children}</ol>;
        },
        li({ children }) {
          return <li className="mb-1">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-lg font-semibold mt-4 mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-blue-500 pl-3 italic text-muted-foreground my-2">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-2">
              <table className="w-full border-collapse">{children}</table>
            </div>
          );
        },
        thead({ children }) {
          return <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>;
        },
        th({ children }) {
          return (
            <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-sm font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function MessageItem({ message, isDark }: { message: Message; isDark: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-3 sm:gap-4 py-3 sm:py-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center",
        isUser 
          ? "bg-gradient-to-br from-blue-500 to-blue-600" 
          : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
      )}>
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm",
        isUser 
          ? "message-bubble-user" 
          : "message-bubble-ai"
      )}>
        {/* Attachments for user messages */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att) => (
              <AttachmentPreview key={att.id} attachment={att} />
            ))}
          </div>
        )}

        {/* Thinking content */}
        {!isUser && message.thinking && (
          <div className="mb-3 p-2 sm:p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-muted-foreground mb-1">思考过程</p>
            <p className="text-xs sm:text-sm text-muted-foreground italic">{message.thinking}</p>
          </div>
        )}

        {/* Main content */}
        <div className={cn(
          "markdown-content text-sm sm:text-base",
          isUser && "text-white"
        )}>
          {message.content ? (
            <MessageContent content={message.content} isDark={isDark} />
          ) : message.isStreaming ? (
            <ThinkingIndicator />
          ) : null}
        </div>

        {/* Streaming indicator */}
        {message.isStreaming && message.content && (
          <div className="mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">生成中...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages, isDark, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">开始对话</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            输入您的问题，我将尽力为您提供帮助。支持 Markdown 格式、代码高亮和文件上传。
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-2 sm:px-4" ref={scrollRef}>
      <div className="max-w-3xl mx-auto py-2 sm:py-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} isDark={isDark} />
        ))}
        
        {/* Loading indicator for initial response */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-200" />
            </div>
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 message-bubble-ai">
              <ThinkingIndicator />
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
