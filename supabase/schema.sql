
create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  kategori text not null,
  marka text not null,
  model text not null,
  alt_model text not null,
  alis_fiyati numeric not null default 0,
  puan numeric not null default 0,
  fayda numeric not null default 0,
  kampanya_maliyeti numeric not null default 0,
  montaj_maliyeti numeric not null default 0,
  net_bedel numeric not null default 0,
  kar numeric not null default 0,
  nakit_satis numeric not null default 0,
  kart_satis numeric not null default 0,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kategori, marka, model, alt_model)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

alter table products enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products"
on products
for select
using (true);
