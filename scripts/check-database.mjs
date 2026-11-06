import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

(async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users(
      id uuid primary key,
      email text,
      email_confirmed_at timestamptz,
      raw_user_meta_data jsonb default '{}'
    );
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.role() returns text language sql stable
      as $$ select current_setting('request.jwt.claim.role', true) $$;
    grant usage on schema auth, public to anon, authenticated, service_role;
    grant execute on all functions in schema auth to anon, authenticated, service_role;
  `);

  const projectRoot = fileURLToPath(new URL('../', import.meta.url));
  const schema = fs.readFileSync(projectRoot + 'supabase/schema.sql', 'utf8')
    .replace('create extension if not exists pgcrypto;', '');
  await db.exec(schema);

  const migrations = [
    'supabase/migrations/20261030_v070.sql',
    'supabase/migrations/20261105_v083_staff_analytics.sql',
    'supabase/migrations/20261106_v094_teacher_approval.sql',
  ];
  for (const migrationPath of migrations) {
    const sql = fs.readFileSync(projectRoot + migrationPath, 'utf8');
    await db.exec(sql);
    await db.exec(sql); // all included migrations must be safe to re-run
  }

  const ids = [
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
  ];
  for (let i = 0; i < 4; i++) {
    await db.query(
      'insert into auth.users(id,email,email_confirmed_at) values($1,$2,$3)',
      [ids[i], `test${i}@example.test`, i === 3 ? null : new Date().toISOString()],
    );
  }
  await db.query("update profiles set role='admin' where id=$1", [ids[2]]);
  await db.exec(`
    grant select,insert,update,delete on all tables in schema public to service_role;
    set role service_role;
    select set_config('request.jwt.claim.role','service_role',false);
  `);

  const teacherArgs = [
    ids[1],
    'Guru uji',
    'Mandiri',
    '',
    'Saya ingin membantu siswa belajar nahwu.',
  ];

  // Legacy direct-activation RPC must no longer be executable by service_role.
  await assert.rejects(
    db.query('select irab_register_teacher($1,$2,$3,$4,$5)', teacherArgs),
    /permission denied/,
  );
  assert.equal(
    (await db.query('select role from profiles where id=$1', [ids[1]])).rows[0].role,
    'student',
  );

  // The server-side application workflow records a pending request without elevating the role.
  await db.query(
    `insert into teacher_applications(full_name,email,institution,experience,motivation,status)
     values($1,'test1@example.test',$2,$3,$4,'pending')`,
    ['Guru uji', 'Mandiri', '', 'Saya ingin membantu siswa belajar nahwu.'],
  );
  assert.equal(
    (await db.query("select status from teacher_applications where lower(email)='test1@example.test'")).rows[0].status,
    'pending',
  );
  await assert.rejects(
    db.query(
      `insert into teacher_applications(full_name,email,institution,experience,motivation,status)
       values('Guru duplikat','TEST1@example.test','Mandiri','','Saya ingin membantu siswa belajar nahwu.','pending')`,
    ),
    /unique|duplicate/i,
  );
  assert.equal(
    (await db.query('select role from profiles where id=$1', [ids[1]])).rows[0].role,
    'student',
  );

  // An unverified account cannot be made a teacher through the deprecated RPC either.
  await assert.rejects(
    db.query('select irab_register_teacher($1,$2,$3,$4,$5)', [ids[3], ...teacherArgs.slice(1)]),
    /permission denied/,
  );
  await assert.rejects(
    db.query('select irab_register_teacher($1,$2,$3,$4,$5)', [ids[2], ...teacherArgs.slice(1)]),
    /permission denied/,
  );

  async function answer(student, event, correct) {
    return (await db.query(
      "select irab_record_answer($1,'v070','v070-0-0',0,$2,$3,$4) r",
      [student, JSON.stringify({ kind: correct ? 'Fi‘il' : 'Isim' }), correct, event],
    )).rows[0].r;
  }
  const event = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  let result = await answer(ids[0], event, true);
  assert.equal(result.attempts, 1);
  assert.equal(result.completed, true);
  result = await answer(ids[0], event, true);
  assert.equal(result.attempts, 1);
  result = await answer(ids[0], 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', false);
  assert.equal(result.attempts, 2);
  assert.equal(result.completed, false);
  assert.equal(result.answer.kind, 'Isim');
  await answer(ids[1], event, true);

  const summary = await db.query(
    "select * from irab_student_summaries($1,'v070')",
    [[ids[0]]],
  );
  assert.equal(Number(summary.rows[0].attempts), 2);
  assert.equal(Number(summary.rows[0].correct_words), 0);

  await db.query(
    "select irab_submit_feedback(null,'guest','hash','Saran fitur','Tolong tambah latihan kosakata.')",
  );
  await assert.rejects(
    db.query("select irab_submit_feedback(null,'guest','hash','Saran fitur','Tolong tambah latihan kosakata.')"),
    /RATE_LIMIT/,
  );

  await db.exec(`
    grant select, update on public.profiles to authenticated;
    reset role;
    set role authenticated;
    select set_config('request.jwt.claim.sub','${ids[0]}',false);
    select set_config('request.jwt.claim.role','authenticated',false);
  `);
  assert.equal((await db.query('select * from irab_word_progress')).rows.length, 1);
  await assert.rejects(
    db.query("update profiles set role='teacher' where id=$1", [ids[0]]),
    /Role changes must be performed by a trusted server invitation workflow/,
  );
  await assert.rejects(
    db.query('select irab_register_teacher($1,$2,$3,$4,$5)', teacherArgs),
    /permission denied/,
  );
  await assert.rejects(db.query('update irab_word_progress set completed=true'), /permission denied/);
  await assert.rejects(db.query('select * from irab_feedback'), /permission denied/);
  await db.exec(`select set_config('request.jwt.claim.sub','${ids[1]}',false);`);
  assert.equal((await db.query('select * from irab_word_progress')).rows.length, 2);
  await db.exec('reset role;set role anon;');
  await assert.rejects(db.query('select * from irab_word_progress'), /permission denied/);

  // The trusted invitation redemption path uses service_role for the role assignment.
  await db.exec(`
    reset role;
    set role service_role;
    select set_config('request.jwt.claim.role','service_role',false);
  `);
  await db.query("update profiles set role='teacher' where id=$1", [ids[1]]);
  assert.equal(
    (await db.query('select role from profiles where id=$1', [ids[1]])).rows[0].role,
    'teacher',
  );

  await db.close();
  console.log('PASS: additive migrations re-run; direct teacher activation is disabled; pending applications do not elevate roles; duplicate active applications are blocked; trusted role assignment, answer persistence/idempotency, summaries, feedback throttling, and RLS permissions behave as expected.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
