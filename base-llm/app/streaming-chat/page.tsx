'use client';

import { useEffect, useRef, useState, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Message } from "@/app/api/chat/route";
import { Loader2 } from "lucide-react";
import MarkdownWrap from "@/components/markdown-wrap";


// 头像组件定义在MessageItem外部确保引用稳定
const Avatar = memo(
  ({ role }: { role: 'user' | 'assistant' }) => {
    const src = role === 'user'
      ? "https://dummyimage.com/128x128/363536/ffffff&text=J"
      : "https://dummyimage.com/128x128/354ea1/ffffff&text=G";

    return (
      <img
        className={role === 'user' ? "mr-2 h-8 w-8 rounded-full" : "ml-2 h-8 w-8 rounded-full"}
        src={src}
        alt={role}
      />
    );
  },
  // 添加类型注解并修复比较函数
  (prevProps: { role: 'user' | 'assistant' }, nextProps: { role: 'user' | 'assistant' }) => {
    return prevProps.role === nextProps.role;
  }
);

// 消息项组件 - 使用memo避免重复渲染
// 为MessageItem添加自定义比较函数，仅内容变化时重渲染
const MessageItem = memo(
  ({ message }: { message: Message }) => {
    return message.role === 'user' ? (
      <div className="flex items-start">
        {useMemo(() => <Avatar role="user" />, [])}
        <div className="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-4 dark:bg-slate-800 sm:max-w-md md:max-w-2xl">
          <p>{message.content as string}</p>
        </div>
      </div>
    ) : (
      <div className="flex flex-row-reverse items-start">
        {useMemo(() => <Avatar role="assistant" />, [])}
        <div className="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-4 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl">
          <MarkdownWrap>{message.content}</MarkdownWrap>
        </div>
      </div>
    );
  }
);


export default function StreamingChat() {
  const [data, setData] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    fetch('/api/streamingChat', {
      method: 'DELETE',
    }).then(() => {
      setData([]);
      setPrompt('');
    })
  }

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 创建新的 EventSource，对 prompt 进行 URL 编码
    const eventSource = new EventSource(
      `/api/streamingChat?prompt=${encodeURIComponent(prompt)}`
    );

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      // 直接处理文本数据，不进行 JSON 解析
      if (event.data === 'close') {
        setLoading(false);
        eventSource.close();
        setPrompt('');
      } else if (event.data) {
        // 处理流式内容更新
        setData(JSON.parse(event.data));
        // 确保 messagesContainerRef 元素一直出现在页面中
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setLoading(false);
      eventSource.close();
    };
  }

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    }
  }, []);

  return (
    <div className="flex h-[97vh] w-full flex-col" >
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-6 overflow-y-auto rounded-xl bg-slate-200 p-4 text-sm leading-6 text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-300 sm:text-base sm:leading-7"
      >
        {data.map(message => (
          <MessageItem key={message.index} message={message} />
        ))}


      </div>
      <form className="mt-2" onSubmit={handleClick}>
        <label htmlFor="chat-input" className="sr-only">Enter your prompt</label>
        <div className="relative">
          <textarea
            id="chat-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="block w-full resize-none rounded-xl border-none bg-slate-200 p-4 pl-10 pr-20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-600 sm:text-base"
            placeholder="请输入问题"
            required
          />

          <div className="absolute bottom-2 right-2.5 flex gap-2">
            <Button type="submit" disabled={loading} className=" bg-blue-700 hover:bg-blue-800">
              {loading ? <>
                <Loader2 className="animate-spin" /> 思考中...</> : 'Send'}
            </Button>
            <Button onClick={handleNewChat}>
              开始新对话
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
