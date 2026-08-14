import type { PropertyFormData } from "@/lib/schemas";
import type { Property } from "@/types/prismaTypes";

export type PropertyFormStep = "basic" | "details" | "amenities";

export type StoredPropertyFormValues = Omit<PropertyFormData, "photoUrls"> & {
  photoUrls?: never;
};

export interface PropertyDraft {
  id: string;
  status: "DRAFT";
  lastCompletedStep: PropertyFormStep;
  updatedAt: string;
  values: Partial<StoredPropertyFormValues>;
}

const DRAFTS_KEY = "shagriha-property-drafts-v1";
const DEMO_PROPERTIES_KEY = "shagriha-demo-properties-v1";

export const PROPERTY_STORAGE_UPDATED_EVENT =
  "shagriha-property-storage-updated";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(PROPERTY_STORAGE_UPDATED_EVENT));
}

export function getPropertyDrafts(): PropertyDraft[] {
  return readJson<PropertyDraft[]>(DRAFTS_KEY, []).sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getPropertyDraft(id: string): PropertyDraft | undefined {
  return getPropertyDrafts().find((draft) => draft.id === id);
}

export function savePropertyDraft(input: {
  id?: string;
  values: Partial<StoredPropertyFormValues>;
  lastCompletedStep: PropertyFormStep;
}): PropertyDraft {
  const drafts = getPropertyDrafts();
  const draft: PropertyDraft = {
    id: input.id ?? crypto.randomUUID(),
    status: "DRAFT",
    lastCompletedStep: input.lastCompletedStep,
    updatedAt: new Date().toISOString(),
    values: input.values,
  };

  const nextDrafts = [draft, ...drafts.filter((item) => item.id !== draft.id)];
  writeJson(DRAFTS_KEY, nextDrafts);
  return draft;
}

export function deletePropertyDraft(id?: string | null) {
  if (!id) return;
  writeJson(
    DRAFTS_KEY,
    getPropertyDrafts().filter((draft) => draft.id !== id)
  );
}

export function getDemoPublishedProperties(): Property[] {
  return readJson<Property[]>(DEMO_PROPERTIES_KEY, []);
}

export function getDemoPublishedProperty(id: number): Property | undefined {
  return getDemoPublishedProperties().find((property) => property.id === id);
}

export function upsertDemoPublishedProperty(property: Property) {
  const properties = getDemoPublishedProperties();
  writeJson(DEMO_PROPERTIES_KEY, [
    property,
    ...properties.filter((item) => item.id !== property.id),
  ]);
}
