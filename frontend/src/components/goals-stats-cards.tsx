import { IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GoalsStatsCardsProps {
  totalGoals: number;
  completedGoals: number;
  inProgressCount: number;
  completionRate: number;
}

export function GoalsStatsCards({
  totalGoals,
  completedGoals,
  inProgressCount,
  completionRate,
}: GoalsStatsCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Goals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalGoals}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Comprehensive development plan <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Across multiple skill areas
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Goals Completed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {completedGoals}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />+{completedGoals}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Excellent progress <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Personal development goals
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>In Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {inProgressCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Working toward targets <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Active skill development</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {completionRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />+{completionRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong achievement rate <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Goal completion success</div>
        </CardFooter>
      </Card>
    </div>
  );
}
