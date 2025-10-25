import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Skill Tree Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            78%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong emotional growth <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Skills mastered this month
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Goals Completed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +3
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Exceeding weekly targets <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Personal development goals
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Coaching Sessions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Consistent mentorship <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Active guidance sessions</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Emotional Intelligence</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            85
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Excellent self-awareness <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">EQ score improvement</div>
        </CardFooter>
      </Card>
    </div>
  );
}
