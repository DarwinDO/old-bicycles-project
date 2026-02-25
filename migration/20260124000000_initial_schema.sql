-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS (Removed brake_type and frame_material as they are now tables)
create type public.app_role as enum ('guest', 'buyer', 'seller', 'inspector', 'admin');
create type public.user_status as enum ('active', 'banned');
create type public.product_status as enum ('pending', 'active', 'hidden', 'sold');
create type public.condition as enum ('new_90', 'used', 'needs_repair');
create type public.image_type as enum ('main', 'groupset', 'serial', 'other');
create type public.order_status as enum ('pending', 'deposited', 'completed', 'cancelled');
create type public.payment_method as enum ('transfer', 'cash', 'online');
create type public.transaction_type as enum ('deposit_in', 'deposit_out', 'refund', 'fee');
create type public.report_reason as enum ('fraud', 'fake', 'wrong_description', 'spam', 'other');
create type public.report_status as enum ('pending', 'reviewed', 'resolved');
create type public.notification_type as enum ('order', 'chat', 'system', 'inspection');

-- 1. USERS (Standalone Table - No Supabase Auth dependency)
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email varchar not null unique,
  password_hash varchar not null,
  role public.app_role not null default 'buyer',
  first_name varchar,
  last_name varchar,
  phone varchar unique,
  avatar_url text,
  default_address text,
  is_verified boolean default false,
  status public.user_status default 'active',
  last_login_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. DYNAMIC LOOKUP TABLES
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null unique,
  logo_url text,
  created_at timestamp with time zone default now()
);

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null,
  slug varchar not null unique,
  parent_id uuid references public.categories(id),
  created_at timestamp with time zone default now()
);

-- New Dynamic Tables replacing Enums
create table public.brake_types (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null unique, -- e.g. 'Disc Brake', 'V-Brake'
  description text,
  created_at timestamp with time zone default now()
);

create table public.frame_materials (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null unique, -- e.g. 'Carbon', 'Aluminum'
  description text,
  created_at timestamp with time zone default now()
);

-- 3. PRODUCTS
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.users(id) not null,
  
  brand_id uuid references public.brands(id),
  category_id uuid references public.categories(id),
  
  -- Foreign Keys to new dynamic tables
  frame_material_id uuid references public.frame_materials(id),
  brake_type_id uuid references public.brake_types(id),
  
  title varchar not null,
  description text,
  price numeric not null,
  original_price numeric,
  
  -- Remaining Specs
  frame_size varchar, -- S, M, L, 52cm
  wheel_size varchar, -- 29, 700c
  groupset varchar,   -- Shimano 105
  
  condition public.condition default 'used',
  province varchar,
  district varchar,
  address text,
  
  status public.product_status default 'pending',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. PRODUCT IMAGES
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  image_type public.image_type default 'other',
  is_primary boolean default false,
  display_order int default 0,
  created_at timestamp with time zone default now()
);

-- 5. INSPECTIONS
create table public.inspections (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id),
  inspector_id uuid references public.users(id),
  
  frame_score int check (frame_score between 1 and 5),
  fork_score int check (fork_score between 1 and 5),
  brake_score int check (brake_score between 1 and 5),
  drivetrain_score int check (drivetrain_score between 1 and 5),
  wheel_score int check (wheel_score between 1 and 5),
  overall_score numeric(3,1),
  
  passed boolean default false,
  report_file_url text,
  notes text,
  valid_until timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- 6. ORDERS & TRANSACTIONS
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references public.users(id),
  product_id uuid references public.products(id),
  seller_id uuid references public.users(id),
  
  total_amount numeric,
  deposit_amount numeric,
  service_fee numeric,
  
  status public.order_status default 'pending',
  payment_method public.payment_method,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id),
  type public.transaction_type,
  amount numeric,
  balance_after numeric,
  note text,
  created_at timestamp with time zone default now()
);

-- 7. MESSAGING
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id),
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.users(id),
  content text,
  image_url text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- 8. REVIEWS & REPORTS
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id),
  reviewer_id uuid references public.users(id),
  reviewee_id uuid references public.users(id),
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  seller_reply text,
  seller_replied_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.users(id),
  target_id uuid not null,
  target_type varchar not null,
  reason public.report_reason,
  description text,
  status public.report_status default 'pending',
  admin_note text,
  resolved_by uuid references public.users(id),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  type public.notification_type,
  title varchar,
  content text,
  link_to varchar,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

create table public.wishlists (
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, product_id)
);

-- AUTOMATION
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at before update on public.users for each row execute procedure update_updated_at_column();
create trigger update_products_updated_at before update on public.products for each row execute procedure update_updated_at_column();
create trigger update_orders_updated_at before update on public.orders for each row execute procedure update_updated_at_column();
create trigger update_conversations_updated_at before update on public.conversations for each row execute procedure update_updated_at_column();
