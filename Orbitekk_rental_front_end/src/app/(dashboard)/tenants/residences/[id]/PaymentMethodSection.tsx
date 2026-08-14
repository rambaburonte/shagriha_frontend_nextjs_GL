"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreatePaymentMethodMutation,
  useGetPaymentMethodQuery,
  useRemovePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
} from "@/state/api";
import type { PaymentMethodFormData } from "@/lib/schemas";
import {
  CreditCard,
  Edit,
  MapPin,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import PaymentMethodModal from "./PaymentMethodModal";

type PaymentMethodSectionProps = {
  userId: string;
};

const PaymentMethodSection = ({ userId }: PaymentMethodSectionProps) => {
  const { data: paymentMethod = null, isLoading } =
    useGetPaymentMethodQuery(userId);
  const [createPaymentMethod, { isLoading: isCreating }] =
    useCreatePaymentMethodMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] =
    useUpdatePaymentMethodMutation();
  const [removePaymentMethod, { isLoading: isRemoving }] =
    useRemovePaymentMethodMutation();
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);

  const handleSave = async (data: PaymentMethodFormData) => {
    if (modalMode === "edit") {
      await updatePaymentMethod({ userId, data }).unwrap();
    } else {
      await createPaymentMethod({ userId, data }).unwrap();
    }
    setModalMode(null);
  };

  const handleRemove = async () => {
    await removePaymentMethod(userId).unwrap();
  };

  return (
    <div className="mt-10 flex-1 overflow-hidden rounded-xl bg-white p-6 shadow-md md:mt-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment method</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage how you pay rent for this residence.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setModalMode("add")}
            disabled={Boolean(paymentMethod) || isLoading}
            title={
              paymentMethod
                ? "Only one payment method is currently supported"
                : "Add a payment method"
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add payment
          </Button>
          {paymentMethod && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isRemoving}
                  aria-label="Payment method actions"
                  title="Payment method actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onSelect={() => setModalMode("edit")}>
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleRemove}
                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 h-40 animate-pulse rounded-lg bg-gray-100" />
      ) : paymentMethod ? (
        <div className="mt-6 min-h-44 rounded-lg border border-gray-200 p-5">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-md bg-primary-700">
              <span className="text-xl font-bold uppercase text-white">
                {paymentMethod.brand}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold">
                  {paymentMethod.brand} ending in {paymentMethod.last4}
                </h3>
                {paymentMethod.isDefault && (
                  <span className="rounded-full border border-primary-700 px-3 py-1 text-xs font-medium text-primary-700">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center text-sm text-gray-500">
                <CreditCard className="mr-2 h-4 w-4" />
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
              <p className="mt-3 text-sm font-medium text-gray-700">
                {paymentMethod.cardholderName}
              </p>
              <p className="mt-1 flex items-start text-sm text-gray-500">
                <MapPin className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {paymentMethod.billingAddress}, {paymentMethod.city},{" "}
                  {paymentMethod.state} {paymentMethod.postalCode},{" "}
                  {paymentMethod.country}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center">
          <div className="rounded-full bg-primary-50 p-3 text-primary-700">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-semibold text-gray-900">
            Add Your Payment Method
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Add a card and billing details to prepare for upcoming rent payments.
          </p>
        </div>
      )}

      <PaymentMethodModal
        mode={modalMode ?? "add"}
        open={modalMode !== null}
        paymentMethod={paymentMethod}
        isSaving={isCreating || isUpdating}
        onOpenChange={(open) => !open && setModalMode(null)}
        onSave={handleSave}
      />
    </div>
  );
};

export default PaymentMethodSection;
