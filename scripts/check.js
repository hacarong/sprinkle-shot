// 문법 검사: 서버·테스트·스크립트의 JS 파일과 클라이언트 묶음(game.js), 그 외 클라이언트 스크립트를 node --check로 확인합니다.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { bundle, sources } from '../server/bundle.js';

let failed = 0;
let count = 0;

function check(label, args, input) {
  count++;
  const r = spawnSync(process.execPath, ['--check', ...args], { input, encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.error(`✗ ${label}\n${r.stderr}`);
  }
}

function walk(dir, client) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (p !== join('client', 'src')) walk(p, client);
    } else if (e.name.endsWith('.js')) {
      // 클라이언트는 일반 스크립트라서 CommonJS로 해석되도록 표준 입력으로 넘깁니다.
      if (client) check(p, ['--input-type=commonjs', '-'], readFileSync(p, 'utf8'));
      else check(p, [p]);
    }
  }
}

walk('client', true);
for (const d of ['server', 'test', 'scripts']) walk(d, false);
// client/src 파일들은 하나의 함수 안에서 이어지므로 묶음 전체를 검사합니다.
check(`client/src 묶음 (${sources().length}개 파일)`, ['--input-type=commonjs', '-'], bundle());

console.log(`${count}개 대상 검사, 실패 ${failed}개`);
process.exit(failed ? 1 : 0);
