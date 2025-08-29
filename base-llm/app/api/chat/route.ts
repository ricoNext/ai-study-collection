import OpenAI from "openai";

export type Message = {
  role: 'user' | 'assistant' | 'system',
  content: string,
  index: number,
}

const messages: Message[] = []

const openai = new OpenAI({
  baseURL: process.env.DOUBAO_API_BASE_URL,
  apiKey: process.env.DOUBAO_API_KEY,
});

// 非流式问答
export async function POST(request: Request) {
  const { prompt } = await request.json();

  messages.push({
    role: 'user',
    content: prompt,
    index: -1,
  })
  
  const completion = await openai.chat.completions.create({  
    model: 'doubao-1-5-pro-32k-250115',
    messages,
  });

  messages.push({
    ...completion.choices[0].message,
    index: completion.choices[0].index as number,
  } as Message)
  
  console.log('completion', messages);
  return new Response(JSON.stringify(messages));
}

// 清空对话
export async function DELETE(request: Request) {
  messages.length = 0;
  return new Response(JSON.stringify({ message: '对话已清空' }));
}



