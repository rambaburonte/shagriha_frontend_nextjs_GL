"use client";

import { AddressAutofill } from "@mapbox/search-js-react";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PropertyFormData } from "@/lib/schemas";

const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export function mapAutofillResult(response: AddressAutofillRetrieveResponse) {
  const feature = response.features[0];
  if (!feature) return null;
  const properties = feature.properties;
  const [longitude, latitude] = feature.geometry.coordinates;
  const region = properties.context.find((item) => item.id.startsWith("region."));
  const regionCode = region && "short_code" in region && typeof region.short_code === "string"
    ? region.short_code.split("-").at(-1)?.toUpperCase() ?? ""
    : "";

  return {
    addressLine1: properties.address_line1 ?? properties.feature_name,
    city: properties.address_level2 ?? "",
    stateName: properties.address_level1 ?? region?.text ?? "",
    stateCode: regionCode,
    postalCode: properties.postcode ?? "",
    countryName: properties.country ?? "United States",
    countryCode: (properties.country_code ?? properties.metadata.iso_3166_1 ?? "US").toUpperCase(),
    formattedAddress: properties.full_address ?? properties.place_name ?? "",
    longitude,
    latitude,
    mapboxFeatureId: properties.mapbox_id,
  };
}

const PropertyAddressFields = () => {
  const form = useFormContext<PropertyFormData>();
  const selectedAddress = useRef<ReturnType<typeof mapAutofillResult>>(null);

  const invalidateSelection = (name: keyof NonNullable<ReturnType<typeof mapAutofillResult>>, value: string) => {
    if (form.getValues("addressConfirmed") && String(selectedAddress.current?.[name] ?? "") !== value) {
      form.setValue("addressConfirmed", false, { shouldDirty: true });
    }
  };

  const handleRetrieve = (response: AddressAutofillRetrieveResponse) => {
    const address = mapAutofillResult(response);
    if (!address) return;
    selectedAddress.current = address;
    for (const [name, value] of Object.entries(address)) {
      form.setValue(name as keyof PropertyFormData, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    form.setValue("addressConfirmed", true, { shouldDirty: true, shouldValidate: true });
    form.clearErrors("addressLine1");
  };

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="countryName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <select
                {...field}
                autoComplete="country-name"
                onChange={(event) => { field.onChange(event); invalidateSelection("countryName", event.target.value); }}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="United States">United States</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressLine1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property Address</FormLabel>
            <AddressAutofill
              accessToken={token}
              options={{ country: "US", language: "en" }}
              onRetrieve={handleRetrieve}
              onChange={(value) => {
                field.onChange(value);
                invalidateSelection("addressLine1", value);
              }}
            >
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  autoComplete="address-line1"
                  placeholder="Start typing a street address..."
                />
              </FormControl>
            </AddressAutofill>
            {!token && <p className="text-sm text-amber-700">Address suggestions require NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.</p>}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField control={form.control} name="addressLine2" render={({ field }) => (
        <FormItem>
          <FormLabel>Apartment, Unit, Suite, Floor <span className="font-normal text-gray-500">(optional)</span></FormLabel>
          <FormControl><Input {...field} value={field.value ?? ""} autoComplete="address-line2" placeholder="Optional" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField control={form.control} name="city" render={({ field }) => (
          <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} autoComplete="address-level2" onChange={(event) => { field.onChange(event); invalidateSelection("city", event.target.value); }} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="stateName" render={({ field }) => (
          <FormItem><FormLabel>State / Province</FormLabel><FormControl><Input {...field} autoComplete="address-level1" onChange={(event) => { field.onChange(event); invalidateSelection("stateName", event.target.value); }} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
      <FormField control={form.control} name="postalCode" render={({ field }) => (
        <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} autoComplete="postal-code" onChange={(event) => { field.onChange(event); invalidateSelection("postalCode", event.target.value); }} /></FormControl><FormMessage /></FormItem>
      )} />
      <input type="hidden" autoComplete="country" value={form.watch("countryCode")} readOnly />
    </div>
  );
};

export default PropertyAddressFields;
