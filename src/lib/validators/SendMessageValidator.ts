import { z } from "zod";

export const SendMessageValidator = z.object({
  message: z.string().min(1),
  fileId: z.string().min(1),
});
