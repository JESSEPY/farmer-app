-- Find listings saved with a municipality that is not one of Masbate's 21 municipalities
-- (older versions of the app offered names such as Pilar, Dapa and San Jose).
-- Run in the Supabase SQL Editor. This only reads data; it changes nothing.

select id, crop, municipality, status, created_at
from listings
where municipality not in (
  'Aroroy', 'Baleno', 'Balud', 'Batuan', 'Cataingan', 'Cawayan', 'Claveria',
  'Dimasalang', 'Esperanza', 'Mandaon', 'Masbate City', 'Milagros', 'Mobo',
  'Monreal', 'Palanas', 'Pio V. Corpuz', 'Placer', 'San Fernando', 'San Jacinto',
  'San Pascual', 'Uson'
)
order by created_at desc;

-- The old names do not map cleanly onto real municipalities, so the owner picks the
-- correct one by opening the listing and choosing Edit (the form now asks for it).
-- If you know the right answer for a specific row, fix it directly, for example:
--   update listings set municipality = 'Mobo' where id = '<listing id>';
