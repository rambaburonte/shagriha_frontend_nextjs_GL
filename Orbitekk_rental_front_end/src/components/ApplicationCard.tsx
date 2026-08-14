"use client";

import type { Lease } from "@/types/prismaTypes";
import { Mail, MapPin, PhoneCall } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const getNextPaymentDate = (lease?: Lease | null) => {
  if (!lease) return "—";

  const today = new Date();
  const startDate = new Date(lease.startDate);
  const endDate = new Date(lease.endDate);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    today > endDate
  ) {
    return "—";
  }

  const paymentDay = Math.min(startDate.getDate(), 28);
  let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);

  if (nextPayment < today) {
    nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
  }

  return nextPayment <= endDate ? nextPayment.toLocaleDateString() : "—";
};

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrls?.[0] || "/placeholder.jpg"
  );

  const statusColor =
    application.status === "Approved"
      ? "bg-green-500"
      : application.status === "Denied"
      ? "bg-red-500"
      : "bg-yellow-500";

  const contactPerson =
    userType === "manager"
      ? application.tenant
      : application.property.manager;

  const contactName = contactPerson?.name ?? "Property Manager";
  const contactPhone = contactPerson?.phoneNumber ?? "Contact unavailable";
  const contactEmail = contactPerson?.email ?? "Email unavailable";

  return (
    <article className="mb-4 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col items-start justify-between gap-6 px-4 py-5 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex w-full min-w-0 flex-col gap-5 lg:w-auto lg:flex-row">
          <Image
            src={imgSrc}
            alt={application.property.name}
            width={220}
            height={160}
            className="h-44 w-full rounded-xl object-cover lg:h-40 lg:w-[220px]"
            sizes="(max-width: 1024px) 100vw, 220px"
            onError={() => setImgSrc("/placeholder.jpg")}
          />

          <div className="flex min-w-[220px] flex-col justify-between">
            <div>
              <h3 className="my-2 text-xl font-bold text-gray-950">
                {application.property.name}
              </h3>
              <div className="flex items-center text-gray-700">
                <MapPin className="mr-1 h-5 w-5 shrink-0" />
                <span>
                  {application.property.location.city},{" "}
                  {application.property.location.country}
                </span>
              </div>
            </div>
            <div className="mt-5 text-xl font-semibold">
              ${application.property.pricePerMonth.toLocaleString()}{" "}
              <span className="text-sm font-normal">/ month</span>
            </div>
          </div>
        </div>

        <div className="hidden h-48 border-l lg:block" />

        <div className="flex w-full flex-col justify-between gap-4 py-2 lg:h-48 lg:basis-3/12 lg:gap-0">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Status:</span>
              <span
                className={`rounded-full px-2.5 py-1 text-sm text-white ${statusColor}`}
              >
                {application.status}
              </span>
            </div>
            <hr className="mt-3" />
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Start Date:</span>
            <span>{formatDate(application.lease?.startDate)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">End Date:</span>
            <span>{formatDate(application.lease?.endDate)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Next Payment:</span>
            <span>
              {application.status === "Approved"
                ? getNextPaymentDate(application.lease)
                : "—"}
            </span>
          </div>
        </div>

        <div className="hidden h-48 border-l lg:block" />

        <div className="flex w-full flex-col justify-start gap-5 py-2 lg:h-48 lg:basis-3/12">
          <div>
            <div className="text-lg font-semibold">
              {userType === "manager" ? "Tenant" : "Manager"}
            </div>
            <hr className="mt-3" />
          </div>

          <div className="flex gap-4">
            <Image
              src="/landing-i1.png"
              alt={contactName}
              width={42}
              height={42}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 space-y-2">
              <div className="font-semibold text-gray-900">{contactName}</div>
              {userType === "manager" && (
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneCall className="mr-2 h-5 w-5 shrink-0" />
                  <span className="truncate">{contactPhone}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="mr-2 h-5 w-5 shrink-0" />
                <span className="truncate">{contactEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">{children}</div>
    </article>
  );
};

export default ApplicationCard;
