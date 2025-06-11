
import React from 'react';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { TextArea } from './TextArea';
import { Checkbox } from './Checkbox';
import { LoadingSpinner } from './LoadingSpinner';
import { DEFAULT_TARGET_GEMINI_MODEL } from '../constants';

interface Phase2FormProps {
  targetGeminiApiKey: string;
  setTargetGeminiApiKey: (key: string) => void;
  targetGeminiModel: string;
  setTargetGeminiModel: (model: string) => void;
  targetGoogleSheetId: string;
  setTargetGoogleSheetId: (id: string) => void;
  finalSheetName: string;
  setFinalSheetName: (name: string) => void;
  finalUiElementsString: string;
  setFinalUiElementsString: (elements: string) => void;
  applyStylishDesign: boolean;
  setApplyStylishDesign: (value: boolean) => void;
  includeResponsiveCss: boolean;
  setIncludeResponsiveCss: (value: boolean) => void;
  otherRequests: string;
  setOtherRequests: (requests: string) => void;
  onGenerateCode: () => Promise<void>;
  isLoading: boolean;
  onBack: () => void;
  isWizardAiInitialized: boolean; // Added prop
}

export const Phase2Form: React.FC<Phase2FormProps> = ({
  targetGeminiApiKey, setTargetGeminiApiKey,
  targetGeminiModel, setTargetGeminiModel,
  targetGoogleSheetId, setTargetGoogleSheetId,
  finalSheetName, setFinalSheetName,
  finalUiElementsString, setFinalUiElementsString,
  applyStylishDesign, setApplyStylishDesign,
  includeResponsiveCss, setIncludeResponsiveCss,
  otherRequests, setOtherRequests,
  onGenerateCode, isLoading, onBack,
  isWizardAiInitialized, // Destructure prop
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-sky-400 mb-1">Step 2: 세부 정보를 입력하고 코드를 생성하세요.</h2>
        <p className="text-slate-400">확정된 설계를 바탕으로 실제 코드를 만듭니다.</p>
      </div>

      <div className="space-y-6">
        {/* Backend Configuration */}
        <div className="p-6 bg-slate-700/50 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-sky-300">[ 백엔드 구성 ]</h3>
          <TextInput
            label="생성될 앱의 Gemini API 키"
            id="targetGeminiApiKey"
            type="password"
            value={targetGeminiApiKey}
            onChange={(e) => setTargetGeminiApiKey(e.target.value)}
            placeholder="G Suite 관리자 또는 개발자로부터 받은 API 키"
            required
            helpText="API 키는 Google AI Studio (makersuite.google.com)에서 'Get API key'를 통해 발급받을 수 있습니다. 생성된 앱에서 이 키를 사용하게 됩니다."
            disabled={!isWizardAiInitialized}
          />
          <TextInput
            label="생성될 앱의 Gemini 모델"
            id="targetGeminiModel"
            value={targetGeminiModel}
            onChange={(e) => setTargetGeminiModel(e.target.value)}
            placeholder={`기본값: ${DEFAULT_TARGET_GEMINI_MODEL}`}
            required
            helpText="일반 텍스트 작업에는 'gemini-2.5-flash-preview-04-17', 이미지 생성 작업에는 'imagen-3.0-generate-002'를 사용하세요. 다른 모델이 필요한 경우 Google AI 문서를 참조하여 모델명을 입력하세요."
            disabled={!isWizardAiInitialized}
          />
          <TextInput
            label="생성될 앱의 Google 시트 ID"
            id="targetGoogleSheetId"
            value={targetGoogleSheetId}
            onChange={(e) => setTargetGoogleSheetId(e.target.value)}
            placeholder="Google 시트 URL에서 ID 부분"
            required
            helpText="구글 시트 URL (예: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0) 에서 YOUR_SHEET_ID 부분이 시트 ID입니다."
            disabled={!isWizardAiInitialized}
          />
          <TextInput
            label="시트명 (Phase 1에서 자동 완성)"
            id="finalSheetName"
            value={finalSheetName}
            onChange={(e) => setFinalSheetName(e.target.value)}
            required
            disabled={!isWizardAiInitialized}
          />
        </div>

        {/* UI Configuration */}
        <div className="p-6 bg-slate-700/50 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-sky-300">[ 화면 인터페이스 구성 ]</h3>
          <TextArea
            label="UI 요소 목록 (Phase 1에서 자동 완성, 수정 가능)"
            id="finalUiElements"
            value={finalUiElementsString}
            onChange={(e) => setFinalUiElementsString(e.target.value)}
            rows={6}
            required
            helpText="한 줄에 하나의 UI 요소를 설명합니다. 예: h1 제목: 나의 멋진 앱"
            disabled={!isWizardAiInitialized}
          />
        </div>
        
        {/* Additional Requests */}
        <div className="p-6 bg-slate-700/50 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-sky-300">[ 추가 요청 ]</h3>
          <Checkbox
            label="최신 트렌드의 세련된 디자인 적용 (Tailwind CSS 활용)"
            id="stylishDesign"
            checked={applyStylishDesign}
            onChange={(e) => setApplyStylishDesign(e.target.checked)}
            disabled={!isWizardAiInitialized}
          />
          <Checkbox
            label="모바일 반응형 CSS 포함"
            id="responsiveCss"
            checked={includeResponsiveCss}
            onChange={(e) => setIncludeResponsiveCss(e.target.checked)}
            disabled={!isWizardAiInitialized}
          />
          <TextArea
            label="기타 요청사항"
            id="otherRequests"
            value={otherRequests}
            onChange={(e) => setOtherRequests(e.target.value)}
            rows={3}
            placeholder="예: 사용자 입력 유효성 검사 추가, 특정 스타일 테마 적용 등"
            disabled={!isWizardAiInitialized}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button onClick={onBack} fullWidth color="secondary" disabled={!isWizardAiInitialized || isLoading}>
          이전 단계로 (Step 1)
        </Button>
        <Button onClick={onGenerateCode} disabled={!isWizardAiInitialized || isLoading} fullWidth color="primary">
          {isLoading ? <LoadingSpinner size="sm" /> : '🔥 마법으로 코드 생성하기'}
        </Button>
      </div>
    </div>
  );
};