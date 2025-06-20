import { NextResponse } from 'next/server';
import mqttBridge from '../../../../../lib/mqttBridge.js';

export async function POST(request) {
  try {
    const { topic, message } = await request.json();
    
    if (!topic || !message) {
      return NextResponse.json(
        { success: false, error: 'Topic and message are required' },
        { status: 400 }
      );
    }

    const success = mqttBridge.publishCommand(topic, message);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Command published successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'MQTT not connected' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
