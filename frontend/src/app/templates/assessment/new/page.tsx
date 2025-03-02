'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';

// Define types for task template
interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  environment: string;
  estimatedTime: string;
  dependsOn?: string[];
}

// Mock data for task templates that can be added to an assessment
const mockAvailableTasks = [
  {
    id: '1',
    name: 'Kubernetes Deployment',
    description: 'Deploy a simple application to Kubernetes',
    environment: 'Kubernetes',
    estimatedTime: '30 minutes',
  },
  {
    id: '2',
    name: 'Database Optimization',
    description: 'Optimize PostgreSQL queries and indexes',
    environment: 'Linux',
    estimatedTime: '45 minutes',
  },
  {
    id: '3',
    name: 'Security Hardening',
    description: 'Implement security best practices for a Linux server',
    environment: 'Linux',
    estimatedTime: '60 minutes',
  },
  {
    id: '4',
    name: 'Networking Configuration',
    description: 'Configure networking for a multi-container application',
    environment: 'Docker',
    estimatedTime: '45 minutes',
  }
];

export default function NewAssessmentTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    estimatedDuration: '120',
    tasks: [] as TaskTemplate[]
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableTasks, setAvailableTasks] = useState(mockAvailableTasks);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total duration based on selected tasks
  useEffect(() => {
    const totalMinutes = template.tasks.reduce((total, task) => {
      const timeString = task.estimatedTime || '0 minutes';
      const minutes = parseInt(timeString.split(' ')[0]) || 0;
      return total + minutes;
    }, 0);

    setTemplate(prev => ({
      ...prev,
      estimatedDuration: totalMinutes.toString()
    }));
  }, [template.tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real application, you would send the data to the server
      console.log('Submitting assessment template:', template);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to templates page
      router.push('/templates');
    } catch (error) {
      console.error('Error creating assessment template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTaskToAssessment = () => {
    if (!selectedTaskId) return;

    const taskToAdd = availableTasks.find(task => task.id === selectedTaskId);
    if (!taskToAdd) return;

    // Add task to assessment with default dependsOn as empty array
    setTemplate({
      ...template,
      tasks: [...template.tasks, { ...taskToAdd, dependsOn: [] }]
    });

    // Clear selection
    setSelectedTaskId('');
  };

  const removeTaskFromAssessment = (taskId: string) => {
    // Remove the task
    const updatedTasks = template.tasks.filter(task => task.id !== taskId);

    // Update any dependencies that referenced this task
    const tasksWithUpdatedDeps = updatedTasks.map(task => ({
      ...task,
      dependsOn: task.dependsOn ? task.dependsOn.filter((depId: string) => depId !== taskId) : []
    }));

    setTemplate({
      ...template,
      tasks: tasksWithUpdatedDeps
    });
  };

  const toggleTaskDependency = (taskId: string, dependencyId: string) => {
    const updatedTasks = template.tasks.map(task => {
      if (task.id === taskId) {
        const currentDependsOn = task.dependsOn || [];
        const dependsOn = currentDependsOn.includes(dependencyId)
          ? currentDependsOn.filter((id: string) => id !== dependencyId)
          : [...currentDependsOn, dependencyId];

        return { ...task, dependsOn };
      }
      return task;
    });

    setTemplate({
      ...template,
      tasks: updatedTasks
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center text-sm text-zinc-400 mb-4">
          <Link href="/templates" className="hover:text-zinc-200">Templates</Link>
          <ChevronRightIcon className="h-4 w-4 mx-2" />
          <Link href="/templates" className="hover:text-zinc-200">Assessment Templates</Link>
          <ChevronRightIcon className="h-4 w-4 mx-2" />
          <span className="text-zinc-200">New Assessment Template</span>
        </div>

        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Create New Assessment Template</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-800 rounded-md p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="name"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="duration" className="block text-sm font-medium text-zinc-300 mb-1">
                Estimated Duration
              </label>
              <span className="text-sm text-zinc-400">
                Auto-calculated: {template.estimatedDuration} minutes
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Assessment Tasks</h2>
          </div>

          <div className="mb-6">
            <div className="flex space-x-2">
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="flex-1 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
              >
                <option value="">Select a task to add...</option>
                {availableTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.environment}, {task.estimatedTime})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={addTaskToAssessment}
                disabled={!selectedTaskId}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          </div>

          {template.tasks.length === 0 ? (
            <div className="bg-zinc-700 rounded-md p-4 text-center text-zinc-400">
              No tasks added to this assessment yet. Use the selector above to add tasks.
            </div>
          ) : (
            <div className="space-y-4">
              {template.tasks.map((task, index) => (
                <div key={task.id} className="bg-zinc-700 rounded-md p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-zinc-100">
                          {index + 1}. {task.name}
                        </h3>
                        <span className="ml-2 bg-zinc-600 text-zinc-200 px-2 py-1 rounded text-xs">
                          {task.environment}
                        </span>
                        <span className="ml-2 text-zinc-400 text-sm">
                          {task.estimatedTime}
                        </span>
                      </div>
                      <p className="text-zinc-300 mt-1">{task.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTaskFromAssessment(task.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Remove task"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {index > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-600">
                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Dependencies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.tasks.slice(0, index).map((depTask) => (
                          <label
                            key={depTask.id}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded cursor-pointer ${
                              task.dependsOn && task.dependsOn.includes(depTask.id)
                                ? 'bg-indigo-700 text-indigo-100'
                                : 'bg-zinc-600 text-zinc-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={task.dependsOn?.includes(depTask.id) || false}
                              onChange={() => toggleTaskDependency(task.id, depTask.id)}
                            />
                            <span>{depTask.name}</span>
                          </label>
                        ))}
                        {template.tasks.slice(0, index).length === 0 && (
                          <span className="text-zinc-400 text-sm">No prior tasks available for dependencies</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Link href="/templates">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || template.tasks.length === 0}
          >
            {isSubmitting ? 'Creating...' : 'Create Assessment Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}
