import { TopicPage } from "@/components/topic-page/topic-page";

interface TopicPageProps {
  params: {
    topic: string;
  };
}

export default function TopicPageRoute({ params }: TopicPageProps) {
  const topic = decodeURIComponent(params.topic);
  
  return <TopicPage topic={topic} />;
}

// Generate static params for common topics
export async function generateStaticParams() {
  const commonTopics = [
    "machine learning",
    "data structures",
    "algorithms",
    "web development",
    "python programming",
    "javascript",
    "react",
    "node.js",
    "database design",
    "system design"
  ];

  return commonTopics.map((topic) => ({
    topic: encodeURIComponent(topic),
  }));
}
