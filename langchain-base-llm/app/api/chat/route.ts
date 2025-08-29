import { ChatOpenAI } from "@langchain/openai";



export type Message = {
  role: 'user' | 'assistant' | 'system',
  content: string,
  index?: string,
}


const messages: Message[] = []

const model = new ChatOpenAI({
  apiKey: process.env.DOUBAO_API_KEY,
  configuration: {
    baseURL: process.env.DOUBAO_API_BASE_URL,
  },
  modelName: 'doubao-1-5-pro-32k-250115',
});

// 非流式问答
export async function POST(request: Request) {
  const { prompt } = await request.json();



  messages.push({
    role: 'user',
    content: prompt as string,
    index: `${+new Date()}`,
  })
  
  const res = await model.invoke(messages);

  messages.push({
    role: 'assistant',
    content: res.content as string,
    index: res.id,
  })

  return new Response(JSON.stringify(messages));
}

// 清空对话
export async function DELETE(request: Request) {
  messages.length = 0;
  return new Response(JSON.stringify({ message: '对话已清空' }));
}



