export type ProviderOffer = {
  serviceId: string;
  price: string;
  unit: string;
  turnaround: string;
};

export type LaundryProviderListing = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  pickupFee: string;
  offers: ProviderOffer[];
};

export const HARDCODED_LAUNDRY_PROVIDERS: LaundryProviderListing[] = [
  {
    id: "ocean-breeze-laundry",
    name: "Ocean Breeze Laundry",
    location: "Riverside District",
    rating: 4.6,
    reviewCount: 128,
    pickupFee: "Free over KSh 2,000",
    offers: [
      { serviceId: "wash-fold", price: "195", unit: "per kg", turnaround: "24 hrs" },
      { serviceId: "ironing", price: "110", unit: "per item", turnaround: "Same day" },
      { serviceId: "dry-cleaning", price: "720", unit: "per item", turnaround: "2 days" },
      { serviceId: "delicate-care", price: "1,250", unit: "per basket", turnaround: "48 hrs" },
    ],
  },
  {
    id: "freshwave-laundry",
    name: "FreshWave Laundry",
    location: "North End",
    rating: 4.7,
    reviewCount: 94,
    pickupFee: "KSh 150 flat",
    offers: [
      { serviceId: "wash-fold", price: "210", unit: "per kg", turnaround: "24 hrs" },
      { serviceId: "ironing", price: "104", unit: "per item", turnaround: "Same day" },
      { serviceId: "delicate-care", price: "1,170", unit: "per basket", turnaround: "48 hrs" },
      { serviceId: "curtain-cleaning", price: "3,900", unit: "per panel", turnaround: "4 days" },
    ],
  },
  {
    id: "sunshine-suds-co",
    name: "Sunshine Suds Co.",
    location: "Central Business Area",
    rating: 4.4,
    reviewCount: 76,
    pickupFee: "Free pickup",
    offers: [
      { serviceId: "wash-fold", price: "185", unit: "per kg", turnaround: "48 hrs" },
      { serviceId: "stain-removal", price: "780", unit: "per request", turnaround: "24 hrs" },
      { serviceId: "blanket-cleaning", price: "1,450", unit: "per item", turnaround: "3 days" },
      { serviceId: "ironing", price: "98", unit: "per item", turnaround: "Next day" },
    ],
  },
  {
    id: "greenleaf-cleaners",
    name: "GreenLeaf Cleaners",
    location: "Westside",
    rating: 4.5,
    reviewCount: 61,
    pickupFee: "Free over KSh 1,500",
    offers: [
      { serviceId: "eco-wash", price: "220", unit: "per kg", turnaround: "48 hrs" },
      { serviceId: "delicate-care", price: "1,320", unit: "per basket", turnaround: "48 hrs" },
      { serviceId: "blanket-cleaning", price: "1,380", unit: "per item", turnaround: "3 days" },
      { serviceId: "wash-fold", price: "200", unit: "per kg", turnaround: "48 hrs" },
    ],
  },
  {
    id: "cityspin-laundromat",
    name: "CitySpin Laundromat",
    location: "Downtown",
    rating: 4.3,
    reviewCount: 52,
    pickupFee: "KSh 200 flat",
    offers: [
      { serviceId: "wash-fold", price: "175", unit: "per kg", turnaround: "24 hrs" },
      { serviceId: "ironing", price: "115", unit: "per item", turnaround: "Same day" },
      { serviceId: "stain-removal", price: "850", unit: "per request", turnaround: "48 hrs" },
    ],
  },
  {
    id: "royalrinse-laundry",
    name: "RoyalRinse Laundry",
    location: "East Heights",
    rating: 4.2,
    reviewCount: 39,
    pickupFee: "KSh 100 flat",
    offers: [
      { serviceId: "dry-cleaning", price: "650", unit: "per item", turnaround: "3 days" },
      { serviceId: "stain-removal", price: "720", unit: "per request", turnaround: "24 hrs" },
      { serviceId: "curtain-cleaning", price: "4,100", unit: "per panel", turnaround: "5 days" },
    ],
  },
];

export const getProvidersForService = (serviceId: string) =>
  HARDCODED_LAUNDRY_PROVIDERS.filter((p) =>
    p.offers.some((o) => o.serviceId === serviceId),
  ).map((p) => ({
    provider: p,
    offer: p.offers.find((o) => o.serviceId === serviceId)!,
  }));

export const formatOfferPrice = (price: string, unit: string) =>
  `KSh ${price} ${unit}`;
