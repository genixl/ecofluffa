import type { ProviderOrderStatus } from "~/data/providerOrders";

export type CustomerOrderService = {
  title: string;
  price: string;
  description: string;
};

export type CustomerOrder = {
  id: string;
  provider: string;
  status: ProviderOrderStatus;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  providerPhone: string;
  services: CustomerOrderService[];
  totalEstimate: string;
};

export const HARDCODED_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: "EF-2048",
    provider: "Ocean Breeze Laundry",
    status: "washing",
    pickupDate: "2026-05-28",
    pickupTime: "14:30",
    pickupAddress: "12 Green Street, Apt 4, Nairobi",
    providerPhone: "+254 700 111 222",
    totalEstimate: "KSh 4,368",
    services: [
      { title: "Wash & Fold", price: "KSh 3,120", description: "Mixed-load wash and fold." },
      { title: "Ironing", price: "KSh 1,248", description: "Crisp press for shirts and uniforms." },
    ],
  },
  {
    id: "EF-1007",
    provider: "FreshWave Laundry",
    status: "ready",
    pickupDate: "2026-05-27",
    pickupTime: "10:00",
    pickupAddress: "42 Riverside Drive, Block B",
    providerPhone: "+254 733 444 555",
    totalEstimate: "KSh 6,240",
    services: [
      { title: "Delicate Care", price: "KSh 2,340", description: "Low-tumble cleaning for delicates." },
      { title: "Curtain Cleaning", price: "KSh 3,900", description: "Careful drying and folding for panels." },
    ],
  },
  {
    id: "EF-0833",
    provider: "GreenLeaf Cleaners",
    status: "delivered",
    pickupDate: "2026-05-18",
    pickupTime: "15:00",
    pickupAddress: "Westside Apartments, Unit 12",
    providerPhone: "+254 722 333 444",
    totalEstimate: "KSh 3,500",
    services: [
      { title: "Eco Wash", price: "KSh 3,500", description: "Eco-friendly wash and fold bundle." },
    ],
  },
  {
    id: "EF-0711",
    provider: "CitySpin Laundromat",
    status: "pending",
    pickupDate: "2026-05-16",
    pickupTime: "09:30",
    pickupAddress: "Downtown, Moi Avenue",
    providerPhone: "+254 711 555 666",
    totalEstimate: "KSh 2,100",
    services: [
      { title: "Wash & Fold", price: "KSh 2,100", description: "Quick turnaround everyday laundry." },
    ],
  },
];
