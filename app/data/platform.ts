import {
  PROVIDER_ORDER_FLOW,
  PROVIDER_STATUS_LABELS,
  type ProviderOrderStatus,
} from "~/data/providerOrders";

export type { ProviderOrderStatus };
export { PROVIDER_ORDER_FLOW, PROVIDER_STATUS_LABELS };

export type PlatformRole = "customer" | "provider" | "admin";

export type PlatformService = {
  title: string;
  price: string;
  description: string;
};

export type PlatformOrder = {
  id: string;
  provider: string;
  customerName: string;
  customerPhone: string;
  providerPhone: string;
  status: ProviderOrderStatus;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  notes?: string;
  services: PlatformService[];
  totalEstimate: string;
};

export type PlatformActivity = {
  id: string;
  orderId: string;
  type: "status" | "message" | "booking" | "admin";
  title: string;
  detail: string;
  actor: PlatformRole;
  actorName: string;
  at: string;
};

export type PlatformMessage = {
  id: string;
  orderId: string;
  from: PlatformRole;
  senderName: string;
  body: string;
  at: string;
};

export const PLATFORM_ORDERS: PlatformOrder[] = [
  {
    id: "EF-2048",
    provider: "Ocean Breeze Laundry",
    customerName: "Lara Cheruiyot",
    customerPhone: "+254 712 345 678",
    providerPhone: "+254 700 111 222",
    status: "washing",
    pickupDate: "2026-05-28",
    pickupTime: "14:30",
    pickupAddress: "12 Green Street, Apt 4, Nairobi",
    notes: "Ring the gate bell and wait at the reception.",
    totalEstimate: "KSh 4,368",
    services: [
      { title: "Wash & Fold", price: "KSh 3,120", description: "Mixed-load wash and fold." },
      { title: "Ironing", price: "KSh 1,248", description: "Crisp press for shirts and uniforms." },
    ],
  },
  {
    id: "EF-1007",
    provider: "FreshWave Laundry",
    customerName: "Musa Wanjala",
    customerPhone: "+254 701 222 333",
    providerPhone: "+254 733 444 555",
    status: "ready",
    pickupDate: "2026-05-27",
    pickupTime: "10:00",
    pickupAddress: "42 Riverside Drive, Block B",
    totalEstimate: "KSh 6,240",
    services: [
      { title: "Delicate Care", price: "KSh 2,340", description: "Low-tumble cleaning for delicates." },
      { title: "Curtain Cleaning", price: "KSh 3,900", description: "Careful drying and folding for panels." },
    ],
  },
  {
    id: "EF-0833",
    provider: "GreenLeaf Cleaners",
    customerName: "Amina Hassan",
    customerPhone: "+254 733 888 999",
    providerPhone: "+254 722 333 444",
    status: "delivered",
    pickupDate: "2026-05-18",
    pickupTime: "15:00",
    pickupAddress: "Westside Apartments, Unit 12",
    totalEstimate: "KSh 3,500",
    services: [
      { title: "Eco Wash", price: "KSh 3,500", description: "Eco-friendly wash and fold bundle." },
    ],
  },
  {
    id: "EF-0711",
    provider: "CitySpin Laundromat",
    customerName: "Joseph Otieno",
    customerPhone: "+254 722 111 444",
    providerPhone: "+254 711 555 666",
    status: "pending",
    pickupDate: "2026-05-16",
    pickupTime: "09:30",
    pickupAddress: "Downtown, Moi Avenue",
    totalEstimate: "KSh 2,100",
    services: [
      { title: "Wash & Fold", price: "KSh 2,100", description: "Quick turnaround everyday laundry." },
    ],
  },
  {
    id: "EF-0605",
    provider: "Ocean Breeze Laundry",
    customerName: "Grace Njeri",
    customerPhone: "+254 745 555 121",
    providerPhone: "+254 700 111 222",
    status: "washing",
    pickupDate: "2026-05-14",
    pickupTime: "11:30",
    pickupAddress: "Kilimani, Chania Road",
    notes: "Separate whites from colors.",
    totalEstimate: "KSh 3,500",
    services: [
      { title: "Wash & Fold", price: "KSh 2,600", description: "Color-sorted wash and fold." },
      { title: "Ironing", price: "KSh 900", description: "Press for two office shirts." },
    ],
  },
  {
    id: "EF-0522",
    provider: "Ocean Breeze Laundry",
    customerName: "Peter Kamau",
    customerPhone: "+254 710 999 000",
    providerPhone: "+254 700 111 222",
    status: "cancelled",
    pickupDate: "2026-05-12",
    pickupTime: "08:00",
    pickupAddress: "Parklands, 3rd Avenue",
    notes: "Customer cancelled before pickup.",
    totalEstimate: "KSh 1,100",
    services: [
      { title: "Ironing", price: "KSh 1,100", description: "Five shirts only." },
    ],
  },
];

export const PLATFORM_MESSAGES: PlatformMessage[] = [
  {
    id: "m1",
    orderId: "EF-2048",
    from: "provider",
    senderName: "Ocean Breeze Laundry",
    body: "Hi Lara — we have received your order and will pick up at 14:30 today.",
    at: "2026-05-28T09:00:00",
  },
  {
    id: "m2",
    orderId: "EF-2048",
    from: "customer",
    senderName: "Lara Cheruiyot",
    body: "Thanks! Please ring the gate bell when you arrive.",
    at: "2026-05-28T09:15:00",
  },
  {
    id: "m3",
    orderId: "EF-1007",
    from: "provider",
    senderName: "FreshWave Laundry",
    body: "Your laundry is ready for delivery. Reply with a preferred drop-off time.",
    at: "2026-05-27T15:30:00",
  },
  {
    id: "m4",
    orderId: "EF-0711",
    from: "customer",
    senderName: "Joseph Otieno",
    body: "Can pickup be moved to 10:00 instead?",
    at: "2026-05-16T08:00:00",
  },
];

export const PLATFORM_ACTIVITIES: PlatformActivity[] = [
  {
    id: "a1",
    orderId: "EF-2048",
    type: "status",
    title: "Order in washing",
    detail: "Ocean Breeze Laundry started processing EF-2048.",
    actor: "provider",
    actorName: "Ocean Breeze Laundry",
    at: "2026-05-28T11:00:00",
  },
  {
    id: "a2",
    orderId: "EF-1007",
    type: "status",
    title: "Order ready",
    detail: "FreshWave Laundry marked EF-1007 as ready for delivery.",
    actor: "provider",
    actorName: "FreshWave Laundry",
    at: "2026-05-27T14:00:00",
  },
  {
    id: "a3",
    orderId: "EF-0711",
    type: "booking",
    title: "New order placed",
    detail: "Joseph Otieno booked wash & fold with CitySpin Laundromat.",
    actor: "customer",
    actorName: "Joseph Otieno",
    at: "2026-05-16T07:30:00",
  },
  {
    id: "a4",
    orderId: "EF-0833",
    type: "status",
    title: "Order delivered",
    detail: "GreenLeaf Cleaners completed delivery for EF-0833.",
    actor: "provider",
    actorName: "GreenLeaf Cleaners",
    at: "2026-05-18T17:00:00",
  },
];
