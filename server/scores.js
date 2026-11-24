// 순위표 저장소. DATABASE_URL이 있으면 PostgreSQL, 없으면 메모리(선택적으로 파일 보존)를 씁니다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const TOP = 20;
const KEEP = 200; // 메모리 저장소가 맵당 보관하는 최대 기록 수

export function cleanScore(raw, mapIds) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
  const wave = Number(raw.wave);
  const kills = Number(raw.kills);
  if (!name || !mapIds.includes(raw.map)) return null;
  if (!Number.isInteger(wave) || wave < 1 || wave > 999) return null;
  if (!Number.isInteger(kills) || kills < 0 || kills > 99999) return null;
  // 웨이브당 처치 수가 비현실적인 기록은 거부합니다(최소한의 검증이며 조작을 막지는 못합니다).
  if (kills > wave * 40 + 40) return null;
  return { name, map: raw.map, wave, kills };
}

function order(a, b) {
  return b.wave - a.wave || b.kills - a.kills || a.at - b.at;
}

export class MemoryStore {
  constructor(dir) {
    this.file = dir ? join(dir, 'scores.json') : null;
    this.data = {};
    if (this.file) {
      try {
        this.data = JSON.parse(readFileSync(this.file, 'utf8'));
      } catch {
        mkdirSync(dir, { recursive: true });
      }
    }
  }
  async add(s) {
    const list = (this.data[s.map] ??= []);
    const row = { name: s.name, wave: s.wave, kills: s.kills, at: Date.now() };
    list.push(row);
    list.sort(order);
    if (list.length > KEEP) list.length = KEEP;
    if (this.file) {
      try {
        writeFileSync(this.file, JSON.stringify(this.data));
      } catch {}
    }
    return list.indexOf(row) + 1; // 보관 범위를 벗어나면 0
  }
  async top(map) {
    return (this.data[map] ?? []).slice(0, TOP);
  }
}

export class PgStore {
  constructor(url) {
    this.url = url;
    this.ready = null;
  }
  init() {
    this.ready ??= (async () => {
      const { default: pg } = await import('pg');
      const pool = new pg.Pool({ connectionString: this.url, max: 4 });
      await pool.query(
        `create table if not exists scores (
           id bigserial primary key, map text not null, name text not null,
           wave int not null, kills int not null, at timestamptz not null default now())`,
      );
      await pool.query('create index if not exists scores_rank on scores (map, wave desc, kills desc, at)');
      return pool;
    })();
    return this.ready;
  }
  async add(s) {
    const pool = await this.init();
    await pool.query('insert into scores (map, name, wave, kills) values ($1, $2, $3, $4)', [s.map, s.name, s.wave, s.kills]);
    const r = await pool.query(
      'select count(*)::int + 1 as rank from scores where map = $1 and (wave > $2 or (wave = $2 and kills > $3))',
      [s.map, s.wave, s.kills],
    );
    return r.rows[0].rank;
  }
  async top(map) {
    const pool = await this.init();
    const r = await pool.query(
      `select name, wave, kills, (extract(epoch from at) * 1000)::bigint as at
         from scores where map = $1 order by wave desc, kills desc, at limit $2`,
      [map, TOP],
    );
    return r.rows.map((x) => ({ ...x, at: Number(x.at) }));
  }
}

export function makeStore(env = process.env) {
  return env.DATABASE_URL ? new PgStore(env.DATABASE_URL) : new MemoryStore(env.DATA_DIR || null);
}
