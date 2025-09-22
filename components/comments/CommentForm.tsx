import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitComment } from '@/lib/actions/comments';

interface CommentFormProps {
  pollId: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ pollId }) => {
  return (
    <form action={submitComment} className="flex gap-2 mt-4">
      <input type="hidden" name="pollId" value={pollId} />
      <Input
        type="text"
        name="content"
        placeholder="Add a comment..."
        className="flex-grow"
        required
        aria-label="Comment content"
      />
      <Button type="submit" aria-label="Submit comment">Comment</Button>
    </form>
  );
};

export default CommentForm;