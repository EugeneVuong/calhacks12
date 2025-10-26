"""
Enhanced Course Agent with Structured JSON Output

This is an enhanced version of the existing SkillTreeCourseAgent that includes
structured JSON output capabilities for consistent data formatting.
"""

from letta_client import Letta
from letta_client.client import BaseTool
from pydantic import BaseModel, Field
from typing import Type, List, Dict, Any, Optional
from dotenv import load_dotenv
import os
import json

load_dotenv()


class LearningResource(BaseModel):
    """Schema for learning resources"""
    title: str = Field(..., description="Title of the resource")
    url: str = Field(..., description="URL of the resource")
    type: str = Field(..., description="Type: course, book, tutorial, article")
    difficulty: str = Field(..., description="Difficulty level")
    rating: Optional[float] = Field(None, description="Rating out of 5")


class TopicAnalysis(BaseModel):
    """Structured analysis of an educational topic"""
    topic: str = Field(..., description="The topic being analyzed")
    summary: str = Field(..., description="Comprehensive summary")
    key_concepts: List[str] = Field(..., description="Key concepts to understand")
    prerequisites: List[str] = Field(..., description="Prerequisites")
    difficulty_level: str = Field(..., description="beginner, intermediate, advanced")
    estimated_hours: int = Field(..., description="Estimated hours to learn")
    resources: List[Dict[str, Any]] = Field(..., description="Learning resources")
    subtopics: List[str] = Field(..., description="Subtopics to explore")
    current_trends: List[str] = Field(..., description="Current trends and developments")
    career_applications: List[str] = Field(..., description="Career applications")


class StructuredAnalysisTool(BaseTool):
    """Tool for generating structured topic analysis"""
    
    name: str = "analyze_topic_structured"
    args_schema: Type[BaseModel] = TopicAnalysis
    description: str = "Generate a comprehensive structured analysis of an educational topic"
    
    def run(self, topic: str, summary: str, key_concepts: List[str],
            prerequisites: List[str], difficulty_level: str, 
            estimated_hours: int, resources: List[Dict], 
            subtopics: List[str], current_trends: List[str],
            career_applications: List[str]) -> str:
        """Generate structured topic analysis"""
        
        analysis = {
            "topic": topic,
            "summary": summary,
            "key_concepts": key_concepts,
            "prerequisites": prerequisites,
            "difficulty_level": difficulty_level,
            "estimated_hours": estimated_hours,
            "resources": resources,
            "subtopics": subtopics,
            "current_trends": current_trends,
            "career_applications": career_applications,
            "analysis_timestamp": "2025-01-27T00:00:00Z"
        }
        
        return json.dumps(analysis, indent=2)


