import React from "react";
import { FiStar } from "react-icons/fi";

interface IdeaEvaluationMatrixProps {
  ideas: any[];
  criteria: any[];
  ratings: any;
  weights: any;
  onRatingChange: (ideaId: string, criterionId: string, rating: number) => void;
  onWeightChange: (criterionId: string, weight: number) => void;
}

const IdeaEvaluationMatrix: React.FC<IdeaEvaluationMatrixProps> = ({
  ideas,
  criteria,
  ratings,
  weights,
  onRatingChange,
  onWeightChange,
}) => {
  const calculateWeightedScore = (ideaId: string) => {
    let totalScore = 0;
    let totalWeight = 0;

    criteria.forEach((criterion) => {
      const rating = ratings[ideaId]?.[criterion.id] || 0;
      const weight = weights[criterion.id] || 0;
      totalScore += rating * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  return (
    <div className="idea-evaluation-matrix">
      <table className="w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 bg-gray-100 text-left font-medium text-gray-700"></th>
            {criteria.map((criterion) => (
              <th
                key={criterion.id}
                className="px-4 py-2 bg-gray-100 text-left font-medium text-gray-700"
              >
                {criterion.name}
                <input
                  type="number"
                  value={weights[criterion.id] || ""}
                  onChange={(e) =>
                    onWeightChange(criterion.id, parseInt(e.target.value))
                  }
                  className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </th>
            ))}
            <th className="px-4 py-2 bg-gray-100 text-left font-medium text-gray-700">
              Weighted Score
            </th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
            <tr key={idea.id}>
              <td className="px-4 py-2 border-b border-gray-300">
                {idea.title}
              </td>
              {criteria.map((criterion) => (
                <td
                  key={criterion.id}
                  className="px-4 py-2 border-b border-gray-300"
                >
                  <input
                    type="number"
                    value={ratings[idea.id]?.[criterion.id] || ""}
                    onChange={(e) =>
                      onRatingChange(
                        idea.id,
                        criterion.id,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              ))}
              <td className="px-4 py-2 border-b border-gray-300">
                {calculateWeightedScore(idea.id).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IdeaEvaluationMatrix;
