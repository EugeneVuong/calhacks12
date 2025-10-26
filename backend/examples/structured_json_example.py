"""
Example: Structured JSON Output for Node Agents

This example shows how to implement structured JSON output in Letta node agents,
specifically for educational topic research.

Run this example:
    python examples/structured_json_example.py
"""

from letta_client import Letta
from letta_client.client import BaseTool
from pydantic import BaseModel, Field
from typing import Type, List, Dict, Any, Optional
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Initialize Letta client
client = Letta(token=os.getenv('LETTA_API_KEY'))


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


class StructuredNodeAgent:
    """Enhanced node agent with structured JSON output"""
    
    def __init__(self, topic: str):
        self.client = client
        self.topic = topic
        self.structured_tool = None
        
    def create_structured_tool(self):
        """Create the structured output tool"""
        self.structured_tool = client.tools.add(tool=StructuredAnalysisTool())
        return self.structured_tool
    
    def create_node_agent(self):
        """Create a node agent with structured output capabilities"""
        
        # Create the structured output tool
        if not self.structured_tool:
            self.create_structured_tool()
        
        # Create agent with structured output instructions
        agent = self.client.agents.create(
            name=f"structured_node_{self.topic.replace(' ', '_')}",
            memory_blocks=[
                {
                    "label": "persona",
                    "value": f"""You are an expert educational researcher specializing in {self.topic}.

Your task is to research this topic thoroughly and provide structured output using the analyze_topic_structured tool.

Research Guidelines:
1. Use web_search to find current information about {self.topic}
2. Identify key concepts, prerequisites, and subtopics
3. Find relevant learning resources (courses, books, tutorials)
4. Assess difficulty level and estimate learning time
5. Identify current trends and career applications
6. Use analyze_topic_structured tool to format your findings

CRITICAL: You MUST use the analyze_topic_structured tool to format your response. Do not provide unstructured text responses."""
                },
                {
                    "label": "research_context",
                    "value": f"Researching topic: {self.topic}",
                    "description": "Context for the current research topic"
                }
            ],
            tools=["web_search", "fetch_webpage", self.structured_tool.id],
            model="openai/gpt-4o-mini",
            embedding="openai/text-embedding-3-small"
        )
        
        return agent
    
    def research_topic(self, agent_id: str) -> Dict[str, Any]:
        """Research a topic and return structured data"""
        
        prompt = f"""Research the topic "{self.topic}" thoroughly and provide a comprehensive analysis.

Use web_search to find current information, then use analyze_topic_structured to format your findings.

Include:
- Current developments and trends
- Key concepts and terminology
- Prerequisites for learning
- Difficulty assessment (beginner/intermediate/advanced)
- Learning resources with URLs
- Related subtopics
- Career applications

Make sure to use the analyze_topic_structured tool with all the required fields."""

        response = self.client.agents.messages.create(
            agent_id=agent_id,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract structured output from tool returns
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


def test_structured_output():
    """Test structured JSON output with different topics"""
    
    topics = [
        "Machine Learning",
        "Web Development",
        "Data Structures and Algorithms"
    ]
    
    results = {}
    
    for topic in topics:
        print(f"\n{'='*60}")
        print(f"Researching: {topic}")
        print(f"{'='*60}")
        
        # Create structured node agent
        agent_manager = StructuredNodeAgent(topic)
        agent = agent_manager.create_node_agent()
        
        print(f"✓ Created agent: {agent.id}")
        
        # Research topic
        result = agent_manager.research_topic(agent.id)
        
        if "error" not in result:
            print(f"✓ Successfully extracted structured data")
            results[topic] = result
            
            # Display key information
            print(f"\n📊 Analysis Summary:")
            print(f"  Topic: {result.get('topic', 'N/A')}")
            print(f"  Difficulty: {result.get('difficulty_level', 'N/A')}")
            print(f"  Estimated Hours: {result.get('estimated_hours', 'N/A')}")
            print(f"  Key Concepts: {len(result.get('key_concepts', []))}")
            print(f"  Resources: {len(result.get('resources', []))}")
            print(f"  Subtopics: {len(result.get('subtopics', []))}")
        else:
            print(f"❌ Failed to extract structured data: {result.get('error')}")
    
    return results


def validate_structured_output(data: Dict[str, Any]) -> bool:
    """Validate that structured output has required fields"""
    required_fields = [
        "topic", "summary", "key_concepts", "prerequisites", 
        "difficulty_level", "estimated_hours", "resources", 
        "subtopics", "current_trends", "career_applications"
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        print(f"❌ Missing required fields: {missing_fields}")
        return False
    
    # Validate types
    if not isinstance(data["key_concepts"], list):
        print("❌ key_concepts should be a list")
        return False
    
    if not isinstance(data["resources"], list):
        print("❌ resources should be a list")
        return False
    
    if not isinstance(data["estimated_hours"], int):
        print("❌ estimated_hours should be an integer")
        return False
    
    print("✅ Structured output validation passed")
    return True


def save_results(results: Dict[str, Any]):
    """Save results to JSON files"""
    
    for topic, data in results.items():
        if "error" not in data:
            filename = f"structured_analysis_{topic.replace(' ', '_').lower()}.json"
            with open(filename, "w") as f:
                json.dump(data, f, indent=2)
            print(f"💾 Saved analysis to {filename}")


def main():
    """Main function to run structured JSON example"""
    
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║         Structured JSON Output for Node Agents               ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Test structured output
    results = test_structured_output()
    
    # Validate results
    print(f"\n{'='*60}")
    print("Validation Results")
    print(f"{'='*60}")
    
    for topic, data in results.items():
        print(f"\nValidating {topic}:")
        validate_structured_output(data)
    
    # Save results
    print(f"\n{'='*60}")
    print("Saving Results")
    print(f"{'='*60}")
    
    save_results(results)
    
    # Display sample result
    if results:
        sample_topic = list(results.keys())[0]
        sample_data = results[sample_topic]
        
        print(f"\n{'='*60}")
        print(f"Sample Structured Output: {sample_topic}")
        print(f"{'='*60}")
        print(json.dumps(sample_data, indent=2)[:500] + "...")
    
    print(f"\n{'='*60}")
    print("📚 Key Benefits of Structured JSON:")
    print(f"{'='*60}")
    print("""
✅ Consistent data format across all agents
✅ Easy parsing and processing
✅ Validation with Pydantic schemas
✅ Integration with APIs and databases
✅ Hierarchical data structures
✅ Type safety and error handling
    """)


if __name__ == "__main__":
    main()
