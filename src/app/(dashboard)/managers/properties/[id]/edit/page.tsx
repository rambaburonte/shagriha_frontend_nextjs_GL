"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { propertyToFormValues } from "@/lib/propertyForm";
import { useGetPropertyQuery } from "@/state/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PropertyForm from "../../../newproperty/components/PropertyForm";

const EditPropertyPage = () => {
  const params = useParams<{ id: string }>();
  const propertyId = Number(params.id);
  const { data: property, isLoading, isError } = useGetPropertyQuery(propertyId, {
    skip: !Number.isFinite(propertyId),
  });

  if (isLoading) return <Loading />;

  if (!Number.isFinite(propertyId) || isError || !property) {
    return (
      <div className="dashboard-container">
        <div className="rounded-xl border bg-white p-6">
          Unable to load this property for editing.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container min-w-0">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href={`/managers/properties/${propertyId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>
        <Header
          title="Edit Property"
          subtitle="Review and update the property listing information"
        />
        <PropertyForm
          mode="edit"
          propertyId={propertyId}
          existingProperty={property}
          initialValues={propertyToFormValues(property)}
          initialHighestAccessibleStep={2}
        />
      </div>
    </div>
  );
};

export default EditPropertyPage;
