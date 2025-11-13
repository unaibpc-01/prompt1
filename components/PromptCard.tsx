import React, { useState, useRef } from 'react';
import type { Prompt } from '../types';
import { EditIcon, DeleteIcon } from './icons';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onEdit, onDelete, onCopy }) => {
  const [longPressActive, setLongPressActive] = useState(false);
  const timerRef = useRef<number>();
  const isLongPress = useRef(false);

  const handlePressStart = () => {
    isLongPress.current = false;
    timerRef.current = window.setTimeout(() => {
      isLongPress.current = true;
      setLongPressActive(true);
    }, 400);
  };

  const handlePressEnd = () => {
    clearTimeout(timerRef.current);
  };

  const handleClick = () => {
    if (!isLongPress.current) {
      onCopy();
    }
  };
  
  // Prevent click event from bubbling up from buttons to the overlay
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setLongPressActive(false); // Close menu after action
  };
  
  return (
    <div
      className="bg-gray-800 rounded-lg p-2 shadow-md border border-gray-700 flex flex-col space-y-1 transition hover:border-blue-500 h-36 relative cursor-pointer"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd} // Cancel on mouse leave
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onClick={handleClick}
      role="button"
      aria-label={`Copy prompt: ${prompt.title}`}
      tabIndex={0}
    >
      <div className="flex justify-between items-start px-2 pt-1">
        <h2 className="text-lg font-bold text-white">{prompt.title}</h2>
      </div>
      <div className="flex-1 overflow-hidden relative rounded-2xl p-1.5 bg-gray-700 border-2 border-black mx-2 mb-2">
        <p className="text-gray-300 text-sm whitespace-pre-wrap font-mono select-none">
          {prompt.prompt}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-600 to-transparent pointer-events-none" />
      </div>

      {longPressActive && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center space-x-4 rounded-lg z-10 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setLongPressActive(false);
          }}
        >
          <button
            onClick={(e) => handleActionClick(e, onEdit)}
            aria-label="Edit prompt"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-semibold"
          >
            <EditIcon className="h-5 w-5" />
            <span>Edit</span>
          </button>
          <button
            onClick={(e) => handleActionClick(e, onDelete)}
            aria-label="Delete prompt"
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition font-semibold"
          >
            <DeleteIcon className="h-5 w-5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptCard;