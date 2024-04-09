'use client';

import { Tables } from '@/types_db';

type Insight = Tables<'insights'>;

interface InsightsProps {
  insights: Insight[];
}

export default function Insights({ insights }: InsightsProps) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">Insights</h3>
      {/* Add insights implementation */}
      <ul>
        {insights.map((insight) => (
          <li key={insight.id}>{insight.name}</li>
        ))}
      </ul>
    </div>
  );
}
