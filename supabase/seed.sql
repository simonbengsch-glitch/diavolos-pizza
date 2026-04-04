-- ============================================================
-- DIAVOLO'S PIZZA – Seed-Daten (komplette Speisekarte)
-- Nach schema_v2.sql ausführen!
-- ============================================================

-- Pizza-Größen
INSERT INTO pizza_sizes (label, extra_price, sort_order) VALUES
  ('Ø 30 cm (Standard)', 0.00, 1),
  ('Ø 35 cm', 3.00, 2),
  ('Ø 40 cm', 5.00, 3),
  ('Ø 45 cm', 7.00, 4),
  ('Ø 50 cm', 9.00, 5),
  ('Familien-Pizza 60×40 cm', 14.00, 6);

-- Extras (Pizzabeläge)
INSERT INTO extras (name, price, sort_order) VALUES
  ('Mozzarella extra', 1.00, 1),
  ('Salami', 1.50, 2),
  ('Hinterschinken', 1.50, 3),
  ('Parmaschinken', 2.00, 4),
  ('Speck', 1.50, 5),
  ('Hackfleisch', 1.50, 6),
  ('Sucuk', 1.50, 7),
  ('Thunfisch', 1.50, 8),
  ('Sardellen', 1.50, 9),
  ('Lachs', 2.00, 10),
  ('Champignons', 1.00, 11),
  ('Steinpilze', 2.00, 12),
  ('Peperoni', 1.00, 13),
  ('Paprika', 1.00, 14),
  ('Zwiebeln', 0.50, 15),
  ('Knoblauch', 0.50, 16),
  ('Oliven', 1.00, 17),
  ('Artischocken', 1.50, 18),
  ('Rucola', 1.00, 19),
  ('Spinat', 1.00, 20),
  ('Mais', 0.50, 21),
  ('Ananas', 0.50, 22),
  ('Broccoli', 1.00, 23),
  ('Kapern', 1.00, 24),
  ('Tomaten frisch', 1.00, 25),
  ('Kirschtomaten', 1.00, 26),
  ('Gorgonzola', 1.50, 27),
  ('Frischkäse', 1.50, 28),
  ('Ei', 0.50, 29),
  ('Parmesan/Grana', 1.00, 30);

-- Vorspeise
INSERT INTO products (number, name, description, category, base_price, allergens, has_extras, has_sizes, sort_order) VALUES
  (100, 'Bruschetta', '4 Stück, Tomaten, Knoblauch, Zwiebeln, Petersilie', 'Vorspeise', 6.50, 'A,G', false, false, 1);

-- Pasta
INSERT INTO products (number, name, description, category, base_price, allergens, has_extras, has_sizes, sort_order) VALUES
  (101, 'Lasagne', 'Überbacken', 'Pasta & Mehr', 10.50, 'C,G', false, false, 1),
  (102, 'Lasagne Casa', 'Mit Erbsen, Hinterschinken und Champignons, überbacken', 'Pasta & Mehr', 11.00, 'C,G', false, false, 2),
  (103, 'Spaghetti al Forno', 'Mit Fleischsoße, überbacken', 'Pasta & Mehr', 10.50, 'C,G', false, false, 3),
  (113, 'Rigatoni al Forno', 'Mit Fleischsoße, überbacken', 'Pasta & Mehr', 10.50, 'A,G', false, false, 4),
  (125, 'Tortellini al Forno', 'Mit Fleischsoße, überbacken', 'Pasta & Mehr', 10.50, 'A,C,G', false, false, 5);

-- Salate
INSERT INTO products (number, name, description, category, base_price, allergens, has_extras, has_sizes, sort_order) VALUES
  (300, 'Gurkensalat', '', 'Salate', 5.50, '', false, false, 1),
  (301, 'Gemischter Salat', 'Eisbergsalat, Tomaten, Gurken und Karotten', 'Salate', 6.00, '', false, false, 2),
  (302, 'Tomatensalat', 'Tomaten und Zwiebeln', 'Salate', 6.50, '', false, false, 3),
  (303, 'Gemischter Salat mit Thunfisch', 'Eisbergsalat, Tomaten, Gurken, Karotten und Thunfisch', 'Salate', 7.00, 'D', false, false, 4),
  (304, 'Thunfischsalat', 'Thunfisch und Zwiebeln', 'Salate', 7.50, 'D', false, false, 5),
  (305, 'Italienische Salatplatte', 'Eisbergsalat, Tomaten, Gurken, Karotten, Hinterschinken, Käse, Ei und Paprika', 'Salate', 9.50, 'C', false, false, 6),
  (307, 'Insalata Salerno', 'Gemischter Salat auf Pizzabrot mit Hinterschinken, Käse, Ei und Zwiebeln', 'Salate', 11.00, 'A,G,C', false, false, 7),
  (308, 'Insalata Toscana', 'Eisbergsalat, Tomaten, Gurken, Karotten, Mais und gegrillten Putenbruststreifen', 'Salate', 11.00, '', false, false, 8),
  (309, 'Insalata Vesuvio', 'Eisbergsalat, Tomaten, Gurken, Karotten, Rucola, Parmesan und gegrillte Putenbruststreifen', 'Salate', 11.50, 'G', false, false, 9);

