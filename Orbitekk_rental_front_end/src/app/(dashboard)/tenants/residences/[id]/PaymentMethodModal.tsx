"use client";

import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  addPaymentMethodSchema,
  editPaymentMethodSchema,
  PaymentMethodFormData,
} from "@/lib/schemas";
import type { PaymentMethod } from "@/types/prismaTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type PaymentMethodModalProps = {
  mode: "add" | "edit";
  open: boolean;
  paymentMethod: PaymentMethod | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PaymentMethodFormData) => Promise<void>;
};

const emptyValues: PaymentMethodFormData = {
  cardholderName: "",
  cardNumber: "",
  expiryDate: "",
  securityCode: "",
  isDefault: true,
  billingAddress: "",
  country: "",
  city: "",
  state: "",
  postalCode: "",
};

const getFormValues = (
  mode: PaymentMethodModalProps["mode"],
  paymentMethod: PaymentMethod | null
): PaymentMethodFormData => {
  if (mode === "add" || !paymentMethod) return emptyValues;

  return {
    cardholderName: paymentMethod.cardholderName,
    cardNumber: "",
    expiryDate: `${paymentMethod.expiryMonth}/${paymentMethod.expiryYear}`,
    securityCode: "",
    isDefault: paymentMethod.isDefault,
    billingAddress: paymentMethod.billingAddress,
    country: paymentMethod.country,
    city: paymentMethod.city,
    state: paymentMethod.state,
    postalCode: paymentMethod.postalCode,
  };
};

const PaymentMethodModal = ({
  mode,
  open,
  paymentMethod,
  isSaving,
  onOpenChange,
  onSave,
}: PaymentMethodModalProps) => {
  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(
      mode === "add" ? addPaymentMethodSchema : editPaymentMethodSchema
    ),
    defaultValues: getFormValues(mode, paymentMethod),
  });

  useEffect(() => {
    if (open) form.reset(getFormValues(mode, paymentMethod));
  }, [form, mode, open, paymentMethod]);

  const handleSubmit = async (data: PaymentMethodFormData) => {
    await onSave({
      ...data,
      cardNumber: data.cardNumber.replace(/\s/g, ""),
    });
  };

  const isEditing = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit payment method" : "Add payment method"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the card ending in ${paymentMethod?.last4} and its billing details.`
              : "Enter the card and billing details to use for rent payments."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="payment-method-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <section className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Card information</h3>
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "Leave card number and secure code blank to keep the saved card."
                    : "All card fields are required."}
                </p>
              </div>

              <CustomFormField
                name="cardholderName"
                label="Name on card"
                placeholder="Jordan Lee"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CustomFormField
                  name="cardNumber"
                  label="Card number"
                  placeholder={
                    isEditing
                      ? `•••• •••• •••• ${paymentMethod?.last4}`
                      : "1234 5678 9012 3456"
                  }
                  inputClassName="font-mono"
                />
                <CustomFormField
                  name="expiryDate"
                  label="Expiry date"
                  placeholder="MM/YY"
                  inputClassName="font-mono"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <CustomFormField
                  name="securityCode"
                  label="Secure code"
                  type="password"
                  placeholder={isEditing ? "Leave blank to keep card" : "CVV"}
                  inputClassName="font-mono"
                />
                <CustomFormField
                  name="isDefault"
                  label="Set as default payment method"
                  type="checkbox"
                  className="rounded-md border border-gray-200 px-4 py-2"
                />
              </div>
            </section>

            <section className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900">Billing details</h3>
              <CustomFormField
                name="billingAddress"
                label="Billing address"
                placeholder="Street address"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CustomFormField
                  name="country"
                  label="Country"
                  placeholder="United States"
                />
                <CustomFormField name="city" label="City" placeholder="Chicago" />
                <CustomFormField name="state" label="State" placeholder="Illinois" />
                <CustomFormField
                  name="postalCode"
                  label="Pincode"
                  placeholder="60601"
                />
              </div>
            </section>

            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Secure codes are never saved. Production card collection must be
                tokenized by the selected payment provider before reaching the API.
              </p>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="payment-method-form"
            disabled={isSaving}
            className="bg-primary-700 text-white hover:bg-primary-800"
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Add payment method"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
