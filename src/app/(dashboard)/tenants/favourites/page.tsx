"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant, isLoading: isTenantLoading, error: tenantError } = useGetTenantQuery(
    authUser?.authInfo?.userId || "",
    {
      skip: !authUser?.authInfo?.userId,
    }
  );

  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 }
  );

  if (isTenantLoading || isLoading) return <Loading />;
  if (tenantError || error) return <div>Error loading favourites</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Favourite Properties"
        subtitle="Browse and manage your saved property listings"
      />
      {favoriteProperties && favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteProperties.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={true}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/search/${property.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          message="No listings have been added to favourites"
          action={
          <Button asChild className="mt-4 bg-primary-700 text-white hover:bg-primary-600">
            <Link href="/search">Search properties</Link>
          </Button>
          }
        />
      )}
    </div>
  );
};

export default Favorites;
