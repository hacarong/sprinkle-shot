// 정적 클라이언트 제공 + 헬스체크 + 멀티 준비용 WebSocket 방 서버.
// 현재 클라이언트는 싱글 플레이만 사용합니다. /ws는 다음 단계(협동 멀티)의 골격입니다.
import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { WebSocketServer } from 'ws';
import { Rooms } from './rooms.js';
import { bundle } from './bundle.js';
import { makeStore, cleanScore } from './scores.js';

const ROOT = fileURLToPath(new URL('../client/', import.meta.url));
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};
const MAX_MSG = 8192; // 메시지 1건 최대 바이트(방장의 월드 스냅숏 포함)
const RELAY_HZ = 60; // 참가자 1명당 초당 중계 상한
const POST_GAP = 8000; // 같은 주소의 순위 등록 최소 간격(ms)

// 맵 id 목록: 브라우저용 스크립트인 maps.js를 함수로 감싸 읽습니다.
const MAP_IDS = new Function(`${readFileSync(ROOT + 'maps.js', 'utf8')}; return MAPS.map(function (m) { return m.id; });`)();

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

// 시작 시 정적 파일을 메모리에 올리고 텍스트는 gzip으로 미리 압축합니다.
function loadStatic(dir) {
  const files = new Map();
  (function walk(d) {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        if (relative(dir, p) !== 'src') walk(p); // 소스는 묶음(game.js)으로만 제공
      }
      else {
        const type = MIME[extname(p)] ?? 'application/octet-stream';
        const body = readFileSync(p);
        const text = /^text\/|json/.test(type);
        files.set('/' + relative(dir, p).split(sep).join('/'), { type, body, gz: text ? gzipSync(body) : null });
      }
    }
  })(dir);
  const game = Buffer.from(bundle());
  files.set('/game.js', { type: MIME['.js'], body: game, gz: gzipSync(game) });
  return files;
}

export function createApp({ store = makeStore() } = {}) {
  const files = loadStatic(ROOT);
  const lastPost = new Map(); // 주소 -> 마지막 등록 시각
  const rooms = new Rooms();
  const started = Date.now();

  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ ok: true, rooms: rooms.size, uptime: Math.round((Date.now() - started) / 1000) }));
      return;
    }
    if (url.pathname === '/api/scores') {
      if (req.method === 'GET') {
        const map = url.searchParams.get('map');
        if (!MAP_IDS.includes(map)) return json(res, 400, { error: 'bad_map' });
        store.top(map).then((scores) => json(res, 200, { scores }), () => json(res, 503, { error: 'store' }));
        return;
      }
      if (req.method === 'POST') {
        const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress).split(',')[0].trim();
        const now = Date.now();
        if (now - (lastPost.get(ip) ?? 0) < POST_GAP) return json(res, 429, { error: 'too_fast' });
        let body = '';
        req.on('data', (c) => {
          body += c;
          if (body.length > 1024) req.destroy();
        });
        req.on('end', () => {
          let score = null;
          try {
            score = cleanScore(JSON.parse(body), MAP_IDS);
          } catch {}
          if (!score) return json(res, 400, { error: 'bad_score' });
          lastPost.set(ip, now);
          if (lastPost.size > 5000) lastPost.clear();
          store.add(score).then((rank) => json(res, 200, { ok: true, rank }), () => json(res, 503, { error: 'store' }));
        });
        return;
      }
      res.writeHead(405, { allow: 'GET, POST' });
      res.end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' });
      res.end();
      return;
    }
    const f = files.get(url.pathname === '/' ? '/index.html' : url.pathname);
    if (!f) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('찾을 수 없음');
      return;
    }
    const gz = f.gz && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
    res.writeHead(200, {
      'content-type': f.type,
      // 배포 직후 새 버전이 바로 보이도록 재검증을 요구합니다.
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      vary: 'accept-encoding',
      ...(gz ? { 'content-encoding': 'gzip' } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : gz ? f.gz : f.body);
  });

  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: MAX_MSG });
  const sockets = new Map(); // id -> ws

  function send(ws, msg) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  }
  function broadcast(code, fromId, msg) {
    for (const id of rooms.peers(code, fromId)) {
      const peer = sockets.get(id);
      if (peer) send(peer, msg);
    }
  }

  wss.on('connection', (ws) => {
    let me = null; // { code, id }
    let windowStart = 0;
    let sent = 0;
    ws.isAlive = true;
    ws.on('pong', () => (ws.isAlive = true));

    ws.on('message', (data) => {
      let msg;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;

      if (msg.t === 'join' && !me) {
        const r = rooms.join(msg.room, msg.name);
        if (!r.ok) return send(ws, { t: 'error', reason: r.reason });
        me = { code: r.code, id: r.id };
        sockets.set(r.id, ws);
        send(ws, { t: 'joined', id: r.id, room: r.code, players: r.players, host: rooms.host(r.code) });
        broadcast(r.code, r.id, { t: 'peer_join', player: r.players.find((p) => p.id === r.id) });
        return;
      }
      if (msg.t === 'state' && me) {
        // 초당 RELAY_HZ건까지만 중계합니다.
        const now = Date.now();
        if (now - windowStart >= 1000) {
          windowStart = now;
          sent = 0;
        }
        if (++sent > RELAY_HZ) return;
        broadcast(me.code, me.id, { t: 'state', id: me.id, s: msg.s });
      }
    });

    ws.on('close', () => {
      if (!me) return;
      sockets.delete(me.id);
      rooms.leave(me.code, me.id);
      broadcast(me.code, me.id, { t: 'peer_leave', id: me.id, host: rooms.host(me.code) });
    });
  });

  // 응답 없는 연결 정리
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);
  server.on('close', () => clearInterval(heartbeat));

  return { server, rooms, wss };
}

// 직접 실행한 경우에만 포트를 엽니다(테스트에서는 createApp만 사용).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 8080;
  const { server, wss } = createApp();
  server.listen(port, '0.0.0.0', () => console.log(`sprinkle-shot 서버 시작: 포트 ${port}`));
  // 배포 교체 시 연결을 닫고 정상 종료합니다.
  for (const sig of ['SIGTERM', 'SIGINT']) {
    process.on(sig, () => {
      for (const ws of wss.clients) ws.close(1001);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 5000).unref();
    });
  }
}
