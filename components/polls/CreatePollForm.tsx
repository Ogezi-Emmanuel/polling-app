// components/polls/CreatePollForm.tsx

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: poll, error } = await supabase
      .from('polls')
      .insert({ question: data.question, user_id: userId })
      .select('id, question');

    if (error) {
      console.error('Error creating poll:', error);
      setIsLoading(false);
      return;
    }

    if (poll && poll.length > 0) {
      const pollId = poll[0].id;
      const optionsToInsert = data.options.map((option) => ({
        poll_id: pollId,
        text: option.text,
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Error adding options:', optionsError);
        setIsLoading(false);
        return;
      }

      console.log('Poll created successfully:', poll);
      // Optionally, redirect or show a success message
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
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