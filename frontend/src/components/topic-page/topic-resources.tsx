"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Video, FileText, GraduationCap, Star } from "lucide-react";

interface LearningResource {
  title: string;
  url: string;
  type: string;
  difficulty?: string;
  rating?: number;
}

interface TopicResourcesProps {
  resources: LearningResource[];
}

const getResourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'course':
      return <GraduationCap className="h-4 w-4" />;
    case 'book':
      return <BookOpen className="h-4 w-4" />;
    case 'tutorial':
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'article':
      return <FileText className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const getResourceTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'course':
      return 'bg-blue-100 text-blue-800';
    case 'book':
      return 'bg-green-100 text-green-800';
    case 'tutorial':
    case 'video':
      return 'bg-purple-100 text-purple-800';
    case 'article':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function TopicResources({ resources }: TopicResourcesProps) {
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Resources</CardTitle>
          <CardDescription>
            No resources available for this topic yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Learning Resources</h2>
        <p className="text-muted-foreground">
          Curated resources to help you learn this topic effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getResourceIcon(resource.type)}
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </div>
                <Badge className={getResourceTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
              </div>
              {resource.difficulty && (
                <Badge variant="outline" className="w-fit">
                  {resource.difficulty}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resource.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{resource.rating}/5</span>
                  </div>
                )}
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Resource
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
