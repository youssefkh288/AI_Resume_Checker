import React from "react";
import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 70 ? "text-blue-400"
      : score > 49 ? "text-indigo-400"
      : "text-rose-400";

  const bgColor =
    score > 70 ? "bg-blue-500/10"
      : score > 49 ? "bg-indigo-500/10"
      : "bg-rose-500/10";

  return (
    <div
      className={`flex items-center justify-between px-5 py-4 rounded-xl ${bgColor} transition-all hover:scale-[1.02] hover:shadow-md`}
    >
      <div className="flex flex-row gap-2 items-center">
        <p className="text-lg font-medium text-gray-100">{title}</p>
        <ScoreBadge score={score} />
      </div>
      <p className="text-lg font-semibold">
        <span className={textColor}>{score}</span>
        <span className="text-gray-400">/100</span>
      </p>
    </div>
  );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="rounded-2xl w-full overflow-hidden 
                    bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 
                    shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="flex flex-row items-center p-6 gap-6 border-b border-gray-700">
        <ScoreGauge score={feedback.overallScore} />
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Your Resume Score
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            This score is calculated based on the categories below.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="p-6 space-y-4">
        <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
        <Category title="Content" score={feedback.content.score} />
        <Category title="Structure" score={feedback.structure.score} />
        <Category title="Skills" score={feedback.skills.score} />
      </div>
    </div>
  );
};

export default Summary;
