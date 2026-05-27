export type LaundryService = {
  id: string;
  title: string;
  category: string;
  price: string;
  description: string;
  turnaround: string;
  popular?: boolean;
};

export const SERVICE_CATEGORIES = [
  "All",
  "Everyday",
  "Premium",
  "Specialty",
] as const;

export const HARDCODED_LAUNDRY_SERVICES: LaundryService[] = [
  {
    id: "wash-fold",
    title: "Wash & Fold",
    category: "Everyday",
    price: "From KSh 195 / kg",
    description: "Everyday laundry washed, dried, and neatly folded.",
    turnaround: "24–48 hrs",
    popular: true,
  },
  {
    id: "ironing",
    title: "Ironing",
    category: "Everyday",
    price: "From KSh 104 / item",
    description: "Professional pressing for shirts, trousers, and uniforms.",
    turnaround: "Same day",
    popular: true,
  },
  {
    id: "dry-cleaning",
    title: "Dry Cleaning",
    category: "Premium",
    price: "From KSh 650 / item",
    description: "Gentle solvent cleaning for suits, dresses, and delicate fabrics.",
    turnaround: "2–3 days",
  },
  {
    id: "delicate-care",
    title: "Delicate Care",
    category: "Premium",
    price: "From KSh 1,170 / basket",
    description: "Low-tumble wash for silk, wool, and sensitive garments.",
    turnaround: "48 hrs",
    popular: true,
  },
  {
    id: "stain-removal",
    title: "Stain Removal",
    category: "Specialty",
    price: "From KSh 780 / request",
    description: "Targeted treatment for wine, oil, ink, and grass stains.",
    turnaround: "24 hrs",
  },
  {
    id: "curtain-cleaning",
    title: "Curtain Cleaning",
    category: "Specialty",
    price: "From KSh 3,900 / panel",
    description: "Deep clean and careful folding for curtains and drapes.",
    turnaround: "3–5 days",
  },
  {
    id: "blanket-cleaning",
    title: "Blanket Cleaning",
    category: "Specialty",
    price: "From KSh 1,450 / item",
    description: "Large-item wash and dry for blankets, duvets, and comforters.",
    turnaround: "3 days",
  },
  {
    id: "eco-wash",
    title: "Eco Wash",
    category: "Premium",
    price: "From KSh 220 / kg",
    description: "Plant-based detergents and energy-efficient machines.",
    turnaround: "48 hrs",
  },
];
