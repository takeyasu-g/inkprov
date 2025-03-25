import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useTranslation } from "react-i18next";

interface RedeemCodeProps {
  isRedeeming: boolean;
  setIsRedeeming: React.Dispatch<React.SetStateAction<boolean>>;
}

// Map to link redemption codes to the appripriate stat in user_gamification_stats
const CODE_TO_STAT_MAPPING: Record<string, string> = {
  CC37DEMODAY: "attended_demo_day",
  CC_INSTRUCTOR: "is_cc_instructor",
  CC_DEVELOPER: "is_cc_developer",
};

const RedeemCode: React.FC<RedeemCodeProps> = ({ setIsRedeeming }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error(t("toasts.codeRedemptionError1"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if we have a mapping for this code
      const normalizedCode = code.trim().toUpperCase();
      const statColumn = CODE_TO_STAT_MAPPING[normalizedCode];

      if (!statColumn) {
        throw new Error("Invalid code");
      }

      if (!user) {
        throw new Error("You must be logged in to redeem a code");
      }

      // Check if user has already redeemed this code by looking at their stats
      const { data: userStats, error: userStatsError } = await supabase
        .from("user_gamification_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (userStatsError && userStatsError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        throw new Error("Error checking redemption status");
      }

      // If user has already redeemed this code
      if (userStats && userStats[statColumn] === 1) {
        throw new Error("You have already redeemed this code");
      }

      // Prepare update data
      const updateData: Record<string, any> = {};
      if (statColumn === "is_cc_instructor") {
        updateData[statColumn] = true;
      } else {
        updateData[statColumn] = 1;
      }

      if (userStats) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("user_gamification_stats")
          .update(updateData)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Update error:", updateError);
          throw new Error("Failed to update gamification stats");
        }
      } else {
        // Insert new record
        updateData.user_id = user.id;
        const { error: insertError } = await supabase
          .from("user_gamification_stats")
          .insert([updateData]);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw new Error("Failed to update gamification stats");
        }
      }

      // Success response
      toast.success(t("toasts.codeRedemptionSuccess"));
      setCode("");
      setIsRedeeming(false);
    } catch (error: any) {
      toast.error(error.message || t("toasts.codeRedemptionError2"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCode("");
    setIsRedeeming(false);
  };

  return (
    <div className="flex flex-col space-y-4 p-2">
      <h3 className="text-lg font-medium text-primary-text">
        {t("profile.header.redeemCode")}
      </h3>
      <p className="text-sm text-secondary-text">
        {t("profile.header.redeemCodeDescription")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("profile.header.redeemCodePlaceholder")}
            className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-button hover:bg-primary-button-hover text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("profile.header.redeemCodeLoading")}
              </>
            ) : (
              t("profile.header.redeem")
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-auto text-primary-text hover:bg-secondary-button-hover hover:text-primary-text cursor-pointer"
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RedeemCode;
