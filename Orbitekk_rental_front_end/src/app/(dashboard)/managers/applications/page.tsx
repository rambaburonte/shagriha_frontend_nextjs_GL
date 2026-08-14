"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    undefined,
    {
      skip: !authUser?.authInfo?.userId,
    }
  );
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  const handleStatusChange = async (id: number, status: string) => {
    await updateApplicationStatus({ id, status });
  };

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;
    return application.status.toLowerCase() === activeTab;
  });

  return (
    <div className="dashboard-container min-w-0">
      <div className="mx-auto w-full max-w-6xl">
        <Header
          title="Applications"
          subtitle="View and manage applications for your properties"
        />
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="my-5 w-full min-w-0"
        >
          <div className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
              <TabsTrigger className="min-h-9" value="all">
                All
              </TabsTrigger>
              <TabsTrigger className="min-h-9" value="pending">
                Pending
              </TabsTrigger>
              <TabsTrigger className="min-h-9" value="approved">
                Approved
              </TabsTrigger>
              <TabsTrigger className="min-h-9" value="denied">
                Denied
              </TabsTrigger>
            </TabsList>
          </div>
          {["all", "pending", "approved", "denied"].map((tab) => (
            <TabsContent
              key={tab}
              value={tab}
              className="mt-5 w-full space-y-4"
            >
            {filteredApplications
              .filter(
                (application) =>
                  tab === "all" || application.status.toLowerCase() === tab
              )
              .map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  userType="manager"
                >
                  <div className="flex w-full min-w-0 flex-col gap-4 sm:px-4 sm:pb-4 lg:flex-row lg:items-stretch lg:justify-between lg:gap-5">
                    {/* Colored Section Status */}
                    <div
                      className={`min-w-0 grow rounded-md p-4 ${
                        application.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : application.status === "Denied"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <File className="h-5 w-5 shrink-0" />
                        <span>
                          Application submitted on{" "}
                          {new Date(
                            application.applicationDate
                          ).toLocaleDateString()}
                          .
                        </span>
                        <CircleCheckBig className="h-5 w-5 shrink-0" />
                        <span
                          className={`font-semibold ${
                            application.status === "Approved"
                              ? "text-green-800"
                              : application.status === "Denied"
                              ? "text-red-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {application.status === "Approved" &&
                            "This application has been approved."}
                          {application.status === "Denied" &&
                            "This application has been denied."}
                          {application.status === "Pending" &&
                            "This application is pending review."}
                        </span>
                      </div>
                    </div>

                    {/* Right Buttons */}
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:items-center lg:justify-end">
                      <Link
                        href={`/managers/properties/${application.property.id}`}
                        className="flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-primary-700 hover:text-primary-50"
                        scroll={false}
                      >
                        <Hospital className="mr-2 h-5 w-5" />
                        Property Details
                      </Link>
                      {application.status === "Approved" && (
                        <button
                          className="flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-primary-700 hover:text-primary-50"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Download Agreement
                        </button>
                      )}
                      {application.status === "Pending" && (
                        <>
                          <button
                            className="min-h-10 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-500"
                            onClick={() =>
                              handleStatusChange(application.id, "Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="min-h-10 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
                            onClick={() =>
                              handleStatusChange(application.id, "Denied")
                            }
                          >
                            Deny
                          </button>
                        </>
                      )}
                      {application.status === "Denied" && (
                        <button
                          className="flex min-h-10 items-center justify-center whitespace-nowrap rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-secondary-500 hover:text-primary-50"
                        >
                          Contact User
                        </button>
                      )}
                    </div>
                  </div>
                </ApplicationCard>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Applications;
