import { z } from 'zod';

export const voteSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
  pollId: z.string().min(1, 'Poll ID is required'),
});

export const createPollSchema = z.object({
  question: z.string().min(1, 'Poll question is required').max(500, 'Question too long'),
  options: z.array(z.string().min(1, 'Option cannot be empty').max(200, 'Option too long'))
    .min(2, 'At least 2 options required')
    .max(10, 'Maximum 10 options allowed'),
  userId: z.string().min(1, 'User ID is required'),
});

export const deletePollSchema = z.object({
  pollId: z.string().min(1, 'Poll ID is required'),
});

export type VoteInput = z.infer<typeof voteSchema>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type DeletePollInput = z.infer<typeof deletePollSchema>;