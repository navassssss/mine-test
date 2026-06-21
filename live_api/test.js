/**
 * STANDALONE API TEST SCRIPT
 * Run this using: node live_api/test.js
 * Make sure the API server is running (npm run api)
 */

async function runTest() {
  const url = 'http://localhost:3001/api/chat';
  
  // Test payload
  const payload = {
    message: 'Compare React and Vue.',
    instructions: 'Keep it clean and straightforward.',
    role: 'senior software engineer',
    format: 'table',
    structure: 'pros_cons',
    stream: true
  };

  console.log('Sending streaming request to http://localhost:3001/api/chat...');
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('\nError response from API server:', err);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    console.log('Stream response starting:\n---');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') {
            console.log('\n---\nStream finished successfully!');
            break;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.delta) {
              process.stdout.write(parsed.delta);
            }
          } catch (e) {
            // Not a valid JSON payload or parsing metadata
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to run test script:', error);
  }
}

runTest();
