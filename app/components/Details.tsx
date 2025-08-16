import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px] border backdrop-blur-md",
        score > 69
          ? "bg-blue-100/70 border-blue-200 text-blue-800"
          : score > 39
            ? "bg-indigo-100/70 border-indigo-200 text-indigo-800"
            : "bg-slate-200/70 border-slate-300 text-slate-800"
      )}
    >
      <img
        src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
        alt="score"
        className="size-4"
      />
      <p className="text-sm font-medium">{score}/100</p>
    </div>
  );
};


const CategoryHeader = ({
                          title,
                          categoryScore,
                        }: {
  title: string;
  categoryScore: number;
}) => {
  return (
      <div className="flex flex-row gap-4 items-center py-2">
        <p className="text-2xl font-semibold">{title}</p>
        <ScoreBadge score={categoryScore} />
      </div>
  );
};

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Grid - Compact Overview */}
      <div className="bg-gray-900/80 w-full rounded-xl p-1 grid grid-cols-2 gap-3 border border-gray-800">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={`flex flex-col gap-2 rounded-xl p-3 
              ${tip.type === "good" 
                ? "bg-emerald-600/30 border border-emerald-400" 
                : "bg-red-400/30 border border-red-300"
              }
              transition-all hover:bg-opacity-70 hover:shadow-lg`}
          >
            <div className="flex items-center gap-2">
              <img
                src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="size-4 filter brightness-0 invert opacity-90"
              />
              {/* Much brighter text */}
              <span className="font-medium text-white">{tip.tip}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom List - Detailed Explanations */}
      <div className="flex flex-col gap-3 w-full bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={`flex flex-col gap-3 rounded-xl p-4 border transition-all hover:shadow-lg
              ${tip.type === "good"
                ? "bg-emerald-700/40 border-emerald-500 hover:bg-emerald-700/60"
                : "bg-red-400/40 border-red-300 hover:bg-red-400/60"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${tip.type === "good" 
                ? "bg-emerald-600" 
                : "bg-red-400"}`}>
                <img
                  src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                  alt="score"
                  className="size-5 filter brightness-0 invert"
                />
              </div>
              {/* Tip title */}
              <h3 className="text-xl font-semibold text-gray-900">{tip.tip}</h3>
            </div>
            {/* Explanation text also white for max clarity */}
           <p className="text-base  leading-relaxed pl-[52px]">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};












const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
      <div className="flex flex-col gap-4 w-full">
        <Accordion>
          <AccordionItem id="tone-style">
            <AccordionHeader itemId="tone-style">
              <CategoryHeader
                  title="Tone & Style"
                  categoryScore={feedback.toneAndStyle.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="tone-style">
              <CategoryContent tips={feedback.toneAndStyle.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="content">
            <AccordionHeader itemId="content">
              <CategoryHeader
                  title="Content"
                  categoryScore={feedback.content.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="content">
              <CategoryContent tips={feedback.content.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="structure">
            <AccordionHeader itemId="structure">
              <CategoryHeader
                  title="Structure"
                  categoryScore={feedback.structure.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="structure">
              <CategoryContent tips={feedback.structure.tips} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem id="skills">
            <AccordionHeader itemId="skills">
              <CategoryHeader
                  title="Skills"
                  categoryScore={feedback.skills.score}
              />
            </AccordionHeader>
            <AccordionContent itemId="skills">
              <CategoryContent tips={feedback.skills.tips} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
  );
};

export default Details;