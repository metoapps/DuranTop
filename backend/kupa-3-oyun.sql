-- Kupa: her oyuncu haftada 3 oyun × 10 vuruş = 30 vuruş. (Önceki sınır 10.) Geriye uyumlu: eski sunucu yine 10'da durur.
alter table public.dt_live_players drop constraint if exists dt_live_players_idx_check;
alter table public.dt_live_players add constraint dt_live_players_idx_check check(idx between 0 and 30);
create or replace function public.dt_live_save_shot(p_room uuid,p_player text,p_hash text,p_idx integer,p_entry jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare r public.dt_live_players%rowtype; w date;
begin
 select week_start into w from public.dt_live_rooms where id=p_room;
 if w is not null and w<>date_trunc('week',timezone('Europe/Istanbul',now()))::date then raise exception 'WEEK_ENDED'; end if;
 select * into r from public.dt_live_players where room_id=p_room and player=p_player and token_hash=p_hash for update;
 if not found then raise exception 'PLAYER_AUTH'; end if;
 if p_idx<r.idx then return jsonb_build_object('idx',r.idx,'entries',r.entries,'entry',r.entries->p_idx); end if;
 if p_idx<>r.idx or r.idx>=30 then raise exception 'SHOT_ORDER'; end if;
 update public.dt_live_players set idx=idx+1,entries=entries||jsonb_build_array(p_entry),updated_at=now() where room_id=p_room and player=p_player returning * into r;
 return jsonb_build_object('idx',r.idx,'entries',r.entries,'entry',p_entry);
end;$$;
