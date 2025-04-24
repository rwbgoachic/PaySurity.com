import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FAQsAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<FAQ>();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FAQ) => {
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(data)
          .eq('id', editingFaq.id);

        if (error) throw error;
        toast.success('FAQ updated successfully');
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([data]);

        if (error) throw error;
        toast.success('FAQ created successfully');
      }

      reset();
      setEditingFaq(null);
      fetchFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    Object.entries(faq).forEach(([key, value]) => {
      setValue(key as keyof FAQ, value);
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleRegenerateEmbeddings = async () => {
    try {
      const { error } = await supabase.functions.invoke('regenerate-embeddings');
      if (error) throw error;
      toast.success('Embeddings regeneration started');
    } catch (error) {
      console.error('Error regenerating embeddings:', error);
      toast.error('Failed to regenerate embeddings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage FAQs</h1>
        <p className="mt-2 text-gray-600">
          Add, edit, and manage frequently asked questions
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Question
            </label>
            <input
              type="text"
              {...register('question')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              {...register('answer')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            {editingFaq && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditingFaq(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {editingFaq ? 'Update FAQ' : 'Add FAQ'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">FAQ List</h2>
          <button
            onClick={handleRegenerateEmbeddings}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Regenerate Embeddings
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {faq.category}
                  </h3>
                  <p className="mt-1 text-base font-medium">{faq.question}</p>
                  <p className="mt-1 text-gray-600">{faq.answer}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}