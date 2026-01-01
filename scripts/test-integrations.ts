// Integration Test Script
// Tests SMS, Voice, and AI integrations

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

// Always use localhost for testing
const APP_URL = 'http://localhost:3000'

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  response?: any;
}

const results: TestResult[] = [];

async function testEndpoint(name: string, url: string, options: RequestInit = {}): Promise<TestResult> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/xml')) {
      data = await response.text();
    } else {
      data = await response.text();
    }

    return {
      name,
      success: response.ok,
      message: response.ok ? 'OK' : `HTTP ${response.status}`,
      response: data,
    };
  } catch (error) {
    return {
      name,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runTests() {
  console.log('🔬 TalyaCRM Integration Tests\n');
  console.log(`📍 App URL: ${APP_URL}\n`);
  console.log('='.repeat(50));

  // Test 1: Check if app is running
  console.log('\n1. Testing App Health...');
  const healthResult = await testEndpoint(
    'App Health',
    `${APP_URL}/dashboard`
  );
  results.push(healthResult);
  console.log(healthResult.success ? '   ✅ App is running' : '   ❌ App not reachable');

  // Test 2: Test Voice Router endpoint (simulate Twilio webhook)
  console.log('\n2. Testing Voice Router...');
  const voiceRouterResult = await testEndpoint(
    'Voice Router',
    `${APP_URL}/api/twilio/voice-router`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: '+15551234567',
        To: process.env.TWILIO_PHONE_NUMBER || '+15559876543',
        CallSid: 'TEST_CALL_SID_' + Date.now(),
      }).toString(),
    }
  );
  results.push(voiceRouterResult);
  
  if (voiceRouterResult.success && voiceRouterResult.response?.includes('Response')) {
    console.log('   ✅ Voice Router returning TwiML');
  } else {
    console.log('   ❌ Voice Router issue:', voiceRouterResult.message);
  }

  // Test 3: Test Voice AI endpoint
  console.log('\n3. Testing Voice AI Handler...');
  const voiceAIResult = await testEndpoint(
    'Voice AI',
    `${APP_URL}/api/twilio/voice-ai`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: '+15551234567',
        CallSid: 'TEST_AI_CALL_' + Date.now(),
      }).toString(),
    }
  );
  results.push(voiceAIResult);
  
  if (voiceAIResult.success && voiceAIResult.response?.includes('Gather')) {
    console.log('   ✅ Voice AI returning TwiML with Gather');
  } else {
    console.log('   ❌ Voice AI issue:', voiceAIResult.message);
  }

  // Test 4: Test Vapi Webhook
  console.log('\n4. Testing Vapi Webhook...');
  const vapiResult = await testEndpoint(
    'Vapi Webhook',
    `${APP_URL}/api/vapi/webhook`,
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'call.started',
        call: {
          id: 'test-call-id-' + Date.now(),
          customer: {
            number: '+15551234567',
          },
        },
      }),
    }
  );
  results.push(vapiResult);
  console.log(vapiResult.success ? '   ✅ Vapi Webhook responding' : '   ❌ Vapi Webhook issue');

  // Test 5: Test Twilio Webhook (SMS)
  console.log('\n5. Testing Twilio SMS Webhook...');
  const smsWebhookResult = await testEndpoint(
    'SMS Webhook',
    `${APP_URL}/api/twilio/webhook`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: '+15551234567',
        To: process.env.TWILIO_PHONE_NUMBER || '+15559876543',
        Body: 'Test message from integration tests',
        MessageSid: 'TEST_SMS_' + Date.now(),
      }).toString(),
    }
  );
  results.push(smsWebhookResult);
  
  // Note: This may fail signature validation, which is expected
  const smsResponse = smsWebhookResult.response;
  const isSmsResponseString = typeof smsResponse === 'string';
  if ((isSmsResponseString && smsResponse.includes('Message')) || smsResponse?.success) {
    console.log('   ✅ SMS Webhook responding');
  } else if (smsResponse?.error === 'Invalid signature') {
    console.log('   ⚠️  SMS Webhook works but blocked due to signature validation (expected)');
  } else {
    console.log('   ❌ SMS Webhook issue:', smsWebhookResult.message);
  }

  // Test 6: Test AI Chat API (if exists)
  console.log('\n6. Testing AI Chat (OpenRouter)...');
  const chatResult = await testEndpoint(
    'AI Chat',
    `${APP_URL}/api/chat`,
    {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello, what services do you offer?',
        projectContext: {
          projectName: 'Test Project',
          customerName: 'Test Customer',
          status: 'inspection',
          address: '123 Test St',
        },
      }),
    }
  );
  results.push(chatResult);
  
  if (chatResult.success && chatResult.response) {
    console.log('   ✅ AI Chat responding');
  } else if (chatResult.message.includes('404')) {
    console.log('   ⚠️  AI Chat endpoint not found (may need to create)');
  } else {
    console.log('   ❌ AI Chat issue:', chatResult.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary\n');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`   ${icon} ${r.name}: ${r.message}`);
  });
  
  console.log(`\n📈 Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests need attention.');
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Integration Testing Checklist\n');
  console.log('To fully test integrations, you need to:');
  console.log('');
  console.log('1. SMS Testing:');
  console.log('   - Configure Twilio webhook URL in Twilio Console');
  console.log('   - Send a test SMS to your Twilio number');
  console.log('   - Check the communications table in Supabase');
  console.log('');
  console.log('2. Voice Testing:');
  console.log('   - Configure voice webhook URL in Twilio Console');
  console.log('   - Call your Twilio number');
  console.log('   - Test business hours routing vs AI routing');
  console.log('');
  console.log('3. AI Caller (Vapi):');
  console.log('   - Set up Vapi assistant with webhook URL');
  console.log('   - Make a test call through Vapi');
  console.log('   - Verify transcript saves to database');
  console.log('');
  console.log('4. AI Chat (OpenRouter):');
  console.log('   - Test chat from project detail page');
  console.log('   - Verify responses are context-aware');
  console.log('');
}

// Run tests
runTests().catch(console.error);
