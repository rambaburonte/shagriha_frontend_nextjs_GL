import type {
  Application,
  Lease,
  Payment,
  PaymentMethod,
  Property,
  SavePaymentMethodRequest,
} from "@/types/prismaTypes";
import { AmenityEnum, HighlightEnum } from "@/lib/constants";
import {
  getDemoPublishedProperties,
  getDemoPublishedProperty,
} from "@/lib/propertyDraftStorage";

// Demo data remains available for UI-only work, while local integration uses the
// Spring Boot API by default.
export const FRONTEND_DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const demoProperty: Property = {
  id: 1,
  name: "Lakeview Apartments",
  description:
    "A bright, modern apartment with generous living space and easy access to downtown.",
  pricePerMonth: 1850,
  securityDeposit: 1850,
  applicationFee: 50,
  photoUrls: ["/singlelisting-2.jpg"],
  amenities: [
    AmenityEnum.WasherDryer,
    AmenityEnum.Dishwasher,
    AmenityEnum.HighSpeedInternet,
    AmenityEnum.Parking,
  ],
  highlights: [
    HighlightEnum.RecentlyRenovated,
    HighlightEnum.CloseToTransit,
    HighlightEnum.GreatView,
  ],
  isPetsAllowed: true,
  isParkingIncluded: true,
  beds: 2,
  baths: 2,
  squareFeet: 1180,
  propertyType: "Apartment",
  postedDate: "2026-07-20",
  averageRating: 4.8,
  numberOfReviews: 24,
  locationId: 1,
  managerUserId: "demo-manager",
  location: {
    id: 1,
    address: "1200 Lake Shore Drive",
    city: "Chicago",
    state: "IL",
    country: "USA",
    postalCode: "60601",
    coordinates: { longitude: -87.6231, latitude: 41.8858 },
  },
};

export const demoLease: Lease = {
  id: 1,
  startDate: "2026-06-01",
  endDate: "2027-05-31",
  rent: 1850,
  deposit: 1850,
  propertyId: demoProperty.id,
  tenantUserId: "demo-tenant",
  property: demoProperty,
  tenant: {
    id: 2,
    userId: "demo-tenant",
    name: "Jordan Lee",
    email: "jordan@example.com",
    phoneNumber: "(312) 555-0184",
    favorites: [demoProperty],
  },
  payments: [],
};

export const demoApplications: Application[] = [
  {
    id: 1,
    applicationDate: "2026-07-22",
    status: "Pending",
    propertyId: demoProperty.id,
    tenantUserId: "demo-tenant",
    name: "Jordan Lee",
    email: "jordan@example.com",
    phoneNumber: "(312) 555-0184",
    message: "I am interested in moving in next month.",
    leaseId: null,
    property: demoProperty,
    tenant: demoLease.tenant,
    lease: demoLease,
  },
  {
    id: 2,
    applicationDate: "2026-07-18",
    status: "Approved",
    propertyId: demoProperty.id,
    tenantUserId: "demo-tenant-2",
    name: "Taylor Morgan",
    email: "taylor@example.com",
    phoneNumber: "(773) 555-0142",
    message: null,
    leaseId: demoLease.id,
    property: demoProperty,
    tenant: demoLease.tenant,
    lease: demoLease,
  },
  {
    id: 3,
    applicationDate: "2026-07-15",
    status: "Denied",
    propertyId: demoProperty.id,
    tenantUserId: "demo-tenant-3",
    name: "Casey Smith",
    email: "casey@example.com",
    phoneNumber: "(847) 555-0129",
    message: null,
    leaseId: null,
    property: demoProperty,
    tenant: demoLease.tenant,
    lease: demoLease,
  },
];

export const demoPayments: Payment[] = [
  {
    id: 1,
    amountDue: 1850,
    amountPaid: 1850,
    dueDate: "2026-07-01",
    paymentDate: "2026-07-01",
    paymentStatus: "Paid",
    leaseId: demoLease.id,
  },
];

