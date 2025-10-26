import json
import uuid
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass


@dataclass
class NodeData:
    """Data structure for a skill tree node"""
    topic: str
    resources: List[Dict[str, str]]
    quiz_questions: List[Dict[str, str]]
    related_harder_topics: List[str]
    uuid: str


class SkillTreeGenerator:
    def __init__(self, max_depth: int = 5):
        self.max_depth = max_depth
        self.node_counter = 1
        self.nodes = []
        self.edges = []
        self.processed_topics = set()
    
    def generate_react_flow_format(self, root_topic_data: Dict[str, Any]) -> Tuple[List[Dict], List[Dict]]:
        """
        Generate React Flow nodes and edges from skill tree data
        
        Args:
            root_topic_data: The root topic data in the format shown in the terminal selection
            
        Returns:
            Tuple of (nodes, edges) in React Flow format
        """
        self.nodes = []
        self.edges = []
        self.node_counter = 1
        self.processed_topics = set()
        
        # Process the root node
        self._process_node(root_topic_data, parent_id=None, depth=0)
        
        return self.nodes, self.edges
    
    def _process_node(self, node_data: Dict[str, Any], parent_id: str = None, depth: int = 0) -> str:
        """
        Recursively process a node and its children
        
        Args:
            node_data: The node data dictionary
            parent_id: ID of the parent node (None for root)
            depth: Current depth in the tree
            
        Returns:
            The ID of the processed node
        """
        # Check if we've hit max depth
        if depth >= self.max_depth:
            return None
            
        # Check if this topic has already been processed (prevent cycles)
        topic = node_data.get('topic', '')
        if topic in self.processed_topics:
            return None
            
        # Mark this topic as processed
        self.processed_topics.add(topic)
        
        # Generate node ID
        node_id = str(self.node_counter)
        self.node_counter += 1
        
        # Determine node type
        node_type = "input" if parent_id is None else "default"
        
        # Create the node
        node = {
            "id": node_id,
            "type": node_type,
            "data": {
                "label": topic,
                "topic": topic,
                "resources": node_data.get('resources', []),
                "quiz_questions": node_data.get('quiz_questions', []),
                "related_harder_topics": node_data.get('related_harder_topics', []),
                "uuid": node_data.get('uuid', str(uuid.uuid4()))
            },
            "position": {"x": 0, "y": 0}  # Will be calculated by React Flow
        }
        
        self.nodes.append(node)
        
        # Create edge from parent if exists
        if parent_id:
            edge = {
                "source": parent_id,
                "target": node_id
            }
            self.edges.append(edge)
        
        # Process children - check for nested children structure first
        children = node_data.get('children', [])
        
        if children:
            # Process each child node
            for child_data in children:
                child_id = self._process_node(child_data, node_id, depth + 1)
                # Child processing and edge creation is handled recursively
        else:
            # Fallback to related_harder_topics for backward compatibility
            related_topics = node_data.get('related_harder_topics', [])
            
            # If no related topics or empty list, this is a leaf node
            if not related_topics:
                return node_id
                
            # Process each related topic as placeholder
            for topic_name in related_topics:
                if depth < self.max_depth - 1:
                    # Add a placeholder node for topics that couldn't be processed
                    placeholder_id = str(self.node_counter)
                    self.node_counter += 1
                    
                    placeholder_node = {
                        "id": placeholder_id,
                        "type": "default",
                        "data": {
                            "label": f"{topic_name} (placeholder)",
                            "topic": topic_name,
                            "resources": [],
                            "quiz_questions": [],
                            "related_harder_topics": [],
                            "uuid": str(uuid.uuid4()),
                            "is_placeholder": True
                        },
                        "position": {"x": 0, "y": 0}
                    }
                    
                    self.nodes.append(placeholder_node)
                    
                    # Create edge to placeholder
                    edge = {
                        "source": node_id,
                        "target": placeholder_id
                    }
                    self.edges.append(edge)
        
        return node_id
    
    def generate_json_output(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, Any]:
        """
        Generate JSON format for React Flow
        
        Args:
            nodes: List of node dictionaries
            edges: List of edge dictionaries
            
        Returns:
            Dictionary containing nodes and edges
        """
        return {
            "nodes": nodes,
            "edges": edges
        }
    
    def generate_typescript_output(self, nodes: List[Dict], edges: List[Dict]) -> str:
        """
        Generate TypeScript code for React Flow (kept for backward compatibility)
        
        Args:
            nodes: List of node dictionaries
            edges: List of edge dictionaries
            
        Returns:
            TypeScript code string
        """
        # Generate nodes array
        nodes_ts = "export const initialNodes: Node[] = [\n"
        for node in nodes:
            nodes_ts += f"  {{\n"
            nodes_ts += f"    id: \"{node['id']}\",\n"
            nodes_ts += f"    type: \"{node['type']}\",\n"
            nodes_ts += f"    data: {{\n"
            nodes_ts += f"      label: \"{node['data']['label']}\",\n"
            nodes_ts += f"      topic: \"{node['data']['topic']}\",\n"
            nodes_ts += f"      resources: {json.dumps(node['data']['resources'], indent=6)},\n"
            nodes_ts += f"      quiz_questions: {json.dumps(node['data']['quiz_questions'], indent=6)},\n"
            nodes_ts += f"      related_harder_topics: {json.dumps(node['data']['related_harder_topics'])},\n"
            nodes_ts += f"      uuid: \"{node['data']['uuid']}\"\n"
            if node['data'].get('is_placeholder'):
                nodes_ts += f"      ,is_placeholder: true\n"
            nodes_ts += f"    }},\n"
            nodes_ts += f"    position,\n"
            nodes_ts += f"  }},\n"
        nodes_ts += "];\n\n"
        
        # Generate edges array
        edges_ts = "export const initialEdges: Edge[] = [\n"
        for edge in edges:
            edges_ts += f"  {{\n"
            edges_ts += f"    source: \"{edge['source']}\",\n"
            edges_ts += f"    target: \"{edge['target']}\",\n"
            edges_ts += f"  }},\n"
        edges_ts += "];\n"
        
        # Combine with position constant
        full_ts = """const position = { x: 0, y: 0 };

""" + nodes_ts + edges_ts
        
        return full_ts


