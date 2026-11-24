import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/index.js';
import { MemoryStore, cleanScore, TOP } from '../server/scores.js';

test('기록 검증', () => {
  const ids = ['inferno'];
  assert.deepEqual(cleanScore({ name: ' <b>haron ', map: 'inferno', wave: 7, kills: 60 }, ids), { name: 'bharon', map: 'inferno', wave: 7, kills: 60 });
  assert.equal(cleanScore({ name: '', map: 'inferno', wave: 7, kills: 1 }, ids), null);
  assert.equal(cleanScore({ name: 'a', map: 'nope', wave: 7, kills: 1 }, ids), null);
  assert.equal(cleanScore({ name: 'a', map: 'inferno', wave: 0, kills: 1 }, ids), null);
  assert.equal(cleanScore({ name: 'a', map: 'inferno', wave: 2.5, kills: 1 }, ids), null);
  assert.equal(cleanScore({ name: 'a', map: 'inferno', wave: 3, kills: 9999 }, ids), null);
  assert.equal(cleanScore(null, ids), null);
});

test('메모리 저장소: 웨이브, 처치 순 정렬과 상위 개수 제한', async () => {
  const s = new MemoryStore();
  for (let i = 1; i <= TOP + 5; i++) await s.add({ name: `p${i}`, map: 'inferno', wave: i, kills: i });
  assert.equal(await s.add({ name: 'tie', map: 'inferno', wave: TOP + 5, kills: 999 }), 1);
  const top = await s.top('inferno');
  assert.equal(top.length, TOP);
  assert.equal(top[0].name, 'tie');
  assert.equal(top[1].wave, TOP + 5);
  assert.deepEqual(await s.top('arena'), []);
});

let app;
let base;
before(async () => {
  app = createApp({ store: new MemoryStore() });
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${app.server.address().port}`;
});
after(() => new Promise((r) => app.server.close(r)));

const post = (body) => fetch(`${base}/api/scores`, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) });

test('순위 API: 등록, 조회, 검증, 간격 제한', async () => {
  assert.equal((await fetch(`${base}/api/scores?map=nope`)).status, 400);
  assert.equal((await post('{bad')).status, 400);
  assert.equal((await post({ name: 'a', map: 'inferno', wave: 3, kills: 5000 })).status, 400);
  const ok = await post({ name: 'haron', map: 'inferno', wave: 9, kills: 80 });
  assert.deepEqual(await ok.json(), { ok: true, rank: 1 });
  assert.equal((await post({ name: 'haron', map: 'inferno', wave: 9, kills: 80 })).status, 429);
  const list = await (await fetch(`${base}/api/scores?map=inferno`)).json();
  assert.equal(list.scores.length, 1);
  assert.equal(list.scores[0].name, 'haron');
  assert.equal((await fetch(`${base}/api/scores`, { method: 'DELETE' })).status, 405);
});
