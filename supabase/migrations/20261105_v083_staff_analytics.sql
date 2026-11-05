-- I'rab Labs v0.8.3: staff bank analytics and accurate latest-answer status.
-- Safe additive migration; preserves existing progress rows and event idempotency.
begin;

-- Carry forward v0.8.2 progress for unchanged answer keys.
-- Seven word-level keys changed after the nahwu review, so those specific responses must be attempted again.
insert into public.irab_word_progress(
 student_id,curriculum_version,question_id,word_index,answer,correct,completed,attempts,updated_at
)
select student_id,'v083','v083-'||substring(question_id from 6),word_index,answer,correct,completed,attempts,updated_at
from public.irab_word_progress
where curriculum_version='v082'
  and question_id like 'v082-%'
  and not (
   (question_id='v082-1-0' and word_index=0) or
   (question_id='v082-4-2' and word_index=1) or
   (question_id='v082-6-0' and word_index=0) or
   (question_id='v082-6-1' and word_index=0) or
   (question_id='v082-6-2' and word_index=0) or
   (question_id='v082-7-1' and word_index=1) or
   (question_id='v082-8-1' and word_index=1)
  )
on conflict(student_id,curriculum_version,question_id,word_index) do nothing;

create or replace function public.irab_record_answer(
 p_student uuid,p_version text,p_question text,p_word integer,p_answer jsonb,
 p_correct boolean,p_event uuid
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare inserted integer; result jsonb;
begin
 insert into public.irab_answer_events(student_id,event_id)
 values(p_student,p_event) on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted=1 then
  insert into public.irab_word_progress as wp(
   student_id,curriculum_version,question_id,word_index,answer,correct,completed
  ) values(p_student,p_version,p_question,p_word,p_answer,p_correct,p_correct)
  on conflict(student_id,curriculum_version,question_id,word_index) do update
  set answer=excluded.answer,
      correct=excluded.correct,
      completed=excluded.completed,
      attempts=wp.attempts+1,
      updated_at=now();
 end if;
 select to_jsonb(wp)-'student_id' into result
 from public.irab_word_progress wp
 where student_id=p_student and curriculum_version=p_version
   and question_id=p_question and word_index=p_word;
 if result is null then raise exception 'Event does not belong to this answer'; end if;
 return result;
end; $$;

revoke all on function public.irab_record_answer(uuid,text,text,integer,jsonb,boolean,uuid) from public,anon,authenticated;
grant execute on function public.irab_record_answer(uuid,text,text,integer,jsonb,boolean,uuid) to service_role;

commit;
