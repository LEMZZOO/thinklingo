'use client';

import { useState } from 'react';

interface AcademyVocabularyToggleProps {
  initialValue: boolean;
}

export function AcademyVocabularyToggle({ initialValue }: AcademyVocabularyToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);

  return (
    <div className="space-y-1.5 p-1">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="uses_custom_vocabulary"
          name="uses_custom_vocabulary"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
        />
        <label htmlFor="uses_custom_vocabulary" className="text-sm font-bold text-slate-600 dark:text-slate-300">
          Usar vocabulario propio
        </label>
      </div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-7 uppercase tracking-widest">
        {enabled
          ? 'Vocabulario desde la base de datos'
          : 'Vocabulario global (JSON)'}
      </p>
      {enabled && (
        <p className="text-[10px] font-bold text-amber-500 pl-7">
          ⚠️ Si no hay palabras en DB, la academia no mostrará vocabulario.
        </p>
      )}
    </div>
  );
}
