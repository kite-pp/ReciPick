-- #54 Supabase 테이블·RLS 실환경 확인용 조회 쿼리 (읽기 전용)
-- Supabase Dashboard > SQL Editor에서 실행하고 결과를 이슈에 기록합니다.

-- 1. 사용자 데이터 테이블과 RLS 활성화 여부 (6개 모두 rls_enabled = true 여야 함)
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;

-- 2. 정책 목록 (notification_logs만 SELECT, 나머지는 ALL)
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. 컬럼 구성 (schema.sql과 실제 테이블이 같은지 비교)
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 4. 제약 조건 (PK·FK·UNIQUE)
SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- 5. 인덱스 (user_id 인덱스 유무 확인)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
