"use client";

import { useGetNearbyPlacesQuery } from "@/state/api";
import type { NearbyPlace, NearbyPlacesResponse } from "@/types/prismaTypes";
import { Bus, Fuel, Pill, ShoppingBasket, Utensils } from "lucide-react";

const categories: Array<{
  key: keyof NearbyPlacesResponse;
  label: string;
  icon: typeof ShoppingBasket;
}> = [
  { key: "groceries", label: "Groceries", icon: ShoppingBasket },
  { key: "restaurants", label: "Restaurant", icon: Utensils },
  { key: "pharmacies", label: "Pharmacy", icon: Pill },
  { key: "gasStations", label: "Gas Station", icon: Fuel },
  { key: "transit", label: "Transit", icon: Bus },
];

const miles = (place: NearbyPlace) => `${(place.distanceMeters / 1609.344).toFixed(1)} mi`;

const NearbyPlaces = ({ propertyId }: PropertyDetailsProps) => {
  const { data, isLoading, isError } = useGetNearbyPlacesQuery(propertyId);

  return (
    <section className="mb-16" aria-labelledby="nearby-heading">
      <h3 id="nearby-heading" className="text-xl font-semibold text-primary-800 dark:text-primary-100">
        Nearby
      </h3>
      {isLoading && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading nearby places">
          {categories.map(({ key }) => <div key={key} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      )}
      {isError && <p className="mt-4 text-sm text-gray-600">Nearby places are temporarily unavailable.</p>}
      {!isLoading && !isError && data && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ key, label, icon: Icon }) => {
            const place = data[key][0];
            return (
              <div key={key} className="flex items-center gap-4 rounded-xl border p-4">
                <Icon className="h-7 w-7 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                  {place ? (
                    <><p className="truncate font-medium text-gray-900">{place.name}</p><p className="text-sm text-gray-600">{miles(place)}</p></>
                  ) : <p className="text-sm text-gray-500">No nearby result</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default NearbyPlaces;
