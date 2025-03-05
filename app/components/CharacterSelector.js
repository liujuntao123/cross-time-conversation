'use client';
import { useState } from 'react';
import { quickSelectCharacters } from '../data/characters';

export default function CharacterSelector({ onCharacterSelect, selectedCharacters = [], isLoading = false }) {
  return (
    <div className="space-y-2">
      {/* Quick Select */}
      <div className="grid grid-cols-5 gap-x-2 gap-y-3">
        {quickSelectCharacters.map((char) => {
          const isSelected = selectedCharacters.some(c => c.name === char.name);
          return (
            <div key={char.name} className="flex flex-col items-center">
              <button
                onClick={() => onCharacterSelect(char)}
                disabled={isLoading}
                className={`w-14 h-14 rounded-lg flex items-center justify-center text-base overflow-hidden transition-colors ${
                  isSelected
                    ? 'bg-[#E7F7EB] border-2 border-[#09B83E] text-[#09B83E]'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {char.name[0]}
              </button>
              <span className="mt-0.5 text-xs text-gray-600 truncate w-full text-center">
                {char.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
