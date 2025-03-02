'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskTemplatesList } from './components/TaskTemplatesList';
import { AssessmentTemplatesList } from './components/AssessmentTemplatesList';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('task-templates');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Templates</h1>
      </div>

      <Tabs
        defaultValue="task-templates"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="task-templates">Task Templates</TabsTrigger>
          <TabsTrigger value="assessment-templates">Assessment Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="task-templates" className="mt-6">
          <TaskTemplatesList />
        </TabsContent>

        <TabsContent value="assessment-templates" className="mt-6">
          <AssessmentTemplatesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
