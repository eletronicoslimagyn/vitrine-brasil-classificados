-- ZixLima: execute uma vez no SQL Editor do projeto Supabase correto.
-- Não exclui anúncios existentes. Revise antes de executar.
create table if not exists public.zix_billing_settings (
 id int primary key default 1 check(id=1),charging_enabled boolean not null default false,
 discount_plan text not null default 'todos' check(discount_plan in ('todos','avulso','iniciante','negocio','profissional')),
 discount_percent int not null default 0 check(discount_percent between 0 and 100));
insert into public.zix_billing_settings(id) values(1) on conflict(id) do nothing;
alter table public.zix_billing_settings enable row level security;
drop policy if exists "zix_public_billing_read" on public.zix_billing_settings;
create policy "zix_public_billing_read" on public.zix_billing_settings for select to anon,authenticated using(true);
create table if not exists public.zix_credits (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null check(plan in ('boasvindas','avulso','iniciante','negocio','profissional')),
 remaining int not null check(remaining>=0), expires_at timestamptz not null,
 created_at timestamptz not null default now());
create index if not exists zix_credits_user on public.zix_credits(user_id,expires_at);
alter table public.zix_credits enable row level security;
drop policy if exists "zix_credits_owner_read" on public.zix_credits;
create policy "zix_credits_owner_read" on public.zix_credits for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.admins where user_id=auth.uid()));
alter table public.listings add column if not exists zix_expires_at timestamptz;
alter table public.listings add column if not exists zix_paused_at timestamptz;
alter table public.listings add column if not exists zix_blocked boolean not null default false;
create table if not exists public.zix_audit (
 id bigint generated always as identity primary key,admin_id uuid not null,action text not null,
 listing_id uuid,detail text,created_at timestamptz not null default now());
alter table public.zix_audit enable row level security;
drop policy if exists "zix_audit_admin_read" on public.zix_audit;
create policy "zix_audit_admin_read" on public.zix_audit for select to authenticated using(exists(select 1 from public.admins where user_id=auth.uid()));
create or replace function public.zix_is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;
revoke all on function public.zix_is_admin() from public;
grant execute on function public.zix_is_admin() to authenticated;
create or replace function public.zix_set_billing(p_enabled boolean,p_plan text,p_discount int) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.zix_is_admin() then raise exception 'Sem permissão'; end if;
 if p_plan not in ('todos','avulso','iniciante','negocio','profissional') or p_discount not between 0 and 100 then raise exception 'Parâmetros inválidos'; end if;
 update public.zix_billing_settings set charging_enabled=p_enabled,discount_plan=p_plan,discount_percent=p_discount where id=1;
 insert into public.zix_audit(admin_id,action,detail) values(auth.uid(),'billing',p_enabled::text||'/'||p_plan||'/'||p_discount::text);
end $$;
revoke all on function public.zix_set_billing(boolean,text,int) from public;
grant execute on function public.zix_set_billing(boolean,text,int) to authenticated;
create or replace function public.zix_grant_credits(p_user uuid,p_plan text) returns void language plpgsql security definer set search_path=public as $$
declare n int;d int;
begin
 if not public.zix_is_admin() then raise exception 'Sem permissão'; end if;
 n:=case p_plan when 'boasvindas' then 1 when 'avulso' then 1 when 'iniciante' then 5 when 'negocio' then 15 when 'profissional' then 40 else null end;
 d:=case when p_plan in ('boasvindas','avulso') then 7 else 30 end;
 if n is null then raise exception 'Plano inválido'; end if;
 insert into public.zix_credits(user_id,plan,remaining,expires_at) values(p_user,p_plan,n,now()+make_interval(days=>d));
 insert into public.zix_audit(admin_id,action,detail) values(auth.uid(),'grant',p_user::text||'/'||p_plan);
end $$;
revoke all on function public.zix_grant_credits(uuid,text) from public;
grant execute on function public.zix_grant_credits(uuid,text) to authenticated;
-- Reserva de crédito feita dentro da mesma transação da inserção, com bloqueio de linha.
create or replace function public.zix_before_listing() returns trigger language plpgsql security definer set search_path=public as $$
declare charge boolean; c record;
begin
 select charging_enabled into charge from public.zix_billing_settings where id=1;
 if coalesce(charge,false) then
  select id,plan,expires_at into c from public.zix_credits where user_id=new.user_id and remaining>0 and expires_at>now() order by expires_at,id limit 1 for update;
  if c.id is null then raise exception 'Sem créditos ativos. Solicite um plano ao administrador.'; end if;
  update public.zix_credits set remaining=remaining-1 where id=c.id;
  new.zix_expires_at:=least(c.expires_at,now()+case when c.plan in ('boasvindas','avulso') then interval '7 days' else interval '30 days' end);
 else
  new.zix_expires_at:=now()+interval '30 days';
 end if;
 return new;
end $$;
drop trigger if exists zix_listing_credit on public.listings;
create trigger zix_listing_credit before insert on public.listings for each row execute function public.zix_before_listing();
-- Expiração, pausa e bloqueio também são verificados no RLS de leitura pública.
drop policy if exists "Public sees approved and owners see own" on public.listings;
create policy "Public sees approved and owners see own" on public.listings for select to anon,authenticated using(
 (status='approved' and not zix_blocked and zix_paused_at is null and (zix_expires_at is null or zix_expires_at>now()))
 or user_id=auth.uid() or public.zix_is_admin());
create or replace function public.zix_manage_listing(p_listing uuid,p_action text,p_days int,p_reason text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.zix_is_admin() then raise exception 'Sem permissão'; end if;
 if p_action='extend' then update public.listings set zix_expires_at=greatest(coalesce(zix_expires_at,now()),now())+make_interval(days=>p_days) where id=p_listing;
 elsif p_action='pause' then update public.listings set zix_paused_at=coalesce(zix_paused_at,now()) where id=p_listing;
 elsif p_action='resume' then update public.listings set zix_expires_at=coalesce(zix_expires_at,now())+greatest(interval '0 seconds',now()-zix_paused_at),zix_paused_at=null where id=p_listing;
 elsif p_action='renew' then update public.listings set zix_expires_at=now()+make_interval(days=>p_days),zix_paused_at=null where id=p_listing;
 elsif p_action='block' then update public.listings set zix_blocked=true where id=p_listing;
 elsif p_action='release' then update public.listings set zix_blocked=false where id=p_listing;
 else raise exception 'Ação inválida'; end if;
 insert into public.zix_audit(admin_id,action,listing_id,detail) values(auth.uid(),p_action,p_listing,left(p_reason,200));
end $$;
revoke all on function public.zix_manage_listing(uuid,text,int,text) from public;
grant execute on function public.zix_manage_listing(uuid,text,int,text) to authenticated;
