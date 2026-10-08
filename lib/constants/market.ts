export const cropTypes = [
  "Rice (Palay)", "Corn", "Coconut", "Cassava", "Sweet Potato",
  "Peanut", "Mongo", "Tomato", "Eggplant", "Pepper", "Okra", "Squash",
  "Banana", "Papaya", "Watermelon", "Livestock (Chicken)", "Livestock (Pig)",
];

export interface MasbateMunicipality {
  name: string;
  lat: number;
  lng: number;
}

// The 21 municipalities of Masbate province (coordinates from OpenStreetMap).
export const MASBATE_MUNICIPALITIES: MasbateMunicipality[] = [
  { name: "Aroroy", lat: 12.5123, lng: 123.3987 },
  { name: "Baleno", lat: 12.4739, lng: 123.4975 },
  { name: "Balud", lat: 12.0384, lng: 123.1934 },
  { name: "Batuan", lat: 12.4216, lng: 123.7795 },
  { name: "Cataingan", lat: 11.9996, lng: 123.9978 },
  { name: "Cawayan", lat: 11.9284, lng: 123.7692 },
  { name: "Claveria", lat: 12.9035, lng: 123.2457 },
  { name: "Dimasalang", lat: 12.1931, lng: 123.8586 },
  { name: "Esperanza", lat: 11.737, lng: 124.0417 },
  { name: "Mandaon", lat: 12.2266, lng: 123.2849 },
  { name: "Masbate City", lat: 12.3711, lng: 123.6239 },
  { name: "Milagros", lat: 12.2182, lng: 123.5094 },
  { name: "Mobo", lat: 12.3366, lng: 123.6581 },
  { name: "Monreal", lat: 12.6441, lng: 123.6638 },
  { name: "Palanas", lat: 12.146, lng: 123.9222 },
  { name: "Pio V. Corpuz", lat: 11.8837, lng: 124.0489 },
  { name: "Placer", lat: 11.8703, lng: 123.9182 },
  { name: "San Fernando", lat: 12.4843, lng: 123.7629 },
  { name: "San Jacinto", lat: 12.5677, lng: 123.7337 },
  { name: "San Pascual", lat: 13.1281, lng: 122.9776 },
  { name: "Uson", lat: 12.2251, lng: 123.7847 },
];

export const municipalities = MASBATE_MUNICIPALITIES.map((m) => m.name);

export const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "quantity_desc", label: "Most Available" },
] as const;
