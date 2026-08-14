"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
import type { PropertyDraft } from "@/lib/propertyDraftStorage";

interface ManagerDraftPropertyCardProps {
  draft: PropertyDraft;
}

const ManagerDraftPropertyCard = ({ draft }: ManagerDraftPropertyCardProps) => {
  const propertyName = draft.values.name?.trim() || "Untitled Property";
  const address = [
    draft.values.address,
    draft.values.city,
    draft.values.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex h-48 items-center justify-center bg-gray-100 px-5 text-center text-lg text-gray-500">
        Images to be added
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-950">
              {propertyName}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {address || "Address details are not complete"}
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            Draft
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Clock3 className="h-3.5 w-3.5" />
            Saved {new Date(draft.updatedAt).toLocaleDateString()}
          </span>
          <Link
            href={`/managers/newproperty?draftId=${draft.id}`}
            className="text-sm font-medium text-secondary-600 hover:text-secondary-700 hover:underline"
          >
            Resume
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ManagerDraftPropertyCard;
