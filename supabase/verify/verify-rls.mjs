// #54 계정 간 RLS 차단 검증 스크립트
//
// 준비: Supabase에 테스트 계정 2개(A, B)를 만들고 .env.local에 아래 값을 추가합니다.
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
//   RLS_TEST_A_EMAIL, RLS_TEST_A_PASSWORD, RLS_TEST_B_EMAIL, RLS_TEST_B_PASSWORD
// 실행: node --env-file=.env.local supabase/verify/verify-rls.mjs
//
// A 계정으로 테스트 행을 만들고, B 계정과 비로그인(anon) 상태에서 조회·수정·삭제·대리 생성이
// 막히는지 확인한 뒤 A가 만든 테스트 행을 지웁니다. service role 키는 사용하지 않습니다.
import { createClient } from '@supabase/supabase-js';

const {
  VITE_SUPABASE_URL: url,
  VITE_SUPABASE_ANON_KEY: anonKey,
  RLS_TEST_A_EMAIL,
  RLS_TEST_A_PASSWORD,
  RLS_TEST_B_EMAIL,
  RLS_TEST_B_PASSWORD,
} = process.env;

if (!url || !anonKey || !RLS_TEST_A_EMAIL || !RLS_TEST_B_EMAIL) {
  console.error('환경 변수가 없습니다. 파일 상단의 준비 항목을 확인해 주세요.');
  process.exit(1);
}

// 테스트 값이 기존 데이터와 겹치지 않도록 큰 id를 사용합니다.
const TEST_ID = 900000 + Math.floor(Math.random() * 90000);
const USER_TABLES = [
  { table: 'fridge_items', row: { ingredient_id: TEST_ID } },
  { table: 'favorites', row: { recipe_id: TEST_ID } },
  { table: 'recent_recipes', row: { recipe_id: TEST_ID } },
  { table: 'shopping_items', row: { ingredient_id: TEST_ID } },
];

const results = [];
function record(table, check, passed, detail = '') {
  results.push({ table, check, result: passed ? 'PASS' : 'FAIL', detail });
}

function newClient() {
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

async function signIn(email, password) {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`${email} 로그인 실패: ${error.message}`);
  return { client, userId: data.user.id };
}

const a = await signIn(RLS_TEST_A_EMAIL, RLS_TEST_A_PASSWORD);
const b = await signIn(RLS_TEST_B_EMAIL, RLS_TEST_B_PASSWORD);
const anon = newClient();
const created = [];

// profiles: id가 곧 사용자 id
{
  const { error } = await a.client.from('profiles').upsert({ id: a.userId });
  record('profiles', 'A 본인 프로필 upsert', !error, error?.message);

  const { data: read } = await b.client.from('profiles').select('id').eq('id', a.userId);
  record('profiles', 'B가 A 프로필 조회 차단', read?.length === 0);

  const { data: updated } = await b.client
    .from('profiles')
    .update({ nickname: 'rls-test' })
    .eq('id', a.userId)
    .select();
  record('profiles', 'B가 A 프로필 수정 차단', updated?.length === 0);

  const { data: anonRead } = await anon.from('profiles').select('id').eq('id', a.userId);
  record('profiles', '비로그인 조회 차단', !anonRead?.length);
}

for (const { table, row } of USER_TABLES) {
  const { data: inserted, error: insertError } = await a.client
    .from(table)
    .insert({ ...row, user_id: a.userId })
    .select('id')
    .single();
  record(table, 'A 본인 행 생성', !insertError, insertError?.message);
  if (insertError) continue;
  created.push({ table, id: inserted.id });

  const { data: read } = await b.client.from(table).select('id').eq('id', inserted.id);
  record(table, 'B가 A 행 조회 차단', read?.length === 0);

  const { data: updated } = await b.client
    .from(table)
    .update({ user_id: b.userId })
    .eq('id', inserted.id)
    .select();
  record(table, 'B가 A 행 수정 차단', updated?.length === 0);

  await b.client.from(table).delete().eq('id', inserted.id);
  const { data: stillThere } = await a.client.from(table).select('id').eq('id', inserted.id);
  record(table, 'B가 A 행 삭제 차단', stillThere?.length === 1);

  const { error: spoofError } = await b.client.from(table).insert({ ...row, user_id: a.userId });
  record(table, 'B가 A 명의로 생성 차단', Boolean(spoofError), spoofError?.code);

  const { data: anonRead } = await anon.from(table).select('id').eq('id', inserted.id);
  record(table, '비로그인 조회 차단', !anonRead?.length);
}

// notification_logs: 본인 기록 생성·조회만 허용 (#67 스키마). 테스트 기록은 냉장고 행 삭제 시 CASCADE로 지워짐
{
  const fridgeItem = created.find((item) => item.table === 'fridge_items');
  const log = { fridge_item_id: fridgeItem?.id ?? null, notification_type: 'D-7' };

  const { data: ownLog, error: insertError } = await a.client
    .from('notification_logs')
    .insert({ ...log, user_id: a.userId })
    .select('id')
    .single();
  record('notification_logs', 'A 본인 기록 생성 허용', !insertError, insertError?.message);

  const { data: ownRead } = await a.client
    .from('notification_logs')
    .select('id')
    .eq('id', ownLog?.id ?? -1);
  record('notification_logs', 'A 본인 기록 조회 허용', ownRead?.length === 1);

  const { data: otherRead } = await b.client
    .from('notification_logs')
    .select('id')
    .eq('id', ownLog?.id ?? -1);
  record('notification_logs', 'B가 A 기록 조회 차단', otherRead?.length === 0);

  const { error: spoofError } = await b.client
    .from('notification_logs')
    .insert({ ...log, notification_type: 'D-DAY', user_id: a.userId });
  record('notification_logs', 'B가 A 명의로 기록 생성 차단', Boolean(spoofError), spoofError?.code);
}

for (const { table, id } of created) {
  await a.client.from(table).delete().eq('id', id);
}

console.table(results);
const failed = results.filter((item) => item.result === 'FAIL').length;
console.log(failed === 0 ? '모든 검사를 통과했습니다.' : `${failed}개 검사가 실패했습니다.`);
process.exit(failed === 0 ? 0 : 1);
