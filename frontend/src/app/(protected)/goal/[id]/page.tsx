import data from "../../data.json";
import { SkillTree } from "@/components/goals";
import type { SkillNode, SkillLink } from "@/components/goals";

interface Goal {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
}

export default async function GoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goals = data as Goal[];
  const goal = goals.find((g) => g.id === parseInt(id));

  if (!goal) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Goal Not Found</h1>
          <p className="text-muted-foreground">
            The goal you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Create skill tree data for all skills
  const skillNodes: SkillNode[] = goals.map((g) => ({
    id: g.id.toString(),
    name: g.header,
    status: g.status,
    type: g.type,
  }));

  // Create links between related skills (connect skills of the same type)
  const skillLinks: SkillLink[] = [];
  const skillsByType = goals.reduce((acc, g) => {
    if (!acc[g.type]) acc[g.type] = [];
    acc[g.type].push(g.id.toString());
    return acc;
  }, {} as Record<string, string[]>);

  Object.values(skillsByType).forEach((skillIds) => {
    for (let i = 0; i < skillIds.length - 1; i++) {
      skillLinks.push({
        source: skillIds[i],
        target: skillIds[i + 1],
      });
    }
  });

  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 min-h-0 w-full">
        <SkillTree skills={skillNodes} links={skillLinks} />
      </div>
    </div>
  );
}
