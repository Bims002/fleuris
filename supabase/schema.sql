-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text check (role in ('customer', 'admin', 'partner')) default 'customer',
  phone text
);

-- Partners (Fleurists)
create table partners (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  address text,
  city text,
  zip_codes text[], -- Array of strings for covered zip codes
  status text check (status in ('active', 'inactive', 'pending')) default 'pending',
  contact_email text,
  contact_phone text
);

-- Products (Catalog)
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price integer not null, -- stored in cents
  images text[],
  category text, -- 'anniversaire', 'amour', 'felicitations', 'deuil'
  is_available boolean default true,
  slug text unique
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users, -- can be null for guest checkout if we allow it, but better linked
  status text check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount integer not null,
  recipient_name text not null,
  recipient_address text not null,
  recipient_phone text,
  message_card text,
  delivery_date date not null,
  delivery_instructions text,
  partner_id uuid references partners, -- assigned partner
  stripe_payment_id text
);

-- Order Items
create table order_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_id uuid references orders not null,
  product_id uuid references products not null,
  quantity integer default 1,
  price_at_purchase integer not null -- to freeze price history
);

-- RLS Policies (Row Level Security)
alter table profiles enable row level security;
alter table partners enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read access for products
create policy "Public products are viewable by everyone."
  on products for select
  using ( is_available = true );

-- Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- AUTOMATIC PROFILE CREATION TRIGGER
-- This ensures that when a user signs up via Auth, a public profile is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKETS (Optional, recommended for images)
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Product images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'products' );
