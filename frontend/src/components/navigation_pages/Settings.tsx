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
import {
  getUsername,
  getBio,
  getMatureContent,
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

const Settings: React.FC = () => {
  // Setting states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [matureContent, setMatureContent] = useState<boolean>(false);

  useEffect(() => {
    // Fetch user data
    const userData = Promise.all([getUsername(), getBio(), getMatureContent()]);
    userData.then((res) => {
      let username = res[0][0].user_profile_name;
      if (username.includes("@")) {
        username = username.substring(0, username.indexOf("@"));
      }

      setUsername(username);
      setBio(res[1][0].user_profile_bio);
      setMatureContent(res[2][0].user_profile_mature_enabled);
    });
  }, []);

  // Form Validation
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      username: username,
      bio: bio,
      matureContent: matureContent,
    },
  });

  // Form Submission
  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Update user data in database
    try {
      setIsLoading(true);
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
    } catch (error) {
      toast.error("An error occured when saving changes");
      setIsLoading(false);
    }
  }

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
                          placeholder={
                            username.length > 0 ? username : "Username"
                          }
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
                      <FormControl>
                        <Textarea
                          placeholder={
                            bio.length > 0
                              ? bio
                              : "Share a glimpse of your story with others."
                          }
                          className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                          {...field}
                        />
                      </FormControl>
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
            <div className="text-primary-text">
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
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setMatureContent(checked);
                        }}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Settings;