-- Dessert
INSERT INTO products (number, name, description, category, base_price, allergens, is_vegetarian, has_extras, has_sizes, sort_order) VALUES
  (NULL, 'Tiramisu', 'Hausgemachtes italienisches Kaffeedessert', 'Dessert', 6.00, 'A,C,G,O,Z', true, false, false, 1),
  (NULL, 'Panna Cotta', 'Hausgemachtes italienisches Dessert', 'Dessert', 5.00, 'G', true, false, false, 2),
  (NULL, 'Tartufo', 'Italienisches Eisdessert', 'Dessert', 5.00, 'A,C,G,O', true, false, false, 3),
  (NULL, 'Profiteroles', 'Windbeutel mit Schokoladensauce', 'Dessert', 5.00, 'A,C,G', true, false, false, 4);

-- Getränke
INSERT INTO products (name, description, category, base_price, allergens, is_vegetarian, has_extras, has_sizes, sort_order) VALUES
  ('Coca Cola (0,33 l)', '', 'Getränke', 2.50, '', true, false, false, 1),
  ('Coca Cola (1,0 l)', '', 'Getränke', 3.50, '', true, false, false, 2),
  ('Fanta (0,33 l)', '', 'Getränke', 2.50, '', true, false, false, 3),
  ('Fanta (1,0 l)', '', 'Getränke', 3.50, '', true, false, false, 4),
  ('Sprite (0,33 l)', '', 'Getränke', 2.50, '', true, false, false, 5),
  ('Sprite (1,0 l)', '', 'Getränke', 3.50, '', true, false, false, 6),
  ('Mezzo Mix (0,33 l)', '', 'Getränke', 2.50, '', true, false, false, 7),
  ('Mezzo Mix (1,0 l)', '', 'Getränke', 3.50, '', true, false, false, 8),
  ('Red Bull (0,25 l)', '', 'Getränke', 3.25, '', true, false, false, 9),
  ('Rotwein (0,7 l)', 'Trocken aus Italien, 9,8% alk.', 'Getränke', 9.90, 'O,Z', false, false, false, 10),
  ('Weißwein (0,7 l)', 'Trocken aus Italien, 9,8% alk.', 'Getränke', 9.90, 'O,Z', false, false, false, 11),
  ('Lambrusco (0,7 l)', 'Rotwein, süss-spritzig aus Italien, 7,9% alk.', 'Getränke', 12.90, 'O,Z', false, false, false, 12),
  ('Prosecco (0,7 l)', 'Aus Italien, 9,8% alk.', 'Getränke', 12.90, 'O,Z', false, false, false, 13),
  ('Augustiner Hell (0,5 l)', '5,4% alk.', 'Getränke', 2.90, 'A,Z', false, false, false, 14),
  ('Gutmann Weizen (0,5 l)', '5,8% alk.', 'Getränke', 2.90, 'A,Z', false, false, false, 15);

