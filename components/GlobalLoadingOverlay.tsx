
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface GlobalLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const dotStates = ['', '.', '..', '...'];

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({ isLoading, message }) => {
  const [animatedDots, setAnimatedDots] = useState<string>('');
  const baseMessage = message || 'AI가 열심히 작업 중입니다... 잠시만 기다려주세요.';

  useEffect(() => {
    let intervalId: number | undefined;
    if (isLoading) {
      let dotIndex = 0;
      intervalId = window.setInterval(() => {
        setAnimatedDots(dotStates[dotIndex % dotStates.length]);
        dotIndex++;
      }, 500);
    } else {
      setAnimatedDots(''); // Reset dots when not loading
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
      aria-live="assertive"
      role="alertdialog"
      aria-busy="true"
      aria-labelledby="loading-message"
    >
      <LoadingSpinner size="lg" color="text-sky-400" />
      <p id="loading-message" className="mt-4 text-xl text-slate-200">
        {baseMessage}{animatedDots}
      </p>
    </div>
  );
};
