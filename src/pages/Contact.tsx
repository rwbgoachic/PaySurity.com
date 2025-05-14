import { motion } from 'framer-motion';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement actual form submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="relative isolate pt-24">
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Contact Us
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Get in touch with our team to learn more about our solutions.
            </p>
          </motion.div>

          <motion.div 
            className="mx-auto mt-16 max-w-xl sm:mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ${
                      errors.name ? 'ring-red-500' : 'ring-white/10'
                    } focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6`}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-400" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ${
                      errors.email ? 'ring-red-500' : 'ring-white/10'
                    } focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6`}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400" id="email-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white">
                  Message
                </label>
                <div className="mt-2">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ${
                      errors.message ? 'ring-red-500' : 'ring-white/10'
                    } focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6`}
                    aria-invalid={errors.message ? 'true' : 'false'}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-400" id="message-error">
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="rounded-md bg-green-500/10 p-4">
                  <p className="text-sm text-green-400">
                    Thank you for your message. We'll get back to you soon!
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="rounded-md bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">
                    There was an error sending your message. Please try again.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}