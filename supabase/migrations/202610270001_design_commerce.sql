-- Aplicar después de 202610170001_community.sql. Sin pasarela: verificación manual de pago.
begin;
alter table public.designs drop constraint if exists designs_license_check;
alter table public.designs add constraint designs_license_check
 check(license in ('CC BY 4.0','CC BY-SA 4.0','CC0 1.0','Uso personal · ProtoLab v1'));
alter table public.designs add column complexity text not null default 'basic'
 check(complexity in ('basic','intermediate','advanced'));
alter table public.designs add column complexity_notes text not null default '' check(length(complexity_notes)<=2000);
alter table public.designs add column proposed_price integer check(proposed_price between 1 and 1000000);
alter table public.designs add column price integer check(price between 1 and 1000000);
alter table public.designs add column commercial_consent boolean not null default false;
alter table public.designs add column sales_agreement text not null default '' check(length(sales_agreement)<=2000);
alter table public.designs add column commercial_reviewed boolean not null default false;
-- No convertir licencias previas ni inventar consentimiento/precio de sus autores.
update public.designs set status='pending', review_note='Nueva modalidad comercial: requiere propuesta de precio, autorización del creador y acuerdo comercial.'
 where status='approved';
alter table public.designs add constraint design_sale_approval check(
 status<>'approved' or (price is not null and commercial_consent and commercial_reviewed
 and license='Uso personal · ProtoLab v1' and length(trim(sales_agreement))>=20
 and length(trim(complexity_notes))>=20));

-- El acuerdo del creador no forma parte de la lectura pública.
revoke select on public.designs from anon,authenticated;
grant select(id,owner_id,author_name,title,description,category,material,license,file_path,image_path,status,created_at,complexity,complexity_notes,price) on public.designs to anon,authenticated;
grant insert(complexity,complexity_notes,proposed_price,commercial_consent,sales_agreement) on public.designs to authenticated;
grant update(complexity,price,commercial_reviewed) on public.designs to authenticated;
drop policy design_submit on public.designs;
create policy design_submit on public.designs for insert to authenticated with check(
 owner_id=auth.uid() and status='pending' and price is null and not commercial_reviewed
 and commercial_consent and proposed_price is not null and license='Uso personal · ProtoLab v1'
 and length(trim(complexity_notes))>=20 and length(trim(sales_agreement))>=20
 and author_name=(select display_name from public.profiles where id=auth.uid())
 and exists(select 1 from public.upload_tickets where owner_id=auth.uid() and path=file_path and kind='design')
 and exists(select 1 from public.upload_tickets where owner_id=auth.uid() and path=image_path and kind='preview'));

create table public.design_purchases (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id),
 design_id uuid not null references public.designs(id),
 design_title text not null,
 amount integer not null check(amount between 1 and 1000000),
 currency text not null default 'HNL' check(currency='HNL'),
 license text not null,
 status text not null default 'pending' check(status in ('pending','paid','revoked')),
 payment_reference text unique,
 verified_by uuid references public.profiles(id),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 unique(owner_id,design_id),
 check(status='pending' or (payment_reference is not null and verified_by is not null and verified_at is not null))
);
create table public.purchase_events (
 id uuid primary key default gen_random_uuid(),
 purchase_id uuid not null references public.design_purchases(id),
 actor_id uuid not null references public.profiles(id),
 status text not null check(status in ('paid','revoked')),
 reference text not null, created_at timestamptz not null default now()
);
alter table public.design_purchases enable row level security;
alter table public.purchase_events enable row level security;
revoke all on public.design_purchases,public.purchase_events from anon,authenticated;
grant all on public.design_purchases,public.purchase_events to service_role;
grant select on public.design_purchases to authenticated;
create policy purchase_own on public.design_purchases for select to authenticated
 using(owner_id=auth.uid() or public.is_protolab_admin());
-- Sin INSERT/UPDATE desde REST: precios y estados se escriben solo mediante estas funciones.
create function public.request_design_purchase(p_design_id uuid) returns public.design_purchases
language plpgsql security definer set search_path=public as $$
declare member_id uuid:=auth.uid(); d public.designs; p public.design_purchases;
begin
 if member_id is null then raise exception 'Authentication required'; end if;
 perform 1 from public.profiles where id=member_id for update;
 select * into d from public.designs where id=p_design_id and status='approved' for share;
 if not found then raise exception 'Design unavailable'; end if;
 if d.owner_id=member_id then raise exception 'Own design'; end if;
 select * into p from public.design_purchases where owner_id=member_id and design_id=p_design_id;
 if found then return p; end if;
 if (select count(*) from public.design_purchases where owner_id=member_id and created_at>now()-interval '24 hours')>=20
 then raise exception 'Daily submission limit reached'; end if;
 insert into public.design_purchases(owner_id,design_id,design_title,amount,license)
 values(member_id,d.id,d.title,d.price,d.license) returning * into p;
 return p;
end $$;
revoke all on function public.request_design_purchase(uuid) from public;
grant execute on function public.request_design_purchase(uuid) to authenticated;

create function public.review_design_purchase(p_id uuid,p_status text,p_reference text)
returns void language plpgsql security definer set search_path=public as $$
declare p public.design_purchases;
begin
 if not public.is_protolab_admin() then raise exception 'Admin required'; end if;
 if p_status not in ('paid','revoked') or length(trim(p_reference)) not between 5 and 200
 then raise exception 'Invalid payment review'; end if;
 select * into p from public.design_purchases where id=p_id for update;
 if not found then raise exception 'Purchase unavailable'; end if;
 -- Idempotencia: un segundo envío de la misma confirmación no genera otra operación.
 if p.status=p_status and p.payment_reference=trim(p_reference) then return; end if;
 if (p_status='paid' and p.status<>'pending') or (p_status='revoked' and p.status<>'paid')
 then raise exception 'Invalid payment transition'; end if;
 if p_status='paid' and not exists(select 1 from public.designs where id=p.design_id and status='approved')
 then raise exception 'Design unavailable'; end if;
 update public.design_purchases set status=p_status,
 payment_reference=case when p_status='paid' then trim(p_reference) else payment_reference end,
 verified_by=auth.uid(),verified_at=now() where id=p_id;
 insert into public.purchase_events(purchase_id,actor_id,status,reference)
 values(p_id,auth.uid(),p_status,trim(p_reference));
end $$;
revoke all on function public.review_design_purchase(uuid,text,text) from public;
grant execute on function public.review_design_purchase(uuid,text,text) to authenticated;
create index purchase_member_status on public.design_purchases(owner_id,status);
commit;
