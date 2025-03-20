import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { settingsSchema } from "@/utils/formSchemas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { deleteUserAccount } from "@/utils/supabase";
import {
  getUserProfileData,
  updateUsername,
  updateBio,
  updateMatureContent,
} from "@/utils/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { UserCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
const API_BASE_URL = import.meta.env.BACKEND_URL || "http://localhost:8080";

const Settings: React.FC = () => {
  // Setting states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  // const [username, setUsername] = useState<string>("");
  // const [bio, setBio] = useState<string>("");
  const [bioCharCount, setBioCharCount] = useState<number>(0);
  const [matureContent, setMatureContent] = useState<boolean>(false);

  const navigate = useNavigate();

  // Form Validation
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: "",
      bio: "",
      matureContent: false,
    },
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        // Use the consolidated API call
        const userData = await getUserProfileData();

        let username = userData.username;
        if (username.includes("@")) {
          username = username.substring(0, username.indexOf("@"));
        }

        const bioText = userData.bio || "";
        setBioCharCount(bioText ? bioText.length : 0);
        setMatureContent(userData.matureContentEnabled || false);

        // set form values after data is fetched
        form.reset({
          username: username,
          bio: bioText,
          matureContent: userData.matureContentEnabled || false,
        });
      } catch (error) {
        console.error("Error fetching settings data:", error);
        toast.error("Failed to load settings");
      }
    };

    fetchSettingsData();
  }, [form]);

  // Form Submission
  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Update user data in database
    try {
      setIsLoading(true);

      // Check if any of the fields have data
      if (
        values.username.length > 0 ||
        values.bio.length > 0 ||
        values.matureContent !== matureContent
      ) {
        const moderationResponse = await axios.post(
          `${API_BASE_URL}/moderation`,
          {
            content: values.username + " " + values.bio,
          }
        );

        // If content is flagged, display reason
        if (moderationResponse.data.flagged) {
          toast.error(
            `Content flagged for ${moderationResponse.data.reason}. Please try again.`
          );
          setIsLoading(false);
          return;
        }
      }

      if (values.username.length > 0) {
        await updateUsername(values.username);
        sessionStorage.setItem("username", values.username);
      }
      values.bio.length > 0 ? await updateBio(values.bio) : null;
      values.matureContent !== matureContent
        ? await updateMatureContent(values.matureContent)
        : null;
      toast.success("Successfully Saved Changes");
      setIsLoading(false);
    } catch (error: any) {
      toast.error(`${error.message}`);
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
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto"
      >
        <h2 className="text-3xl font-medium text-primary-text text-left mt-5">
          Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 bg-background">
          {/* Left Column */}
          <div className="w-full max-w-xl space-y-8 bg-card p-8 rounded-lg border border-primary-border">
            <h3 className="text-2xl font-medium text-primary-text text-left mb-3">
              Profile Information
            </h3>
            <p className="text-sm text-tertiary-text text-left">
              Update your account settings
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                {/* Username Input */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-primary-text text-left">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                          placeholder="Username"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      {/* Form Error Message */}
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col">
                {/* Bio Input */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-primary-text text-left">
                        Bio
                      </FormLabel>
                      <div className="flex flex-col">
                        <FormControl>
                          <Textarea
                            placeholder="Share a glimpse of your story with others."
                            className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                            onChange={(e) => handleBioChange(e, field.onChange)}
                            value={field.value}
                            maxLength={180}
                          />
                        </FormControl>
                        <div className="text-xs text-tertiary-text text-right mt-1">
                          {bioCharCount}/180 characters
                        </div>
                      </div>
                      {/* Form Error Message */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                className="bg-primary-button hover:bg-primary-button-hover cursor-pointer w-1/2"
                variant="default"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" /> Saving Changes
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg border border-primary-border">
            <h3 className="text-2xl font-medium text-primary-text text-left mb-3">
              Preferences
            </h3>
            <p className="text-sm text-tertiary-text text-left">
              Manage your account preferences
            </p>
            <div className="text-primary-text space-y-8">
              {/* Allow Mature Content Switch */}
              <FormField
                control={form.control}
                name="matureContent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Allow mature content</FormLabel>
                    <FormControl>
                      <Switch
                        className="data-[state=checked]:bg-primary-button cursor-pointer"
                        checked={matureContent}
                        onCheckedChange={async (checked) => {
                          field.onChange(checked);
                          setMatureContent(checked);
                          try {
                            await updateMatureContent(checked);
                            toast.success(
                              checked
                                ? "Mature content enabled"
                                : "Mature content disabled"
                            );
                          } catch (error: any) {
                            toast.error(`${error.message}`);
                            // Revert the switch if the update failed
                            field.onChange(!checked);
                            setMatureContent(!checked);
                          }
                        }}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Profile Preview Button (Temporary) */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-3">Danger Zone</h4>
                <p className="text-sm text-tertiary-text mb-4">
                  Delete user account and information from Inkprov
                </p>
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2"
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
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Settings;
