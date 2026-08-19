"use client";

import ApplicationCard from "@/components/ApplicationCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FRONTEND_DEMO_MODE } from "@/lib/demoData";
import { useUpdateApplicationStatusMutation } from "@/state/api";
import type { Application, ApplicationStatus } from "@/types/prismaTypes";
import {
  CircleCheckBig,
  Download,
  File,
  Hospital,
  Link2,
  ListFilter,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface PropertyApplicationsTabProps {
  propertyId: number;
  applications: Application[];
  onOpenPropertyDetails: () => void;
}

type StatusFilter = "All" | ApplicationStatus;

const statusPanelClasses: Record<ApplicationStatus, string> = {
  Approved: "bg-green-100 text-green-700",
  Denied: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const statusMessageClasses: Record<ApplicationStatus, string> = {
  Approved: "text-green-800",
  Denied: "text-red-800",
  Pending: "text-yellow-800",
};

const statusMessage: Record<ApplicationStatus, string> = {
  Approved: "This application has been approved.",
  Denied: "This application has been denied.",
  Pending: "This application is pending review.",
};

const PropertyApplicationsTab = ({
  propertyId,
  applications,
  onOpenPropertyDetails,
}: PropertyApplicationsTabProps) => {
  const [updateApplicationStatus, { isLoading: isUpdating }] =
    useUpdateApplicationStatusMutation();

  const filteredApplications = useMemo(
    () => applications.filter((application) => application.propertyId === propertyId),
    [applications, propertyId]
  );

  const [visibleApplications, setVisibleApplications] =
    useState<Application[]>(filteredApplications);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const displayedApplications = useMemo(
    () =>
      statusFilter === "All"
        ? visibleApplications
        : visibleApplications.filter(
            (application) => application.status === statusFilter
          ),
    [statusFilter, visibleApplications]
  );

  useEffect(() => {
    setVisibleApplications(filteredApplications);
  }, [filteredApplications]);

  const handleStatusChange = async (
    applicationId: number,
    status: ApplicationStatus
  ) => {
    if (FRONTEND_DEMO_MODE) {
      setVisibleApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );
      toast.success(`Application marked as ${status.toLowerCase()}.`);
      return;
    }

    try {
      await updateApplicationStatus({ id: applicationId, status }).unwrap();
    } catch {
      // API toast already reports the request failure.
    }
  };

  const handleShareListing = async () => {
    const shareUrl = `${window.location.origin}/search/${propertyId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Property link copied to clipboard.");
    } catch {
      toast.error("Unable to copy the property link.");
    }
  };

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">Applications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review applications submitted for this property.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger
              className="w-full bg-white sm:w-[150px]"
              aria-label="Filter applications by status"
            >
              <span className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Denied">Denied</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-violet-600 hover:text-violet-700 sm:w-auto"
            onClick={handleShareListing}
          >
            <Link2 className="h-4 w-4" />
            Share Link
          </Button>
        </div>
      </div>

      {displayedApplications.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-16 text-center text-sm text-gray-500">
          {visibleApplications.length === 0
            ? "No applications have been submitted for this property yet."
            : `No ${statusFilter.toLowerCase()} applications for this property.`}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              userType="manager"
            >
              <div className="flex w-full min-w-0 flex-col gap-4 px-4 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div
                  className={`min-w-0 grow rounded-md p-4 ${statusPanelClasses[application.status]}`}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <File className="h-5 w-5 shrink-0" />
                    <span>
                      Application submitted on{" "}
                      {new Date(application.applicationDate).toLocaleDateString()}.
                    </span>
                    <CircleCheckBig className="h-5 w-5 shrink-0" />
                    <span
                      className={`font-semibold ${statusMessageClasses[application.status]}`}
                    >
                      {statusMessage[application.status]}
                    </span>
                  </div>
                </div>

                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenPropertyDetails}
                  >
                    <Hospital className="h-4 w-4" />
                    Property Details
                  </Button>

                  {application.status === "Approved" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        toast.info(
                          "Agreement download will use the uploaded lease document."
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download Agreement
                    </Button>
                  )}

                  {application.status === "Pending" && (
                    <>
                      <Button
                        type="button"
                        className="bg-green-600 text-white hover:bg-green-500"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(application.id, "Approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(application.id, "Denied")
                        }
                      >
                        Deny
                      </Button>
                    </>
                  )}

                  {application.status === "Denied" && (
                    <Button
                      type="button"
                      className="bg-gray-800 text-white hover:bg-gray-700"
                      onClick={() =>
                        toast.info(
                          `Contact ${application.tenant.name} at ${application.tenant.email}.`
                        )
                      }
                    >
                      Contact User
                    </Button>
                  )}
                </div>
              </div>
            </ApplicationCard>
          ))}
        </div>
      )}
    </section>
  );
};

export default PropertyApplicationsTab;
