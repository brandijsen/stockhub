import { z } from "zod";

export const createConversationSchema = z.object({
  withUserId: z.string().trim().min(1),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const listMessagesQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
