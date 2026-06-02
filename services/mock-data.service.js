const products = [
  {
    id: "p1",
    name: "Truffle Parmesan Fries",
    price: 8.5,
    category: "Starters",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIvq1GedBnLXTMGgj9Xqxu4rbw7QB_Yf71niOJnroKL0uLisJHsloyruwUkmQzC5dW9VWxCFuZ39Qn2RtqzLgz-26TFGwm08AQvRfsciFcHluIoM4mGNG8aipwxy7uIkXzbsbfV1MPPj_eLiS9AfmdJfB1itzfZeT5NlygNixvVhCyzjXfRBU2bessoJWiExQGP2_0NRnFA5R3Dlcma0zuPeRlP7CnqgbjPNVcx7-HUheAaShIN2pkG-ogcyaMXwF-3uRQh-hcsCpO",
    created_at: new Date("2026-01-01T10:00:00.000Z").toISOString(),
  },
  {
    id: "p5",
    name: "Garlic Herb Bruschetta",
    price: 7.0,
    category: "Starters",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIvq1GedBnLXTMGgj9Xqxu4rbw7QB_Yf71niOJnroKL0uLisJHsloyruwUkmQzC5dW9VWxCFuZ39Qn2RtqzLgz-26TFGwm08AQvRfsciFcHluIoM4mGNG8aipwxy7uIkXzbsbfV1MPPj_eLiS9AfmdJfB1itzfZeT5NlygNixvVhCyzjXfRBU2bessoJWiExQGP2_0NRnFA5R3Dlcma0zuPeRlP7CnqgbjPNVcx7-HUheAaShIN2pkG-ogcyaMXwF-3uRQh-hcsCpO",
    created_at: new Date("2026-01-01T11:00:00.000Z").toISOString(),
  },
  {
    id: "p2",
    name: "Signature Wagyu Burger",
    price: 18,
    category: "Mains",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6Z9Rr9xd8l0DE3mvuER9CaU6IGfrZG19dQ3p7OjuXCCsOwRYkVd4kfNa3YsLMoy0mwT52bs57J6R_Lzd1-jxOEBawVPP3VXrXfnNngX9h1nJ_yqqcqt36Gz5nkDG_bmO_Y6hecQOVKHbfkkn1cBCmQUBkjLWhyf6FkfT-R-5dTL2fyd7uOqBMIPQ6nuyx-yP29V6QYMZJx2ZYeNL1IA1YFPDcavCNKUH_MQdeJ7phbIYKVagAkIyIW4buZFoDBIfa4EX8DntULed8",
    created_at: new Date("2026-01-02T10:00:00.000Z").toISOString(),
  },
  {
    id: "p3",
    name: "Roasted Roots Quinoa Bowl",
    price: 14.5,
    category: "Mains",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-PArIVSn0NWLXjJhMxBgd5j_1MWVngP0ZS8N_2DOsDEu_PIRrPlV2_cVby9-YNvTQixNO5RWXTpa3YwPRIifZEHu17wWYspkWysy_cq_JWrk97flexlbnc1mTm5-DTS11FyGhfD-n6kzbpebUYffZKSwf3F_gWKkFowL_G9IvMXWCZDhJnp1Xmhr8mFZfKmgdgoHIf-LgGNb9DR4hDIyHVWqpuiS83QNANuN-3jc_BllBz4LZQsLH7SFj_AiTalUHEMOYAoO8JFS8",
    created_at: new Date("2026-01-03T10:00:00.000Z").toISOString(),
  },
  {
    id: "p6",
    name: "Dark Chocolate Lava Cake",
    price: 9.0,
    category: "Desserts",
    image_url:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
    created_at: new Date("2026-01-03T14:00:00.000Z").toISOString(),
  },
  {
    id: "p4",
    name: "Iced Matcha Latte",
    price: 5.5,
    category: "Beverages",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDopa19h4ZBg6GK_OPv5TdXo0lvG0Bgli2NhJnVNvCnzoJ8lAfkYJEJBg8w4dBSIbyMbgS_WScAq3KA-l1mH0zFXO8lcBHrQUtjMjtUEg3Z2VqLOcsNpdThpWcPjmpapU4PtBgrxT7atwRn-xzqlWXD7auCe56oDZZjf44n7Kf56cI3FVhedd5FycRj5D29Z2KkD-oGzV1Eh63_tk_GUA410o0afR_rihfoq8ZCsjhnf_8C_44RtFESGZLwm_k3zw84xeQ6FGzVgDx4",
    created_at: new Date("2026-01-04T10:00:00.000Z").toISOString(),
  },
  {
    id: "p7",
    name: "Sparkling Citrus Cooler",
    price: 4.5,
    category: "Beverages",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDopa19h4ZBg6GK_OPv5TdXo0lvG0Bgli2NhJnVNvCnzoJ8lAfkYJEJBg8w4dBSIbyMbgS_WScAq3KA-l1mH0zFXO8lcBHrQUtjMjtUEg3Z2VqLOcsNpdThpWcPjmpapU4PtBgrxT7atwRn-xzqlWXD7auCe56oDZZjf44n7Kf56cI3FVhedd5FycRj5D29Z2KkD-oGzV1Eh63_tk_GUA410o0afR_rihfoq8ZCsjhnf_8C_44RtFESGZLwm_k3zw84xeQ6FGzVgDx4",
    created_at: new Date("2026-01-04T11:00:00.000Z").toISOString(),
  },
];

const orders = [];

export function listMockProducts() {
  return [...products].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function createMockOrder({
  items,
  total_amount,
  payment_method = "cod",
  payment_status,
  table_number = "1",
  service_type = "dine_in",
  order_status = "received",
}) {
  const status =
    payment_status ??
    (payment_method === "cod" ? "Pending" : "Paid");
  const order = {
    id: crypto.randomUUID(),
    items,
    total_amount,
    payment_method,
    payment_status: status,
    table_number: service_type === "takeout" ? null : table_number,
    service_type,
    order_status,
    created_at: new Date().toISOString(),
  };
  orders.unshift(order);
  return order;
}

export function getMockOrderById(id) {
  return orders.find((order) => String(order.id) === String(id)) ?? null;
}

export function listMockOrders() {
  return [...orders];
}

export function updateMockOrderPaymentStatus({ id, payment_status }) {
  const index = orders.findIndex((order) => String(order.id) === String(id));
  if (index < 0) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }
  orders[index] = { ...orders[index], payment_status };
  return orders[index];
}

export function updateMockOrderStatus({ id, order_status }) {
  const index = orders.findIndex((order) => String(order.id) === String(id));
  if (index < 0) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }
  orders[index] = { ...orders[index], order_status };
  return orders[index];
}