let demoPaymentMethod: PaymentMethod | null = {
  id: 1,
  cardholderName: "Jordan Lee",
  brand: "Visa",
  last4: "2024",
  expiryMonth: "06",
  expiryYear: "28",
  isDefault: true,
  billingAddress: "1200 Lake Shore Drive",
  country: "United States",
  city: "Chicago",
  state: "Illinois",
  postalCode: "60601",
};

export const demoAuthUser: User = {
  authInfo: { userId: "demo-manager", username: "demo.manager" },
  userInfo: {
    id: 1,
    userId: "demo-manager",
    name: "Demo Manager",
    email: "manager@example.com",
    phoneNumber: "(312) 555-0100",
    managedProperties: [demoProperty],
  },
  userRole: "manager",
};

function getMergedDemoProperties(): Property[] {
  const localProperties = getDemoPublishedProperties();
  return [
    ...localProperties,
    ...[demoProperty].filter(
      (property) => !localProperties.some((local) => local.id === property.id)
    ),
  ];
}

const getCardBrand = (cardNumber: string) => {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  return "Card";
};

export function getDemoApiData(
  url: string,
  method = "GET",
  body?: unknown
) {
  if (url === "auth/me") return demoAuthUser;
  if (url === "auth/enable-manager" && method === "POST") {
    demoAuthUser.userRole = "manager";
    return {
      token: { accessToken: "demo-manager-token", tokenType: "Bearer", expiresIn: 3600 },
      userId: demoAuthUser.authInfo.userId,
      username: demoAuthUser.authInfo.username,
      role: "MANAGER",
    };
  }
  if (url === "properties" && method === "POST") return demoProperty;
  if (url === "properties") return getMergedDemoProperties();

  if (/^properties\/\d+$/.test(url)) {
    const propertyId = Number(url.split("/")[1]);
    return getDemoPublishedProperty(propertyId) ?? demoProperty;
  }

  if (/^properties\/\d+\/leases$/.test(url)) {
    const propertyId = Number(url.split("/")[1]);
    return propertyId === demoProperty.id ? [demoLease] : [];
  }

  if (/^managers\/[^/]+\/properties$/.test(url)) {
    return getMergedDemoProperties();
  }

  if (/^managers\/[^/]+$/.test(url)) return demoAuthUser.userInfo;
  if (/^tenants\/[^/]+\/current-residences$/.test(url)) return [demoProperty];
  if (/^tenants\/[^/]+\/favorites\/\d+$/.test(url)) return demoLease.tenant;
  if (/^tenants\/[^/]+$/.test(url)) return demoLease.tenant;
  if (url === "applications") return demoApplications;
  if (/^applications\/\d+\/status$/.test(url)) return demoApplications[0];
  if (url === "leases") return [demoLease];
  if (/^leases\/\d+\/payments$/.test(url)) return demoPayments;

  if (/^tenants\/[^/]+\/payment-method$/.test(url)) {
    if (method === "GET") return demoPaymentMethod;
    if (method === "DELETE") {
      demoPaymentMethod = null;
      return null;
    }

    const data = body as SavePaymentMethodRequest;
    const [expiryMonth, expiryYear] = data.expiryDate.split("/");
    const cardNumber = data.cardNumber?.replace(/\s/g, "");
    demoPaymentMethod = {
      id: demoPaymentMethod?.id ?? 1,
      cardholderName: data.cardholderName,
      brand: cardNumber
        ? getCardBrand(cardNumber)
        : demoPaymentMethod?.brand ?? "Card",
      last4: cardNumber?.slice(-4) ?? demoPaymentMethod?.last4 ?? "0000",
      expiryMonth,
      expiryYear,
      isDefault: data.isDefault,
      billingAddress: data.billingAddress,
      country: data.country,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
    };
    return demoPaymentMethod;
  }

  return [];
}
