import { NextResponse } from 'next/server';
import mqttBridge from '../../../../../lib/mqttBridge.js';

export async function GET() {
  console.log('🔍 API Debug - mqttBridge instance:', !!mqttBridge);
  console.log('🔍 API Debug - local isConnected:', mqttBridge.isConnected);
  console.log('🔍 API Debug - global mqttConnected:', global.mqttConnected);
  console.log('🔍 API Debug - global bridge exists:', !!global.mqttBridge);
  
  const status = mqttBridge.getStatus();
  
  console.log('🔍 API Debug - final getStatus result:', status);
  
  return NextResponse.json({
    success: true,
    data: status
  });
}
