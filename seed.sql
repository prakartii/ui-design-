-- ============================================================
-- INTENT — Indian Demo Seed Data
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- NOTE: These rows bypass auth.users — for demo purposes only.
-- For production, users sign up via the app UI.
-- ============================================================

-- ── Demo Brand Users ─────────────────────────────────────────
-- We insert into public.users directly using fixed UUIDs so that
-- brands and creators can reference them. In production the
-- handle_new_user trigger populates this table automatically.

insert into public.users (id, name, email, role) values
  ('b1000000-0000-0000-0000-000000000001', 'Nykaa Team',       'demo-nykaa@intent.app',      'brand'),
  ('b1000000-0000-0000-0000-000000000002', 'Mamaearth Team',   'demo-mamaearth@intent.app',   'brand'),
  ('b1000000-0000-0000-0000-000000000003', 'boAt Team',        'demo-boat@intent.app',        'brand'),
  ('b1000000-0000-0000-0000-000000000004', 'Myntra Team',      'demo-myntra@intent.app',      'brand'),
  ('b1000000-0000-0000-0000-000000000005', 'Flipkart Team',    'demo-flipkart@intent.app',    'brand'),
  ('b1000000-0000-0000-0000-000000000006', 'Swiggy Team',      'demo-swiggy@intent.app',      'brand')
on conflict (id) do nothing;

-- ── Demo Creator Users ────────────────────────────────────────
insert into public.users (id, name, email, role) values
  ('c1000000-0000-0000-0000-000000000001', 'Priya Sharma',    'demo-priya@intent.app',      'creator'),
  ('c1000000-0000-0000-0000-000000000002', 'Arjun Mehta',     'demo-arjun@intent.app',      'creator'),
  ('c1000000-0000-0000-0000-000000000003', 'Aanya Kapoor',    'demo-aanya@intent.app',      'creator'),
  ('c1000000-0000-0000-0000-000000000004', 'Rahul Das',       'demo-rahul@intent.app',      'creator'),
  ('c1000000-0000-0000-0000-000000000005', 'Meera Nair',      'demo-meera@intent.app',      'creator'),
  ('c1000000-0000-0000-0000-000000000006', 'Kabir Singh',     'demo-kabir@intent.app',      'creator')
on conflict (id) do nothing;

-- ── Brands ───────────────────────────────────────────────────
insert into public.brands (id, user_id, name, industry, description) values
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Nykaa',      'Beauty & Personal Care',
   'India''s leading beauty and lifestyle retailer.'),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'Mamaearth',  'Natural Wellness',
   'Toxin-free personal care products for the whole family.'),
  ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'boAt',       'Consumer Electronics',
   'India''s leading audio and wearables brand.'),
  ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004',
   'Myntra',     'Fashion & Lifestyle',
   'India''s top fashion destination.'),
  ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005',
   'Flipkart',   'E-Commerce',
   'India''s homegrown e-commerce marketplace.'),
  ('a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006',
   'Swiggy',     'Food & Delivery',
   'India''s on-demand delivery platform.')
on conflict (id) do nothing;

-- ── Creators ─────────────────────────────────────────────────
insert into public.creators (id, user_id, handle, niche, followers, bio) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'priya_beauty', 'Beauty · Skincare', 284000,
   'Honest reviews, everyday skincare, from Delhi.'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
   'arjun_tech',   'Tech · Gadgets',   156000,
   'Making tech accessible for every Indian household.'),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
   'aanya_fashion','Fashion · OOTDs',  421000,
   'Mumbai street style to high fashion.'),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004',
   'rahul_fitness','Fitness · Wellness', 98000,
   'Desi fitness journey — no gym required.'),
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005',
   'meera_food',   'Food · Recipes',  203000,
   'Home cooking and restaurant reviews across Bangalore.'),
  ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006',
   'kabir_travel', 'Travel · Vlog',   67000,
   'Budget travel across incredible India.')
on conflict (id) do nothing;

