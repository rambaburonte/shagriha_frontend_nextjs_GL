"use client";

import ImagePreviews from "@/app/(nondashboard)/search/[id]/ImagePreviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AmenityEnum,
  AmenityIcons,
  HighlightEnum,
  HighlightIcons,
} from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import type { Property } from "@/types/prismaTypes";
import { HelpCircle, MapPin, Star } from "lucide-react";

interface ManagerPropertyDetailsTabProps {
  property: Property;
}

const ManagerPropertyDetailsTab = ({
  property,
}: ManagerPropertyDetailsTabProps) => {
  const images =
    property.photoUrls?.length > 0
      ? property.photoUrls
      : ["/singlelisting-2.jpg"];

  const locationLabel = [
    property.location?.city,
    property.location?.state,
    property.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const metrics = [
    {
      label: "Monthly Rent",
      value: `$${property.pricePerMonth.toLocaleString()}`,
    },
    { label: "Bedrooms", value: `${property.beds} bd` },
    { label: "Bathrooms", value: `${property.baths} ba` },
    {
      label: "Square Feet",
      value: `${property.squareFeet.toLocaleString()} sq ft`,
    },
  ];

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-gray-950">Property Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          View the listing information shown to prospective tenants.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg">
        <ImagePreviews images={images} />
      </div>

      <div className="mx-auto max-w-5xl px-1 py-6 sm:px-3">
        <div className="mb-5">
          <h3 className="text-2xl font-bold text-gray-950">{property.name}</h3>

          <div className="mt-3 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center text-gray-500">
              <MapPin className="mr-1.5 h-4 w-4 text-gray-700" />
              {locationLabel || "Location unavailable"}
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center text-yellow-500">
                <Star className="mr-1 h-4 w-4 fill-current" />
                {property.averageRating.toFixed(1)} ({property.numberOfReviews}{" "}
                Reviews)
              </span>
              <span className="font-medium text-green-600">Verified Listing</span>
            </div>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`px-5 py-4 ${
                index > 0 ? "border-t sm:border-l sm:border-t-0" : ""
              } ${index === 2 ? "sm:border-l-0 lg:border-l" : ""}`}
            >
              <div className="text-sm text-gray-500">{metric.label}</div>
              <div className="mt-1 font-semibold text-gray-900">
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        <div className="my-10">
          <h3 className="mb-4 text-lg font-semibold text-gray-950">
            About {property.name}
          </h3>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
            {property.description || "No property description is available."}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-950">
            Property Amenities
          </h3>
          {property.amenities.length === 0 ? (
            <p className="text-sm text-gray-500">No amenities have been added.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {property.amenities.map((amenity) => {
                const Icon =
                  AmenityIcons[amenity as AmenityEnum] || HelpCircle;
                return (
                  <div
                    key={amenity}
                    className="flex min-h-28 flex-col items-center justify-center rounded-xl border p-4 text-center"
                  >
                    <Icon className="mb-3 h-7 w-7 text-gray-700" />
                    <span className="text-sm text-gray-700">
                      {formatEnumString(amenity)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="my-10">
          <h3 className="mb-4 text-lg font-semibold text-gray-950">Highlights</h3>
          {property.highlights.length === 0 ? (
            <p className="text-sm text-gray-500">No highlights have been added.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {property.highlights.map((highlight) => {
                const Icon =
                  HighlightIcons[highlight as HighlightEnum] || HelpCircle;
                return (
                  <div
                    key={highlight}
                    className="flex min-h-28 flex-col items-center justify-center rounded-xl border p-4 text-center"
                  >
                    <Icon className="mb-3 h-7 w-7 text-gray-700" />
                    <span className="text-sm text-gray-700">
                      {formatEnumString(highlight)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-950">
            Fees and Policies
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            These fees are based on the information supplied for this listing.
          </p>

          <Tabs defaultValue="required-fees" className="mt-6">
            <TabsList className="grid h-auto w-full grid-cols-3">
              <TabsTrigger className="min-h-9" value="required-fees">
                Required Fees
              </TabsTrigger>
              <TabsTrigger className="min-h-9" value="pets">
                Pets
              </TabsTrigger>
              <TabsTrigger className="min-h-9" value="parking">
                Parking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="required-fees" className="mt-5 max-w-md">
              <p className="mb-2 font-semibold">One-time move-in fees</p>
              <div className="divide-y rounded-lg border">
                <div className="flex justify-between px-4 py-3">
                  <span className="font-medium text-gray-700">
                    Application Fee
                  </span>
                  <span>${property.applicationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="font-medium text-gray-700">
                    Security Deposit
                  </span>
                  <span>${property.securityDeposit.toLocaleString()}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pets" className="mt-5">
              <div className="rounded-lg border p-4 text-sm text-gray-700">
                Pets are {property.isPetsAllowed ? "allowed" : "not allowed"}.
              </div>
            </TabsContent>

            <TabsContent value="parking" className="mt-5">
              <div className="rounded-lg border p-4 text-sm text-gray-700">
                Parking is {property.isParkingIncluded ? "included" : "not included"}.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ManagerPropertyDetailsTab;
