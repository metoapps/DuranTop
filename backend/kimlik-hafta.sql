-- Private identities; accessible only to the server's service role.
create table if not exists public.dt_identity_accounts (
 player text primary key check(player in ('meto','lort','fero','latte','josh')),
 id uuid not null unique default gen_random_uuid(), salt text not null, credential_hash text not null,
 attempts integer not null default 0, attempt_window timestamptz not null default now()
);
create table if not exists public.dt_identity_sessions (
 token_hash text primary key check(length(token_hash)=64),
 player text not null references public.dt_identity_accounts(player) on delete cascade,
 expires_at timestamptz not null default now()+interval '90 days', created_at timestamptz not null default now()
);
create index if not exists dt_identity_sessions_player_idx on public.dt_identity_sessions(player);
alter table public.dt_identity_accounts enable row level security;
alter table public.dt_identity_sessions enable row level security;
revoke all on public.dt_identity_accounts,public.dt_identity_sessions from public,anon,authenticated;
grant all on public.dt_identity_accounts,public.dt_identity_sessions to service_role;

-- Atomic attempt budget; a failed password cannot roll back the attempt counter.
create or replace function public.dt_identity_attempt(p_player text) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare a public.dt_identity_accounts%rowtype;
begin
 select * into a from public.dt_identity_accounts where player=p_player for update;
 if not found then return jsonb_build_object('allowed',false); end if;
 if a.attempt_window<now()-interval '15 minutes' then
  update public.dt_identity_accounts set attempts=0,attempt_window=now() where player=p_player returning * into a;
 end if;
 if a.attempts>=16 then return jsonb_build_object('allowed',false); end if;
 update public.dt_identity_accounts set attempts=attempts+1 where player=p_player;
 return jsonb_build_object('allowed',true,'id',a.id,'player',a.player,'salt',a.salt,'credential_hash',a.credential_hash);
end;$$;
revoke all on function public.dt_identity_attempt(text) from public,anon,authenticated;
grant execute on function public.dt_identity_attempt(text) to service_role;

alter table public.dt_live_rooms add column if not exists week_start date;
create unique index if not exists dt_live_rooms_week_idx on public.dt_live_rooms(week_start) where week_start is not null;
alter table public.dt_live_players drop constraint if exists dt_live_players_idx_check;
alter table public.dt_live_players add constraint dt_live_players_idx_check check(idx between 0 and 10);

-- Exactly one official room per Istanbul calendar week, shared by all five identities.
create or replace function public.dt_weekly_room(p_code text,p_creator_hash text) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare w date:=date_trunc('week',timezone('Europe/Istanbul',now()))::date; r public.dt_live_rooms%rowtype;
begin
 perform pg_advisory_xact_lock(hashtext('dt_weekly_room'));
 select * into r from public.dt_live_rooms where week_start=w;
 if not found then
  insert into public.dt_live_rooms(code,creator_hash,version,week_start,expires_at)
  values(p_code,p_creator_hash,8,w,((w+7)::timestamp at time zone 'Europe/Istanbul')) returning * into r;
 end if;
 return to_jsonb(r);
end;$$;
revoke all on function public.dt_weekly_room(text,text) from public,anon,authenticated;
grant execute on function public.dt_weekly_room(text,text) to service_role;

-- Keep the save operation authoritative and idempotent, including the weekly deadline.
create or replace function public.dt_live_save_shot(p_room uuid,p_player text,p_hash text,p_idx integer,p_entry jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.dt_live_players%rowtype; w date;
begin
 select week_start into w from public.dt_live_rooms where id=p_room;
 if w is not null and w<>date_trunc('week',timezone('Europe/Istanbul',now()))::date then raise exception 'WEEK_ENDED'; end if;
 select * into r from public.dt_live_players where room_id=p_room and player=p_player and token_hash=p_hash for update;
 if not found then raise exception 'PLAYER_AUTH'; end if;
 if p_idx<r.idx then return jsonb_build_object('idx',r.idx,'entries',r.entries,'entry',r.entries->p_idx); end if;
 if p_idx<>r.idx or r.idx>=10 then raise exception 'SHOT_ORDER'; end if;
 update public.dt_live_players set idx=idx+1,entries=entries||jsonb_build_array(p_entry),updated_at=now() where room_id=p_room and player=p_player returning * into r;
 return jsonb_build_object('idx',r.idx,'entries',r.entries,'entry',p_entry);
end;$$;
revoke all on function public.dt_live_save_shot(uuid,text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.dt_live_save_shot(uuid,text,text,integer,jsonb) to service_role;

create or replace function public.dt_goal_standings() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from (
  select a.player,count(e) filter(where e->>'gol'='true')::integer as gol,
   coalesce(sum((e->>'puan')::integer),0)::integer as puan,count(e)::integer as vurus
  from public.dt_identity_accounts a left join (
   select p.player,entry as e from public.dt_live_players p join public.dt_live_rooms r on r.id=p.room_id
   cross join lateral jsonb_array_elements(p.entries) entry where r.week_start is not null and r.version=8
  ) goals on goals.player=a.player group by a.player order by gol desc,puan desc,a.player
 ) t;
$$;
revoke all on function public.dt_goal_standings() from public,anon,authenticated;
grant execute on function public.dt_goal_standings() to service_role;