-- ── Campaigns (INR budgets) ───────────────────────────────────
insert into public.campaigns (id, brand_id, title, brief, status, budget, currency, deadline) values
  ('e1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'Nykaa Summer Glow — Skin Ritual',
   'Show your summer skincare ritual featuring Nykaa Naturals SPF range. Raw, real, no filters.',
   'active', 50000, 'INR', '2026-07-15'),

  ('e1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'Nykaa Festive Beauty Drops',
   'Festive season beauty looks using Nykaa makeup. Lead with the transformation.',
   'draft', 100000, 'INR', '2026-09-01'),

  ('e1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000002',
   'Mamaearth Onion Hair Oil — Trust Series',
   'Honest 30-day hair growth challenge. No scripted lines. Your words only.',
   'active', 25000, 'INR', '2026-07-31'),

  ('e1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000003',
   'boAt Rockerz 450 — Street Energy',
   'Show the product in your most high-energy moment. Urban India aesthetic. No voice-over.',
   'active', 15000, 'INR', '2026-08-10'),

  ('e1000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000004',
   'Myntra Style Refresh Q3',
   'Style 3 complete outfits from Myntra''s new seasonal edit. Mix-and-match encouraged.',
   'active', 50000, 'INR', '2026-08-20'),

  ('e1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000005',
   'Flipkart Big Billion Days — Creator Picks',
   'Share your top 5 picks from Big Billion Days. Authentic enthusiasm only.',
   'draft', 25000, 'INR', '2026-10-01'),

  ('e1000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000006',
   'Swiggy Instamart — Late Night Snacks',
   'Show the 10-minute delivery experience for a late-night snack craving. Keep it real.',
   'completed', 15000, 'INR', '2026-06-01')
on conflict (id) do nothing;

-- ── Campaign Creators ─────────────────────────────────────────
insert into public.campaign_creators (campaign_id, creator_id, status) values
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'active'),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'active'),
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'active'),
  ('e1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000005', 'completed'),
  ('e1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000006', 'completed')
on conflict (campaign_id, creator_id) do nothing;

-- ── Creator ↔ Brand Matches ───────────────────────────────────
insert into public.creator_brand_matches (creator_id, brand_id, compatibility_score) values
  -- Priya × beauty/wellness brands
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 94),
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 89),
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 76),
  -- Arjun × tech/electronics
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 91),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 84),
  -- Aanya × fashion
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 96),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 82),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 79),
  -- Rahul × fitness/food
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 88),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 73),
  -- Meera × food/lifestyle
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 93),
  ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 81),
  -- Kabir × travel/lifestyle
  ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 87),
  ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 78)
on conflict (creator_id, brand_id) do nothing;

-- ── Living Briefs ─────────────────────────────────────────────
insert into public.living_briefs (campaign_id, signal_type, description, is_active) values
  ('e1000000-0000-0000-0000-000000000001', 'new',
   'Outdoor content featuring natural sunlight +41% CTR this week — shift from indoor bathroom to balcony or park.',
   true),
  ('e1000000-0000-0000-0000-000000000001', 'update',
   'Reduce product-first framing → lead with skin texture story before revealing SPF product.',
   true),
  ('e1000000-0000-0000-0000-000000000003', 'alert',
   'Competitor claims alert: avoid mentioning "faster growth in X days" — Mamaearth legal flagged this phrase.',
   true),
  ('e1000000-0000-0000-0000-000000000004', 'update',
   'Hip-hop and EDM soundtracks outperforming other genres by 28% on Reels this week — align audio accordingly.',
   true),
  ('e1000000-0000-0000-0000-000000000005', 'new',
   'Co-ord sets trending +67% on Myntra discovery this week — prioritise co-ord styling in your look.',
   true)
on conflict do nothing;

-- ── Pixel Pact Verifications ──────────────────────────────────
insert into public.pixel_pact_verifications
  (campaign_id, creator_id, status, payment_amount) values
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001',
   'partial', 50000),
  ('e1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000005',
   'verified', 15000),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002',
   'pending', 15000)
on conflict do nothing;
