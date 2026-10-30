-- Irab Labs v0.7.0: additive migration; preserves all existing users and tables.
begin;
create table if not exists public.irab_word_progress (
 student_id uuid not null references public.profiles(id) on delete cascade,
 curriculum_version text not null,
 question_id text not null,
 word_index integer not null check(word_index>=0),
 answer jsonb not null,
 correct boolean not null,
 completed boolean not null default false,
 attempts integer not null default 1 check(attempts>0),
 updated_at timestamptz not null default now(),
 primary key(student_id,curriculum_version,question_id,word_index)
);
create table if not exists public.irab_answer_events (
 student_id uuid not null references public.profiles(id) on delete cascade,
 event_id uuid not null,
 created_at timestamptz not null default now(),
 primary key(student_id,event_id)
);
create table if not exists public.irab_feedback (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references public.profiles(id) on delete set null,
 sender_role text not null check(sender_role in ('guest','student','teacher','admin')),
 sender_hash text not null,
 category text not null check(category in ('Saran fitur','Koreksi materi','Laporan kendala','Lainnya')),
 message text not null check(char_length(message) between 10 and 3000),
 status text not null default 'baru' check(status in ('baru','ditinjau','selesai')),
 created_at timestamptz not null default now()
);
create index if not exists irab_feedback_sender_time on public.irab_feedback(sender_hash,created_at desc);
create index if not exists irab_feedback_time on public.irab_feedback(created_at desc);
alter table public.irab_word_progress enable row level security;
alter table public.irab_answer_events enable row level security;
alter table public.irab_feedback enable row level security;
revoke all on public.irab_word_progress,public.irab_answer_events,public.irab_feedback from anon,authenticated;
grant select on public.irab_word_progress to authenticated;
grant all on public.irab_word_progress,public.irab_answer_events,public.irab_feedback to service_role;
drop policy if exists irab_progress_read on public.irab_word_progress;
create policy irab_progress_read on public.irab_word_progress for select to authenticated
 using(student_id=auth.uid() or public.current_app_role() in ('teacher','admin'));
-- No client writes. Routes verify authenticated role, validate and grade answers.
-- Staff access to student names is served through /api/students; email is not returned.

create or replace function public.irab_register_teacher(p_user uuid,p_name text,p_institution text,p_experience text,p_motivation text)
returns void language plpgsql security definer set search_path=public as $$
declare verified_email text; existing_id uuid; v_app_role public.app_role;
begin
 select email into verified_email from auth.users where id=p_user and email_confirmed_at is not null;
 if verified_email is null then raise exception 'Verified account required'; end if;
 select role into v_app_role from public.profiles where id=p_user for update;
 if v_app_role is null or v_app_role='admin' then raise exception 'Invalid account'; end if;
 if char_length(p_name) not between 2 and 120 or char_length(p_institution) not between 2 and 180 or char_length(p_experience)>1500 or char_length(p_motivation) not between 20 and 2000 then raise exception 'Invalid form'; end if;
 select id into existing_id from public.teacher_applications where lower(email)=lower(verified_email) and status in ('pending','processing','approved') limit 1 for update;
 if existing_id is null then
  insert into public.teacher_applications(full_name,email,institution,experience,motivation,status,reviewed_at)
  values(p_name,lower(verified_email),p_institution,p_experience,p_motivation,'approved',now());
 else
  update public.teacher_applications set full_name=p_name,institution=p_institution,experience=p_experience,motivation=p_motivation,status='approved',reviewed_at=now() where id=existing_id;
 end if;
 update public.profiles set full_name=p_name,role='teacher',updated_at=now() where id=p_user;
end; $$;

create or replace function public.irab_record_answer(p_student uuid,p_version text,p_question text,p_word integer,p_answer jsonb,p_correct boolean,p_event uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare inserted integer; result jsonb;
begin
 -- Retry of the same request must not inflate the attempt count.
 insert into public.irab_answer_events(student_id,event_id) values(p_student,p_event) on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted=1 then
  insert into public.irab_word_progress as wp(student_id,curriculum_version,question_id,word_index,answer,correct,completed)
  values(p_student,p_version,p_question,p_word,p_answer,p_correct,p_correct)
  on conflict(student_id,curriculum_version,question_id,word_index) do update
  set answer=case when wp.completed and not excluded.correct then wp.answer else excluded.answer end,
      correct=wp.correct or excluded.correct,completed=wp.completed or excluded.completed,
      attempts=wp.attempts+1,updated_at=now();
 end if;
 select to_jsonb(wp)-'student_id' into result from public.irab_word_progress wp
 where student_id=p_student and curriculum_version=p_version and question_id=p_question and word_index=p_word;
 if result is null then raise exception 'Event does not belong to this answer'; end if;
 return result;
end; $$;

create or replace function public.irab_student_summaries(p_students uuid[],p_version text)
returns table(student_id uuid,correct_words bigint,attempts bigint,last_active timestamptz)
language sql stable security definer set search_path=public as $$
 select wp.student_id,count(*) filter(where wp.completed),sum(wp.attempts),max(wp.updated_at)
 from public.irab_word_progress wp where wp.student_id=any(p_students) and curriculum_version=p_version group by wp.student_id;
$$;

create or replace function public.irab_submit_feedback(p_user uuid,p_role text,p_hash text,p_category text,p_message text)
returns void language plpgsql security definer set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_hash,0));
 if exists(select 1 from public.irab_feedback where sender_hash=p_hash and created_at>now()-interval '1 minute')
 or (select count(*) from public.irab_feedback where sender_hash=p_hash and created_at>now()-interval '1 hour')>=5 then
  raise exception 'RATE_LIMIT';
 end if;
 insert into public.irab_feedback(user_id,sender_role,sender_hash,category,message) values(p_user,p_role,p_hash,p_category,p_message);
end; $$;
revoke all on function public.irab_register_teacher(uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.irab_record_answer(uuid,text,text,integer,jsonb,boolean,uuid) from public,anon,authenticated;
revoke all on function public.irab_student_summaries(uuid[],text) from public,anon,authenticated;
revoke all on function public.irab_submit_feedback(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.irab_register_teacher(uuid,text,text,text,text) to service_role;
grant execute on function public.irab_record_answer(uuid,text,text,integer,jsonb,boolean,uuid) to service_role;
grant execute on function public.irab_student_summaries(uuid[],text) to service_role;
grant execute on function public.irab_submit_feedback(uuid,text,text,text,text) to service_role;
commit;
