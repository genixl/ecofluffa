export type ProviderOrderStatus =
  | "pending"
  | "washing"
  | "ready"
  | "delivered"
  | "cancelled";

export type ProviderOrderService = {
  title: string;
  price: string;
  description: string;
};

export type ProviderOrder = {
  id: string;
  provider: string;
  customerName: string;
  status: ProviderOrderStatus;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  customerPhone: string;
  notes?: string;
  services: ProviderOrderService[];
};

export const PROVIDER_ORDER_FLOW: ProviderOrderStatus[] = [
  "pending",
  "washing",
  "ready",
  "delivered",
];

export const PROVIDER_STATUS_LABELS: Record<ProviderOrderStatus, string> = {
  pending: "Pending",
  washing: "Washing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const HARDCODED_PROVIDER_ORDERS: ProviderOrder[] = [
  {
    id: "EF-2048",
    provider: "Ocean Breeze Laundry",
    customerName: "Lara Cheruiyot",
    status: "pending",
    pickupDate: "2026-05-28",
    pickupTime: "14:30",
    pickupAddress: "12 Green Street, Apt 4, Nairobi",
    customerPhone: "+254 712 345 678",
    notes: "Ring the gate bell and wait at the reception.",
    services: [
      { title: "Wash & Fold", price: "KSh 3,120", description: "Mixed-load wash and fold." },
      { title: "Ironing", price: "KSh 1,248", description: "Crisp press for shirts and uniforms." },
    ],
  },
  {
    id: "EF-1007",
    provider: "Ocean Breeze Laundry",
    customerName: "Musa Wanjala",
    status: "washing",
    pickupDate: "2026-05-27",
    pickupTime: "10:00",
    pickupAddress: "42 Riverside Drive, Block B",
    customerPhone: "+254 701 222 333",
    notes: "Leave laundry with the security desk if no one is home.",
    services: [
      { title: "Delicate Care", price: "KSh 2,340", description: "Low-tumble cleaning for delicates." },
      { title: "Curtain Cleaning", price: "KSh 3,900", description: "Careful drying and folding for panels." },
    ],
  },
  {
    id: "EF-0812",
    provider: "Ocean Breeze Laundry",
    customerName: "Amina Hassan",
    status: "ready",
    pickupDate: "2026-05-20",
    pickupTime: "16:00",
    pickupAddress: "Westlands, Rhapta Road 9",
    customerPhone: "+254 733 888 999",
    services: [
      { title: "Dry Cleaning", price: "KSh 4,500", description: "Professional dry cleaning for suits." },
    ],
  },
  {
    id: "EF-0711",
    provider: "Ocean Breeze Laundry",
    customerName: "Joseph Otieno",
    status: "delivered",
    pickupDate: "2026-05-16",
    pickupTime: "09:00",
    pickupAddress: "South B, Plainsview Estate",
    customerPhone: "+254 722 111 444",
    services: [
      { title: "Wash & Fold", price: "KSh 2,800", description: "Weekly family laundry bundle." },
    ],
  },
  {
    id: "EF-0605",
    provider: "Ocean Breeze Laundry",
    customerName: "Grace Njeri",
    status: "washing",
    pickupDate: "2026-05-14",
    pickupTime: "11:30",
    pickupAddress: "Kilimani, Chania Road",
    customerPhone: "+254 745 555 121",
    notes: "Separate whites from colors — customer request.",
    services: [
      { title: "Wash & Fold", price: "KSh 2,600", description: "Color-sorted wash and fold." },
      { title: "Ironing", price: "KSh 900", description: "Press for two office shirts." },
    ],
  },
  {
    id: "EF-0522",
    provider: "Ocean Breeze Laundry",
    customerName: "Peter Kamau",
    status: "cancelled",
    pickupDate: "2026-05-12",
    pickupTime: "08:00",
    pickupAddress: "Parklands, 3rd Avenue",
    customerPhone: "+254 710 999 000",
    notes: "Customer cancelled before pickup.",
    services: [
      { title: "Ironing", price: "KSh 1,100", description: "Five shirts only." },
    ],
  },
];
