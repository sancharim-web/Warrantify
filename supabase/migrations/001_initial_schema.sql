-- ============================================
-- Warrantify — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Warranties table
create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  brand text,
  category text not null check (category in ('Electronics', 'Appliances', 'Furniture', 'Automotive', 'Home & Garden', 'Other')),
  purchase_date date not null,
  warranty_months integer not null check (warranty_months > 0),
  expiry_date date generated always as (purchase_date + (warranty_months * interval '1 month')::interval) stored,
  serial_number text,
  warranty_terms text,
  brand_contact text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.warranties enable row level security;

create policy "Users can view own warranties"
  on public.warranties for select
  using (auth.uid() = user_id);

create policy "Users can insert own warranties"
  on public.warranties for insert
  with check (auth.uid() = user_id);

create policy "Users can update own warranties"
  on public.warranties for update
  using (auth.uid() = user_id);

create policy "Users can delete own warranties"
  on public.warranties for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger warranties_updated_at
  before update on public.warranties
  for each row execute function public.update_updated_at();

-- 3. Documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  warranty_id uuid not null references public.warranties(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_type text not null,
  uploaded_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "Users can view own documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.warranties w
      where w.id = documents.warranty_id and w.user_id = auth.uid()
    )
  );

create policy "Users can insert own documents"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.warranties w
      where w.id = documents.warranty_id and w.user_id = auth.uid()
    )
  );

create policy "Users can delete own documents"
  on public.documents for delete
  using (
    exists (
      select 1 from public.warranties w
      where w.id = documents.warranty_id and w.user_id = auth.uid()
    )
  );

-- 4. Reminders table
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  warranty_id uuid not null references public.warranties(id) on delete cascade,
  type text not null check (type in ('30_day', '7_day')),
  sent_at timestamptz default now()
);

alter table public.reminders enable row level security;

create policy "Users can view own reminders"
  on public.reminders for select
  using (
    exists (
      select 1 from public.warranties w
      where w.id = reminders.warranty_id and w.user_id = auth.uid()
    )
  );

-- 5. Storage bucket for warranty documents
insert into storage.buckets (id, name, public)
values ('warranty-docs', 'warranty-docs', false)
on conflict (id) do nothing;

create policy "Users can upload warranty docs"
  on storage.objects for insert
  with check (
    bucket_id = 'warranty-docs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own warranty docs"
  on storage.objects for select
  using (
    bucket_id = 'warranty-docs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own warranty docs"
  on storage.objects for delete
  using (
    bucket_id = 'warranty-docs' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
