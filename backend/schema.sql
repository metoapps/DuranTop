create table if not exists public.dt_live_rooms (
 id uuid primary key default gen_random_uuid(), code text not null unique check(code ~ '^[A-F0-9]{6}$'),
 creator_hash text not null, version integer not null default 1,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '7 days'
);
create table if not exists public.dt_live_players (
 room_id uuid not null references public.dt_live_rooms(id) on delete cascade,
 player text not null check(player in ('meto','lort','fero','latte','josh')), token_hash text not null,
 idx integer not null default 0 check(idx between 0 and 5), entries jsonb not null default '[]',
 updated_at timestamptz not null default now(), primary key(room_id,player), unique(room_id,token_hash)
);
alter table public.dt_live_rooms enable row level security;
alter table public.dt_live_players enable row level security;
revoke all on public.dt_live_rooms, public.dt_live_players from anon,authenticated;
grant all on public.dt_live_rooms, public.dt_live_players to service_role;
create index if not exists dt_live_rooms_creator_idx on public.dt_live_rooms(creator_hash,created_at);
create or replace function public.dt_live_save_shot(p_room uuid,p_player text,p_hash text,p_idx integer,p_entry jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.dt_live_players%rowtype;
begin
 select * into r from public.dt_live_players where room_id=p_room and player=p_player and token_hash=p_hash for update;
 if not found then raise exception 'PLAYER_AUTH'; end if;
 if p_idx<r.idx then return jsonb_build_object('idx',r.idx,'entries',r.entries,'entry',r.entries->p_idx); end if;
 if p_idx<>r.idx or r.idx>=5 then raise exception 'SHOT_ORDER'; end if;
 update public.dt_live_players set idx=idx+1,entries=entries||jsonb_build_array(p_entry),updated_at=now() where room_id=p_room and player=p_player returning * into r;
 return jsonb_build_object('idx',r.idx,'entries',r.entries,'entry',p_entry);
end; $$;
revoke all on function public.dt_live_save_shot(uuid,text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.dt_live_save_shot(uuid,text,text,integer,jsonb) to service_role;

-- Atomik oda oluşturma (20261004b): sayım ve ekleme tek işlemde, tüm odalar için tek sıra (advisory lock).
-- Önceden sayım ve ekleme ayrı isteklerdi; eşzamanlı istekler günlük sınırı aşabiliyordu.
create or replace function public.dt_live_create_room(p_code text,p_creator_hash text,p_version integer,p_token_limit integer,p_global_limit integer)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.dt_live_rooms%rowtype; since timestamptz:=now()-interval '24 hours';
begin
 perform pg_advisory_xact_lock(hashtext('dt_live_create_room'));
 if (select count(*) from public.dt_live_rooms where creator_hash=p_creator_hash and created_at>=since)>=p_token_limit
    or (select count(*) from public.dt_live_rooms where created_at>=since)>=p_global_limit then
  raise exception 'ROOM_LIMIT';
 end if;
 insert into public.dt_live_rooms(code,creator_hash,version) values(p_code,p_creator_hash,p_version) returning * into r;
 return to_jsonb(r);
end; $$;
revoke all on function public.dt_live_create_room(text,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.dt_live_create_room(text,text,integer,integer,integer) to service_role;
