alter table public.properties
  add column if not exists description text,
  add column if not exists construction_year smallint,
  add column if not exists energy_rating text,
  add column if not exists floor text,
  add column if not exists features text[] not null default '{}',
  add column if not exists gallery text[] not null default '{}';

update public.properties
set
  description = case type
    when 'Villa' then 'Una villa concebida para vivir entre el interior y el paisaje. Sus espacios abiertos, la luz natural y la relación con el exterior crean una atmósfera serena durante todo el año.'
    when 'Ático' then 'Una vivienda elevada sobre la ciudad, con estancias amplias y una terraza pensada para disfrutar de la luz desde primera hora hasta el atardecer.'
    when 'Apartamento' then 'Un hogar urbano equilibrado, reformado con materiales cálidos y una distribución que aprovecha cada metro sin renunciar a la amplitud.'
    when 'Casa rural' then 'Arquitectura tradicional y confort contemporáneo en un entorno tranquilo. Una casa con textura, historia y espacios para reunirse sin prisa.'
    when 'Estudio' then 'Un espacio compacto y cuidadosamente resuelto en pleno centro, ideal para disfrutar de la ciudad con comodidad y carácter.'
    else 'Una vivienda luminosa y funcional donde cada estancia conecta de forma natural con el exterior y con la vida cotidiana.'
  end,
  construction_year = 2021 - (id % 7),
  energy_rating = (array['A', 'B', 'B', 'C'])[(id % 4) + 1],
  floor = case
    when type = 'Villa' or type like 'Casa%' then 'Independiente'
    else ((id % 6) + 1)::text || 'ª planta'
  end,
  features = case
    when type = 'Villa' then array['Piscina privada', 'Jardín', 'Terraza', 'Garaje', 'Climatización', 'Vistas abiertas']
    else array['Luz natural', 'Cocina equipada', 'Climatización', 'Armarios empotrados', 'Ascensor', 'Terraza']
  end,
  gallery = array[
    image,
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=88',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=88',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=88',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=88'
  ];

alter table public.properties
  alter column description set not null,
  alter column construction_year set not null,
  alter column energy_rating set not null,
  alter column floor set not null;

alter table public.properties
  drop constraint if exists properties_construction_year_check,
  drop constraint if exists properties_energy_rating_check;

alter table public.properties
  add constraint properties_construction_year_check check (construction_year between 1800 and 2100),
  add constraint properties_energy_rating_check check (energy_rating in ('A', 'B', 'C', 'D', 'E', 'F', 'G'));
