-- ProtoLab: ejecutar una vez en SQL Editor del proyecto Supabase.
-- Los archivos CAD son privados; los permisos se verifican antes de firmar una descarga.
begin;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (length(display_name) between 1 and 60),
 is_admin boolean not null default false
);
create or replace function public.handle_new_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
 insert into public.profiles(id,display_name)
 values(new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Creador'),60))
 on conflict (id) do nothing;
 return new;
end $$;
drop trigger if exists protolab_member_created on auth.users;
create trigger protolab_member_created after insert on auth.users for each row execute function public.handle_new_member();
insert into public.profiles(id,display_name)
select id,left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),'Creador'),60) from auth.users on conflict do nothing;

create or replace function public.is_protolab_admin() returns boolean
language sql stable security definer set search_path = public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and is_admin);
$$;
revoke all on function public.is_protolab_admin() from public;
grant execute on function public.is_protolab_admin() to anon,authenticated;

create table if not exists public.upload_tickets (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete cascade,
 path text unique not null, bucket text not null, kind text not null,
 bytes bigint not null check(bytes > 0 and bytes <= 52428800),
 created_at timestamptz not null default now()
);
create index if not exists upload_owner_time on public.upload_tickets(owner_id,created_at);
create table if not exists public.designs (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id),
 author_name text not null, title text not null check(length(title) between 1 and 100),
 description text not null check(length(description) between 40 and 4000),
 category text not null check(category in ('Organización','Mecánica','Electrónica','Hogar','Arte y accesorios','Educación')),
 material text not null check(material in ('PLA','PETG','ABS','TPU')),
 license text not null check(license in ('CC BY 4.0','CC BY-SA 4.0','CC0 1.0')),
 file_path text not null unique, image_path text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 review_note text, created_at timestamptz not null default now()
);
create index if not exists design_status_time on public.designs(status,created_at desc);
create index if not exists design_owner_status on public.designs(owner_id,status);

create table if not exists public.quotes (
 id uuid primary key default gen_random_uuid(),
 code text unique not null default ('PL-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 owner_id uuid not null references public.profiles(id),
 project text not null check(length(project) between 1 and 120),
 material text not null check(material in ('PLA','PETG','ABS','TPU')),
 quantity integer not null check(quantity between 1 and 1000),
 priority text not null check(priority in ('Normal','Urgente')),
 status_index integer not null default 0 check(status_index between 0 and 6),
 client_name text not null, email text not null, phone text not null, city text not null,
 detail text not null default '', file_path text,
 design_id uuid references public.designs(id), specifications jsonb not null default '{}',
 price numeric check(price > 0), estimated_delivery text,
 created_at timestamptz not null default now()
);
create index if not exists quote_owner_time on public.quotes(owner_id,created_at desc);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id),
 name text not null, email text not null,
 message text not null check(length(message) between 20 and 4000),
 kind text not null check(kind in ('contact','advice')),
 file_path text, created_at timestamptz not null default now()
);

create or replace function public.limit_member_submissions() returns trigger
language plpgsql security definer set search_path = public as $$
declare daily_count integer; daily_limit integer;
begin
 perform 1 from public.profiles where id=new.owner_id for update;
 daily_limit := case tg_table_name when 'designs' then 10 when 'quotes' then 30 else 20 end;
 execute format('select count(*) from public.%I where owner_id=$1 and created_at>now()-interval ''24 hours''',tg_table_name)
 into daily_count using new.owner_id;
 if daily_count >= daily_limit then raise exception 'Daily submission limit reached'; end if;
 return new;
end $$;
revoke all on function public.limit_member_submissions() from public;
drop trigger if exists protolab_submission_limit on public.designs;
create trigger protolab_submission_limit before insert on public.designs for each row execute function public.limit_member_submissions();
drop trigger if exists protolab_submission_limit on public.quotes;
create trigger protolab_submission_limit before insert on public.quotes for each row execute function public.limit_member_submissions();
drop trigger if exists protolab_submission_limit on public.messages;
create trigger protolab_submission_limit before insert on public.messages for each row execute function public.limit_member_submissions();
alter table public.profiles enable row level security;
alter table public.upload_tickets enable row level security;
alter table public.designs enable row level security;
alter table public.quotes enable row level security;
alter table public.messages enable row level security;
revoke all on public.profiles,public.upload_tickets,public.designs,public.quotes,public.messages from anon,authenticated;
grant all on public.profiles,public.upload_tickets,public.designs,public.quotes,public.messages to service_role;
grant select on public.profiles,public.upload_tickets to authenticated;
grant select on public.designs to anon,authenticated;
grant insert(owner_id,author_name,title,description,category,material,license,file_path,image_path) on public.designs to authenticated;
grant update(status,review_note) on public.designs to authenticated;
grant select on public.quotes,public.messages to authenticated;
grant insert(owner_id,project,material,quantity,priority,client_name,email,phone,city,detail,file_path,design_id,specifications) on public.quotes to authenticated;
grant update(status_index,price,estimated_delivery) on public.quotes to authenticated;
grant insert(owner_id,name,email,message,kind,file_path) on public.messages to authenticated;

