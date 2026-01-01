// AI Chat API Endpoint using OpenRouter
import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, ProjectContext } from '@/lib/ai/chat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, projectContext, conversationHistory } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Default project context if not provided
    const context: ProjectContext = projectContext || {
      projectName: 'General Inquiry',
      customerName: 'Customer',
      status: 'lead',
      address: 'Not specified',
    };

    // Generate AI response
    const response = await generateChatResponse(
      message,
      context,
      conversationHistory || []
    );

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
