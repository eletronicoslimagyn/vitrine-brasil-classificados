-- Execute no SQL Editor do Supabase. Não execute repetidamente em projeto já alterado sem revisar.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.listings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 8 and 100),
 description text not null check (char_length(description) between 20 and 3000),
 category text not null check (category in ('carros','motos','caminhoes','pecas','eletronicos','imoveis','casa','servicos','outros')),
 price numeric(12,2) not null check(price>=0 and price<=999999999),
 city text not null check(char_length(city) between 2 and 80),
 state text not null check(state ~ '^[A-Z]{2}$'),
 phone text check(phone is null or phone ~ '^[0-9]{10,15}$'),
 photos text[] not null default '{}',
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
create index if not exists listings_public_recent on public.listings(status,created_at desc);
create index if not exists listings_public_category on public.listings(status,category,created_at desc);
create index if not exists listings_owner on public.listings(user_id,created_at desc);
alter table public.admins enable row level security;
alter table public.listings enable row level security;
create policy "Admins read own status" on public.admins for select to authenticated using(user_id=(select auth.uid()));
create policy "Public sees approved and owners see own" on public.listings for select to anon,authenticated using(status='approved' or user_id=(select auth.uid()) or exists(select 1 from public.admins where user_id=(select auth.uid())));
create policy "Users submit pending listings" on public.listings for insert to authenticated with check(user_id=(select auth.uid()) and status='pending');
create policy "Owners delete own listings" on public.listings for delete to authenticated using(user_id=(select auth.uid()));
create policy "Admins moderate listings" on public.listings for update to authenticated using(exists(select 1 from public.admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.admins where user_id=(select auth.uid())));
-- Public bucket: fotos de anúncios são públicas, mas o envio é autenticado e limitado à pasta do usuário.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('listing-images','listing-images',true,3145728,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=3145728,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "Authenticated users upload in own folder" on storage.objects for insert to authenticated with check(bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Public reads listing photos" on storage.objects for select to public using(bucket_id='listing-images');
create policy "Owners remove photos" on storage.objects for delete to authenticated using(bucket_id='listing-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Para tornar-se administrador: faça cadastro, copie o UUID em Authentication > Users
-- e execute manualmente no SQL Editor, trocando o UUID:
-- insert into public.admins(user_id) values ('SEU-UUID-AQUI');
-- Aprovar um anúncio (no SQL Editor, troque o UUID):
-- update public.listings set status='approved' where id='UUID-DO-ANUNCIO';
