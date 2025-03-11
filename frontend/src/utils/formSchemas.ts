import { z } from "zod";

const settingsSchema = z.object({
    username: z.string(),
    bio: z.string().max(50, { message: "Bio must be less than 50 characters" }),
    matureContent: z.boolean()
  });

  export { settingsSchema };