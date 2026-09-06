-- ============================================================
-- InvoicePro — Migration 001 : Schéma initial complet
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
create type document_status as enum (
  'draft','sent','accepted','refused','expired','converted',
  'paid','partially_paid','unpaid','overdue','cancelled'
);

create type member_role as enum ('owner','admin','accountant','employee','viewer');
create type payment_method as enum (
  'cash','orange_money','moov_money','wave','bank_transfer','check','card','other'
);
create type product_type as enum ('product','service');
create type subscription_plan as enum ('free','starter','pro','business');

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique,
  logo_url      text,
  address       text,
  city          text,
  country       text default 'ML',
  phone         text,
  email         text,
  website       text,
  nif           text,
  tax_regime    text,
  currency      text not null default 'XOF',
  default_vat   numeric(5,2) default 18,
  bank_name     text,
  bank_account  text,
  bank_iban     text,
  bank_swift    text,
  payment_terms text default '30',
  invoice_notes text,
  invoice_footer text,
  primary_color text default '#2563EB',
  secondary_color text default '#1D4ED8',
  default_template text default 'classic',
  onboarding_completed boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- USERS (extension de auth.users)
-- ============================================================
create table user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  locale      text default 'fr',
  theme       text default 'light',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
create table organization_members (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            member_role not null default 'employee',
  invited_email   text,
  accepted        boolean default true,
  created_at      timestamptz default now(),
  unique(organization_id, user_id)
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table subscription_plans (
  id                  uuid primary key default uuid_generate_v4(),
  name                subscription_plan unique not null,
  label               text not null,
  price_monthly       numeric(10,2) default 0,
  max_invoices        int default 10,
  max_clients         int default 5,
  max_products        int default 10,
  max_users           int default 1,
  max_templates       int default 1,
  has_statistics      boolean default false,
  has_export          boolean default false,
  has_custom_branding boolean default false,
  created_at          timestamptz default now()
);

insert into subscription_plans values
  (uuid_generate_v4(),'free','Gratuit',0,10,5,10,1,1,false,false,false),
  (uuid_generate_v4(),'starter','Starter',5000,100,50,100,3,2,true,true,false),
  (uuid_generate_v4(),'pro','Pro',15000,-1,-1,-1,10,4,true,true,true),
  (uuid_generate_v4(),'business','Business',30000,-1,-1,-1,-1,4,true,true,true);

create table subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade unique,
  plan            subscription_plan not null default 'free',
  status          text default 'active',
  trial_ends_at   timestamptz,
  current_period_start timestamptz default now(),
  current_period_end   timestamptz,
  stripe_subscription_id text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- CURRENCIES
-- ============================================================
create table currencies (
  code   text primary key,
  name   text not null,
  symbol text not null,
  decimal_places int default 0
);
insert into currencies values
  ('XOF','Franc CFA BCEAO','FCFA',0),
  ('EUR','Euro','€',2),
  ('USD','Dollar américain','$',2),
  ('GBP','Livre sterling','£',2),
  ('MAD','Dirham marocain','DH',2),
  ('GNF','Franc guinéen','GNF',0),
  ('NGN','Naira nigérian','₦',2);

-- ============================================================
-- TAXES
-- ============================================================
create table taxes (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  rate            numeric(5,2) not null,
  is_default      boolean default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
create table product_categories (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  color           text,
  created_at      timestamptz default now()
);

-- ============================================================
-- CLIENTS
-- ============================================================
create table clients (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  company_name    text,
  email           text,
  phone           text,
  whatsapp        text,
  address         text,
  city            text,
  country         text,
  nif             text,
  tax_number      text,
  notes           text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_clients_org on clients(organization_id);
create index idx_clients_name_trgm on clients using gin(name gin_trgm_ops);

create table client_contacts (
  id         uuid primary key default uuid_generate_v4(),
  client_id  uuid not null references clients(id) on delete cascade,
  name       text not null,
  role       text,
  email      text,
  phone      text,
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS / SERVICES
-- ============================================================
create table products (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  description     text,
  sku             text,
  type            product_type not null default 'service',
  category_id     uuid references product_categories(id) on delete set null,
  unit            text default 'unité',
  price_ht        numeric(15,4) not null default 0,
  tax_rate        numeric(5,2) default 18,
  price_ttc       numeric(15,4) generated always as (price_ht * (1 + tax_rate/100)) stored,
  image_url       text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_products_org on products(organization_id);
create index idx_products_name_trgm on products using gin(name gin_trgm_ops);

-- ============================================================
-- DOCUMENT SEQUENCES (numérotation sans doublon)
-- ============================================================
create table document_sequences (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type            text not null,  -- invoice, quote, receipt, purchase_order
  prefix          text not null,
  include_year    boolean default true,
  include_month   boolean default false,
  padding         int default 4,
  current_value   bigint default 0,
  reset_period    text default 'yearly', -- yearly, monthly, never
  last_reset      date default current_date,
  unique(organization_id, type)
);

-- Fonction atomic pour générer le prochain numéro
create or replace function next_document_number(
  p_org_id uuid,
  p_type text
) returns text
language plpgsql
as $$
declare
  v_seq record;
  v_counter bigint;
  v_number text;
  v_year text;
  v_month text;
begin
  select * into v_seq from document_sequences
  where organization_id = p_org_id and type = p_type
  for update;

  if not found then
    raise exception 'No sequence found for org % type %', p_org_id, p_type;
  end if;

  -- Reset si nécessaire
  if v_seq.reset_period = 'yearly' and extract(year from current_date) > extract(year from v_seq.last_reset) then
    update document_sequences set current_value = 0, last_reset = current_date
    where organization_id = p_org_id and type = p_type;
    v_seq.current_value := 0;
  elsif v_seq.reset_period = 'monthly' and (
    extract(year from current_date) > extract(year from v_seq.last_reset) or
    extract(month from current_date) > extract(month from v_seq.last_reset)
  ) then
    update document_sequences set current_value = 0, last_reset = current_date
    where organization_id = p_org_id and type = p_type;
    v_seq.current_value := 0;
  end if;

  v_counter := v_seq.current_value + 1;
  update document_sequences set current_value = v_counter
  where organization_id = p_org_id and type = p_type;

  v_year := to_char(current_date, 'YYYY');
  v_month := to_char(current_date, 'MM');

  if v_seq.include_year and v_seq.include_month then
    v_number := v_seq.prefix || '-' || v_year || '-' || v_month || '-' || lpad(v_counter::text, v_seq.padding, '0');
  elsif v_seq.include_year then
    v_number := v_seq.prefix || '-' || v_year || '-' || lpad(v_counter::text, v_seq.padding, '0');
  else
    v_number := v_seq.prefix || '-' || lpad(v_counter::text, v_seq.padding, '0');
  end if;

  return v_number;
end;
$$;

-- ============================================================
-- QUOTES (DEVIS)
-- ============================================================
create table quotes (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id       uuid references clients(id) on delete set null,
  number          text not null,
  status          document_status not null default 'draft',
  date            date not null default current_date,
  expiry_date     date,
  reference       text,
  notes           text,
  conditions      text,
  subtotal_ht     numeric(15,2) default 0,
  total_discount  numeric(15,2) default 0,
  total_tax       numeric(15,2) default 0,
  total_ttc       numeric(15,2) default 0,
  currency        text default 'XOF',
  template        text default 'classic',
  converted_to_invoice_id uuid,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(organization_id, number)
);

create table quote_items (
  id           uuid primary key default uuid_generate_v4(),
  quote_id     uuid not null references quotes(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  description  text not null,
  quantity     numeric(15,4) not null default 1,
  unit         text default 'unité',
  unit_price   numeric(15,4) not null default 0,
  discount_pct numeric(5,2) default 0,
  discount_amt numeric(15,2) default 0,
  tax_rate     numeric(5,2) default 0,
  line_ht      numeric(15,2) generated always as (
    round((quantity * unit_price * (1 - discount_pct/100)) - discount_amt, 2)
  ) stored,
  line_tax     numeric(15,2),
  line_ttc     numeric(15,2),
  position     int default 0
);

-- ============================================================
-- INVOICES (FACTURES)
-- ============================================================
create table invoices (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id       uuid references clients(id) on delete set null,
  quote_id        uuid references quotes(id) on delete set null,
  number          text not null,
  status          document_status not null default 'draft',
  date            date not null default current_date,
  due_date        date,
  reference       text,
  payment_terms   text,
  notes           text,
  conditions      text,
  subtotal_ht     numeric(15,2) default 0,
  total_discount  numeric(15,2) default 0,
  total_tax       numeric(15,2) default 0,
  total_ttc       numeric(15,2) default 0,
  amount_paid     numeric(15,2) default 0,
  amount_due      numeric(15,2) generated always as (total_ttc - amount_paid) stored,
  currency        text default 'XOF',
  template        text default 'classic',
  sent_at         timestamptz,
  paid_at         timestamptz,
  cancelled_at    timestamptz,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(organization_id, number)
);

create index idx_invoices_org on invoices(organization_id);
create index idx_invoices_status on invoices(status);
create index idx_invoices_client on invoices(client_id);
create index idx_invoices_date on invoices(date);

create table invoice_items (
  id           uuid primary key default uuid_generate_v4(),
  invoice_id   uuid not null references invoices(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  description  text not null,
  quantity     numeric(15,4) not null default 1,
  unit         text default 'unité',
  unit_price   numeric(15,4) not null default 0,
  discount_pct numeric(5,2) default 0,
  discount_amt numeric(15,2) default 0,
  tax_rate     numeric(5,2) default 0,
  line_ht      numeric(15,2),
  line_tax     numeric(15,2),
  line_ttc     numeric(15,2),
  position     int default 0
);

-- ============================================================
-- PAYMENTS (PAIEMENTS)
-- ============================================================
create table payments (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_id      uuid not null references invoices(id) on delete cascade,
  amount          numeric(15,2) not null,
  method          payment_method not null default 'cash',
  reference       text,
  date            date not null default current_date,
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now()
);

create index idx_payments_invoice on payments(invoice_id);
create index idx_payments_org on payments(organization_id);

-- Trigger : mettre à jour amount_paid sur invoice
create or replace function update_invoice_payment()
returns trigger language plpgsql as $$
begin
  update invoices
  set
    amount_paid = (select coalesce(sum(amount),0) from payments where invoice_id = coalesce(new.invoice_id, old.invoice_id)),
    status = case
      when (select coalesce(sum(amount),0) from payments where invoice_id = coalesce(new.invoice_id, old.invoice_id)) = 0 then 'unpaid'
      when (select coalesce(sum(amount),0) from payments where invoice_id = coalesce(new.invoice_id, old.invoice_id)) >= total_ttc then 'paid'
      else 'partially_paid'
    end,
    paid_at = case
      when (select coalesce(sum(amount),0) from payments where invoice_id = coalesce(new.invoice_id, old.invoice_id)) >= total_ttc then now()
      else null
    end,
    updated_at = now()
  where id = coalesce(new.invoice_id, old.invoice_id);
  return new;
end;
$$;

create trigger trg_update_invoice_payment
after insert or update or delete on payments
for each row execute function update_invoice_payment();

-- ============================================================
-- RECEIPTS (REÇUS)
-- ============================================================
create table receipts (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_id      uuid references invoices(id) on delete set null,
  payment_id      uuid references payments(id) on delete set null,
  client_id       uuid references clients(id) on delete set null,
  number          text not null,
  date            date not null default current_date,
  amount          numeric(15,2) not null,
  method          payment_method not null default 'cash',
  reference       text,
  notes           text,
  currency        text default 'XOF',
  template        text default 'classic',
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  unique(organization_id, number)
);

-- ============================================================
-- PURCHASE ORDERS (BONS DE COMMANDE)
-- ============================================================
create table purchase_orders (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id       uuid references clients(id) on delete set null,
  number          text not null,
  status          document_status not null default 'draft',
  date            date not null default current_date,
  expected_date   date,
  reference       text,
  notes           text,
  subtotal_ht     numeric(15,2) default 0,
  total_discount  numeric(15,2) default 0,
  total_tax       numeric(15,2) default 0,
  total_ttc       numeric(15,2) default 0,
  currency        text default 'XOF',
  template        text default 'classic',
  converted_to_invoice_id uuid,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(organization_id, number)
);

create table purchase_order_items (
  id           uuid primary key default uuid_generate_v4(),
  po_id        uuid not null references purchase_orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  description  text not null,
  quantity     numeric(15,4) not null default 1,
  unit         text default 'unité',
  unit_price   numeric(15,4) not null default 0,
  discount_pct numeric(5,2) default 0,
  discount_amt numeric(15,2) default 0,
  tax_rate     numeric(5,2) default 0,
  line_ht      numeric(15,2),
  line_tax     numeric(15,2),
  line_ttc     numeric(15,2),
  position     int default 0
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  type            text not null,
  title           text not null,
  body            text,
  link            text,
  read            boolean default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  action          text not null,
  table_name      text,
  record_id       uuid,
  old_values      jsonb,
  new_values      jsonb,
  ip_address      inet,
  created_at      timestamptz default now()
);

create index idx_audit_org on audit_logs(organization_id);
create index idx_audit_created on audit_logs(created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_organizations_updated_at before update on organizations for each row execute function set_updated_at();
create trigger trg_user_profiles_updated_at before update on user_profiles for each row execute function set_updated_at();
create trigger trg_clients_updated_at before update on clients for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products for each row execute function set_updated_at();
create trigger trg_invoices_updated_at before update on invoices for each row execute function set_updated_at();
create trigger trg_quotes_updated_at before update on quotes for each row execute function set_updated_at();
create trigger trg_purchase_orders_updated_at before update on purchase_orders for each row execute function set_updated_at();
create trigger trg_subscriptions_updated_at before update on subscriptions for each row execute function set_updated_at();

-- ============================================================
-- NEW USER PROFILE (trigger sur auth.users)
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles(id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_new_user
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table user_profiles enable row level security;
alter table clients enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table taxes enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table receipts enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table document_sequences enable row level security;
alter table subscriptions enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- Helper function: get user org ids
create or replace function user_org_ids()
returns setof uuid language sql stable security definer as $$
  select organization_id from organization_members where user_id = auth.uid() and accepted = true;
$$;

-- Organizations
create policy "members_select_org" on organizations for select using (id in (select user_org_ids()));
create policy "owner_update_org" on organizations for update using (
  exists(select 1 from organization_members where organization_id = id and user_id = auth.uid() and role in ('owner','admin'))
);

-- Organization members
create policy "members_select_members" on organization_members for select using (organization_id in (select user_org_ids()));
create policy "owner_manage_members" on organization_members for all using (
  exists(select 1 from organization_members m2 where m2.organization_id = organization_id and m2.user_id = auth.uid() and m2.role in ('owner','admin'))
);

-- User profiles
create policy "own_profile" on user_profiles for all using (id = auth.uid());

-- Per-org tables helper macro
create policy "clients_select" on clients for select using (organization_id in (select user_org_ids()));
create policy "clients_insert" on clients for insert with check (organization_id in (select user_org_ids()));
create policy "clients_update" on clients for update using (organization_id in (select user_org_ids()));
create policy "clients_delete" on clients for delete using (
  exists(select 1 from organization_members where organization_id = clients.organization_id and user_id = auth.uid() and role in ('owner','admin','accountant'))
);

create policy "products_select" on products for select using (organization_id in (select user_org_ids()));
create policy "products_insert" on products for insert with check (organization_id in (select user_org_ids()));
create policy "products_update" on products for update using (organization_id in (select user_org_ids()));
create policy "products_delete" on products for delete using (
  exists(select 1 from organization_members where organization_id = products.organization_id and user_id = auth.uid() and role in ('owner','admin'))
);

create policy "product_categories_all" on product_categories for all using (organization_id in (select user_org_ids()));
create policy "taxes_all" on taxes for all using (organization_id in (select user_org_ids()));
create policy "doc_sequences_all" on document_sequences for all using (organization_id in (select user_org_ids()));
create policy "subscriptions_select" on subscriptions for select using (organization_id in (select user_org_ids()));

create policy "quotes_all" on quotes for all using (organization_id in (select user_org_ids()));
create policy "quote_items_all" on quote_items for all using (
  quote_id in (select id from quotes where organization_id in (select user_org_ids()))
);

create policy "invoices_all" on invoices for all using (organization_id in (select user_org_ids()));
create policy "invoice_items_all" on invoice_items for all using (
  invoice_id in (select id from invoices where organization_id in (select user_org_ids()))
);

create policy "payments_all" on payments for all using (organization_id in (select user_org_ids()));
create policy "receipts_all" on receipts for all using (organization_id in (select user_org_ids()));

create policy "purchase_orders_all" on purchase_orders for all using (organization_id in (select user_org_ids()));
create policy "po_items_all" on purchase_order_items for all using (
  po_id in (select id from purchase_orders where organization_id in (select user_org_ids()))
);

create policy "notifications_all" on notifications for all using (
  organization_id in (select user_org_ids()) and user_id = auth.uid()
);
create policy "audit_logs_select" on audit_logs for select using (organization_id in (select user_org_ids()));
