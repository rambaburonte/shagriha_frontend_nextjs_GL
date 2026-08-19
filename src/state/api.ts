import { cleanParams, withToast } from "@/lib/utils";
import { getAccessToken } from "@/lib/authToken";
import {
  FRONTEND_DEMO_MODE,
  getDemoApiData,
} from "@/lib/demoData";
import {
  Application,
  Lease,
  Manager,
  Payment,
  PaymentMethod,
  NearbyPlacesResponse,
  Property,
  SavePaymentMethodRequest,
  Tenant,
} from "@/types/prismaTypes";
import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { FiltersState } from ".";

const springBootBaseQuery = fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1/",
    prepareHeaders: (headers) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  });

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  if (FRONTEND_DEMO_MODE) {
    const request = typeof args === "string" ? { url: args } : args;
    return {
      data: getDemoApiData(
        request.url,
        request.method?.toUpperCase(),
        request.body
      ),
    };
  }

  return springBootBaseQuery(args, apiContext, extraOptions);
};

export const api = createApi({
  baseQuery,
  reducerPath: "api",
  tagTypes: [
    "Managers",
    "Tenants",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "PaymentMethods",
    "Applications",
  ],
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),

    signup: build.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({ url: "auth/signup", method: "POST", body }),
    }),

    enableManager: build.mutation<AuthResponse, { authorizedToList: boolean }>({
      query: (body) => ({ url: "auth/enable-manager", method: "POST", body }),
      invalidatesTags: ["Managers", "Tenants"],
    }),

    getAuthUser: build.query<User, void>({
      query: () => "auth/me",
    }),

    // property related endpoints
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load property details.",
        });
      },
    }),

    getNearbyPlaces: build.query<NearbyPlacesResponse, number>({
      query: (id) => `properties/${id}/nearby`,
    }),

    // tenant related endpoints
    getTenant: build.query<Tenant, string>({
      query: (userId) => `tenants/${userId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load tenant profile.",
        });
      },
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (userId) => `tenants/${userId}/current-residences`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch current residences.",
        });
      },
    }),

    updateTenantSettings: build.mutation<
      Tenant,
      { userId: string } & Partial<Tenant>
    >({
      query: ({ userId, ...updatedTenant }) => ({
        url: `tenants/${userId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    addFavoriteProperty: build.mutation<
      Tenant,
      { userId: string; propertyId: number }
    >({
      query: ({ userId, propertyId }) => ({
        url: `tenants/${userId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Added to favorites!!",
          error: "Failed to add to favorites",
        });
      },
    }),

    removeFavoriteProperty: build.mutation<
      Tenant,
      { userId: string; propertyId: number }
    >({
      query: ({ userId, propertyId }) => ({
        url: `tenants/${userId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Removed from favorites!",
          error: "Failed to remove from favorites.",
        });
      },
    }),

    // manager related endpoints
    getManagerProperties: build.query<Property[], string>({
      query: (userId) => `managers/${userId}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load manager profile.",
        });
      },
    }),

    updateManagerSettings: build.mutation<
      Manager,
      { userId: string } & Partial<Manager>
    >({
      query: ({ userId, ...updatedManager }) => ({
        url: `managers/${userId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),

    updateProperty: build.mutation<
      Property,
      { id: number; property: FormData }
    >({
      query: ({ id, property }) => ({
        url: `properties/${id}`,
        method: "PUT",
        body: property,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Properties", id: "LIST" },
        { type: "Properties", id },
        { type: "PropertyDetails", id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property updated successfully!",
          error: "Failed to update property.",
        });
      },
    }),

    // lease related enpoints
    getLeases: build.query<Lease[], "tenant" | "manager" | void>({
      query: (view) => view ? `leases?view=${view}` : "leases",
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch property leases.",
        });
      },
    }),

    getPayments: build.query<Payment[], { leaseId: number; view?: "tenant" | "manager" }>({
      query: ({ leaseId, view }) => `leases/${leaseId}/payments${view ? `?view=${view}` : ""}`,
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment info.",
        });
      },
    }),

    getPaymentMethod: build.query<PaymentMethod | null, string>({
      query: (userId) => `tenants/${userId}/payment-method`,
      providesTags: ["PaymentMethods"],
    }),

    createPaymentMethod: build.mutation<
      PaymentMethod,
      { userId: string; data: SavePaymentMethodRequest }
    >({
      query: ({ userId, data }) => ({
        url: `tenants/${userId}/payment-method`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PaymentMethods"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Payment method added successfully!",
          error: "Failed to add payment method.",
        });
      },
    }),

    updatePaymentMethod: build.mutation<
      PaymentMethod,
      { userId: string; data: SavePaymentMethodRequest }
    >({
      query: ({ userId, data }) => ({
        url: `tenants/${userId}/payment-method`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PaymentMethods"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Payment method updated successfully!",
          error: "Failed to update payment method.",
        });
      },
    }),

    removePaymentMethod: build.mutation<void, string>({
      query: (userId) => ({
        url: `tenants/${userId}/payment-method`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethods"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Payment method removed successfully!",
          error: "Failed to remove payment method.",
        });
      },
    }),

    // application related endpoints
    getApplications: build.query<Application[], "tenant" | "manager" | void>({
      query: (view) => view ? `applications?view=${view}` : "applications",
      providesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    updateApplicationStatus: build.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application status updated successfully!",
          error: "Failed to update application settings.",
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application created successfully!",
          error: "Failed to create applications.",
        });
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useEnableManagerMutation,
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetNearbyPlacesQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetPaymentMethodQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
} = api;