-- Pizzen (alle mit Mozzarella & Tomatensauce, Ø 30cm)
INSERT INTO products (number, name, description, category, base_price, is_hot, allergens, has_extras, has_sizes, sort_order) VALUES
  (200, 'Pizzabrot', 'Ohne Belag', 'Pizza', 7.00, false, 'A,G', true, true, 1),
  (201, 'Pizza Margherita', 'Mit Mozzarella & Tomatensauce', 'Pizza', 9.00, false, 'A,G', true, true, 2),
  (202, 'Pizza Cipolla', 'Mit Zwiebeln', 'Pizza', 9.50, false, 'A,G', true, true, 3),
  (203, 'Pizza Napoli', 'Mit Sardellen', 'Pizza', 9.50, false, 'A,G,D', true, true, 4),
  (204, 'Pizza Salami', 'Mit Salami', 'Pizza', 9.50, false, 'A,G', true, true, 5),
  (205, 'Pizza Prosciutto', 'Mit Hinterschinken', 'Pizza', 9.50, false, 'A,G', true, true, 6),
  (206, 'Pizza Peperoni', 'Mit Peperoni', 'Pizza', 9.50, false, 'A,G', true, true, 7),
  (207, 'Pizza Funghi', 'Mit Champignons', 'Pizza', 9.50, false, 'A,G', true, true, 8),
  (208, 'Pizza Roma', 'Mit Salami, Champignons', 'Pizza', 10.00, false, 'A,G', true, true, 9),
  (209, 'Pizza Regina', 'Mit Hinterschinken, Champignons', 'Pizza', 10.00, false, 'A,G', true, true, 10),
  (210, 'Pizza Hawaii', 'Mit Hinterschinken, Ananas', 'Pizza', 10.00, false, 'A,G', true, true, 11),
  (211, 'Pizza Contadina', 'Mit Speck, Zwiebeln', 'Pizza', 10.00, false, 'A,G', true, true, 12),
  (212, 'Pizza Cacciatora', 'Mit Salami, Hinterschinken', 'Pizza', 10.00, false, 'A,G', true, true, 13),
  (213, 'Pizza Torino', 'Mit Hinterschinken, Champignons, Peperoni', 'Pizza', 10.50, false, 'A,G', true, true, 14),
  (214, 'Pizza O Sole Mio', 'Mit Paprika, Hinterschinken, Eiern', 'Pizza', 10.50, false, 'A,G,O', true, true, 15),
  (215, 'Pizza Italia', 'Mit Artischocken, Hinterschinken, Sardellen, Oliven', 'Pizza', 11.00, false, 'A,G,D', true, true, 16),
  (216, 'Pizza Aurora', 'Mit Salami, Hinterschinken, Champignons', 'Pizza', 10.50, false, 'A,G', true, true, 17),
  (217, 'Pizza Hamburg', 'Mit Hackfleisch und Zwiebeln', 'Pizza', 10.50, false, 'A,G', true, true, 18),
  (218, 'Pizza Messicana', 'Mit Hackfleisch, Peperoni, Bohnen, Mais', 'Pizza', 11.00, true, 'A,G', true, true, 19),
  (219, 'Pizza Quattro Stagioni', 'Vier Jahreszeiten mit Salami, Hinterschinken, Peperoni, Champignons', 'Pizza', 11.00, false, 'A,G', true, true, 20),
  (220, 'Pizza Mista', 'Gemischte Pizza mit Salami, Hinterschinken, Champignons, Peperoni, Paprika', 'Pizza', 11.00, false, 'A,G', true, true, 21),
  (221, 'Pizza Vegetale', 'Mit Champignons, Peperoni, Paprika, Artischocken', 'Pizza', 11.00, false, 'A,G', true, true, 22),
  (222, 'Pizza Mare', 'Mit Meeresfrüchten', 'Pizza', 11.50, false, 'A,G,D,R', true, true, 23),
  (223, 'Pizza Salsiccia', 'Mit scharfer italienischer Salami', 'Pizza', 10.00, true, 'A,G', true, true, 24),
  (224, 'Pizza Tonno', 'Mit Thunfisch, Zwiebeln', 'Pizza', 11.00, false, 'A,G,D', true, true, 25),
  (225, 'Pizza Ingolstadt', 'Mit Mais, Hinterschinken, Spiegelei', 'Pizza', 10.50, false, 'A,G', true, true, 26),
  (226, 'Pizza della Casa', 'Mit scharfer Salami, Sardellen, Peperoni, Zwiebeln', 'Pizza', 11.00, true, 'A,G', true, true, 27),
  (227, 'Calzone', 'Mit Hinterschinken, Salami, Champignons, Peperoni', 'Pizza', 11.00, false, 'A,G', true, true, 28),
  (228, 'Pizza Parma', 'Mit Parmaschinken, Rucola, Grana', 'Pizza', 11.50, false, 'A,G', true, true, 29),
  (229, 'Pizza Caprese', 'Mit frischen Tomaten, Rucola, Grana, Mozzarella', 'Pizza', 11.50, false, 'A,G', true, true, 30),
  (230, 'Pizza Carciofi', 'Mit Artischocken, Mozzarella, Oliven', 'Pizza', 10.50, false, 'A,G', true, true, 31),
  (231, 'Pizza Broccoli', 'Mit Broccoli, Knoblauch', 'Pizza', 10.00, false, 'A,G', true, true, 32),
  (232, 'Pizza Bufala', 'Mit Rucola, Büffelmozzarella', 'Pizza', 11.00, false, 'A,G', true, true, 33),
  (233, 'Pizza Calabrese', 'Mit Oliven, Rucola, scharfer Salami', 'Pizza', 11.00, true, 'A,G', true, true, 34),
  (234, 'Pizza Gorgonzola', 'Mit Gorgonzola', 'Pizza', 9.50, false, 'A,G', true, true, 35),
  (235, 'Pizza Vesuvio', 'Mit Oliven, Salami, scharf', 'Pizza', 10.50, true, 'A,G', true, true, 36),
  (236, 'Pizza Napoleone', 'Mit Gorgonzola, Speck, scharfer Salami', 'Pizza', 11.00, true, 'A,G', true, true, 37),
  (237, 'Pizza Quattro Formaggi', 'Mit vier Käsesorten', 'Pizza', 11.00, false, 'A,G', true, true, 38),
  (238, 'Pizza Siciliano', 'Mit Sardellen, Kapern, Oliven', 'Pizza', 10.50, false, 'A,G,D', true, true, 39),
  (239, 'Pizza Del Re', 'Mit Hinterschinken, Champignons, scharfer Salami, Peperoni, Paprika', 'Pizza', 11.50, true, 'A,G,D', true, true, 40),
  (240, 'Pizza Salmone', 'Mit Lachs, Spinat, Kirschtomaten', 'Pizza', 12.00, false, 'A,G,D', true, true, 41),
  (241, 'Pizza Gioia', 'Mit Oliven, Sardellen, frischen Tomaten', 'Pizza', 10.50, false, 'A,G,D', true, true, 42),
  (242, 'Pizza Romeo e Giulietta', 'Mit Frischkäse, Mozzarella, Pesto, Kirschtomaten', 'Pizza', 12.00, false, 'A,G,E', true, true, 43),
  (243, 'Pizza dell Orto', 'Mit Frischkäse, Grillgemüse', 'Pizza', 12.00, false, 'A,G', true, true, 44),
  (244, 'Pizza Rustica', 'Mit Speck, Spinat, Gorgonzola', 'Pizza', 11.50, false, 'A,G', true, true, 45),
  (245, 'Pizza Valdostana', 'Mit Frischkäse, Walnüssen, Speck (ohne Tomatensauce)', 'Pizza', 12.00, false, 'A,G,E', true, true, 46),
  (246, 'Pizza Mare Monti', 'Mit Lachs, Spinat, Steinpilzen, Kirschtomaten', 'Pizza', 14.00, false, 'A,G,D', true, true, 47),
  (247, 'Pizza Capricciosa', 'Mit Artischocken, Oliven, Schinken, Salami, Paprika', 'Pizza', 11.00, false, 'A,G', true, true, 48),
  (248, 'Pizza Tartufata', 'Mit Frischkäse, Trüffel-Pesto, Rucola (ohne Tomatensauce)', 'Pizza', 13.00, false, 'A,G', true, true, 49),
  (249, 'Pizza Genovese', 'Mit Pesto, Kirschtomaten, Parmaschinken (ohne Tomatensauce)', 'Pizza', 12.00, false, 'A,G', true, true, 50),
  (250, 'Pizza Sofia', 'Mit Frischkäse, Garnelen, Zucchini, Kirschtomaten (ohne Tomatensauce)', 'Pizza', 12.50, false, 'A,G,D', true, true, 51),
  (251, 'Pizza Cinquecento', 'Mit Frischkäse, scharfer Salami, Rucola, Parmesan, Kirschtomaten', 'Pizza', 12.50, true, 'A,G', true, true, 52),
  (252, 'Pizza Celentano', 'Mit Gorgonzola, Speck, Zwiebel, Knoblauch, scharf', 'Pizza', 11.50, true, 'A,G', true, true, 53),
  (253, 'Pizza Pazza', 'Mit scharfer Salami, Sardellen, Oliven, Kirschtomaten', 'Pizza', 11.00, true, 'A,G', true, true, 54),
  (254, 'Pizza Primavera', 'Mit Brokkoli, Mais, Paprika, Kirschtomaten', 'Pizza', 11.00, false, 'A,G', true, true, 55),
  (255, 'Pizza Diavolo', 'Mit scharfer Salami, Zwiebeln, Peperoni, Knoblauch, scharf', 'Pizza', 11.50, true, 'A,G', true, true, 56),
  (256, 'Pizza Parmigiana', 'Mit Auberginen, Kirschtomaten, Mozzarella, Parmesan', 'Pizza', 11.50, false, 'A,G', true, true, 57),
  (257, 'Pizza Porcini', 'Mit Frischkäse, Steinpilzen, Pesto, Rucola (ohne Tomatensauce)', 'Pizza', 13.00, false, 'A,G,D', true, true, 58),
  (258, 'Pizza Sucuk', 'Mit Sucuk, Spiegelei', 'Pizza', 11.00, true, 'A,G', true, true, 59);
