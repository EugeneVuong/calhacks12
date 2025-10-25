from dataclasses import asdict 
from typing import List 
from datetime import datetime, timedelta 

from .state import AgentState, Goal, Milestone 

class MentorAgent:
    """
    MentorAgent is the AI mentor. 
    - It remembers your goals and milestones in AgentState 
    - It can generate a 4-week study plan and reiterate the plans based on your response
    - Later, it was call integrations like Notion and Calendar
    """
    def __init__(self):
        #persistent memory
        self.state = AgentState()