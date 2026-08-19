"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Application, Lease, Property } from "@/types/prismaTypes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import LeaseDocumentTab from "./LeaseDocumentTab";
import ManagerPropertyDetailsTab from "./ManagerPropertyDetailsTab";
import PropertyApplicationsTab from "./PropertyApplicationsTab";
import TenantsOverviewTab from "./TenantsOverviewTab";

type PropertyTabValue = "tenants" | "details" | "applications" | "lease";

interface PropertyTabsProps {
  propertyId: number;
  property: Property;
  leases: Lease[];
  applications: Application[];
}

const validTabs: PropertyTabValue[] = [
  "tenants",
  "details",
  "applications",
  "lease",
];

const PropertyTabs = ({
  propertyId,
  property,
  leases,
  applications,
}: PropertyTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedTab = useMemo(() => {
    const tab = searchParams.get("tab") as PropertyTabValue | null;
    return tab && validTabs.includes(tab) ? tab : "tenants";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<PropertyTabValue>(requestedTab);

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  const handleTabChange = (value: string) => {
    const nextTab = value as PropertyTabValue;
    setActiveTab(nextTab);

    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "tenants") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full min-w-0"
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-none border-b border-gray-200 bg-white p-0 sm:grid-cols-4">
        <TabsTrigger
          className="min-h-11 rounded-none border-b-[3px] border-transparent data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-950 data-[state=active]:shadow-none"
          value="tenants"
        >
          Tenants Overview
        </TabsTrigger>
        <TabsTrigger
          className="min-h-11 rounded-none border-b-[3px] border-transparent data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-950 data-[state=active]:shadow-none"
          value="details"
        >
          Property Details
        </TabsTrigger>
        <TabsTrigger
          className="min-h-11 rounded-none border-b-[3px] border-transparent data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-950 data-[state=active]:shadow-none"
          value="applications"
        >
          Applications
        </TabsTrigger>
        <TabsTrigger
          className="min-h-11 rounded-none border-b-[3px] border-transparent data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent data-[state=active]:text-gray-950 data-[state=active]:shadow-none"
          value="lease"
        >
          Lease
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tenants" className="mt-4 min-w-0">
        <TenantsOverviewTab leases={leases} />
      </TabsContent>

      <TabsContent value="details" className="mt-4 min-w-0">
        <ManagerPropertyDetailsTab property={property} />
      </TabsContent>

      <TabsContent value="applications" className="mt-4 min-w-0">
        <PropertyApplicationsTab
          propertyId={propertyId}
          applications={applications}
          onOpenPropertyDetails={() => handleTabChange("details")}
        />
      </TabsContent>

      <TabsContent value="lease" className="mt-4 min-w-0">
        <LeaseDocumentTab propertyId={propertyId} />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
