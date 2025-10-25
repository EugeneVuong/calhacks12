import { lettaCloud } from '@letta-ai/vercel-ai-sdk-provider';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, agentId } = await request.json();
    
    console.log('Letta API request:', { prompt, agentId });

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'Agent ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling Letta streamText...');
    const result = await streamText({
      model: lettaCloud(), // Model configuration (LLM, temperature, etc.) is managed through your Letta agent
      providerOptions: {
        letta: {
          agent: { id: agentId }
        }
      },
      prompt: prompt,
    });

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of result.textStream) {
            console.log('Streaming text part:', textPart);
            const chunk = JSON.stringify({ content: textPart, done: false });
            controller.enqueue(new TextEncoder().encode(`data: ${chunk}\n\n`));
          }
          
          // Send final chunk
          const finalChunk = JSON.stringify({ content: '', done: true });
          controller.enqueue(new TextEncoder().encode(`data: ${finalChunk}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          const errorChunk = JSON.stringify({ 
            error: `Streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            done: true 
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorChunk}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error setting up stream:', error);
    return new Response(
      JSON.stringify({ error: `Failed to setup stream: ${error instanceof Error ? error.message : 'Unknown error'}` }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
