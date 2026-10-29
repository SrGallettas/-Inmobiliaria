insert into public.properties (id, title, location, city, price, bedrooms, bathrooms, area, type, operation, badge, featured, date_added, image, description, construction_year, energy_rating, floor)
values
  (13, 'Patio de Triana', 'Triana, Sevilla', 'Sevilla', 465000, 3, 2, 132, 'Casa', 'comprar', 'Novedad', false, '2026-10-27', 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=88', 'Una casa urbana luminosa, organizada alrededor de un patio tranquilo en el corazón de Triana.', 2019, 'B', 'Independiente'),
  (14, 'Apartamento Guggenheim', 'Abando, Bilbao', 'Bilbao', 2100, 2, 2, 112, 'Apartamento', 'alquilar', 'Alquiler', false, '2026-10-25', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=88', 'Un apartamento contemporáneo junto a la ría, con estancias amplias y mucha luz natural.', 2022, 'A', '4ª planta'),
  (15, 'Carmen del Alba', 'Albaicín, Granada', 'Granada', 780000, 4, 3, 238, 'Casa', 'comprar', null, true, '2026-10-23', 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=88', 'Una vivienda con jardín y vistas abiertas que combina el carácter granadino con el confort actual.', 2018, 'B', 'Independiente'),
  (16, 'Estudio Nervión', 'Nervión, Sevilla', 'Sevilla', 1050, 1, 1, 54, 'Estudio', 'alquilar', 'Alquiler', false, '2026-10-21', 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?auto=format&fit=crop&w=1200&q=88', 'Un estudio funcional y bien conectado, pensado para disfrutar de la ciudad con comodidad.', 2021, 'B', '3ª planta')
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('public.properties', 'id'), (select max(id) from public.properties));
