// test-para-api.js
import { Para, Environment } from "@getpara/server-sdk";
import dotenv from "dotenv";

dotenv.config();

async function testParaApi() {
  console.log('=== Para API Key Test ===');
  
  const apiKey = process.env.PARA_API_KEY;
  
  console.log('1. Environment Check:');
  console.log('   - API Key exists:', !!apiKey);
  console.log('   - API Key length:', apiKey?.length || 0);
  console.log('   - API Key starts with beta_:', apiKey?.startsWith('beta_'));
  console.log('   - API Key preview:', apiKey?.substring(0, 20) + '...');
  
  if (!apiKey) {
    console.error('❌ PARA_API_KEY not found in environment variables');
    return;
  }

  // Test different API key formats
  const testKeys = [
    { name: 'Original', key: apiKey },
    { name: 'Trimmed', key: apiKey.trim() },
    { name: 'String Cast', key: String(apiKey) },
  ];

  for (const testKey of testKeys) {
    console.log(`\n2. Testing with ${testKey.name} API key:`);
    
    try {
      // Create Para instance
      const para = new Para(Environment.SANDBOX, testKey.key);
      console.log('   ✅ Para instance created');
      
      // Test API call
      const result = await para.hasPregenWallet({
        pregenId: { phone: '+1234567890' }
      });
      
      console.log('   ✅ API call successful:', result);
      console.log('   🎉 This API key format works!');
      break;
      
    } catch (error) {
      console.log('   ❌ Failed with error:', error.message);
      console.log('   - Error name:', error.name);
      console.log('   - Error code:', error.code);
      console.log('   - Error status:', error.status);
      
      if (error.message?.includes('missing para api key')) {
        console.log('   - This is the missing API key error');
      }
    }
  }

  // Test manual HTTP request if possible (advanced debugging)
  console.log('\n3. Manual HTTP Test:');
  try {
    // This would require knowing Para's actual API endpoints
    // For now, just log what we would send
    console.log('   - Would send API key as:', JSON.stringify(apiKey));
    console.log('   - Header format would be: Authorization: Bearer', apiKey);
  } catch (error) {
    console.log('   - Manual HTTP test not implemented');
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
testParaApi().catch(console.error);