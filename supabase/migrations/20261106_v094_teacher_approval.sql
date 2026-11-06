-- I'rab Labs v0.9.4
-- Enforce the administrator-approval + one-time invitation workflow for teacher roles.
-- This migration is additive and does not modify existing users, applications, or progress.
begin;

create or replace function public.irab_register_teacher(
  p_user uuid,
  p_name text,
  p_institution text,
  p_experience text,
  p_motivation text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'Direct teacher activation is disabled. Submit a teacher application and wait for administrator approval and an invitation.';
end;
$$;

-- Remove the legacy service-role execution path. Teacher roles are now assigned
-- only by the trusted invitation-redemption endpoint after email ownership checks.
revoke all on function public.irab_register_teacher(uuid, text, text, text, text)
  from public, anon, authenticated, service_role;

comment on function public.irab_register_teacher(uuid, text, text, text, text)
  is 'Deprecated and disabled in v0.9.4. Teacher access requires admin approval and one-time invitation redemption.';

commit;
