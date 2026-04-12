-- Extras-Katalog Config: Speichert die Belag-Preismatrix als JSONB
-- Ausführen im Supabase SQL Editor

CREATE TABLE IF NOT EXISTS extras_catalog_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  catalog JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
