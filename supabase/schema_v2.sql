-- ============================================================
-- DIAVOLO'S PIZZA – Schema V2
-- In Supabase: SQL Editor > New Query > einfügen & ausführen
-- ============================================================

-- Produkte (Speisekarte)
CREATE TABLE IF NOT EXISTS products (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  number       INTEGER,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL,
  base_price   DECIMAL(10,2) NOT NULL,
  is_hot       BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  allergens    TEXT DEFAULT '',
  has_extras   BOOLEAN DEFAULT false,
  has_sizes    BOOLEAN DEFAULT false,
  sort_order   INTEGER DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produkte öffentlich lesbar" ON products FOR SELECT USING (true);

-- Extras (Pizzabeläge zum Hinzufügen)
CREATE TABLE IF NOT EXISTS extras (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Extras öffentlich lesbar" ON extras FOR SELECT USING (true);

-- Pizza-Größen
CREATE TABLE IF NOT EXISTS pizza_sizes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label       TEXT NOT NULL,
  extra_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE pizza_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Größen öffentlich lesbar" ON pizza_sizes FOR SELECT USING (true);

-- Indizes
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_available_idx ON products (is_available);
