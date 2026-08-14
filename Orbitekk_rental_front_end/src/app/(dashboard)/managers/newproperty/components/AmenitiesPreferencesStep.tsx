"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { CustomFormField } from "@/components/FormField";
import { PROPERTY_AMENITY_OPTIONS } from "@/lib/propertyForm";
import type { PropertyFormData } from "@/lib/schemas";

const AmenitiesPreferencesStep = () => {
  const form = useFormContext<PropertyFormData>();
  const existingPhotoUrls = form.watch("existingPhotoUrls") ?? [];

  return (
    <div className="space-y-7">
      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Amenities and Gender Preference
        </h3>
        <CustomFormField
          name="amenities"
          label="Amenities"
          type="checkbox-group"
          options={PROPERTY_AMENITY_OPTIONS}
        />
        <CustomFormField
          name="genderPreference"
          label="Gender Preference"
          type="checkbox-group"
          singleSelection
          options={[
            { value: "NoPreference", label: "No Preference" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
      </section>

      <div className="border-t border-gray-200" />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Photos</h3>

        {existingPhotoUrls.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Saved property photos
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {existingPhotoUrls.map((photoUrl, index) => (
                <div
                  key={`${photoUrl}-${index}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                >
                  <Image
                    src={photoUrl}
                    alt={`Property photo ${index + 1}`}
                    fill
                    unoptimized={photoUrl.startsWith("data:")}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <CustomFormField
          name="photoUrls"
          label="Property Photos"
          type="file"
          accept="image/*"
          multiple
          maxFiles={Math.max(0, 5 - existingPhotoUrls.length)}
        />
        <p className="text-sm text-gray-500">
          Upload up to 5 images. Each image must be smaller than 10 MB.
        </p>
      </section>
    </div>
  );
};

export default AmenitiesPreferencesStep;
