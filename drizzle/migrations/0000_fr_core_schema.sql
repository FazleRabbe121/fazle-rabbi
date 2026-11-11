
create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

-- One-time setup: the first signed-in account claims admin when no admin exists yet.
create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke execute on function public.claim_admin() from anon, public;
grant execute on function public.claim_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.categories (name, slug, sort_order) values
('Classic Cocktails','classic-cocktails',1),('Modern Cocktails','modern-cocktails',2),
('Signature Cocktails','signature-cocktails',3),('Tiki Cocktails','tiki-cocktails',4),
('Tropical Cocktails','tropical-cocktails',5),('Martini Collection','martini-collection',6),
('Whiskey Cocktails','whiskey-cocktails',7),('Gin Cocktails','gin-cocktails',8),
('Rum Cocktails','rum-cocktails',9),('Vodka Cocktails','vodka-cocktails',10),
('Tequila Cocktails','tequila-cocktails',11),('Mocktails','mocktails',12),
('Homemade Syrups','homemade-syrups',13),('Homemade Purees','homemade-purees',14),
('Coffee Recipes','coffee-recipes',15),('Seasonal Drinks','seasonal-drinks',16);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 160),
  category_id uuid references public.categories(id) on delete set null,
  image_path text,
  ingredients jsonb not null default '[]'::jsonb,
  steps text[] not null default '{}',
  glassware text,
  ice_type text,
  garnish text,
  technique text,
  prep_time_minutes int,
  difficulty text not null default 'Easy' check (difficulty in ('Easy','Medium','Advanced','Expert')),
  abv numeric(5,2),
  flavor_tags text[] not null default '{}',
  servings numeric(6,2) not null default 1,
  cost_per_serving numeric(10,2),
  selling_price numeric(10,2),
  notes text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recipes_user_idx on public.recipes(user_id);
grant select, insert, update, delete on public.recipes to authenticated;
grant all on public.recipes to service_role;
alter table public.recipes enable row level security;
create policy "Admins read recipes" on public.recipes for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert recipes" on public.recipes for insert to authenticated with check (public.has_role(auth.uid(),'admin') and user_id = auth.uid());
create policy "Admins update recipes" on public.recipes for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete recipes" on public.recipes for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger recipes_touch before update on public.recipes for each row execute function public.touch_updated_at();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 5 and 255 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or char_length(phone) <= 40),
  organisation text check (organisation is null or char_length(organisation) <= 150),
  enquiry_type text not null check (enquiry_type in ('Recruitment','Event Booking','Consulting','Collaboration','Other')),
  message text not null check (char_length(message) between 10 and 3000),
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone can send a message" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "Admins read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.contact_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  if (select count(*) from public.contact_messages where lower(email) = lower(new.email) and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'RATE_LIMIT: too many messages, please try again later';
  end if;
  if (select count(*) from public.contact_messages where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'RATE_LIMIT: too many messages, please try again later';
  end if;
  return new;
end $$;
create trigger contact_rate_limit before insert on public.contact_messages for each row execute function public.contact_rate_limit();

create policy "Admins read recipe images" on storage.objects for select to authenticated using (bucket_id = 'recipe-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins upload recipe images" on storage.objects for insert to authenticated with check (bucket_id = 'recipe-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins update recipe images" on storage.objects for update to authenticated using (bucket_id = 'recipe-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins delete recipe images" on storage.objects for delete to authenticated using (bucket_id = 'recipe-images' and public.has_role(auth.uid(),'admin'));
