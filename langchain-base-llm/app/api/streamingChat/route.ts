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


// 流式问答
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt");

  messages.push({
    role: 'user',
    content: prompt as string,
    index: `${+new Date()}`,
  })

  const stream = new ReadableStream({
    async start(controller) {
      // 创建对话
      const stream = await model.stream(messages);

      // 存放本次对话的内容
      let res = ''
      let index = ''

      // 先初始化本次对话
      messages.push({
        role: 'assistant',
        content: res,
      })
      // 处理流式内容更新
      for await (const event of stream) {
        const content = event?.content || '';
        // 更新本次对话的内容和同步更新 messages
        res += content;
        if (event.id) {
          index = event.id;
        }
        messages[messages.length - 1].content = res;
        messages[messages.length - 1].index = index;
        
        // 发送符合 SSE 标准的消息格式
        controller.enqueue(`data: ${JSON.stringify(messages)}\n\n`);
      }

      // 通知前端对话结束
      controller.enqueue('data: close\n\n');
      controller.close();
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// 清空对话
export async function DELETE(request: Request) {
  messages.length = 0;
  return new Response(JSON.stringify({ message: '对话已清空' }));
}