def main():
    """Example usage"""
    # Example data from your terminal selection
    sample_data = {
        "topic": "Big O Notation",
        "resources": [
            {
                "title": "Introduction to Big O Notation",
                "url": "https://www.freecodecamp.org/news/big-o-notation-explained/",
                "type": "article"
            },
            {
                "title": "Understanding Big O Notation in Algorithms",
                "url": "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/",
                "type": "tutorial"
            },
            {
                "title": "Big O Cheat Sheet",
                "url": "https://www.bigocheatsheet.com/",
                "type": "reference"
            }
        ],
        "quiz_questions": [
            {
                "question": "What does Big O notation describe?",
                "option_a": "The upper bound of an algorithm's running time.",
                "option_b": "The average case of an algorithm's running time.",
                "option_c": "The best case of an algorithm's running time.",
                "option_d": "None of the above.",
                "correct_answer": "A",
                "explanation": "'A' is correct because Big O notation provides a mathematical description for the maximum amount of time or space that an algorithm can take, which is known as its upper bound."
            },
            {
                "question": "'O(n)' represents what kind of growth?",
                "option_a": "'Linear' growth with respect to 'n'.",
                "option_b": "'Quadratic' growth with respect to 'n'.",
                "option_c": "'Constant' growth with respect to 'n'.",
                "option_d": "'Exponential' growth with respect to 'n'.",
                "correct_answer": "A",
                "explanation": "'A' is correct because 'O(n)' indicates linear growth, meaning that as the input size increases, the number of operations grows linearly."
            }
        ],
        "related_harder_topics": [
            "Time Complexity Analysis"
        ],
        "uuid": "9ddc7fd3-50bc-4bb3-9674-b6d338a0ff7b"
    }
    
    # Create generator
    generator = SkillTreeGenerator(max_depth=3)
    
    # Generate nodes and edges
    nodes, edges = generator.generate_react_flow_format(sample_data)
    
    # Generate TypeScript output
    ts_output = generator.generate_typescript_output(nodes, edges)
    
    print("Generated React Flow Format:")
    print("=" * 50)
    print(ts_output)
    
    # Also save to file
    with open('/Users/eugenevuong/Desktop/calhacks12/backend/react_flow_output.ts', 'w') as f:
        f.write(ts_output)
    
    print(f"\nGenerated {len(nodes)} nodes and {len(edges)} edges")
    print("TypeScript output saved to react_flow_output.ts")


if __name__ == "__main__":
    main()
