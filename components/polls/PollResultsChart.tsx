'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { getVoteCountsForPoll } from "@/lib/services/votes";
import { Database } from '@/lib/database.types';

interface PollResultsChartProps {
  pollId: string;
}

interface ChartData {
  name: string;
  votes: number;
}

const PollResultsChart: React.FC<PollResultsChartProps> = ({ pollId }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [options, setOptions] = useState<Array<{ id: string; text: string; votes: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchVoteData = async () => {
      setLoading(true);
      try {
        const counts = await getVoteCountsForPoll(pollId);
        setVoteCounts(counts);

        const { data: pollOptions, error: fetchError } = await supabase
          .from('poll_options')
          .select('id, text')
          .eq('poll_id', pollId);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        const formattedOptions = pollOptions.map((option: { id: string; text: string }) => ({
          id: option.id,
          text: option.text,
          votes: counts[option.id] || 0,
        }));
        setOptions(formattedOptions);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVoteData();
  }, [pollId]);

  if (loading) {
    return <div className="text-center py-4">Loading results...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (chartData.length === 0) {
    return <div className="text-center py-4">No votes yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="votes" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PollResultsChart;