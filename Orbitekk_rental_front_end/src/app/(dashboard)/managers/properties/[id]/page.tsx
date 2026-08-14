"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  useGetApplicationsQuery,
  useGetPropertyLeasesQuery,
  useGetPropertyQuery,
} from "@/state/api";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PropertyTabs from "./components/PropertyTabs";

const ManagerPropertyPage = () => {
  const params = useParams<{ id: string }>();
  const propertyId = Number(params.id);

  const {
    data: property,
    isLoading: propertyLoading,
    isError: propertyError,
  } = useGetPropertyQuery(propertyId, {
    skip: !Number.isFinite(propertyId),
  });

  const {
    data: leases = [],
    isLoading: leasesLoading,
    isError: leasesError,
  } = useGetPropertyLeasesQuery(propertyId, {
    skip: !Number.isFinite(propertyId),
  });

  const {
    data: applications = [],
    isLoading: applicationsLoading,
    isError: applicationsError,
  } = useGetApplicationsQuery();

  if (propertyLoading || leasesLoading || applicationsLoading) {
    return <Loading />;
  }

  if (!Number.isFinite(propertyId)) {
    return (
      <div className="dashboard-container">
        <div className="rounded-xl border bg-white p-6">Invalid property ID.</div>
      </div>
    );
  }

  if (propertyError || leasesError || applicationsError || !property) {
    return (
      <div className="dashboard-container">
        <div className="rounded-xl border bg-white p-6">
          Unable to load this property. Please try again.
        </div>
      </div>
    );
  }

  const propertyAddress = [
    property.location?.address,
    property.location?.city,
    property.location?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="dashboard-container min-w-0">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/managers/properties"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-primary-700"
          scroll={false}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-gray-950">
              {property.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {propertyAddress || "Property address unavailable"}
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            asChild
          >
            <Link href={`/managers/properties/${propertyId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        <PropertyTabs
          property={property}
          leases={leases}
          applications={applications}
          propertyId={propertyId}
        />
      </div>
    </div>
  );
};

export default ManagerPropertyPage;