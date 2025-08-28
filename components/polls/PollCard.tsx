interface PollCardProps {
  poll: {
    id: string;
    question: string;
    user_id: string;
    created_at: string;
  };
}

export default function PollCard({ poll }: PollCardProps) {
  return (
    <div>
      <h3>{poll.question}</h3>
      <p>Created by: {poll.user_id}</p>
      {/* Poll card display logic will be implemented here */}
    </div>
  );
}