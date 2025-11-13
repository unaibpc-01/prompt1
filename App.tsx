
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Prompt } from './types';
import SearchInput from './components/SearchInput';
import PromptList from './components/PromptList';
import FloatingActionButton from './components/FloatingActionButton';
import PromptModal from './components/PromptModal';
import Toast from './components/Toast';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const { data, error } = await supabase.from('prompts').select('*');
        if (error) {
          console.error('Error fetching prompts:', error);
        } else {
          setPrompts(data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [prompts, searchTerm]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Prompt copied to clipboard!');
  }, [showToast]);

  const handleOpenModal = useCallback((prompt: Prompt | null = null) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingPrompt(null);
  }, []);

  const handleSavePrompt = useCallback(async (promptToSave: Omit<Prompt, 'id'> & { id?: string }) => {
    if (promptToSave.id) {
      const { error } = await supabase.from('prompts').update(promptToSave).eq('id', promptToSave.id);
      if (error) {
        console.error('Error updating prompt:', error);
        showToast('Error updating prompt');
      } else {
        setPrompts(prompts.map(p => p.id === promptToSave.id ? { ...p, ...promptToSave } as Prompt : p));
        showToast('Prompt updated successfully!');
      }
    } else {
      const { title, prompt } = promptToSave;
      const { data, error } = await supabase.from('prompts').insert([{ title, prompt }]).select();
      if (error) {
        console.error('Error adding prompt:', error);
        showToast('Error adding prompt');
      } else {
        setPrompts([data[0], ...prompts]);
        showToast('Prompt added successfully!');
      }
    }
    handleCloseModal();
  }, [prompts, handleCloseModal, showToast]);
  
  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting prompt:', error);
      showToast('Error deleting prompt');
    } else {
      setPrompts(prompts.filter(p => p.id !== id));
      showToast('Prompt deleted.');
    }
  }, [prompts, showToast]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto max-w-2xl p-4 pb-24">
        <main>
          <div className="my-6">
            <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-400">Loading prompts...</div>
            </div>
          ) : (
            <PromptList
              prompts={filteredPrompts}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onCopy={handleCopy}
            />
          )}
        </main>
      </div>
      <FloatingActionButton onClick={() => handleOpenModal()} />
      <PromptModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePrompt}
        promptToEdit={editingPrompt}
      />
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default App;
