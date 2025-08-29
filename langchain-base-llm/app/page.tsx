'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Message } from "@/app/api/chat/route";
export default function Home() {
  const [data, setData] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json();
    console.log('data', data);
    setData(data);
    setLoading(false);
    setPrompt('');
  }

  const handleNewChat = () => {
    setData([]);
  }

  return (
    <div className="flex flex-1 w-full flex-col">
      <div
        className="flex-1 space-y-6 overflow-y-auto rounded-xl bg-slate-200 p-4 text-sm leading-6 text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-300 sm:text-base sm:leading-7"
      >
        {data.map(message => message.role === 'user' ? <div className="flex items-start" key={message.index}>
          <img
            className="mr-2 h-8 w-8 rounded-full"
            src="https://dummyimage.com/128x128/363536/ffffff&text=J"
          />
          <div
            className="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-4 dark:bg-slate-800 sm:max-w-md md:max-w-2xl"
          >
            <p>{message.content as string}</p>
          </div>
        </div> : <div className="flex flex-row-reverse items-start" key={message.index}>
          <img
            className="ml-2 h-8 w-8 rounded-full"
            src="https://dummyimage.com/128x128/354ea1/ffffff&text=G"
          />

          <div
            className="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-4 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl"
          >
            <p>
              {message.content as string}
            </p>
          </div>
        </div>)}


      </div>
      {/* Prompt message input */}
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