drop policy if exists profile_own on public.profiles;
create policy profile_own on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists tickets_own on public.upload_tickets;
create policy tickets_own on public.upload_tickets for select to authenticated using(owner_id=auth.uid());

drop policy if exists design_read on public.designs;
create policy design_read on public.designs for select using(
 status='approved' or owner_id=auth.uid() or (auth.role()='authenticated' and public.is_protolab_admin())
);
drop policy if exists design_submit on public.designs;
create policy design_submit on public.designs for insert to authenticated with check(
 owner_id=auth.uid() and status='pending'
 and author_name=(select display_name from public.profiles where id=auth.uid())
 and exists(select 1 from public.upload_tickets where owner_id=auth.uid() and path=file_path and kind='design')
 and exists(select 1 from public.upload_tickets where owner_id=auth.uid() and path=image_path and kind='preview')
);
drop policy if exists design_review on public.designs;
create policy design_review on public.designs for update to authenticated
 using(public.is_protolab_admin()) with check(public.is_protolab_admin());
drop policy if exists quote_read on public.quotes;
create policy quote_read on public.quotes for select to authenticated using(owner_id=auth.uid() or public.is_protolab_admin());
drop policy if exists quote_submit on public.quotes;
create policy quote_submit on public.quotes for insert to authenticated with check(
 owner_id=auth.uid() and status_index=0 and price is null and estimated_delivery is null
 and (file_path is null or exists(select 1 from public.upload_tickets where owner_id=auth.uid() and path=file_path and kind='quote'))
 and (design_id is null or exists(select 1 from public.designs where id=design_id and status='approved'))
);
drop policy if exists quote_manage on public.quotes;
create policy quote_manage on public.quotes for update to authenticated using(public.is_protolab_admin()) with check(public.is_protolab_admin());
drop policy if exists message_read on public.messages;
create policy message_read on public.messages for select to authenticated using(owner_id=auth.uid() or public.is_protolab_admin());
drop policy if exists message_submit on public.messages;
create policy message_submit on public.messages for insert to authenticated with check(
 owner_id=auth.uid()
 and (file_path is null or exists(select 1 from public.upload_tickets where owner_id=auth.uid() and path=file_path and kind='quote'))
);

create or replace function public.reserve_upload(p_kind text,p_extension text,p_bytes bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
 member_id uuid := auth.uid();
 object_path text;
 target_bucket text;
begin
 if member_id is null then raise exception 'Authentication required'; end if;
 -- Serializa reservas del mismo usuario para que las peticiones concurrentes no excedan la cuota.
 perform 1 from public.profiles where id=member_id for update;
 if p_kind not in ('design','preview','quote') or p_bytes < 1 or p_bytes > 52428800 then raise exception 'Invalid upload'; end if;
 if p_kind='preview' and (p_bytes>5242880 or p_extension not in ('jpg','jpeg','png','webp')) then raise exception 'Invalid preview'; end if;
 if p_kind='design' and p_extension not in ('stl','obj','3mf','step','stp') then raise exception 'Invalid design'; end if;
 if p_kind='quote' and p_extension not in ('stl','obj','3mf','step','stp','jpg','jpeg','png','webp','pdf','dxf','dwg') then raise exception 'Invalid attachment'; end if;
 if (select count(*) from public.upload_tickets where owner_id=member_id and created_at>now()-interval '24 hours') >= 20
 or coalesce((select sum(bytes) from public.upload_tickets where owner_id=member_id and created_at>now()-interval '24 hours'),0)+p_bytes>104857600
 then raise exception 'Daily upload limit reached'; end if;
 target_bucket := case p_kind when 'preview' then 'design-previews' when 'design' then 'design-files' else 'quote-files' end;
 object_path := member_id::text||'/'||gen_random_uuid()::text||'.'||p_extension;
 insert into public.upload_tickets(owner_id,path,bucket,kind,bytes) values(member_id,object_path,target_bucket,p_kind,p_bytes);
 return jsonb_build_object('path',object_path,'bucket',target_bucket);
end $$;
revoke all on function public.reserve_upload(text,text,bigint) from public;
grant execute on function public.reserve_upload(text,text,bigint) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit)
values ('design-files','design-files',false,52428800),('quote-files','quote-files',false,52428800)
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('design-previews','design-previews',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- No se conceden políticas de lectura/descarga a los buckets privados.
-- Cargas y descargas utilizan URLs firmadas creadas únicamente en el servidor.
commit;
