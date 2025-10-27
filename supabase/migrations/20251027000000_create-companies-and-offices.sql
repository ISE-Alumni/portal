-- Create companies table
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  website text,
  description text,
  logo_url text,
  industry text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create company offices table (one company can have multiple offices)
create table public.company_offices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null, -- e.g., "Dublin Office", "London HQ", "San Francisco Office"
  address text,
  city text not null,
  country text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  is_headquarters boolean default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Add alumni location fields to profiles table
alter table public.profiles add column if not exists current_company_id uuid references public.companies(id) on delete set null;
alter table public.profiles add column if not exists current_office_id uuid references public.company_offices(id) on delete set null;

-- Create indexes for better performance
create index companies_name_idx on public.companies(name);
create index company_offices_company_id_idx on public.company_offices(company_id);
create index company_offices_city_idx on public.company_offices(city);
create index company_offices_country_idx on public.company_offices(country);
create index profiles_current_company_idx on public.profiles(current_company_id);
create index profiles_current_office_idx on public.profiles(current_office_id);
create index profiles_graduation_year_idx on public.profiles(graduation_year);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.company_offices enable row level security;

-- RLS policies for companies table
create policy "Anyone can read companies"
  on public.companies
  for select
  to anon, authenticated
  using (true);

create policy "Admins and Staff can insert companies"
  on public.companies
  for insert
  to authenticated
  with check (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  );

create policy "Admins and Staff can update companies"
  on public.companies
  for update
  to authenticated
  using (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  )
  with check (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  );

create policy "Admins and Staff can delete companies"
  on public.companies
  for delete
  to authenticated
  using (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  );

-- RLS policies for company_offices table
create policy "Anyone can read company offices"
  on public.company_offices
  for select
  to anon, authenticated
  using (true);

create policy "Admins and Staff can insert company offices"
  on public.company_offices
  for insert
  to authenticated
  with check (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  );

create policy "Admins and Staff can update company offices"
  on public.company_offices
  for update
  to authenticated
  using (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  )
  with check (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  );

create policy "Admins and Staff can delete company offices"
  on public.company_offices
  for delete
  to authenticated
  using (
    (select user_type from public.profiles where user_id = auth.uid()) in ('Admin', 'Staff')
  );

-- Create triggers to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_companies_updated_at
  before update on public.companies
  for each row
  execute function public.update_updated_at_column();

create trigger update_company_offices_updated_at
  before update on public.company_offices
  for each row
  execute function public.update_updated_at_column();
