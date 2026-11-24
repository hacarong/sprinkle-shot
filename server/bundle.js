// 클라이언트 소스(client/src/*.js)를 파일 이름 순으로 이어 붙여 game.js 하나로 만듭니다.
// 소스들은 하나의 즉시 실행 함수 안에서 변수를 공유하므로, 개별 파일은 단독으로 실행되지 않습니다.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../client/src/', import.meta.url));

export function sources() {
  return readdirSync(SRC).filter((f) => f.endsWith('.js')).sort();
}

export function bundle() {
  return sources().map((f) => readFileSync(SRC + f, 'utf8')).join('');
}
