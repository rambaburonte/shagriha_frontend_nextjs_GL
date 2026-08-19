"use client";

import { Button } from "@/components/ui/button";
import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertyQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { Heart, MessageCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(auth)/authProvider";

const ContactWidget = ({ propertyId, onOpenModal }: ContactWidgetProps) => {
  const { user } = useAuth();
  const { data: authUser } = useGetAuthUserQuery(undefined, { skip: !user });
  const { data: property } = useGetPropertyQuery(propertyId);
  const { data: tenant } = useGetTenantQuery(
    authUser?.authInfo?.userId || "",
    { skip: !authUser?.authInfo?.userId }
  );
  const [addFavorite, { isLoading: isAddingFavorite }] =
    useAddFavoritePropertyMutation();
  const [removeFavorite, { isLoading: isRemovingFavorite }] =
    useRemoveFavoritePropertyMutation();
  const router = useRouter();
  const isFavorite =
    tenant?.favorites?.some((favorite) => favorite.id === propertyId) || false;
  const isUpdatingFavorite = isAddingFavorite || isRemovingFavorite;

  const handleButtonClick = () => {
    if (authUser) onOpenModal();
    else router.push("/signin");
  };

  const handleSendMessage = () => {
    if (!authUser) {
      router.push("/signin");
      return;
    }

    const recipient = property?.manager?.email || "";
    const subject = encodeURIComponent(`Inquiry about ${property?.name || "property"}`);
    window.location.href = `mailto:${recipient}?subject=${subject}`;
  };

  const handleFavoriteToggle = async () => {
    if (!authUser) {
      router.push("/signin");
      return;
    }

    const args = { userId: authUser.authInfo.userId, propertyId };
    if (isFavorite) await removeFavorite(args);
    else await addFavorite(args);
  };

  return (
    <div className="min-w-[300px]">
      <div className="h-fit rounded-2xl border border-primary-200 bg-white p-7">
        <div className="mb-4 flex items-center gap-5 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center rounded-full bg-primary-900 p-4">
            <Phone className="text-primary-50" size={15} />
          </div>
          <div>
            <p>Contact This Property</p>
            <div className="text-lg font-bold text-primary-800">
              (424) 340-5574
            </div>
          </div>
        </div>
        <Button
          className="w-full bg-primary-700 text-white hover:bg-primary-600"
          onClick={handleButtonClick}
        >
          {authUser ? "Submit Application" : "Sign In to Apply"}
        </Button>

        <hr className="my-4" />
        <div className="text-sm">
          <div className="mb-1 text-primary-600">
            Language: English, Bahasa.
          </div>
          <div className="text-primary-600">
            Open by appointment on Monday - Sunday
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-9 w-full whitespace-normal border-primary-300 px-2 py-2 text-xs leading-tight text-primary-700 hover:bg-secondary-500 hover:text-white"
          onClick={handleSendMessage}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Send Message
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-9 w-full whitespace-normal border-primary-300 px-2 py-2 text-xs leading-tight text-primary-700 hover:bg-primary-700 hover:text-white"
          onClick={handleFavoriteToggle}
          disabled={isUpdatingFavorite}
        >
          <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "Remove Favourite" : "Add to Favourites"}
        </Button>
      </div>
    </div>
  );
};

export default ContactWidget;
