export const cropTypes = [
  "Rice (Palay)", "Corn", "Coconut", "Cassava", "Sweet Potato",
  "Peanut", "Mongo", "Tomato", "Eggplant", "Pepper", "Okra", "Squash",
  "Banana", "Papaya", "Watermelon", "Livestock (Chicken)", "Livestock (Pig)",
];

export const municipalities = [
  "Mobo", "Milagros", "Aroroy", "Baleno", "Balud", "Cawayan",
  "Claveria", "Dapa", "Esperanza", "Mandaon", "Pilar",
  "San Fernando", "San Jose", "Uson",
];

export const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "quantity_desc", label: "Most Available" },
] as const;
