export interface Product {
  id: string;
  number: number | null;
  name: string;
  description: string;
  category: string;
  base_price: number;
  is_hot: boolean;
  is_vegetarian: boolean;
  is_available: boolean;
  allergens: string;
  has_extras: boolean;
  has_sizes: boolean;
  sort_order: number;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

export interface PizzaSize {
  id: string;
  label: string;
  extra_price: number;
  sort_order: number;
}

export interface SelectedExtra {
  id: string;
  name: string;
  price: number;
}

export interface HalfHalf {
  left: SelectedExtra[];
  right: SelectedExtra[];
}

export interface CartItem {
  cartKey: string;
  productId: string;
  name: string;
  displayName: string;
  basePrice: number;
  size: { id: string; label: string; extraPrice: number } | null;
  extras: SelectedExtra[];
  halfHalf?: HalfHalf | null;
  unitPrice: number;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  notes: string;
  orderType: "delivery" | "pickup";
  paymentType: "online" | "in_person";
}

export interface Order {
  id: string;
  created_at: string;
  stripe_session_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: CartItem[];
  total_amount: number;
  status: "pending" | "paid" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  notes: string | null;
  order_type: "delivery" | "pickup";
  payment_type: "online" | "in_person";
}
