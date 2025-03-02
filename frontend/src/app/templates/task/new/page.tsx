'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon, PlusIcon } from '@/components/ui/icons';

export default function NewTaskTemplatePage() {
  const router = useRouter();
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    environment: 'Kubernetes',
    steps: [
      { title: '', description: '', validationCriteria: '' }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real application, you would send the data to the server
      console.log('Submitting template:', template);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to templates page
      router.push('/templates');
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    const updatedSteps = [...template.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setTemplate({ ...template, steps: updatedSteps });
  };

  const addStep = () => {
    setTemplate({
      ...template,
      steps: [...template.steps, { title: '', description: '', validationCriteria: '' }]
    });
  };

  const removeStep = (index: number) => {
    const updatedSteps = [...template.steps];
    updatedSteps.splice(index, 1);
    setTemplate({ ...template, steps: updatedSteps });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center text-sm text-zinc-400 mb-4">
          <Link href="/templates" className="hover:text-zinc-200">Templates</Link>
          <ChevronRightIcon className="h-4 w-4 mx-2" />
          <Link href="/templates" className="hover:text-zinc-200">Task Templates</Link>
          <ChevronRightIcon className="h-4 w-4 mx-2" />
          <span className="text-zinc-200">New Template</span>
        </div>

        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Create New Task Template</h1>
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

          <div className="mb-6">
            <label htmlFor="environment" className="block text-sm font-medium text-zinc-300 mb-1">
              Environment
            </label>
            <select
              id="environment"
              value={template.environment}
              onChange={(e) => setTemplate({ ...template, environment: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
              required
            >
              <option value="Kubernetes">Kubernetes</option>
              <option value="Linux">Linux</option>
              <option value="Docker">Docker</option>
              <option value="Mixed">Mixed Environment</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Task Steps</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          <div className="space-y-6">
            {template.steps.map((step, index) => (
              <div key={index} className="bg-zinc-700 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-zinc-100">Step {index + 1}</h3>
                  {template.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove Step
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`step-title-${index}`} className="block text-sm font-medium text-zinc-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id={`step-title-${index}`}
                      value={step.title}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`step-description-${index}`} className="block text-sm font-medium text-zinc-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id={`step-description-${index}`}
                      value={step.description}
                      onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`step-validation-${index}`} className="block text-sm font-medium text-zinc-300 mb-1">
                      Validation Criteria
                    </label>
                    <textarea
                      id={`step-validation-${index}`}
                      value={step.validationCriteria}
                      onChange={(e) => handleStepChange(index, 'validationCriteria', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-zinc-600 border border-zinc-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-200"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link href="/templates">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}
