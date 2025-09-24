'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MEME_TEMPLATES } from '@/constants';
import { Check } from 'lucide-react';

interface MemeTemplateGridProps {
  selectedTemplate: number | null;
  onSelectTemplate: (templateId: number) => void;
  disabled?: boolean;
}

export function MemeTemplateGrid({ 
  selectedTemplate, 
  onSelectTemplate, 
  disabled = false 
}: MemeTemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MEME_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTemplate === template.id
              ? 'ring-2 ring-indigo-500 bg-indigo-50'
              : 'hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && onSelectTemplate(template.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              {selectedTemplate === template.id && (
                <Badge variant="success" className="flex items-center space-x-1">
                  <Check className="h-3 w-3" />
                  <span>Selected</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={template.image}
                alt={template.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback for missing images
                  const target = e.target as HTMLImageElement;
                  target.src = `https://dummyimage.com/300x300/f3f4f6/6b7280?text=${encodeURIComponent(template.name)}`;
                }}
              />
            </div>
            <p className="text-xs text-gray-600">{template.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
