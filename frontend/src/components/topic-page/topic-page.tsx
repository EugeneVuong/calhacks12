"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Target, ExternalLink, MessageCircle, Brain } from "lucide-react";
import { TopicChatbot } from "./topic-chatbot";
import { TopicResources } from "./topic-resources";
import { TopicQuiz } from "./topic-quiz";
import { TopicSkillTree } from "./topic-skill-tree";

interface LearningResource {
  title: string;
  url: string;
  type: string;
  difficulty?: string;
  rating?: number;
}

interface QuizQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

interface TopicData {
  topic: string;
  summary: string;
  key_concepts: string[];
  prerequisites: string[];
  difficulty_level: string;
  estimated_hours: number;
  resources: LearningResource[];
  subtopics: string[];
  current_trends: string[];
  career_applications: string[];
  quiz_questions?: QuizQuestion[];
  related_harder_topics?: string[];
}

interface TopicPageProps {
  topic: string;
  initialData?: TopicData;
}

export function TopicPage({ topic, initialData }: TopicPageProps) {
  const [topicData, setTopicData] = useState<TopicData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!initialData) {
      fetchTopicData();
    }
  }, [topic, initialData]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/topics/${encodeURIComponent(topic)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch topic data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTopicData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topic data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 animate-spin" />
          <span>Loading topic information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchTopicData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No topic data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{topicData.topic}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{topicData.estimated_hours} hours</span>
              </div>
              <Badge variant={topicData.difficulty_level === 'beginner' ? 'default' : 
                              topicData.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                {topicData.difficulty_level}
              </Badge>
            </div>
          </div>
          <Button 
            onClick={() => setActiveTab("chat")}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Ask AI</span>
          </Button>
        </div>
        
        <p className="text-lg text-muted-foreground leading-relaxed">
          {topicData.summary}
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="skill-tree">Skill Tree</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Key Concepts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicData.key_concepts.map((concept, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
                <CardDescription>
                  What you should know before learning this topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topicData.prerequisites.length > 0 ? (
                  <div className="space-y-2">
                    {topicData.prerequisites.map((prereq, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No prerequisites required</p>
                )}
              </CardContent>
            </Card>

            {/* Current Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Current Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicData.current_trends.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{trend}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Career Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Career Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topicData.career_applications.map((application, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>{application}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <TopicResources resources={topicData.resources} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <TopicQuiz 
            questions={topicData.quiz_questions || []} 
            topic={topicData.topic}
          />
        </TabsContent>

        <TabsContent value="skill-tree" className="mt-6">
          <TopicSkillTree 
            topic={topicData.topic}
            subtopics={topicData.subtopics}
            relatedTopics={topicData.related_harder_topics || []}
          />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <TopicChatbot 
            topic={topicData.topic}
            topicData={topicData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