class EnhancedSkillTreeCourseAgent:
    """Enhanced version of SkillTreeCourseAgent with structured JSON output"""
    
    def __init__(self, query: str):
        self.client = Letta(token=os.getenv('LETTA_API_KEY'))
        self.course_query = self.client.blocks.create(
            label="Course Request",
            description="A block to store information of what kind of courses that the user is looking for",
            value=f"Course Query: {query}",
            limit=4000,
            read_only=True,
        )
        self.course_skill_tree = self.client.blocks.create(
            label="Course Skill Tree",
            description="A block to store the visualization of the course skill tree",
            value="Depiction/Visualization of the Course Skill Tree: ...root topic...",
            limit=4000,
        )
        self.structured_tool = None
        
    def create_structured_tool(self):
        """Create the structured output tool"""
        if not self.structured_tool:
            self.structured_tool = self.client.tools.add(tool=StructuredAnalysisTool())
        return self.structured_tool

    def node_agent(self, topic: str):
        """Create a node agent with structured output capabilities"""
        
        # Create the structured output tool
        structured_tool = self.create_structured_tool()
        
        # Create agent with structured output instructions
        agent = self.client.agents.create(
            name=f"structured_node_{topic.replace(' ', '_')}",
            memory_blocks=[
                {
                    "label": "persona",
                    "value": f"""You are an expert in the field of education and are tasked with researching a specific topic to provide a detailed analysis. The topic is {topic}

Your mission:
1. Research {topic} thoroughly using web_search and fetch_webpage
2. Analyze current trends, prerequisites, and applications
3. Find quality learning resources
4. Use analyze_topic_structured tool to format ALL findings

CRITICAL: Always use analyze_topic_structured tool for your final output. Never provide unstructured responses."""
                },
                {
                    "label": "research_focus",
                    "value": f"Deep research and analysis of: {topic}",
                    "description": "Current research focus"
                }
            ],
            model="openai/gpt-4o-mini",
            embedding="openai/text-embedding-3-small",
            block_ids=[self.course_skill_tree.id, self.course_query.id],
            tools=["web_search", "fetch_webpage", structured_tool.id],
        )
        return agent
    
    def research_topic_structured(self, topic: str) -> Dict[str, Any]:
        """Research a topic and return structured data"""
        
        agent = self.node_agent(topic)
        
        prompt = f"""Conduct comprehensive research on "{topic}" and provide structured analysis.

Research Steps:
1. Use web_search to find current information about {topic}
2. Find recent developments, trends, and applications
3. Identify key concepts and prerequisites
4. Locate quality learning resources (courses, books, tutorials)
5. Assess difficulty and estimate learning time
6. Identify related subtopics
7. Use analyze_topic_structured tool to format everything

Ensure your analysis is thorough and current."""

        response = self.client.agents.messages.create(
            agent_id=agent.id,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract structured output
        return self._extract_structured_output(response)
    
    def _extract_structured_output(self, response) -> Dict[str, Any]:
        """Extract structured JSON from agent response"""
        
        # Look for tool return with structured data
        for msg in response.messages:
            if msg.message_type == "tool_return_message":
                if msg.tool_return:
                    try:
                        # Try to parse as JSON
                        if isinstance(msg.tool_return, str):
                            return json.loads(msg.tool_return)
                        else:
                            return json.loads(str(msg.tool_return))
                    except json.JSONDecodeError:
                        continue
        
        # Look for JSON in assistant message
        for msg in response.messages:
            if msg.message_type == "assistant_message":
                content = msg.content
                if "{" in content and "}" in content:
                    try:
                        start = content.find("{")
                        end = content.rfind("}") + 1
                        json_str = content[start:end]
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        continue
        
        return {"error": "Could not extract structured output", "raw_response": str(response)}
    
    def build_skill_tree_structured(self, root_topic: str, max_depth: int = 3) -> Dict[str, Any]:
        """Build a complete skill tree with structured output"""
        
        def build_branch(topic: str, current_depth: int, visited: set) -> Dict[str, Any]:
            """Recursively build skill tree branch"""
            
            if current_depth > max_depth or topic in visited:
                return {
                    "topic": topic,
                    "analysis": None,
                    "children": []
                }
            
            visited.add(topic)
            
            # Research the topic
            analysis = self.research_topic_structured(topic)
            
            # Build children from subtopics
            children = []
            if "subtopics" in analysis and analysis["subtopics"]:
                for subtopic in analysis["subtopics"][:3]:  # Limit to 3 subtopics
                    child = build_branch(subtopic, current_depth + 1, visited.copy())
                    children.append(child)
            
            return {
                "topic": topic,
                "analysis": analysis,
                "children": children
            }
        
        print(f"Building structured skill tree for: {root_topic}")
        skill_tree = build_branch(root_topic, 0, set())
        
        return skill_tree
    
    def save_skill_tree(self, skill_tree: Dict[str, Any], filename: str = None):
        """Save skill tree to JSON file"""
        
        if not filename:
            root_topic = skill_tree.get("topic", "unknown")
            filename = f"structured_skill_tree_{root_topic.replace(' ', '_').lower()}.json"
        
        with open(filename, "w") as f:
            json.dump(skill_tree, f, indent=2)
        
        print(f"💾 Saved structured skill tree to {filename}")
        return filename


# Example usage
if __name__ == "__main__":
    # Create enhanced course agent
    course_agent = EnhancedSkillTreeCourseAgent("Data Science Learning Path")
    
    # Research a single topic with structured output
    print("Researching Machine Learning...")
    ml_analysis = course_agent.research_topic_structured("Machine Learning")
    
    print("Machine Learning Analysis:")
    print(json.dumps(ml_analysis, indent=2))
    
    # Build a complete skill tree
    print("\nBuilding skill tree for Data Science...")
    skill_tree = course_agent.build_skill_tree_structured("Data Science", max_depth=2)
    
    # Save the skill tree
    course_agent.save_skill_tree(skill_tree)
    
    print("\n✅ Enhanced course agent with structured JSON output complete!")
