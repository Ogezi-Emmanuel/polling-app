import React from 'react';
import { Comment } from '@/lib/services/comments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold">Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((comment) => (
          <Card key={comment.id} aria-label={`Comment by ${comment.user_email} on ${new Date(comment.created_at).toLocaleDateString()}`}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{comment.user_email}</CardTitle>
              <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
            </CardHeader>
            <CardContent>
              <p>{comment.content}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default CommentList;