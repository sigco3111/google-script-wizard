
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { LoadingSpinner } from './LoadingSpinner';

interface WizardApiKeyManagerProps {
  initialApiKey: string | null;
  onSaveApiKey: (key: string) => void; // Parent should handle actual saving & re-init
  isWizardAiInitialized: boolean;
  clearGlobalError: () => void;
  setGlobalError: (message: string | null) => void;
}

const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);


export const WizardApiKeyManager: React.FC<WizardApiKeyManagerProps> = ({ 
  initialApiKey, 
  onSaveApiKey, 
  isWizardAiInitialized,
  clearGlobalError,
  setGlobalError
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Local loading for save operation

  useEffect(() => {
    // If an initial key is provided (e.g., from localStorage on load),
    // and we are not currently editing, set the input field.
    // This handles the case where the key is loaded after component mount.
    if (initialApiKey && !isEditing) {
      setApiKeyInput(initialApiKey);
    }
    // If no initial key, and not editing, imply user needs to set one.
    // If there's no key and AI isn't initialized, start in editing mode.
    if (!initialApiKey && !isWizardAiInitialized) {
        setIsEditing(true);
    }

  }, [initialApiKey, isWizardAiInitialized]);


  const handleToggleEdit = () => {
    if (isEditing) {
      // If was editing and now closing, revert input to current initialApiKey (or empty if none)
      setApiKeyInput(initialApiKey || '');
      setGlobalError(null); // Clear local error when cancelling edit
    } else {
      // If opening edit, prime input with current key for editing
      setApiKeyInput(initialApiKey || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!apiKeyInput.trim()) {
      setGlobalError('API 키를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    clearGlobalError(); // Clear previous global errors
    
    // Simulate async operation for saving and re-initializing AI
    // In a real scenario, onSaveApiKey might be async or trigger async actions in parent
    await new Promise(resolve => setTimeout(resolve, 300)); 
    
    onSaveApiKey(apiKeyInput); // Parent handles actual save and re-init attempt
    
    setIsLoading(false);
    // Only close editing if AI becomes initialized successfully or if there's no initial key (first time setup)
    // The parent's onSaveApiKey will trigger a re-render with new isWizardAiInitialized
    // We rely on useEffect in App.tsx to update `isWizardAiInitialized`
    // If `initWizardAi` in parent is successful, `isWizardAiInitialized` will be true
    // If it fails, parent should set an error, and we might want to keep editing open.
    // For now, optimistically close if a key was entered. The parent's error display will guide the user.
    if (apiKeyInput.trim()) {
        setIsEditing(false); 
    }
  };

  const getMaskedApiKey = () => {
    if (!initialApiKey) return '미설정';
    if (initialApiKey.length <= 8) return '****';
    return `${initialApiKey.substring(0, 4)}...${initialApiKey.substring(initialApiKey.length - 4)}`;
  };

  return (
    <div className="p-3 bg-slate-800/70 rounded-lg shadow-md border border-slate-700/50 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-slate-300">
        <KeyIcon />
        <span>마법사 API 키:</span>
        {isEditing ? (
          <div className="flex-grow sm:min-w-[300px]">
            <TextInput
              id="wizardApiKeyManagerInput"
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                if (e.target.value.trim()) clearGlobalError();
              }}
              placeholder="Gemini API 키 입력"
              className="py-1 text-xs"
              autoFocus
              disabled={isLoading}
            />
          </div>
        ) : (
          <span className={`font-semibold ${isWizardAiInitialized ? 'text-green-400' : 'text-yellow-400'}`}>
            {getMaskedApiKey()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave} size="sm" variant="solid" color="primary" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm"/> : '저장'}
            </Button>
            <Button onClick={handleToggleEdit} size="sm" variant="outline" color="secondary" disabled={isLoading}>
              취소
            </Button>
          </>
        ) : (
          <Button onClick={handleToggleEdit} size="sm" variant="outline" color="secondary">
            {initialApiKey ? '변경' : '설정'}
          </Button>
        )}
         <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${isWizardAiInitialized ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
          {isWizardAiInitialized ? 'AI 활성화됨' : 'AI 비활성화됨'}
        </span>
      </div>
    </div>
  );
};
