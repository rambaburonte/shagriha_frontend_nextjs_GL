import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prismaTypes";
import React from "react";
import CardCompact from "@/components/CardCompact";
import { useAuth } from "@/app/(auth)/authProvider";
import EmptyState from "@/components/EmptyState";

const Listings = () => {
  const { user } = useAuth();
  const { data: authUser } = useGetAuthUserQuery(undefined, { skip: !user });
  const { data: tenant } = useGetTenantQuery(
    authUser?.authInfo?.userId || "",
    {
      skip: !authUser?.authInfo?.userId,
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const filters = useAppSelector((state) => state.global.filters);

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;

    const isFavorite = tenant?.favorites?.some(
      (fav: Property) => fav.id === propertyId
    );

    if (isFavorite) {
      await removeFavorite({
        userId: authUser.authInfo.userId,
        propertyId,
      });
    } else {
      await addFavorite({
        userId: authUser.authInfo.userId,
        propertyId,
      });
    }
  };

  if (isLoading) return <>Loading...</>;

  if (isError || !properties || properties.length === 0) {
    return (
      <EmptyState
        message={`No published properties are currently available in ${filters.location}. Try another location or check back soon.`}
        className="min-h-full"
      />
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
        </span>
      </h3>
      <div className="flex">
        <div className="p-4 w-full">
          {properties?.map((property) => (
            <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;
