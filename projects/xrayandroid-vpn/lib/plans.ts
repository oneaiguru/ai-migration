export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year" | "lifetime";
  popular?: boolean;
  savings?: number;
  features: string[];
  limits: {
    dailyQuota: number | null;
    servers: number | null;
    devices: number | null;
    dedicatedIp?: boolean;
  };
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "500MB daily limit",
      "3 server locations",
      "1 device",
      "Basic support",
      "Ads",
    ],
    limits: {
      dailyQuota: 524288000,
      servers: 3,
      devices: 1,
    },
  },
  {
    id: "premium_monthly",
    name: "Premium",
    price: 499,
    interval: "month",
    popular: true,
    features: [
      "Unlimited data",
      "50+ servers",
      "5 devices",
      "Priority support",
      "No ads",
      "All protocols",
    ],
    limits: {
      dailyQuota: null,
      servers: null,
      devices: 5,
    },
  },
  {
    id: "premium_annual",
    name: "Premium Annual",
    price: 3999,
    interval: "year",
    savings: 33,
    features: [
      "Unlimited data",
      "50+ servers",
      "5 devices",
      "Priority support",
      "No ads",
      "All protocols",
    ],
    limits: {
      dailyQuota: null,
      servers: null,
      devices: 5,
    },
  },
  {
    id: "ultimate_monthly",
    name: "Ultimate",
    price: 999,
    interval: "month",
    features: [
      "Unlimited data",
      "50+ servers",
      "10 devices",
      "24/7 support",
      "No ads",
      "Dedicated IP",
      "Streaming optimized",
    ],
    limits: {
      dailyQuota: null,
      servers: null,
      devices: 10,
      dedicatedIp: true,
    },
  },
  {
    id: "ultimate_annual",
    name: "Ultimate Annual",
    price: 7999,
    interval: "year",
    savings: 33,
    features: [
      "Unlimited data",
      "50+ servers",
      "10 devices",
      "24/7 support",
      "No ads",
      "Dedicated IP",
      "Streaming optimized",
    ],
    limits: {
      dailyQuota: null,
      servers: null,
      devices: 10,
      dedicatedIp: true,
    },
  },
];

export function getPlanById(id: string) {
  return plans.find((plan) => plan.id === id) ?? null;
}

export function getBasePlan(planId: string) {
  if (planId.startsWith("premium")) {
    return "premium";
  }
  if (planId.startsWith("ultimate")) {
    return "ultimate";
  }
  return "free";
}
