from letta_client import Letta
from letta_client.client import BaseTool
from pydantic import BaseModel, Field
from typing import Type
from dotenv import load_dotenv
import os

load_dotenv()
client = Letta(token=os.getenv('LETTA_API_KEY'))

# Define Pydantic models for the tool arguments
class RankData(BaseModel):
    rank: int = Field(
        ...,
        description="The numerical rank from 1-10",
        ge=1,
        le=10
    )
    reason: str = Field(
        ...,
        description="The reasoning behind the rank"
    )

# Create custom tool class extending BaseTool
class GenerateRankTool(BaseTool):
    name: str = "generate_rank"
    args_schema: Type[BaseModel] = RankData
    description: str = "Generate a ranking with explanation for food items or restaurants"
    
    def run(self, rank: int, reason: str) -> str:
        """Generate a ranking with explanation.
        
        Args:
            rank: The numerical rank from 1-10
            reason: The reasoning behind the rank
            
        Returns:
            str: Confirmation message with the generated rank
        """
        result = f"Generated rank {rank} with reasoning: {reason}"
        print(result)
        return result

# Create the tool using the custom tool class
tool = client.tools.add(tool=GenerateRankTool())
# Create agent with the structured generation tool
agent_state = client.agents.create(
    model="openai/gpt-4o-mini",
    embedding="openai/text-embedding-3-small",
    memory_blocks=[
        {
            "label": "human",
            "value": "The human's name is Chad. They are a food enthusiast who enjoys trying different cuisines."
        },
        {
            "label": "persona",
            "value": "I am a helpful food critic assistant. I provide detailed rankings and reviews of different foods and restaurants."
        }
    ],
    tool_ids=[tool.id],
    reasoning=False
)

# Test the agent by sending a message
if __name__ == "__main__":
    print("Testing Letta agent with custom tool...")
    print(f"Agent ID: {agent_state.id}")
    print(f"Tool ID: {tool.id}")
    
    # Send a test message to the agent
    try:
        response = client.agents.messages.create(
            agent_id=agent_state.id,
            messages=[
                {"role": "user", "content": "Please rank the pizza at Tony's Italian Restaurant and explain your reasoning."}
            ]
        )
        
        # Loop through all the responses
        if hasattr(response, 'messages') and response.messages:
            for i, message in enumerate(response.messages):
                print(f"Response {i + 1}: {message}")
        elif hasattr(response, 'data') and response.data:
            for i, item in enumerate(response.data):
                print(f"Response {i + 1}: {item}")
        else:
            print(f"Agent response: {response}")
            
    except Exception as e:
        print(f"Error calling agent: {e}")