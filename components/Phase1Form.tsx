
import React, { useState }from 'react';
import { AiDesignProposal } from '../types';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { LoadingSpinner } from './LoadingSpinner';
import { generateAppDescriptionFromIdea } from '../services/geminiService';

interface Phase1FormProps {
  projectName: string;
  setProjectName: (name: string) => void;
  appDescription: string;
  setAppDescription: (desc: string) => void;
  onGetAiDesign: () => Promise<void>;
  isLoadingAiDesign: boolean;
  aiDesign: AiDesignProposal | null;
  onDesignChange: (design: AiDesignProposal) => void;
  onNextStep: () => void;
  clearError: () => void;
  setError: (message: string) => void;
  setIsGlobalLoading: (isLoading: boolean) => void; // Added prop
}

export const Phase1Form: React.FC<Phase1FormProps> = ({
  projectName,
  setProjectName,
  appDescription,
  setAppDescription,
  onGetAiDesign,
  isLoadingAiDesign,
  aiDesign,
  onDesignChange,
  onNextStep,
  clearError,
  setError,
  setIsGlobalLoading, // Destructure prop
}) => {
  const [isLoadingDescription, setIsLoadingDescription] = useState<boolean>(false);

  const handleSheetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (aiDesign) {
      onDesignChange({ ...aiDesign, sheet_name: e.target.value });
    }
  };

  const handleSheetFieldChange = (index: number, value: string) => {
    if (aiDesign) {
      const updatedFields = [...aiDesign.sheet_fields];
      updatedFields[index] = value;
      onDesignChange({ ...aiDesign, sheet_fields: updatedFields });
    }
  };

  const handleUiElementChange = (index: number, value: string) => {
    if (aiDesign) {
      const updatedElements = [...aiDesign.ui_elements];
      updatedElements[index] = value;
      onDesignChange({ ...aiDesign, ui_elements: updatedElements });
    }
  };
  
  const exampleAppDescriptionPlaceholder = `예: 사용자가 사진을 올리면 AI가 분석하고 그 결과를 Google Sheet에 저장하는 앱입니다. 주요 기능과 사용자의 앱 사용 순서를 설명해주세요.`;

  const handleGenerateAppDescription = async () => {
    if (!projectName.trim()) {
      setError('프로젝트 이름을 먼저 입력해주세요.');
      return;
    }
    setIsLoadingDescription(true);
    setIsGlobalLoading(true); // Start global loading
    clearError();
    try {
      const description = await generateAppDescriptionFromIdea(projectName);
      setAppDescription(description);
    } catch (err) {
      console.error("App description generation failed:", err);
      setError(err instanceof Error ? err.message : 'AI 앱 설명 생성에 실패했습니다.');
    } finally {
      setIsLoadingDescription(false);
      setIsGlobalLoading(false); // End global loading
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-sky-400 mb-1">Step 1: 만들고 싶은 앱을 설명해주세요.</h2>
        <p className="text-slate-400">아이디어를 구체적인 설계로 변환하는 단계입니다.</p>
      </div>

      <div className="space-y-6">
        <TextInput
          label="프로젝트 이름"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="예: AI 음식 분석 앱"
          required
        />
        <div>
          <TextArea
            label="앱의 주요 기능과 사용자 흐름을 자유롭게 설명해주세요"
            id="appDescription"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            placeholder={exampleAppDescriptionPlaceholder}
            rows={8}
            required
          />
          <Button 
            onClick={handleGenerateAppDescription} 
            disabled={!projectName.trim() || isLoadingAiDesign || isLoadingDescription}
            variant="solid"
            color="secondary"
            size="sm"
            className="mt-2"
          >
            {isLoadingDescription ? <LoadingSpinner size="sm" /> : 'AI로 기능 설명 생성'}
          </Button>
        </div>
      </div>

      <Button onClick={onGetAiDesign} disabled={isLoadingAiDesign || isLoadingDescription || !projectName.trim() || !appDescription.trim()} fullWidth>
        {isLoadingAiDesign ? <LoadingSpinner size="sm" /> : 'AI 설계 제안 받기'}
      </Button>

      {aiDesign && (
        <div className="mt-8 pt-8 border-t border-slate-700 space-y-8">
          <h3 className="text-xl font-semibold text-sky-400">AI 설계 제안 (수정 가능)</h3>
          
          <div className="space-y-4 p-6 bg-slate-700/50 rounded-lg">
            <h4 className="text-lg font-medium text-sky-300">[ 제안 1 ] 구글 시트 구조</h4>
            <TextInput
              label="시트명"
              id="sheetName"
              value={aiDesign.sheet_name}
              onChange={handleSheetNameChange}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">필드 구조 (헤더)</label>
              <div className="space-y-2">
                {aiDesign.sheet_fields.map((field, index) => (
                  <TextInput
                    key={`sheet_field_${index}`}
                    id={`sheet_field_${index}`}
                    value={field}
                    onChange={(e) => handleSheetFieldChange(index, e.target.value)}
                    placeholder="예: Timestamp (분석 요청 시간)"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-slate-700/50 rounded-lg">
            <h4 className="text-lg font-medium text-sky-300">[ 제안 2 ] 화면 인터페이스 구성</h4>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">필요한 UI 요소</label>
              <div className="space-y-2">
                {aiDesign.ui_elements.map((element, index) => (
                  <TextInput
                    key={`ui_element_${index}`}
                    id={`ui_element_${index}`}
                    value={element}
                    onChange={(e) => handleUiElementChange(index, e.target.value)}
                    placeholder="예: h1 제목: AI 음식 영양 분석기"
                  />
                ))}
              </div>
            </div>
          </div>
          
          <Button onClick={onNextStep} fullWidth color="primary" disabled={isLoadingAiDesign || isLoadingDescription}>
            이 설계로 코드 생성하기 (Step 2로 이동)
          </Button>
        </div>
      )}
    </div>
  );
};
