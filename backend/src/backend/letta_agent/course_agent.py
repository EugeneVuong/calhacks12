from letta_client import Letta
from letta_client.client import BaseTool
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field
from typing import List, Dict, Type, Any, Optional
import json
import uuid
from enum import Enum
load_dotenv()


### Output of the Node Agent ###
class LearningResource(BaseModel):
    title: str = Field(..., description="Title of the resource")
    url: str = Field(..., description="URL of the resource")
    type: str = Field(..., description="Type of resource: course, book, tutorial, article")

class AnswerChoice(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

class QuizQuestion(BaseModel):
    question: str = Field(..., description="A clear, well-formulated question that tests understanding of the topic")
    option_a: str = Field(..., description="First answer option (must be complete and meaningful)")
    option_b: str = Field(..., description="Second answer option (must be complete and meaningful)")
    option_c: str = Field(..., description="Third answer option (must be complete and meaningful)")
    option_d: str = Field(..., description="Fourth answer option (must be complete and meaningful)")
    correct_answer: str = Field(..., description="The correct answer - must be exactly 'A', 'B', 'C', or 'D'")
    explanation: str = Field(..., description="Clear explanation of why the correct answer is right and why others are wrong")

class NodeAgentOutput(BaseModel):
    topic: str = Field(..., description="The topic being researched")
    resources: List[LearningResource] = Field(..., description="List of learning resources (minimum 3)")
    quiz_questions: List[QuizQuestion] = Field(..., min_length=3, description="List of quiz questions (minimum 3, maximum 5)")
    related_harder_topics: Optional[List[str]] = Field(..., description="Related harder topics that build upon this topic. Can be a list of strings or None if there are no related harder topics")


class NodeAgentOutputTool(BaseTool):
    name: str = "generate_node_agent_output"
    args_schema: Type[BaseModel] = NodeAgentOutput
    description: str = "Generate structured JSON output for a node agent. CRITICAL: You MUST provide exactly 3-5 quiz questions (minimum 3 required)."
    
    def run(self, topic: str, resources: List[LearningResource], quiz_questions: List[QuizQuestion],
            related_harder_topics: Optional[List[str]] = None) -> str:
        """Generate structured output for a topic"""
        import json
        import uuid
        
        # Convert LearningResource objects to dictionaries
        resources_dict = []
        for resource in resources:
            if isinstance(resource, dict):
                resources_dict.append(resource)
            else:
                resources_dict.append({
                    "title": resource.title,
                    "url": resource.url,
                    "type": resource.type
                })
        
        # Convert QuizQuestion objects to dictionaries and clean formatting
        quiz_dict = []
        for question in quiz_questions:
            if isinstance(question, dict):
                # Clean up formatting issues
                cleaned_question = {
                    "question": question.get("question", "").strip().lstrip("+ "),
                    "option_a": question.get("option_a", "").strip().lstrip("+ "),
                    "option_b": question.get("option_b", "").strip().lstrip("+ "),
                    "option_c": question.get("option_c", "").strip().lstrip("+ "),
                    "option_d": question.get("option_d", "").strip().lstrip("+ "),
                    "correct_answer": question.get("correct_answer", "").strip().lstrip("+ "),
                    "explanation": question.get("explanation", "").strip().lstrip("+ ")
                }
                quiz_dict.append(cleaned_question)
            else:
                quiz_dict.append({
                    "question": question.question.strip().lstrip("+ "),
                    "option_a": question.option_a.strip().lstrip("+ "),
                    "option_b": question.option_b.strip().lstrip("+ "),
                    "option_c": question.option_c.strip().lstrip("+ "),
                    "option_d": question.option_d.strip().lstrip("+ "),
                    "correct_answer": question.correct_answer.strip().lstrip("+ "),
                    "explanation": question.explanation.strip().lstrip("+ ")
                })
        
        output = {
            "topic": topic,
            "resources": resources_dict,
            "quiz_questions": quiz_dict,
            "related_harder_topics": related_harder_topics,
            "uuid": str(uuid.uuid4()),
        }
        
        return json.dumps(output, indent=2)
### End of Node Agent Output ###

class SkillTreeCourseAgent:
    def __init__(self):
        self.client = Letta(token=os.getenv('LETTA_API_KEY'))
        self.course_query = None
        self.course_skill_tree = None

    def simplify_topic(self, topic: str):
        simplify_agent = self.client.agents.create(
            name="node_agent",
            memory_blocks=[
                {
                    "label": "persona",
                    "value": f"""You are an expert curriculum designer. Your job is to identify the single *most foundational* starting topic for a course on a broad subject.

You will be given a "Course Overall Topic". You must determine the "Day 1" concept or the "Chapter 1" skill that all other topics will build upon.

For example:
- If the course is "Data Structures and Algorithms", a good starting topic is "Big O Notation" (since it's needed to analyze everything else).
- If the course is "Frontend Web Development", the starting topic is "HTML Basics".
- If the course is "Machine Learning", a good starting topic is "Data Preprocessing" or "Linear Regression".

CRITICAL: Respond ONLY with the name of the single starting topic and nothing else. Your response must be plain text, not JSON, and contain no extra conversation."""
                }
            ],
            model="openai/gpt-4o-mini",
            embedding="openai/text-embedding-3-small",
            block_ids=[self.course_skill_tree.id, self.course_query.id],
        )
        response = self.client.agents.messages.create(
            agent_id=simplify_agent.id,
            messages=[{"role": "user", "content": f"Course Overall Topic '{topic}'"}]
        )
        
        # Extract content from assistant message
        content = None
        for msg in response.messages:
            if msg.message_type == "assistant_message":
                content = msg.content
                break
        
        if content is None:
            raise ValueError("No assistant message found in response")
            
        print(content)
        return content

    def create_node_agent(self):
        if self.course_query is None or self.course_skill_tree is None:
            raise ValueError("Run the orchestrate method first to create the course blocks and skill tree")
        structured_tool = self.client.tools.add(tool=NodeAgentOutputTool())
        
        node_agent = self.client.agents.create(
            name="node_agent",
            memory_blocks=[
                {
                    "label": "persona",
                    "value": f"""You are an expert Curriculum Architect and Subject Matter Expert.
Your primary goal is to analyze a single "Current Topic" and perform two critical actions in sequence.

**ACTION 1: ANALYZE TOPIC (Tool Call)**
First, you will generate a detailed analysis of the "Current Topic" using the `generate_node_agent_output` tool. This includes finding resources, creating quizzes, and identifying the *immediate next* topics that build upon it.

**Guidelines for `related_harder_topics`:**
1.  **Immediate Next Steps:** The topics MUST be the *direct* next layer of complexity or application. Do NOT skip ahead.
2.  **Atomicity:** Keep topics atomic. "Two Pointers" is a good topic. "Two Pointers and Sliding Window" is not.
3.  **Check for Duplicates:** You MUST read the "Course Skill Tree" memory block *before* generating your output. Do NOT list any topic in `related_harder_topics` that is *already* present in the skill tree. This prevents cycles.
4.  **Leaf Nodes:** If there are no more advanced topics that build on this one (it's a final concept), you MUST provide an empty list `[]`.

**ACTION 2: UPDATE SKILL TREE (Memory Block Update)**
Second, after (and ONLY after) you have successfully called `generate_node_agent_output`, you will modify the "Course Skill Tree" memory block.

**Skill Tree Update Rules:**
* You will **APPEND** new lines to the block to represent the new connections you found. DO NOT rewrite the entire block.
* **Format:** You will add one line for *each* new connection.
    `[Current Topic] -> [New Harder Topic 1]`
    `[Current Topic] -> [New Harder Topic 2]`
* If you returned an empty list `[]` for `related_harder_topics`, you MUST append a line to mark this as a leaf node:
    `[Current Topic] -> [LEAF]`

---
**EXAMPLE 1: ONE-TO-MANY (Tree Branch)**
* **User Request:** "Create structured output for 'Arrays and Hash Tables'"
* **Skill Tree Block (Before):** `Data Structures -> Arrays and Hash Tables`
* **Step 1 (Tool Call):** You analyze "Arrays and Hash Tables". You find it leads to "Two Pointers", "Sliding Window", and "Collision Handling". None of these are in the tree yet.
* **`generate_node_agent_output` call:**
    * `topic`: "Arrays and Hash Tables"
    * `resources`: [...]
    * `quiz_questions`: [...]
    * `related_harder_topics`: ["Two Pointers", "Sliding Window", "Collision Handling"]
* **Step 2 (Memory Update):** You APPEND these new connections to the "Course Skill Tree" block:
    ```
    Arrays and Hash Tables -> Two Pointers
    Arrays and Hash Tables -> Sliding Window
    Arrays and Hash Tables -> Collision Handling
    ```

**EXAMPLE 2: LEAF NODE (End of Branch)**
* **User Request:** "Create structured output for 'Sliding Window'"
* **Skill Tree Block (Before):**
    ```
    Data Structures -> Arrays and Hash Tables
    Arrays and Hash Tables -> Two Pointers
    Arrays and Hash Tables -> Sliding Window
    Arrays and Hash Tables -> Collision Handling
    ```
* **Step 1 (Tool Call):** You analyze "Sliding Window". You determine it's a specific technique and doesn't have further complex sub-topics.
* **`generate_node_agent_output` call:**
    * `topic`: "Sliding Window"
    * `resources`: [...]
    * `quiz_questions`: [...]
    * `related_harder_topics`: []
* **Step 2 (Memory Update):** You APPEND the leaf marker to the "Course Skill Tree" block:
    ```
    Sliding Window -> [LEAF]
    ```

**CRITICAL INSTRUCTIONS FOR QUIZ QUESTIONS:**
1.  Generate EXACTLY 3-5 high-quality quiz questions for the topic. You MUST generate at least 3 questions - this is a hard requirement that will cause the tool to fail if not met.
2.  Each question must have ALL 4 options (A, B, C, D) filled out completely.
3.  The `correct_answer` must be exactly "A", "B", "C", or "D".
4.  Include a clear explanation for each question.
5.  If you cannot think of 3 complex questions, create simpler questions but ensure you have at least 3 total.
6.  REMEMBER: The tool will fail with a validation error if you provide fewer than 3 quiz questions.

---
**WORKFLOW SUMMARY:**
1.  Read the "Course Skill Tree" block to see existing topics.
2.  Call `generate_node_agent_output`. Identify new `related_harder_topics` that are NOT in the tree.
3.  Call `client.blocks.update` to APPEND the new connections (e.g., `Current Topic -> New Topic`) or the leaf marker (`Current Topic -> [LEAF]`) to the "Course Skill Tree" block.
4.  You MUST use the tool. Never provide unstructured responses.
"""
                }
            ],
            model="openai/gpt-4o-mini",
            embedding="openai/text-embedding-3-small",
            block_ids=[self.course_skill_tree.id, self.course_query.id],
            tools=[structured_tool.name],
        )
        return node_agent

    def call_node_agent(self, topic: str):
        response = self.client.agents.messages.create(
            agent_id=self.create_node_agent().id,
            messages=[{"role": "user", "content": f"Create structured output for '{topic}' using the generate_node_agent_output tool"}]
        )
        node = None
        for msg in response.messages:
            if msg.message_type == "tool_return_message":
                node = msg.tool_return
                break
        return node

    def orchestrate(self, topic: str, tree_depth: int = 5):
        self.course_query = self.client.blocks.create(
            label="Course Request",
            description="A block to store information of what kind of topic that the user is looking for",
            value=f"Course Overall Topic: {topic}",
            limit=4000,
            read_only=True,
        )
        self.course_skill_tree = self.client.blocks.create(
            label="Course Skill Tree",
            description="A block to store the visualization of the course skill tree",
            value="Depection/Visualization of the Course Skill Tree: ...root topic...",
            limit=4000,
        )
        starting_topic = self.simplify_topic(topic)

        # Generate the full skill tree recursively
        skill_tree_data = self.generate_skill_tree_recursively(starting_topic, tree_depth)
        
        # Generate React Flow format
        try:
            from .skill_tree_generator import SkillTreeGenerator
        except ImportError:
            from skill_tree_generator import SkillTreeGenerator
        generator = SkillTreeGenerator(max_depth=tree_depth)
        nodes, edges = generator.generate_react_flow_format(skill_tree_data)
        
        # Generate JSON output
        json_output = generator.generate_json_output(nodes, edges)
        
        # Save the React Flow output
        with open('react_flow_skill_tree.json', 'w') as f:
            json.dump(json_output, f, indent=2)
        
        return {
            "skill_tree_data": skill_tree_data,
            "react_flow_nodes": nodes,
            "react_flow_edges": edges,
            "json_output": json_output
        }
    
    def generate_skill_tree_recursively(self, topic: str, max_depth: int, current_depth: int = 0, processed_topics: set = None):
        """
        Recursively generate skill tree data by calling the node agent for each topic
        
        Args:
            topic: The current topic to process
            max_depth: Maximum depth of the tree
            current_depth: Current depth in recursion
            processed_topics: Set of already processed topics to prevent cycles
            
        Returns:
            Dictionary containing the skill tree data with nested children
        """
        if processed_topics is None:
            processed_topics = set()
            
        # Check if we've hit max depth or if this topic was already processed
        if current_depth >= max_depth or topic in processed_topics:
            return {
                "topic": topic,
                "resources": [],
                "quiz_questions": [],
                "related_harder_topics": [],
                "uuid": str(uuid.uuid4()),
                "children": []
            }
        
        # Mark this topic as processed
        processed_topics.add(topic)
        
        # Get node data from the agent
        node_response = self.call_node_agent(topic)
        node_data = json.loads(node_response)
        
        # Process related harder topics recursively
        related_topics = node_data.get('related_harder_topics', [])
        children = []
        
        if related_topics:
            # Recursively process each related topic
            for related_topic in related_topics:
                if related_topic not in processed_topics and current_depth < max_depth - 1:
                    child_data = self.generate_skill_tree_recursively(
                        related_topic, 
                        max_depth, 
                        current_depth + 1, 
                        processed_topics.copy()  # Pass a copy to allow siblings
                    )
                    children.append(child_data)
        
        # Add children to the node data
        node_data['children'] = children
        
        return node_data


test = SkillTreeCourseAgent()
print(test.orchestrate("Data Structures and Algorithms"))

    
   