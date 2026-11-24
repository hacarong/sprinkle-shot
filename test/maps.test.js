import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// maps.js는 브라우저용 일반 스크립트라서 함수로 감싸 읽습니다.
const src = readFileSync(new URL('../client/maps.js', import.meta.url), 'utf8');
const MAPS = new Function(`${src}; return MAPS;`)();
const DIR = { '>': [1, 0], '<': [-1, 0], '^': [0, -1], v: [0, 1] };

test('맵 3종 이상, id 중복 없음', () => {
  assert.ok(MAPS.length >= 3);
  assert.equal(new Set(MAPS.map((m) => m.id)).size, MAPS.length);
});

for (const m of MAPS) {
  const at = (x, z) => (m.grid[z] && m.grid[z][x]) || '#';

  test(`${m.id}: 격자는 직사각형이고 벽으로 둘러싸임`, () => {
    const w = m.grid[0].length;
    for (const row of m.grid) {
      assert.equal(row.length, w);
      assert.match(row, /^#[#.U<>^v]*#$/);
    }
    assert.match(m.grid[0], /^#+$/);
    assert.match(m.grid.at(-1), /^#+$/);
  });

  test(`${m.id}: 경사로는 2칸이고 아래는 1층, 위는 2층으로 이어짐`, () => {
    m.grid.forEach((row, z) =>
      [...row].forEach((t, x) => {
        const d = DIR[t];
        if (!d) return;
        const prev = at(x - d[0], z - d[1]);
        const next = at(x + d[0], z + d[1]);
        if (prev === t) assert.equal(next, 'U', `상단 (${x},${z})`);
        else {
          assert.equal(next, t, `하단 (${x},${z})`);
          assert.ok(prev === '.' || prev === 'U', `진입 (${x},${z})`);
        }
      }),
    );
  });

  test(`${m.id}: 상자·방벽·스폰·패드·문·시작 위치가 유효한 칸`, () => {
    for (const [x, z, qx, qz, h, b] of m.crates) {
      const t = at(x, z);
      assert.ok(t === '.' || t === 'U', `상자 (${x},${z})`);
      if (b) assert.equal(t, 'U', `2층 상자 (${x},${z})`);
      assert.ok(Math.abs(qx) === 1 && Math.abs(qz) === 1 && h > 0);
    }
    for (const [x, z, ax] of m.bars) {
      assert.equal(at(x, z), '.', `방벽 (${x},${z})`);
      assert.equal(ax === 'x' ? at(x + 1, z) : at(x, z + 1), '.', `방벽 이웃 (${x},${z})`);
    }
    for (const [x, z, y] of m.spawn) assert.equal(at(x, z), y ? 'U' : '.', `스폰 (${x},${z})`);
    for (const [x, z] of m.pads) assert.equal(at(x, z), '.', `패드 (${x},${z})`);
    for (const pair of m.ports) for (const [x, z] of pair) assert.equal(at(x, z), '.', `문 (${x},${z})`);
    assert.equal(at(...m.start), '.');
    assert.ok(m.spawn.filter((s) => !s[2]).length >= 6, '1층 스폰 6곳 이상');
  });

  test(`${m.id}: 1층 스폰이 모두 시작 위치와 연결됨`, () => {
    const seen = new Set([m.start.join()]);
    const q = [m.start];
    while (q.length) {
      const [x, z] = q.pop();
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = [x + dx, z + dz];
        const t = at(...k);
        if ((t === '.' || t === 'U') && !seen.has(k.join())) {
          seen.add(k.join());
          q.push(k);
        }
      }
    }
    for (const [x, z, y] of m.spawn) if (!y) assert.ok(seen.has([x, z].join()), `고립된 스폰 (${x},${z})`);
  });
}
