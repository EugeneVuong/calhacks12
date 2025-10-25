from dataclasses import dataclass, feild
from typing import List, Optional

@dataclass 
class Milestone:
    label: str
    due_date: str
    status : str
    tasks : List[str] = feild(default_factory = list)
    #tasks could look like ["Review array notes, Do 10 Leetcode problems"]

@dataclass 
class Goal:
    title : str #ex"Data Structures Exam Prep"
    target_date: str #ex: "2025 -11 -20 "
    why_it_matters: str #ex:"I need a strong grade for internship season"
    milestones: List[Milestone] = feild (default_factory= list)

@dataclass 
class AgentState:
    goals : List[Goal] = feild(defaul_factory=list)

    def add_goal(self, goal : Goal):
        #Add a new goal to the agent's memory
        self.goals.append(goal)

    def get_latest_goal(self) -> Optional[Goal]:

        #Return the most recently added goal, or None if there are no goals yet

        if not self.goals:
            return None
        return self.goals[-1]


