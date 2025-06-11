
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { TextInput } from './TextInput';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  // onClose: () => void; // Kept commented as per App.tsx usage
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave /*, onClose*/ }) => {
  const [apiKey, setApiKey] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Reset local state when modal is opened/closed or API key changes externally
    if (isOpen) {
      setApiKey(''); // Clear previous input when modal opens
      setLocalError(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setLocalError('API 키를 입력해주세요.');
      return;
    }
    setLocalError(null);
    onSave(apiKey);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      aria-labelledby="apiKeyModalLabel"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-slate-700">
        <h2 id="apiKeyModalLabel" className="text-2xl font-semibold text-sky-400">
          마법사 Gemini API 키 설정
        </h2>
        <p className="text-slate-400 text-sm">
          Google Script Wizard를 사용하려면 Gemini API 키가 필요합니다. 
          이 키는 AI 설계 제안 및 코드 생성을 위해 사용되며, 브라우저의 localStorage에 저장됩니다.
          Google AI Studio (makersuite.google.com)에서 API 키를 발급받을 수 있습니다.
        </p>

        {localError && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500 rounded-md text-sm">
            <p>{localError}</p>
          </div>
        )}

        <TextInput
          label="Gemini API 키"
          id="wizardApiKeyInput"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API 키를 여기에 붙여넣으세요"
          required
          autoFocus
        />
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 
          <Button onClick={onClose} fullWidth color="secondary" variant="outline">
            닫기
          </Button> 
          */}
          <Button onClick={handleSave} fullWidth color="primary">
            API 키 저장 및 마법사 시작
          </Button>
        </div>
         <p className="text-xs text-slate-500 text-center pt-2">
          이 마법사 앱 자체를 실행하기 위한 API 키입니다. <br/>생성될 앱의 API 키는 2단계에서 별도로 입력합니다.
        </p>
      </div>
    </div>
  );
};
