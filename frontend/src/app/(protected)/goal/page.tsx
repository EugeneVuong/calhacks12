import data from "../data.json";
import { Badge } from "@/components/ui/badge";
import { GoalsStatsCards } from "@/components/goals";
import type { StatCardData } from "@/components/goals";

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
  const otherGoals = goals.filter(
    (goal) => goal.status !== "Done" && goal.status !== "In Process"
  );

  // Calculate statistics
  const totalGoals = goals.length;
  const completedGoals = doneGoals.length;
  const inProgressCount = inProcessGoals.length;
  const completionRate = Math.round((completedGoals / totalGoals) * 100);

  // Configure stats cards
  const statsCards: StatCardData[] = [
    {
      title: "Total Goals",
      value: totalGoals,
      badgeText: "Active",
      badgeShowValue: false,
      highlightText: "Comprehensive development plan",
      description: "Across multiple skill areas",
    },
    {
      title: "Goals Completed",
      value: completedGoals,
      badgeText: "Completed",
      badgeShowValue: true,
      highlightText: "Excellent progress",
      description: "Personal development goals",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      badgeText: "Active",
      badgeShowValue: false,
      highlightText: "Working toward targets",
      description: "Active skill development",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      badgeText: "Success",
      badgeShowValue: false,
      highlightText: "Strong achievement rate",
      description: "Goal completion success",
    },
  ];

  // Convert goals to card data
  const inProcessGoalCards = inProcessGoals.map(goalToCardData);
  const doneGoalCards = doneGoals.map(goalToCardData);
  const otherGoalCards = otherGoals.map(goalToCardData);

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="@container/main flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-6 py-4 px-4 md:py-6 md:px-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Goals</h1>
            <p className="text-muted-foreground">
              Track and manage your personal development goals
            </p>
          </div>

          {/* Stats Cards */}
          <GoalsStatsCards stats={statsCards} />

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

          {/* Other Goals */}
          {otherGoalCards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Other Goals</h2>
                <Badge variant="secondary">{otherGoalCards.length}</Badge>
              </div>
              <GoalsStatsCards stats={otherGoalCards} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
