-- Pizza-Größen: Preise + Label aktualisieren (Betreiber-Preisliste)
-- Ausführen im Supabase SQL Editor

-- Alle Größen aktualisieren (extra_price = Zielpreis - 10€ Grundpreis)
UPDATE pizza_sizes SET extra_price = 0.00  WHERE label ILIKE '%30%cm%';
UPDATE pizza_sizes SET extra_price = 4.00  WHERE label ILIKE '%35%cm%';
UPDATE pizza_sizes SET extra_price = 6.00  WHERE label ILIKE '%40%cm%' AND label NOT ILIKE '%famili%';
UPDATE pizza_sizes SET extra_price = 8.00  WHERE label ILIKE '%45%cm%';
UPDATE pizza_sizes SET extra_price = 10.00 WHERE label ILIKE '%50%cm%';
UPDATE pizza_sizes SET extra_price = 15.00, label = 'Familien-Pizza 40/60 cm' WHERE label ILIKE '%famili%';
