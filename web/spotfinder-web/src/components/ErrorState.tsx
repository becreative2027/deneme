'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {message ?? t('common.error')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-[#6c63ff] text-white text-sm font-semibold rounded-xl hover:bg-[#5a52e0] transition-colors"
        >
          <RefreshCw size={15} />
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
