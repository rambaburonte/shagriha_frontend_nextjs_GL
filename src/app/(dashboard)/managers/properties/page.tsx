"use client";

import React, { useCallback, useEffect, useState } from "react";
import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import ManagerDraftPropertyCard from "@/components/ManagerDraftPropertyCard";
import {
  getPropertyDrafts,
  PROPERTY_STORAGE_UPDATED_EVENT,
  type PropertyDraft,
} from "@/lib/propertyDraftStorage";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import EmptyState from "@/components/EmptyState";

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(authUser?.authInfo?.userId || "", {
    skip: !authUser?.authInfo?.userId,
  });

  const refreshDrafts = useCallback(() => {
    if (authUser?.authInfo?.userId) {
      setDrafts(getPropertyDrafts(authUser.authInfo.userId));
    }
  }, [authUser?.authInfo?.userId]);

  useEffect(() => {
    refreshDrafts();
    window.addEventListener(PROPERTY_STORAGE_UPDATED_EVENT, refreshDrafts);
    window.addEventListener("storage", refreshDrafts);

    return () => {
      window.removeEventListener(PROPERTY_STORAGE_UPDATED_EVENT, refreshDrafts);
      window.removeEventListener("storage", refreshDrafts);
    };
  }, [refreshDrafts]);

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading manager properties</div>;

  const hasProperties = Boolean(managerProperties?.length);
  const hasDrafts = drafts.length > 0;

  return (
    <div className="dashboard-container">
      <Header
        title="My Properties"
        subtitle="View and manage your property listings"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {managerProperties?.map((property) => (
          <Card
            key={property.id}
            property={property}
            isFavorite={false}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/managers/properties/${property.id}`}
          />
        ))}

        {drafts.map((draft) => (
          <ManagerDraftPropertyCard key={draft.id} draft={draft} />
        ))}
      </div>

      {!hasProperties && !hasDrafts && (
        <EmptyState message="No listings added to your profile" />
      )}
    </div>
  );
};

export default Properties;
