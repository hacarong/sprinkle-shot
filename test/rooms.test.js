import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rooms, MAX_PLAYERS, normalizeCode, cleanName } from '../server/rooms.js';

test('방 코드는 영문 대문자·숫자 4~8자로 정규화', () => {
  assert.equal(normalizeCode(' abcd '), 'ABCD');
  assert.equal(normalizeCode('ab'), null);
  assert.equal(normalizeCode('abc-def'), null);
  assert.equal(normalizeCode(undefined), null);
});

test('이름은 제어 문자와 꺾쇠를 제거하고 16자로 자름', () => {
  assert.equal(cleanName('<b>haron</b>'), 'bharon/b');
  assert.equal(cleanName(''), '플레이어');
  assert.equal(cleanName('a'.repeat(40)).length, 16);
});

test('입장·정원·퇴장', () => {
  const r = new Rooms();
  const ids = [];
  for (let i = 0; i < MAX_PLAYERS; i++) {
    const j = r.join('room1', `p${i}`);
    assert.equal(j.ok, true);
    ids.push(j.id);
  }
  assert.deepEqual(r.join('ROOM1', 'late'), { ok: false, reason: 'full' });
  assert.equal(r.players('ROOM1').length, MAX_PLAYERS);
  assert.equal(r.host('ROOM1'), ids[0]);
  assert.equal(r.host('NONE'), 0);
  assert.deepEqual(r.peers('ROOM1', ids[0]), ids.slice(1));
  assert.equal(r.leave('ROOM1', ids[0]), true);
  assert.equal(r.leave('ROOM1', ids[0]), false);
  assert.equal(r.join('room1', 'late').ok, true);
});

test('마지막 참가자가 나가면 방 삭제', () => {
  const r = new Rooms();
  const j = r.join('SOLO', 'a');
  assert.equal(r.size, 1);
  r.leave('SOLO', j.id);
  assert.equal(r.size, 0);
});

test('잘못된 코드는 입장 거부', () => {
  assert.deepEqual(new Rooms().join('!!', 'a'), { ok: false, reason: 'bad_code' });
});
