import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api/v1/search';

async function testRateLimit() {
  console.log(`Testing rate limit on ${API_URL}...`);
  
  const requests = [];
  for (let i = 1; i <= 7; i++) {
    requests.push(
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
      }).then(async (res) => {
        const data = await res.json();
        console.log(`Request ${i}: Status ${res.status}`, data);
        return res.status;
      })
    );
  }

  const statuses = await Promise.all(requests);
  const tooManyRequests = statuses.filter(s => s === 429).length;
  
  if (tooManyRequests > 0) {
    console.log(`\nSUCCESS: ${tooManyRequests} requests were rate limited with 429 status.`);
  } else {
    console.log(`\nFAILURE: No requests were rate limited. Check if the server is running and the limit is applied correctly.`);
  }
}

testRateLimit().catch(console.error);
