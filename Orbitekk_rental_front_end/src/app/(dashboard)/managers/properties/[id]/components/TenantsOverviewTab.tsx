"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPaymentsQuery } from "@/state/api";
import type { Lease, PaymentStatus } from "@/types/prismaTypes";
import { ArrowDownToLine, Check, Download } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface TenantsOverviewTabProps {
  leases: Lease[];
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const paymentStatusClasses: Record<PaymentStatus | "Not Paid", string> = {
  Paid: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  PartiallyPaid: "bg-orange-100 text-orange-800",
  Overdue: "bg-red-100 text-red-800",
  "Not Paid": "bg-red-100 text-red-800",
};

const TenantRow = ({ lease }: { lease: Lease }) => {
  // Existing API expects a lease ID, not a property ID.
  // TODO(spring): Replace the per-row requests with a property-level payment
  // endpoint when Spring Boot exposes GET /properties/{id}/payments.
  const { data: payments = [], isFetching } = useGetPaymentsQuery(lease.id);

  const now = new Date();
  const currentMonthPayment = payments.find((payment) => {
    const dueDate = new Date(payment.dueDate);
    return (
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getFullYear() === now.getFullYear()
    );
  });

  const status: PaymentStatus | "Not Paid" =
    currentMonthPayment?.paymentStatus ?? "Not Paid";

  return (
    <TableRow className="h-24">
      <TableCell className="min-w-[220px]">
        <div className="flex items-center gap-3">
          <Image
            src="/landing-i1.png"
            alt={lease.tenant.name}
            width={42}
            height={42}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">
              {lease.tenant.name}
            </div>
            <div className="truncate text-sm text-gray-500">
              {lease.tenant.email}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="min-w-[150px]">
        <div>{formatDate(lease.startDate)} -</div>
        <div>{formatDate(lease.endDate)}</div>
      </TableCell>

      <TableCell className="min-w-[120px]">
        ${lease.rent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </TableCell>

      <TableCell className="min-w-[160px]">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusClasses[status]}`}
        >
          {status === "Paid" && <Check className="mr-1 h-3.5 w-3.5" />}
          {isFetching ? "Checking..." : status.replace(/([a-z])([A-Z])/g, "$1 $2")}
        </span>
      </TableCell>

      <TableCell className="min-w-[150px]">
        {lease.tenant.phoneNumber || "—"}
      </TableCell>

      <TableCell className="min-w-[210px]">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast.info(
              "Agreement download will be connected to the stored lease document."
            )
          }
        >
          <ArrowDownToLine className="h-4 w-4" />
          Download Agreement
        </Button>
      </TableCell>
    </TableRow>
  );
};

const TenantsOverviewTab = ({ leases }: TenantsOverviewTabProps) => {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">
            Tenants Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view all tenants for this property.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={leases.length === 0}
          onClick={() =>
            toast.info(
              "Bulk agreement download will be connected when lease files are stored."
            )
          }
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>

      {leases.length === 0 ? (
        <div className="border-t px-6 py-14 text-center text-sm text-gray-500">
          No active tenants are associated with this property yet.
        </div>
      ) : (
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="px-5">Tenant</TableHead>
                <TableHead>Lease Period</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Current Month Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.map((lease) => (
                <TenantRow key={lease.id} lease={lease} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};

export default TenantsOverviewTab;
