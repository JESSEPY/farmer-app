// Demo supply shown on the market map (clearly labelled as sample data in the UI).
// Spread across Masbate so every availability level appears: high, medium, low and none.

export interface DemoSupply {
  municipality: string;
  crop: string;
  quantityKg: number;
  pricePerKg: number;
}

export const DEMO_SUPPLY: DemoSupply[] = [
  { municipality: "Aroroy", crop: "Rice (Palay)", quantityKg: 2000, pricePerKg: 23 },
  { municipality: "Aroroy", crop: "Coconut", quantityKg: 3000, pricePerKg: 15 },
  { municipality: "Aroroy", crop: "Peanut", quantityKg: 150, pricePerKg: 45 },
  { municipality: "Baleno", crop: "Rice (Palay)", quantityKg: 900, pricePerKg: 22 },
  { municipality: "Baleno", crop: "Corn", quantityKg: 500, pricePerKg: 18 },
  { municipality: "Balud", crop: "Cassava", quantityKg: 400, pricePerKg: 12 },
  { municipality: "Batuan", crop: "Rice (Palay)", quantityKg: 1000, pricePerKg: 21 },
  { municipality: "Batuan", crop: "Sweet Potato", quantityKg: 300, pricePerKg: 25 },
  { municipality: "Cataingan", crop: "Coconut", quantityKg: 2500, pricePerKg: 15 },
  { municipality: "Cataingan", crop: "Banana", quantityKg: 800, pricePerKg: 17 },
  { municipality: "Cawayan", crop: "Corn", quantityKg: 600, pricePerKg: 17 },
  { municipality: "Claveria", crop: "Coconut", quantityKg: 1800, pricePerKg: 14 },
  { municipality: "Claveria", crop: "Cassava", quantityKg: 500, pricePerKg: 11 },
  { municipality: "Dimasalang", crop: "Rice (Palay)", quantityKg: 700, pricePerKg: 22 },
  { municipality: "Esperanza", crop: "Peanut", quantityKg: 120, pricePerKg: 46 },
  { municipality: "Mandaon", crop: "Corn", quantityKg: 800, pricePerKg: 18 },
  { municipality: "Mandaon", crop: "Banana", quantityKg: 400, pricePerKg: 17 },
  { municipality: "Masbate City", crop: "Rice (Palay)", quantityKg: 800, pricePerKg: 22 },
  { municipality: "Masbate City", crop: "Banana", quantityKg: 600, pricePerKg: 18 },
  { municipality: "Milagros", crop: "Corn", quantityKg: 1500, pricePerKg: 18 },
  { municipality: "Milagros", crop: "Cassava", quantityKg: 700, pricePerKg: 11 },
  { municipality: "Mobo", crop: "Rice (Palay)", quantityKg: 1200, pricePerKg: 21 },
  { municipality: "Mobo", crop: "Corn", quantityKg: 900, pricePerKg: 17 },
  { municipality: "Mobo", crop: "Coconut", quantityKg: 2000, pricePerKg: 14 },
  { municipality: "Monreal", crop: "Coconut", quantityKg: 1500, pricePerKg: 14 },
  { municipality: "Monreal", crop: "Sweet Potato", quantityKg: 200, pricePerKg: 26 },
  { municipality: "Pio V. Corpuz", crop: "Cassava", quantityKg: 250, pricePerKg: 12 },
  { municipality: "San Fernando", crop: "Mango", quantityKg: 350, pricePerKg: 60 },
  { municipality: "San Jacinto", crop: "Banana", quantityKg: 450, pricePerKg: 16 },
  { municipality: "San Pascual", crop: "Coconut", quantityKg: 900, pricePerKg: 14 },
  { municipality: "Uson", crop: "Rice (Palay)", quantityKg: 1800, pricePerKg: 22 },
  { municipality: "Uson", crop: "Corn", quantityKg: 700, pricePerKg: 17 },
  // Palanas and Placer are intentionally empty to show the "no listings" pin.
];
