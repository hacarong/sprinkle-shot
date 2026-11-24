// 문법 검사: 클라이언트·서버·테스트의 모든 JS 파일을 node --check로 확인합니다.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['client', 'server', 'test', 'scripts'];
let failed = 0;
let count = 0;

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) {
      count++;
      // 클라이언트는 일반 스크립트, 그 외는 ES 모듈입니다. --check는 확장자와 package.json을 따르므로
      // 클라이언트 파일은 CommonJS로 해석되도록 표준 입력으로 넘깁니다.
      const r = dir.startsWith('client')
        ? spawnSync(process.execPath, ['--check', '--input-type=commonjs', '-'], { input: readFileSync(p, 'utf8'), encoding: 'utf8' })
        : spawnSync(process.execPath, ['--check', p], { encoding: 'utf8' });
      if (r.status !== 0) {
        failed++;
        console.error(`✗ ${p}\n${r.stderr}`);
      }
    }
  }
}
for (const r of roots) walk(r);
console.log(`${count}개 파일 검사, 실패 ${failed}개`);
process.exit(failed ? 1 : 0);
