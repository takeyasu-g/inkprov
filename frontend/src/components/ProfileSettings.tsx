/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { settingsSchema } from "@/utils/formSchemas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  getUserProfileData,
  updateUsername,
  updateBio,
} from "@/utils/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface EditingToggleProps {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8080";

const ProfileSettings: React.FC<EditingToggleProps> = ({
  isEditing,
  setIsEditing,
  setBio,
  setUsername,
}) => {
  const { t } = useTranslation();
  // Setting states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bioCharCount, setBioCharCount] = useState<number>(0);

  // Form Validation
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const userData = await getUserProfileData();

        let username = userData.username;
        if (username.includes("@")) {
          username = username.substring(0, username.indexOf("@"));
        }

        const bioText = userData.bio || "";
        setBioCharCount(bioText ? bioText.length : 0);

        // Set form values after data is fetched
        form.reset({
          username: username,
          bio: bioText,
        });
      } catch (error) {
        console.error("Error fetching settings data:", error);
        toast.error(t("settings.loadError"));
      }
    };

    fetchSettingsData();
  }, [form]);

  // Form Submission
  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      setIsLoading(true);

      /* Check if any of the fields have data
      if (values.username.length > 0 || values.bio.length > 0) {
        const moderationResponse = await axios.post(
          `${API_BASE_URL}moderation`,
          {
            content: values.username + " " + values.bio,
          }
        );

        // If content is flagged, display reason
        if (moderationResponse.data.flagged) {
          toast.error(
            `${t("moderation.flagged")} ${moderationResponse.data.reason}`
          );
          setIsLoading(false);
          return;
        }
      }
        */

      // Update username and bio
      if (values.username.length > 0) {
        await updateUsername(values.username);
        sessionStorage.setItem("username", values.username);
        setUsername(values.username);
      }
      if (values.bio.length > 0 || values.bio === "") {
        await updateBio(values.bio);
        setBio(values.bio);
      }

      toast.success(t("toasts.saveChangesSuccess"));
    } catch (error: any) {
      toast.error(`${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle bio text change
  const handleBioChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    onChange: (value: string) => void
  ) => {
    const value = e.target.value;

    // Limit to 180 characters
    if (value.length <= 180) {
      onChange(value);
      setBioCharCount(value.length);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto bg-white"
      >
        <div className="flex flex-col gap-4 ">
          {/* Username Input */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-primary-text text-left">
                  {t("settings.leftSection.form.usernameField.title")}
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                    placeholder={t("settings.leftSection.form.usernameField.placeholder")}
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-left" />
              </FormItem>
            )}
          />

          {/* Bio Input */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-primary-text text-left">
                  {t("settings.leftSection.form.bioField.title")}
                </FormLabel>
                <div className="flex flex-col">
                  <FormControl>
                    <Textarea
                      placeholder={t("settings.leftSection.form.bioField.placeholder")}
                      className="mt-1 block w-full rounded-md border border-primary-border resize-y max-h-38 bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                      onChange={(e) => handleBioChange(e, field.onChange)}
                      value={field.value}
                      maxLength={180}
                    />
                  </FormControl>
                  <div className="text-xs text-tertiary-text text-right mt-1">
                    {bioCharCount}/180 {t("characters")}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Save  & Cancel Changes Button */}
          <div className="flex gap-3 ">
            <Button
              className=" w-auto bg-primary-button hover:bg-primary-button-hover cursor-pointer"
              variant="default"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> {t("settings.leftSection.saveChangesLoading")}
                </>
              ) : (
                t("settings.leftSection.saveChanges")
              )}
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="w-auto bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 cursor-pointer"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ProfileSettings;
