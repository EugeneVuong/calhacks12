import data from "../data.json";
import { Badge } from "@/components/ui/badge";
import { GoalsStatsCards } from "@/components/goals";
import type { StatCardData } from "@/components/goals";
import { PageHeader } from "@/components/page-header";

interface Goal {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
}

function goalToCardData(goal: Goal): StatCardData {
  return {
    title: goal.header,
    value: goal.type,
    badgeText: goal.status,
    badgeShowValue: false,
    highlightText: `Target: ${goal.target}`,
    description: `Limit: ${goal.limit} | Reviewed by: ${goal.reviewer}`,
    className:
      "hover:shadow-lg transition-shadow cursor-pointer group hover:border-primary/50",
  };
}

export default function Page() {
  const goals = data as Goal[];

  // Group goals by status
  const doneGoals = goals.filter((goal) => goal.status === "Done");
  const inProcessGoals = goals.filter((goal) => goal.status === "In Process");

  // Convert goals to card data
  const inProcessGoalCards = inProcessGoals.map(goalToCardData);
  const doneGoalCards = doneGoals.map(goalToCardData);

  return (
    <div className="flex flex-1 flex-col h-full">
      <PageHeader
        title="Goals"
        description="Track and manage your personal development goals"
      />
      <div className="@container/main flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-6 py-4 px-4 md:py-6 md:px-6">
          {/* In Process Goals */}
          {inProcessGoalCards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">In Progress</h2>
                <Badge variant="secondary">{inProcessGoalCards.length}</Badge>
              </div>
              <GoalsStatsCards stats={inProcessGoalCards} />
            </div>
          )}

          {/* Completed Goals */}
          {doneGoalCards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Completed</h2>
                <Badge variant="secondary">{doneGoalCards.length}</Badge>
              </div>
              <GoalsStatsCards stats={doneGoalCards} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
