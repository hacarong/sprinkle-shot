import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createApp } from '../server/index.js';

let app;
let base;

before(async () => {
  app = createApp();
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  base = `127.0.0.1:${app.server.address().port}`;
});
after(async () => {
  for (const ws of app.wss.clients) ws.terminate();
  await new Promise((r) => app.server.close(r));
});

test('헬스체크', async () => {
  const res = await fetch(`http://${base}/healthz`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
});

test('게임 페이지와 자산 제공', async () => {
  const html = await fetch(`http://${base}/`);
  assert.equal(html.status, 200);
  assert.match(html.headers.get('content-type'), /text\/html/);
  assert.match(await html.text(), /game\.js/);
  for (const p of ['/game.js', '/style.css', '/maps.js']) {
    const r = await fetch(`http://${base}${p}`);
    assert.equal(r.status, 200, p);
    assert.ok((await r.text()).length > 1000, p);
  }
});

test('game.js는 client/src 묶음이고 소스 파일은 직접 제공하지 않음', async () => {
  const js = await (await fetch(`http://${base}/game.js`)).text();
  assert.match(js, /^\(function\(\)\{/);
  assert.match(js, /\}\)\(\);\s*$/);
  assert.equal((await fetch(`http://${base}/src/00-core.js`)).status, 404);
});

test('없는 경로는 404, 경로 탈출 차단', async () => {
  assert.equal((await fetch(`http://${base}/nope.js`)).status, 404);
  assert.equal((await fetch(`http://${base}/..%2Fpackage.json`)).status, 404);
});

test('POST는 405', async () => {
  assert.equal((await fetch(`http://${base}/`, { method: 'POST' })).status, 405);
});

function open() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${base}/ws`);
    ws.queue = [];
    ws.waiters = [];
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      const w = ws.waiters.shift();
      if (w) w(m);
      else ws.queue.push(m);
    });
    ws.next = () => new Promise((r) => (ws.queue.length ? r(ws.queue.shift()) : ws.waiters.push(r)));
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

test('방 입장과 상태 중계', async () => {
  const a = await open();
  const b = await open();
  a.send(JSON.stringify({ t: 'join', room: 'test', name: 'A' }));
  const ja = await a.next();
  assert.equal(ja.t, 'joined');
  assert.equal(ja.room, 'TEST');
  assert.equal(ja.host, ja.id);

  b.send(JSON.stringify({ t: 'join', room: 'TEST', name: 'B' }));
  const jb = await b.next();
  assert.equal(jb.players.length, 2);
  assert.equal(jb.host, ja.id);
  assert.equal((await a.next()).t, 'peer_join');

  a.send(JSON.stringify({ t: 'state', s: { x: 1, z: 2 } }));
  const st = await b.next();
  assert.deepEqual(st, { t: 'state', id: ja.id, s: { x: 1, z: 2 } });

  b.close();
  assert.deepEqual(await a.next(), { t: 'peer_leave', id: jb.id, host: ja.id });
  a.close();
});

test('잘못된 방 코드는 오류 응답', async () => {
  const a = await open();
  a.send(JSON.stringify({ t: 'join', room: '!', name: 'A' }));
  assert.deepEqual(await a.next(), { t: 'error', reason: 'bad_code' });
  a.close();
});
