// 방 관리(순수 로직). 소켓과 분리해 단위 테스트가 가능합니다.
export const MAX_PLAYERS = 4;
const CODE = /^[A-Z0-9]{4,8}$/;

export function normalizeCode(raw) {
  const code = String(raw ?? '').trim().toUpperCase();
  return CODE.test(code) ? code : null;
}

export function cleanName(raw) {
  const name = String(raw ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
  return name || '플레이어';
}

export class Rooms {
  constructor() {
    this.rooms = new Map(); // code -> Map(id -> { id, name })
    this.nextId = 1;
  }

  get size() {
    return this.rooms.size;
  }

  // 반환: { ok, id, players } 또는 { ok:false, reason }
  join(rawCode, rawName) {
    const code = normalizeCode(rawCode);
    if (!code) return { ok: false, reason: 'bad_code' };
    let room = this.rooms.get(code);
    if (!room) {
      room = new Map();
      this.rooms.set(code, room);
    }
    if (room.size >= MAX_PLAYERS) return { ok: false, reason: 'full' };
    const id = this.nextId++;
    room.set(id, { id, name: cleanName(rawName) });
    return { ok: true, code, id, players: [...room.values()] };
  }

  leave(code, id) {
    const room = this.rooms.get(code);
    if (!room || !room.delete(id)) return false;
    if (room.size === 0) this.rooms.delete(code);
    return true;
  }

  // 같은 방의 다른 참가자 id 목록
  peers(code, id) {
    const room = this.rooms.get(code);
    if (!room) return [];
    return [...room.keys()].filter((k) => k !== id);
  }

  players(code) {
    const room = this.rooms.get(code);
    return room ? [...room.values()] : [];
  }
}
