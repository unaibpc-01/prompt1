
import React, { memo } from 'react';
import type { Prompt } from '../types';
import PromptCard from './PromptCard';

interface PromptListProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

const PromptList: React.FC<PromptListProps> = memo(({ prompts, onEdit, onDelete, onCopy }) => {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No prompts found.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.map(prompt => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={() => onEdit(prompt)}
          onDelete={() => onDelete(prompt.id)}
          onCopy={() => onCopy(prompt.prompt)}
        />
      ))}
    </div>
  );
});

export default PromptList;
