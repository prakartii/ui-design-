-- ============================================================
-- INTENT — Creator Intelligence Platform
-- Full PostgreSQL Schema for Supabase
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Users ────────────────────────────────────────────────────
-- Extended profile linked to Supabase auth.users

create table if not exists public.users (
  id          uuid references auth.users on delete cascade primary key,
  name        text        not null,
  email       text        not null unique,
  role        text        not null check (role in ('creator', 'brand')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.users is 'Extended profile for every authenticated user';

-- ── Brands ───────────────────────────────────────────────────

create table if not exists public.brands (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references public.users(id) on delete cascade,
  name        text        not null,
  industry    text,
  description text,
  logo_url    text,
  created_at  timestamptz not null default now()
);

comment on table public.brands is 'Brand profiles created by brand-role users';

-- ── Creators ─────────────────────────────────────────────────

create table if not exists public.creators (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references public.users(id) on delete cascade,
  handle      text        unique,
  niche       text,
  followers   integer     not null default 0,
  bio         text,
  created_at  timestamptz not null default now()
);

comment on table public.creators is 'Creator profiles created by creator-role users';

-- ── Campaigns ────────────────────────────────────────────────

create table if not exists public.campaigns (
  id          uuid        primary key default gen_random_uuid(),
  brand_id    uuid        not null references public.brands(id) on delete cascade,
  title       text        not null,
  brief       text,
  status      text        not null default 'draft'
                check (status in ('draft', 'active', 'completed', 'paused')),
  budget      numeric(14,2) not null default 0,
  currency    text        not null default 'INR',
  deadline    date,
  created_at  timestamptz not null default now()
);

comment on table public.campaigns is 'Brand campaigns that creators can be part of';

-- ── Campaign Creators (junction) ─────────────────────────────

create table if not exists public.campaign_creators (
  id          uuid        primary key default gen_random_uuid(),
  campaign_id uuid        not null references public.campaigns(id) on delete cascade,
  creator_id  uuid        not null references public.creators(id) on delete cascade,
  status      text        not null default 'active'
                check (status in ('active', 'review', 'completed', 'rejected')),
  created_at  timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

-- ── Creator ↔ Brand Matches ───────────────────────────────────

create table if not exists public.creator_brand_matches (
  id                  uuid    primary key default gen_random_uuid(),
  creator_id          uuid    not null references public.creators(id) on delete cascade,
  brand_id            uuid    not null references public.brands(id) on delete cascade,
  compatibility_score integer not null check (compatibility_score between 0 and 100),
  created_at          timestamptz not null default now(),
  unique (creator_id, brand_id)
);

-- ── Brief Translations ────────────────────────────────────────

create table if not exists public.brief_translations (
  id               uuid    primary key default gen_random_uuid(),
  campaign_id      uuid    not null references public.campaigns(id) on delete cascade,
  creator_id       uuid    not null references public.creators(id) on delete cascade,
  original_brief   text    not null,
  translated_brief jsonb,
  match_score      integer check (match_score between 0 and 100),
  created_at       timestamptz not null default now()
);

-- ── Risk Reviews ──────────────────────────────────────────────

create table if not exists public.risk_reviews (
  id           uuid    primary key default gen_random_uuid(),
  creator_id   uuid    not null references public.creators(id) on delete cascade,
  campaign_id  uuid    references public.campaigns(id) on delete set null,
  content_text text    not null,
  risk_score   integer not null check (risk_score between 0 and 100),
  feedback     jsonb,
  created_at   timestamptz not null default now()
);

-- ── Living Briefs ─────────────────────────────────────────────

create table if not exists public.living_briefs (
  id           uuid    primary key default gen_random_uuid(),
  campaign_id  uuid    not null references public.campaigns(id) on delete cascade,
  signal_type  text    not null check (signal_type in ('new', 'update', 'alert')),
  description  text    not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── Pixel Pact Verifications ──────────────────────────────────

create table if not exists public.pixel_pact_verifications (
  id                  uuid    primary key default gen_random_uuid(),
  campaign_id         uuid    not null references public.campaigns(id) on delete cascade,
  creator_id          uuid    not null references public.creators(id) on delete cascade,
  status              text    not null default 'pending'
                        check (status in ('pending', 'verified', 'failed', 'partial')),
  payment_amount      numeric(14,2) not null default 0,
  verification_report jsonb,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_brands_user_id             on public.brands(user_id);
create index if not exists idx_creators_user_id           on public.creators(user_id);
create index if not exists idx_campaigns_brand_id         on public.campaigns(brand_id);
create index if not exists idx_campaigns_status           on public.campaigns(status);
create index if not exists idx_campaign_creators_campaign on public.campaign_creators(campaign_id);
create index if not exists idx_campaign_creators_creator  on public.campaign_creators(creator_id);
create index if not exists idx_matches_creator            on public.creator_brand_matches(creator_id);
create index if not exists idx_matches_brand              on public.creator_brand_matches(brand_id);
create index if not exists idx_living_briefs_campaign     on public.living_briefs(campaign_id);
create index if not exists idx_pixel_pact_creator         on public.pixel_pact_verifications(creator_id);
create index if not exists idx_risk_reviews_creator       on public.risk_reviews(creator_id);
create index if not exists idx_brief_translations_creator on public.brief_translations(creator_id);

-- ============================================================
-- TRIGGER — Auto-create user profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'creator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users                   enable row level security;
alter table public.brands                  enable row level security;
alter table public.creators                enable row level security;
alter table public.campaigns               enable row level security;
alter table public.campaign_creators       enable row level security;
alter table public.creator_brand_matches   enable row level security;
alter table public.brief_translations      enable row level security;
alter table public.risk_reviews            enable row level security;
alter table public.living_briefs           enable row level security;
alter table public.pixel_pact_verifications enable row level security;

-- users: own profile read/write; others can read basic info
create policy "Users can read all profiles"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- brands: public read; owner write
create policy "Anyone can read brands"
  on public.brands for select using (true);

create policy "Brand owners can insert"
  on public.brands for insert with check (auth.uid() = user_id);

create policy "Brand owners can update"
  on public.brands for update using (auth.uid() = user_id);

-- creators: public read; owner write
create policy "Anyone can read creators"
  on public.creators for select using (true);

create policy "Creator owners can insert"
  on public.creators for insert with check (auth.uid() = user_id);

create policy "Creator owners can update"
  on public.creators for update using (auth.uid() = user_id);

-- campaigns: public read; brand owner write
create policy "Anyone can read campaigns"
  on public.campaigns for select using (true);

create policy "Brand owners can insert campaigns"
  on public.campaigns for insert
  with check (
    exists (select 1 from public.brands where id = brand_id and user_id = auth.uid())
  );

create policy "Brand owners can update campaigns"
  on public.campaigns for update
  using (
    exists (select 1 from public.brands where id = brand_id and user_id = auth.uid())
  );

-- campaign_creators: read own; brand/creator can manage
create policy "Read campaign creators"
  on public.campaign_creators for select using (true);

-- creator_brand_matches: read all
create policy "Read all matches"
  on public.creator_brand_matches for select using (true);

create policy "Insert matches (system/brand)"
  on public.creator_brand_matches for insert
  with check (auth.uid() is not null);

-- brief_translations: creator reads own
create policy "Creators read own translations"
  on public.brief_translations for select
  using (
    exists (select 1 from public.creators where id = creator_id and user_id = auth.uid())
  );

create policy "Creators insert translations"
  on public.brief_translations for insert
  with check (
    exists (select 1 from public.creators where id = creator_id and user_id = auth.uid())
  );

-- risk_reviews: creator reads own
create policy "Creators read own risk reviews"
  on public.risk_reviews for select
  using (
    exists (select 1 from public.creators where id = creator_id and user_id = auth.uid())
  );

create policy "Creators insert risk reviews"
  on public.risk_reviews for insert
  with check (
    exists (select 1 from public.creators where id = creator_id and user_id = auth.uid())
  );

-- living_briefs: read all
create policy "Read all living briefs"
  on public.living_briefs for select using (true);

-- pixel_pact_verifications: creator and brand read own
create policy "Creator reads own verifications"
  on public.pixel_pact_verifications for select
  using (
    exists (select 1 from public.creators where id = creator_id and user_id = auth.uid())
    or
    exists (
      select 1 from public.campaigns c
      join public.brands b on b.id = c.brand_id
      where c.id = campaign_id and b.user_id = auth.uid()
    )
  );
