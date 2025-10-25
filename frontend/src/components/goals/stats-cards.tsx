import { IconTrendingUp } from "@tabler/icons-react";
import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardData {
  title: string;
  value?: string | number;
  badgeText?: string;
  badgeShowValue?: boolean;
  highlightText?: string;
  description?: string;
  customContent?: ReactNode;
  customFooter?: ReactNode;
  className?: string;
}

interface GoalsStatsCardsProps {
  stats: StatCardData[];
  gridClassName?: string;
}

function StatCard({ stat }: { stat: StatCardData }) {
  return (
    <Card className={stat.className || "@container/card"}>
      <CardHeader>
        <CardDescription>{stat.title}</CardDescription>
        {stat.value && (
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stat.value}
          </CardTitle>
        )}
        {stat.badgeText && (
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {stat.badgeShowValue ? `+${stat.value}` : stat.badgeText}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {stat.customContent && <CardContent>{stat.customContent}</CardContent>}
      {stat.customFooter && <CardFooter>{stat.customFooter}</CardFooter>}
      {!stat.customFooter && !stat.customContent && stat.highlightText && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stat.highlightText} <IconTrendingUp className="size-4" />
          </div>
          {stat.description && (
            <div className="text-muted-foreground">{stat.description}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

function GoalsStatsCards({ stats, gridClassName }: GoalsStatsCardsProps) {
  const defaultClassName =
    "*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4";

  return (
    <div className={gridClassName || defaultClassName}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}

export { GoalsStatsCards, StatCard };
export type { StatCardData };
