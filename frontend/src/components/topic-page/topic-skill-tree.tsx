"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Target, BookOpen } from "lucide-react";

interface TopicSkillTreeProps {
  topic: string;
  subtopics: string[];
  relatedTopics: string[];
}

export function TopicSkillTree({ topic, subtopics, relatedTopics }: TopicSkillTreeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Learning Path</h2>
        <p className="text-muted-foreground">
          Explore the structured learning path for {topic} and related topics.
        </p>
      </div>

      {/* Main Topic */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-800">{topic}</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">Current Focus</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            This is your main learning objective. Master the fundamentals before moving to advanced topics.
          </p>
        </CardContent>
      </Card>

      {/* Subtopics */}
      {subtopics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Subtopics to Explore</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subtopics.map((subtopic, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span>{subtopic}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Deep dive into this specific aspect of {topic}.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Related Advanced Topics */}
      {relatedTopics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="space-y-3">
            {relatedTopics.map((relatedTopic, index) => (
              <Card key={index} className="border-l-4 border-l-green-400">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium">{relatedTopic}</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Advanced
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      Explore →
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Build upon your knowledge of {topic} to master {relatedTopic}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
          <CardDescription>
            Track your journey through the {topic} learning path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fundamentals</span>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subtopics</span>
              <Badge variant="outline">Not Started</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Advanced Topics</span>
              <Badge variant="outline">Not Started</Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
