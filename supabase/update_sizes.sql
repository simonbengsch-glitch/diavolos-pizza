-- Pizzagrößen auf 2 reduzieren: Normal & Familienpizza
-- Ausführen im Supabase SQL Editor

-- Alle alten Größen löschen
DELETE FROM pizza_sizes;

-- Nur 2 Größen einfügen
INSERT INTO pizza_sizes (label, extra_price, sort_order) VALUES
  ('Normal (Ø 30 cm)',       0.00, 1),
  ('Familienpizza (Ø 50 cm)', 7.00, 2);
