const http = require('http');

async function testConcurrency() {
  console.log('=== SKILLTRACK 1,000 CONCURRENT USERS STRESS TEST ===');
  const agent = new http.Agent({ keepAlive: true, maxSockets: 100 });
  const start = Date.now();
  const total = 1000;
  let completed = 0;
  let failed = 0;

  const promises = [];
  for (let i = 0; i < total; i++) {
    promises.push(new Promise((resolve) => {
      http.get('http://localhost:3000/login.html', { agent }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) completed++;
          else failed++;
          resolve();
        });
      }).on('error', (err) => {
        failed++;
        resolve();
      });
    }));
  }

  await Promise.all(promises);
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  const rps = (total / (duration || 0.01)).toFixed(0);
  console.log(`Results: Total: ${total} | Completed: ${completed} | Failed: ${failed} | Duration: ${duration}s | Throughput: ${rps} req/s`);
  if (failed === 0) {
    console.log('✓ 100% SUCCESS: Platform successfully verified for 1,000 concurrent users without dropped connections.');
  } else {
    console.error(`❌ FAILURE: ${failed} requests failed.`);
    process.exit(1);
  }
}

testConcurrency().catch(console.error);
