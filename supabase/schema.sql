-- ============================================================
-- DIAVOLO'S PIZZA – Datenbank-Schema
-- In Supabase: SQL Editor > New Query > einfügen & ausführen
-- ============================================================

-- Tabelle für Bestellungen
CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items            JSONB NOT NULL,
  total_amount     INTEGER NOT NULL, -- Betrag in Cent (z.B. 1150 = 11,50 €)
  status           TEXT NOT NULL DEFAULT 'paid'
                     CHECK (status IN ('pending', 'paid', 'preparing', 'delivered', 'cancelled')),
  notes            TEXT
);

-- Sicherheit: Nur der Service-Role-Key darf lesen/schreiben (kein öffentlicher Zugriff)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Keine öffentlichen Policies → nur der Admin-Service-Client kommt rein
-- (Der Service Role Key umgeht RLS automatisch)

-- Index für schnelle Suche nach Datum
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

-- Index für Stripe Session Lookup im Webhook
CREATE INDEX IF NOT EXISTS orders_stripe_session_idx ON orders (stripe_session_id);
