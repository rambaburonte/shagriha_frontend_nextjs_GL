"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import LocationAutocomplete, { type SelectedLocation } from "@/components/LocationAutocomplete";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";

const HeroSection = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [dismissSuggestions, setDismissSuggestions] = useState(0);
  const router = useRouter();

  const handleLocationSearch = async () => {
    setDismissSuggestions((signal) => signal + 1);
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      if (selectedLocation?.label === trimmedQuery) {
        dispatch(setFilters({ location: selectedLocation.label, coordinates: selectedLocation.coordinates }));
        const params = new URLSearchParams({
          location: selectedLocation.label,
          coordinates: selectedLocation.coordinates.join(","),
        });
        router.push(`/search?${params.toString()}`);
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [lng, lat],
          })
        );
        const params = new URLSearchParams({
          location: trimmedQuery,
          coordinates: `${lng},${lat}`,
        });
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("error search location:", error);
    }
  };

  return (
    <div className="relative h-screen">
      <Image
        src="/landing-splash.jpg"
        alt="Rentiful Rental Platform Hero Section"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full"
      >
        <div className="max-w-4xl mx-auto px-16 sm:px-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Start your journey to finding the perfect place to call home
          </h1>
          <p className="text-xl text-white mb-8">
            Explore our wide range of rental properties tailored to fit your
            lifestyle and needs!
          </p>

          <div className="mx-auto flex w-full max-w-lg justify-center">
            <LocationAutocomplete
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                if (value !== selectedLocation?.label) setSelectedLocation(null);
              }}
              onSelect={setSelectedLocation}
              dismissSignal={dismissSuggestions}
              placeholder="Search by city, neighborhood or address"
              className="h-12 w-full rounded-l-xl rounded-r-none border-r-0 bg-white text-left"
            />
            <Button
              onClick={handleLocationSearch}
              className="h-12 shrink-0 rounded-none rounded-r-xl border-none bg-secondary-500 text-white hover:bg-secondary-600"
            >
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
