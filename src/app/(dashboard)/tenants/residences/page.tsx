"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.authInfo?.userId || "",
    {
      skip: !authUser?.authInfo?.userId,
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.authInfo?.userId || "", {
    skip: !authUser?.authInfo?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading current residences</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentResidences?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={tenant?.favorites.some((favorite) => favorite.id === property.id) || false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/tenants/residences/${property.id}`}
          />
        ))}
      </div>
      {(!currentResidences || currentResidences.length === 0) && (
        <EmptyState
          message="You didn’t have any residences to Join or Enroll"
          action={
            <Button
              asChild
              className="mt-4 bg-primary-700 text-white hover:bg-primary-600"
            >
              <Link href="/search">Search properties</Link>
            </Button>
          }
        />
      )}
    </div>
  );
};

export default Residences;
