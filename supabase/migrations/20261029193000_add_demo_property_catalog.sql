with demo(id, title, location, city, price, bedrooms, bathrooms, area, type, operation, badge, featured, image) as (
  values
    (17, 'Ático Retiro', 'Retiro, Madrid', 'Madrid', 980000, 3, 2, 156, 'Ático', 'comprar', 'Novedad', true, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=88'),
    (18, 'Apartamento Malasaña', 'Malasaña, Madrid', 'Madrid', 1950, 2, 1, 84, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=88'),
    (19, 'Casa Sarrià', 'Sarrià, Barcelona', 'Barcelona', 1420000, 4, 3, 260, 'Casa', 'comprar', null, true, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=88'),
    (20, 'Loft Poblenou', 'Poblenou, Barcelona', 'Barcelona', 2300, 2, 2, 118, 'Apartamento', 'alquilar', 'Reformado', false, 'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=88'),
    (21, 'Ático Turia', 'Pla del Real, Valencia', 'Valencia', 620000, 3, 2, 148, 'Ático', 'comprar', null, false, 'https://images.unsplash.com/photo-1600607688960-e095ff83135c?auto=format&fit=crop&w=1200&q=88'),
    (22, 'Estudio Ruzafa', 'Ruzafa, Valencia', 'Valencia', 980, 1, 1, 48, 'Estudio', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=88'),
    (23, 'Casa Santa Cruz', 'Santa Cruz, Sevilla', 'Sevilla', 690000, 4, 3, 215, 'Casa', 'comprar', 'Patio', true, 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=88'),
    (24, 'Apartamento Alameda', 'Alameda, Sevilla', 'Sevilla', 1250, 2, 1, 76, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?auto=format&fit=crop&w=1200&q=88'),
    (25, 'Villa Limonar', 'El Limonar, Málaga', 'Málaga', 1750000, 5, 4, 365, 'Villa', 'comprar', 'Exclusiva', true, 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=88'),
    (26, 'Apartamento Soho', 'Soho, Málaga', 'Málaga', 1650, 2, 2, 96, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=88'),
    (27, 'Casa Cabo Huertas', 'Cabo de las Huertas, Alicante', 'Alicante', 860000, 4, 3, 230, 'Casa', 'comprar', null, false, 'https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=88'),
    (28, 'Ático Centro', 'Centro, Alicante', 'Alicante', 1750, 3, 2, 132, 'Ático', 'alquilar', 'Terraza', false, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=88'),
    (29, 'Apartamento Abando', 'Abando, Bilbao', 'Bilbao', 525000, 3, 2, 124, 'Apartamento', 'comprar', null, false, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=88'),
    (30, 'Loft Casco Viejo', 'Casco Viejo, Bilbao', 'Bilbao', 1450, 1, 1, 72, 'Apartamento', 'alquilar', 'Reformado', false, 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=88'),
    (31, 'Carmen del Darro', 'Albaicín, Granada', 'Granada', 640000, 3, 2, 192, 'Casa', 'comprar', 'Vistas', true, 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=88'),
    (32, 'Estudio Realejo', 'Realejo, Granada', 'Granada', 790, 1, 1, 45, 'Estudio', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=88'),
    (33, 'Villa Portals', 'Portals Nous, Mallorca', 'Mallorca', 2850000, 5, 5, 440, 'Villa', 'comprar', 'Exclusiva', true, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=88'),
    (34, 'Apartamento Santa Catalina', 'Santa Catalina, Mallorca', 'Mallorca', 2200, 2, 2, 104, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=88'),
    (35, 'Casa Begur', 'Begur, Girona', 'Girona', 1180000, 4, 3, 280, 'Casa', 'comprar', 'Costa', false, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=88'),
    (36, 'Apartamento Barri Vell', 'Barri Vell, Girona', 'Girona', 1200, 2, 1, 82, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?auto=format&fit=crop&w=1200&q=88'),
    (37, 'Villa Es Cubells', 'Es Cubells, Ibiza', 'Ibiza', 3900000, 6, 6, 560, 'Villa', 'comprar', 'Exclusiva', true, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88'),
    (38, 'Apartamento Marina', 'Marina Botafoch, Ibiza', 'Ibiza', 3400, 2, 2, 116, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=88'),
    (39, 'Ático Gros', 'Gros, San Sebastián', 'San Sebastián', 1150000, 3, 2, 164, 'Ático', 'comprar', 'Terraza', true, 'https://images.unsplash.com/photo-1600607688960-e095ff83135c?auto=format&fit=crop&w=1200&q=88'),
    (40, 'Apartamento Centro', 'Centro, San Sebastián', 'San Sebastián', 2450, 2, 2, 98, 'Apartamento', 'alquilar', 'Alquiler', false, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=88')
)
insert into public.properties (id, title, location, city, price, bedrooms, bathrooms, area, type, operation, badge, featured, date_added, image, description, construction_year, energy_rating, floor, features, gallery)
select id, title, location, city, price, bedrooms, bathrooms, area, type, operation, badge, featured, current_date - ((id - 17) % 30), image,
  'Vivienda de demostración creada para explorar las funciones de Lumera. Sus datos no corresponden a un anuncio real.',
  2012 + (id % 13), (array['A','B','B','C'])[(id % 4) + 1],
  case when type in ('Villa', 'Casa') then 'Independiente' else ((id % 6) + 1)::text || 'ª planta' end,
  array['Luz natural', 'Cocina equipada', 'Climatización', 'Terraza'], array[image]
from demo
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('public.properties', 'id'), (select max(id) from public.properties));
