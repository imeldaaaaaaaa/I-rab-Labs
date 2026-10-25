-- Bedah I'rab v0.3 — Supabase/PostgreSQL schema.
-- Run in Supabase SQL Editor after reviewing. Keep service-role keys server-only.

create extension if not exists pgcrypto;
do $$ begin
  create type public.app_role as enum ('student', 'teacher', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_number integer not null,
  sequence_number integer not null unique,
  title text not null,
  description text not null default '',
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  sequence_number integer not null,
  title text not null,
  sentence text not null,
  translation text not null default '',
  payload jsonb not null,
  published boolean not null default false,
  reviewed_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (lesson_id, sequence_number)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  correct_count integer not null default 0 check (correct_count >= 0),
  total_count integer not null default 0 check (total_count >= 0),
  score numeric(5,2) not null default 0 check (score >= 0 and score <= 100),
  completed_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  best_score numeric(5,2) not null default 0 check (best_score >= 0 and best_score <= 100),
  attempts integer not null default 0 check (attempts >= 0),
  unlocked boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

-- Public teacher applications are written/read only through trusted server routes.
create table if not exists public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  institution text not null,
  experience text not null default '',
  motivation text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists teacher_applications_email_idx on public.teacher_applications (lower(email));
create unique index if not exists teacher_applications_one_active_per_email_idx
  on public.teacher_applications (lower(email)) where status in ('pending', 'processing', 'approved');
create index if not exists teacher_applications_status_created_idx on public.teacher_applications (status, created_at desc);

-- Invitation records are managed server-side only. Store a hash, never a raw invite code.
create table if not exists public.role_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_role public.app_role not null check (invited_role in ('teacher', 'admin')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer
set search_path = public
as $$ select role from public.profiles where id = auth.uid() limit 1 $$;

-- Prevent role escalation through a direct profile update. Trusted server routes use service_role.
create or replace function public.prevent_untrusted_role_change()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  if new.role is distinct from old.role and coalesce(auth.role(), '') <> 'service_role' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Role changes must be performed by a trusted server invitation workflow';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
for each row execute procedure public.prevent_untrusted_role_change();

-- A new Auth user always becomes a student. The client cannot choose their role.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.attempts enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.role_invitations enable row level security;
alter table public.teacher_applications enable row level security;
-- Intentionally no client-facing RLS policies for teacher_applications or role_invitations.
-- Public submissions and admin review are routed through server endpoints using service_role.

-- Profiles: users can read/update their own non-role fields; role changes are server-side only.
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles for select to authenticated
using (id = auth.uid() or public.current_app_role() = 'admin');
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_teacher_read_assigned_students on public.profiles;
create policy profiles_teacher_read_assigned_students on public.profiles for select to authenticated
using (public.current_app_role() = 'teacher' and exists (
  select 1 from public.class_members cm join public.classes c on c.id = cm.class_id
  where cm.student_id = profiles.id and c.teacher_id = auth.uid()
));
-- Do not grant authenticated users direct INSERT/DELETE on profiles.

-- Curriculum: published content is readable by guests/authenticated users; only admin manages it.
drop policy if exists lessons_read_published on public.lessons;
create policy lessons_read_published on public.lessons for select to anon, authenticated
using (published = true or public.current_app_role() = 'admin');
drop policy if exists lessons_admin_manage on public.lessons;
create policy lessons_admin_manage on public.lessons for all to authenticated
using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');
drop policy if exists exercises_read_published on public.exercises;
create policy exercises_read_published on public.exercises for select to anon, authenticated
using (published = true or public.current_app_role() = 'admin');
drop policy if exists exercises_admin_manage on public.exercises;
create policy exercises_admin_manage on public.exercises for all to authenticated
using (public.current_app_role() = 'admin') with check (public.current_app_role() = 'admin');

-- Classes: assigned teacher or admin may view/manage; a teacher cannot take over another teacher's class.
drop policy if exists classes_teacher_admin_read on public.classes;
create policy classes_teacher_admin_read on public.classes for select to authenticated
using (teacher_id = auth.uid() or public.current_app_role() = 'admin');
drop policy if exists classes_admin_or_owner_manage on public.classes;
create policy classes_admin_or_owner_manage on public.classes for all to authenticated
using ((teacher_id = auth.uid() and public.current_app_role() = 'teacher') or public.current_app_role() = 'admin')
with check ((teacher_id = auth.uid() and public.current_app_role() = 'teacher') or public.current_app_role() = 'admin');
drop policy if exists class_members_read_related on public.class_members;
create policy class_members_read_related on public.class_members for select to authenticated
using (student_id = auth.uid() or exists (select 1 from public.classes c where c.id = class_id and (c.teacher_id = auth.uid() or public.current_app_role() = 'admin')));
drop policy if exists class_members_admin_teacher_manage on public.class_members;
create policy class_members_admin_teacher_manage on public.class_members for all to authenticated
using (exists (select 1 from public.classes c where c.id = class_id and ((c.teacher_id = auth.uid() and public.current_app_role() = 'teacher') or public.current_app_role() = 'admin')))
with check (exists (select 1 from public.classes c where c.id = class_id and ((c.teacher_id = auth.uid() and public.current_app_role() = 'teacher') or public.current_app_role() = 'admin')));

-- Attempts and progress: students see/write only their own records; teachers see records from their classes; admin can audit all.
-- No direct client INSERT/UPDATE policy for attempts: score and answer keys must be validated server-side.
drop policy if exists attempts_read_owner_teacher_admin on public.attempts;
create policy attempts_read_owner_teacher_admin on public.attempts for select to authenticated
using (student_id = auth.uid() or public.current_app_role() = 'admin' or exists (
 select 1 from public.class_members cm join public.classes c on c.id = cm.class_id
 where cm.student_id = attempts.student_id and c.teacher_id = auth.uid() and public.current_app_role() = 'teacher'
));
drop policy if exists attempts_admin_delete on public.attempts;
create policy attempts_admin_delete on public.attempts for delete to authenticated
using (public.current_app_role() = 'admin');
-- No direct client INSERT/UPDATE policy for progress: unlocks and scores must be computed server-side.
drop policy if exists progress_owner_teacher_admin_read on public.lesson_progress;
create policy progress_owner_teacher_admin_read on public.lesson_progress for select to authenticated
using (student_id = auth.uid() or public.current_app_role() = 'admin' or exists (
 select 1 from public.class_members cm join public.classes c on c.id = cm.class_id
 where cm.student_id = lesson_progress.student_id and c.teacher_id = auth.uid() and public.current_app_role() = 'teacher'
));

-- Invitation table intentionally has NO client policies. Create/redeem invites only in trusted server routes
-- using the service-role key, after verifying the caller is an admin and hashing the one-time token.
-- Likewise, trusted server routes/RPCs must validate answers and calculate score/unlock state before writing attempts/progress.
