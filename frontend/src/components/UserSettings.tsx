/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings, AlertTriangle } from "lucide-react";
import { deleteUserAccount } from "@/utils/supabase";
import { updateMatureContent } from "@/utils/supabase";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"; // Import shadcn AlertDialog components

interface UserSettingsProps {
  userPreference: boolean;
}

const UserSettings: React.FC<UserSettingsProps> = ({ userPreference }) => {
  // Setting states
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [matureContent, setMatureContent] = useState<boolean>(userPreference);

  const navigate = useNavigate();

  // Handle mature toggle
  const handleMatureToggle = async (checked: boolean) => {
    setMatureContent(checked);

    try {
      await updateMatureContent(checked);
      toast.success(
        checked ? "Mature content enabled" : "Mature content disabled"
      );
    } catch (error: any) {
      toast.error(`${error.message}`);
      // Revert the switch if the update failed
      setMatureContent(!checked);
    }
  };

  // Account Deletion Handler
  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const result = await deleteUserAccount();

      if (result.success) {
        toast.success(result.message);
        // Navigate to landing page after successful deletion
        navigate("/");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      {/* Icon to open the AlertDialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className=" hover:scale-110 transition-transform duration-200">
            <Settings className="h-6 w-6" />
          </button>
        </AlertDialogTrigger>

        {/* AlertDialog Content */}
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>User Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Manage your preferences and account settings.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Allow Mature Content Switch */}
          <div className="flex items-center space-x-2 mb-4">
            <label
              htmlFor="mature-content-toggle"
              className="text-sm font-medium"
            >
              Allow Mature Content
            </label>
            <Switch
              id="mature-content-toggle"
              checked={matureContent}
              onCheckedChange={handleMatureToggle}
            />
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-3">Danger Zone</h4>
            <p className="text-sm text-tertiary-text mb-4">
              Delete user account and information from Inkprov
            </p>
            <Button
              variant="destructive"
              className="w-[80%] sm:w-[50%] flex items-center justify-center gap-2"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </>
              )}
            </Button>
          </div>

          {/* AlertDialog Footer */}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white w-25">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserSettings;
