export const cropTypes = [
  "Rice (Palay)", "Corn", "Coconut", "Cassava", "Sweet Potato",
  "Peanut", "Mongo", "Tomato", "Eggplant", "Pepper", "Okra", "Squash",
  "Banana", "Papaya", "Watermelon", "Livestock (Chicken)", "Livestock (Pig)",
];

export interface MunicipalityCoords {
  lat: number;
  lng: number;
}

// Map pin positions (from OpenStreetMap), keyed by municipality name. The names
// themselves come from the PSGC API (see /api/municipalities); this table only
// supplies the coordinates the API does not provide, and doubles as the offline fallback.
export const MUNICIPALITY_COORDS: Record<string, MunicipalityCoords> = {
  "Aroroy": { lat: 12.5123, lng: 123.3987 },
  "Baleno": { lat: 12.4739, lng: 123.4975 },
  "Balud": { lat: 12.0384, lng: 123.1934 },
  "Batuan": { lat: 12.4216, lng: 123.7795 },
  "Cataingan": { lat: 11.9996, lng: 123.9978 },
  "Cawayan": { lat: 11.9284, lng: 123.7692 },
  "Claveria": { lat: 12.9035, lng: 123.2457 },
  "Dimasalang": { lat: 12.1931, lng: 123.8586 },
  "Esperanza": { lat: 11.737, lng: 124.0417 },
  "Mandaon": { lat: 12.2266, lng: 123.2849 },
  "Masbate City": { lat: 12.3711, lng: 123.6239 },
  "Milagros": { lat: 12.2182, lng: 123.5094 },
  "Mobo": { lat: 12.3366, lng: 123.6581 },
  "Monreal": { lat: 12.6441, lng: 123.6638 },
  "Palanas": { lat: 12.146, lng: 123.9222 },
  "Pio V. Corpuz": { lat: 11.8837, lng: 124.0489 },
  "Placer": { lat: 11.8703, lng: 123.9182 },
  "San Fernando": { lat: 12.4843, lng: 123.7629 },
  "San Jacinto": { lat: 12.5677, lng: 123.7337 },
  "San Pascual": { lat: 13.1281, lng: 122.9776 },
  "Uson": { lat: 12.2251, lng: 123.7847 },
};

export const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "quantity_desc", label: "Most Available" },
] as const;
