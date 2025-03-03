'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function HelpPage() {
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const onSubmit = (data: ContactFormData) => {
    // In a real application, you'd send this data to your backend
    console.log('Form submitted:', data);
    setFormSubmitted(true);
    reset();

    // Reset the success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  const faqs = [
    {
      question: "What is Qualifyd?",
      answer: "Qualifyd is a platform for creating and managing realistic technical assessments that evaluate job candidates in work-like scenarios. It allows you to observe how candidates perform in realistic environments that simulate actual job responsibilities."
    },
    {
      question: "Who can use Qualifyd?",
      answer: "Qualifyd is designed for technical recruiters, hiring managers, and organizations looking to evaluate candidates for roles such as Platform Engineers, DevOps Engineers, SREs, Infrastructure Engineers, Cloud Engineers, and more."
    },
    {
      question: "What types of assessments can I create?",
      answer: "You can create assessments for Kubernetes configuration, Linux systems administration, container orchestration, security hardening, and many other job-specific technical challenges."
    },
    {
      question: "How does the pricing work?",
      answer: "We offer three plans: Starter ($100/month), Team ($200/month), and Enterprise (custom pricing). Each plan includes different levels of assessments, team members, templates, and environment resources. Check our Pricing page for detailed information."
    },
    {
      question: "How are environments provisioned?",
      answer: "Environments are created on-demand with just-in-time provisioning before the assessment. They are isolated with proper network segmentation, resource-constrained with configurable limits, and automatically cleaned up after test completion."
    },
    {
      question: "Can I customize the assessment environments?",
      answer: "Yes, you can select from pre-defined environment templates (K8s/Linux/Docker) with standard configurations. Enterprise customers can also create custom machine images for specialized workloads."
    },
    {
      question: "How is scoring handled?",
      answer: "Technical recruiters can implement automatic scoring via multiple validation scripts, define score thresholds with weighted assessment components, and configure time-based bonus point allocation with configurable coefficients."
    },
    {
      question: "Can candidates see their results?",
      answer: "Yes, candidates can see their results based on the configuration set by the assessment creator. Post-test solution visibility settings can be configured according to your preferences."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-zinc-100 sm:text-5xl sm:tracking-tight">
          Help Center
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-zinc-400">
          Find answers to common questions or reach out to our team for assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* FAQs Section */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-zinc-800">
                <button
                  className="flex justify-between w-full px-4 py-5 sm:p-6 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-medium text-zinc-100">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0">
                    <svg
                      className={`h-5 w-5 text-indigo-400 transform ${faqOpen[index] ? 'rotate-180' : 'rotate-0'}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>
                {faqOpen[index] && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                    <p className="text-zinc-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Contact Us</h2>
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            {formSubmitted ? (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Thank you for your message! We&apos;ll get back to you soon.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      type="text"
                      className={`shadow-sm block w-full sm:text-sm rounded-md bg-zinc-800 border ${errors.name ? 'border-red-500' : 'border-zinc-700'} text-zinc-100 px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Your name"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      className={`shadow-sm block w-full sm:text-sm rounded-md bg-zinc-800 border ${errors.email ? 'border-red-500' : 'border-zinc-700'} text-zinc-100 px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="your.email@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-zinc-300">
                    Subject
                  </label>
                  <div className="mt-1">
                    <input
                      id="subject"
                      type="text"
                      className={`shadow-sm block w-full sm:text-sm rounded-md bg-zinc-800 border ${errors.subject ? 'border-red-500' : 'border-zinc-700'} text-zinc-100 px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="How can we help you?"
                      {...register('subject', { required: 'Subject is required' })}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-300">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      rows={5}
                      className={`shadow-sm block w-full sm:text-sm rounded-md bg-zinc-800 border ${errors.message ? 'border-red-500' : 'border-zinc-700'} text-zinc-100 px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Your message"
                      {...register('message', { required: 'Message is required' })}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
