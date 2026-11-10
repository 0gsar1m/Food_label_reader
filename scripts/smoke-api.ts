import { spawn } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';

async function main(): Promise<void> {
  const child = spawn(process.execPath, ['dist-api/server.cjs'], {
    env: {
      ...process.env,
      PORT: '8788',
      NODE_ENV: 'production',
      APP_ACCESS_TOKEN: 'local-smoke-token-32-characters-long',
      OPENAI_API_KEY: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(() => {
        throw new Error('Bundled API exited before readiness.');
      }),
      new Promise<never>((_resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Startup timeout.')), 8000);
        timer.unref();
      }),
    ]);
    const health = await fetch('http://localhost:8788/health');
    assert.equal(health.status, 200);
    assert.equal((await health.json()).configured, false);
    const denied = await fetch('http://localhost:8788/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(denied.status, 401);
    console.info('Bundled production API: health and authentication passed.');
  } finally {
    child.kill();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
