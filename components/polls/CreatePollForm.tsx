// components/polls/CreatePollForm.tsx

'use client';

import { useState } from 'react';
import { createPoll } from '@/lib/actions';
import { getSupabaseClient } from '@/lib/supabase';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CreatePollForm({ userId }: { userId: string }) {
  const formSchema = z.object({
    question: z.string().min(1, { message: 'Poll question is required.' }),
    options: z.array(z.object({
      text: z.string().min(1, { message: 'Option cannot be empty.' }),
    })).min(2, { message: 'Please add at least two options.' }),
  });

  type FormData = z.infer<typeof formSchema>;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      options: [{ text: '' }, { text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray<FormData>({
    control,
    name: 'options',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPollCreated, setIsPollCreated] = useState(false);
  const [newPollId, setNewPollId] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    const optionsText = data.options.map(option => option.text);
    const result = await createPoll(data.question, optionsText, userId);

    if ('error' in result) {
      console.error('Error creating poll:', result.error);
      setIsLoading(false);
      return;
    }

    if (result.success) {
      console.log('Poll created successfully:', result.pollId);
      setIsPollCreated(true);
      setNewPollId(result.pollId!);
      reset(); // Reset the form after successful submission
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      {isPollCreated && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Poll created successfully!</span>
          {newPollId && (
            <p className="mt-2">
              Share your poll: <a href={`/poll/${newPollId}`} className="text-blue-600 hover:underline">{`/poll/${newPollId}`}</a>
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Create New Poll</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              placeholder="Enter your poll question"
              {...register('question')}
            />
            {errors.question && <p className="text-red-500 text-sm">{errors.question.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Options</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}.text`)}
                />
                {index > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} className="ml-2">
                  X
                </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ text: '' })}
              className="w-full"
              disabled={fields.length >= 5}
            >
              Add Option
            </Button>
            {errors.options && <p className="text-red-500 text-sm">{errors.options.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Poll'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}