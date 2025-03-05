import { NextResponse } from 'next/server';
import { getCharactersInfo, generateConversation } from '../utils/deepseek';
import { generateConversation as generateConversationClaude } from '../utils/claude';
import { generateConversation as generateConversationGemini } from '../utils/gemini';

export const runtime = 'edge'

export async function POST(request) {
  try {
    console.log('Starting conversation generation...');
    const { characters, rounds, model } = await request.json();
    console.log('Received request:', { characters, rounds, model });

    // 获取每个角色的详细信息
    console.log('Fetching character details...');
    const charactersInfo = await getCharactersInfo(characters);
    console.log('Character details fetched:', charactersInfo);

    // 根据选择的模型生成对话内容
    console.log(`Generating conversation using ${model}...`);
    let messages;
    switch (model) {
      case 'claude':
        messages = await generateConversationClaude(charactersInfo, rounds);
        break;
      case 'gemini':
        messages = await generateConversationGemini(charactersInfo, rounds);
        break;
      case 'deepseek-r1':
      default:
        messages = await generateConversation(charactersInfo, rounds);
        break;
    }
    console.log('Raw conversation messages generated:', messages);

    // 添加时间戳和ID
    const conversation = {
      messages: messages.map((msg, index) => ({
        ...msg,
        id: (index + 1).toString(),
        timestamp: new Date().toISOString()
      }))
    };
    console.log('Final conversation object:', conversation);

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error generating conversation:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: '生成对话失败' },
      { status: 500 }
    );
  }
} 