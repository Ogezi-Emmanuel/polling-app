import { revalidatePath } from 'next/cache';
import PollCard from '@/components/polls/PollCard';
import { redirect } from 'next/navigation';
import { rateLimit, getUserIdentifier, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { deletePollSchema } from '@/lib/validation';
import { ValidationError, RateLimitError, DatabaseError } from '@/lib/errors';
import { PollsService } from '@/lib/services/polls';
import { getSupabaseClient } from '@/lib/supabase';

interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default async function MyPollsPage({ searchParams }: PageProps) {
  const supabase = await getSupabaseClient('server');
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const currentPage = parseInt(searchParams.page || '1');
  const pageSize = 10;

  const { polls, totalCount } = await PollsService.getPollsByUserId(user.id, currentPage, pageSize);

  if (!polls) {
    console.error('Error fetching polls');
    return <p>Error loading polls.</p>;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Polls</h1>
      
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">You haven't created any polls yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {polls.map((poll: any) => (
              <PollCard key={poll.id} poll={poll} onDelete={async (pollId) => {
                try {
                  await handleDelete(pollId);
                  window.location.reload();
                } catch (error) {
                  console.error('Failed to delete poll:', error);
                  alert('Failed to delete poll. Please try again.');
                }
              }} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              {currentPage > 1 && (
                <a
                  href={`/my-polls?page=${currentPage - 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </a>
              )}
              
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              
              {currentPage < totalPages && (
                <a
                  href={`/my-polls?page=${currentPage + 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

async function handleDelete(pollId: string) {
  'use server';
  
  // Validate input
  const validationResult = deletePollSchema.safeParse({ pollId });
  if (!validationResult.success) {
    throw new ValidationError(validationResult.error.format()._errors[0] || 'Invalid input');
  }
  
  // Check rate limit for poll deletion
  const userIdentifier = await getUserIdentifier();
  const rateLimitResult = await rateLimit(userIdentifier, {
    max: 5,
    windowMs: 60 * 1000,
    message: 'Too many poll deletions. Please try again later.'
  });
  
  if (!rateLimitResult.success) {
    throw new RateLimitError(rateLimitResult.message);
  }

  await PollsService.deletePoll(pollId);
  revalidatePath('/my-polls');
}