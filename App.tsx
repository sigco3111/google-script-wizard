import React, { useState, useCallback, useEffect } from 'react';
import { AiDesignProposal, GeneratedCode, Phase2RequestData } from './types';
import { Phase1Form } from './components/Phase1Form';
import { Phase2Form } from './components/Phase2Form';
import { CodeDisplay } from './components/CodeDisplay';
import { GlobalLoadingOverlay } from './components/GlobalLoadingOverlay';
import { ApiKeyModal } from './components/ApiKeyModal'; // Import ApiKeyModal
import { generateDesignProposal, generateAppCode, initWizardAi } from './services/geminiService';
import { DEFAULT_TARGET_GEMINI_MODEL } from './constants';

declare var JSZip: any;
const WIZARD_API_KEY_STORAGE_KEY = 'wizard_gemini_api_key';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Wizard's own API key state
  const [wizardApiKey, setWizardApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isWizardAiInitialized, setIsWizardAiInitialized] = useState<boolean>(false);

  // Phase 1 state
  const [projectName, setProjectName] = useState<string>('');
  const [appDescription, setAppDescription] = useState<string>('');
  const [isLoadingAiDesign, setIsLoadingAiDesign] = useState<boolean>(false);
  const [aiDesign, setAiDesign] = useState<AiDesignProposal | null>(null);
  
  // Phase 2 state
  const [targetGeminiApiKey, setTargetGeminiApiKey] = useState<string>(''); // Default will be set from wizardApiKey
  const [targetGeminiModel, setTargetGeminiModel] = useState<string>(DEFAULT_TARGET_GEMINI_MODEL);
  const [targetGoogleSheetId, setTargetGoogleSheetId] = useState<string>('');
  const [finalSheetName, setFinalSheetName] = useState<string>('');
  const [finalUiElementsString, setFinalUiElementsString] = useState<string>('');
  const [applyStylishDesign, setApplyStylishDesign] = useState<boolean>(true);
  const [includeResponsiveCss, setIncludeResponsiveCss] = useState<boolean>(true);
  const [otherRequests, setOtherRequests] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);

  // API Key Check on Mount
  useEffect(() => {
    // Try to get API key from a globally pre-configured object (e.g., injected via index.html script)
    let key = (window as any).process?.env?.API_KEY || null;
    if (!key) {
      // If not found, try localStorage
      key = localStorage.getItem(WIZARD_API_KEY_STORAGE_KEY);
    }

    if (key) {
      setWizardApiKey(key);
    } else {
      setIsApiKeyModalOpen(true); // Prompt user if no key is found
    }
  }, []);

  // Initialize AI service when wizardApiKey is set
  useEffect(() => {
    if (wizardApiKey) {
      const success = initWizardAi(wizardApiKey);
      setIsWizardAiInitialized(success);
      if (success) {
        setTargetGeminiApiKey(wizardApiKey); // Default Phase 2 API key to wizard's key
        setError(null); // Clear any previous API key errors
      } else {
        setError("마법사 AI 초기화 실패. API 키를 확인해주세요. 유효한 Gemini API 키가 필요합니다.");
      }
    } else {
      setIsWizardAiInitialized(false); // Ensure AI is not considered initialized if key is removed/null
    }
  }, [wizardApiKey]);


  const handleSaveWizardApiKey = (key: string) => {
    if (key && key.trim() !== '') {
      localStorage.setItem(WIZARD_API_KEY_STORAGE_KEY, key);
      setWizardApiKey(key); // This will trigger the useEffect above to init AI
      setIsApiKeyModalOpen(false);
    } else {
      setError("유효한 API 키를 입력해주세요.");
    }
  };

  const clearErrorHandler = useCallback(() => setError(null), []);
  const setErrorHandler = useCallback((message: string) => setError(message), []);

  const handleGetAiDesign = useCallback(async () => {
    if (!isWizardAiInitialized) {
      setError('마법사 AI가 초기화되지 않았습니다. API 키를 먼저 설정해주세요.');
      setIsApiKeyModalOpen(true);
      return;
    }
    if (!projectName.trim() || !appDescription.trim()) {
      setError('프로젝트 이름과 앱 설명을 모두 입력해주세요.');
      return;
    }
    setIsLoadingAiDesign(true);
    setIsGlobalLoading(true);
    setError(null);
    setAiDesign(null);
    try {
      const design = await generateDesignProposal(projectName, appDescription);
      setAiDesign(design);
      setFinalSheetName(design.sheet_name);
      setFinalUiElementsString(design.ui_elements.join('\\n'));
    } catch (err) {
      console.error("Design generation failed:", err);
      setError(err instanceof Error ? err.message : 'AI 설계 제안에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoadingAiDesign(false);
      setIsGlobalLoading(false);
    }
  }, [projectName, appDescription, isWizardAiInitialized]);

  const handleDesignChange = useCallback((updatedDesign: AiDesignProposal) => {
    setAiDesign(updatedDesign);
    setFinalSheetName(updatedDesign.sheet_name);
    setFinalUiElementsString(updatedDesign.ui_elements.join('\\n'));
  }, []);

  const goToPhase2 = () => {
    if (!isWizardAiInitialized) {
      setError('마법사 AI가 초기화되지 않았습니다. API 키를 먼저 설정해주세요.');
      setIsApiKeyModalOpen(true);
      return;
    }
    if (!aiDesign) {
      setError('먼저 AI 설계를 받아 확정해주세요.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };
  
  const handleGenerateCode = useCallback(async () => {
    if (!isWizardAiInitialized) {
        setError('마법사 AI가 초기화되지 않았습니다. API 키를 먼저 설정해주세요.');
        setIsApiKeyModalOpen(true);
        return;
    }
    if (!aiDesign) {
        setError('AI 디자인 데이터가 없습니다. 1단계로 돌아가세요.');
        return;
    }
    if (!targetGeminiApiKey.trim() || !targetGoogleSheetId.trim()) {
        setError('생성될 앱의 Gemini API 키와 구글 시트 ID를 입력해주세요.');
        return;
    }

    setIsGeneratingCode(true);
    setIsGlobalLoading(true);
    setError(null);
    setGeneratedCode(null);

    const phase2Data: Phase2RequestData = {
      projectName,
      appDescription,
      targetGeminiApiKey,
      targetGeminiModel,
      targetGoogleSheetId,
      finalSheetName: finalSheetName || aiDesign.sheet_name,
      finalSheetFields: aiDesign.sheet_fields,
      finalUiElements: finalUiElementsString.split('\\n').map(s => s.trim()).filter(s => s),
      applyStylishDesign,
      includeResponsiveCss,
      otherRequests,
    };

    try {
      const code = await generateAppCode(phase2Data);
      setGeneratedCode(code);
    } catch (err) {
      console.error("Code generation failed:", err);
      setError(err instanceof Error ? err.message : '코드 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingCode(false);
      setIsGlobalLoading(false);
    }
  }, [
    projectName, appDescription, targetGeminiApiKey, targetGeminiModel, targetGoogleSheetId, 
    finalSheetName, aiDesign, finalUiElementsString, applyStylishDesign, 
    includeResponsiveCss, otherRequests, isWizardAiInitialized
  ]);

  const downloadZip = () => {
    if (!generatedCode || !projectName || !generatedCode.sheet_structure_txt || !generatedCode.claude_prompt_txt) return; 
    const zip = new JSZip();
    zip.file("Code.gs", generatedCode.code_gs);
    zip.file("index.html", generatedCode.index_html);
    zip.file("sheet_structure.txt", generatedCode.sheet_structure_txt);
    zip.file("claude_prompt.txt", generatedCode.claude_prompt_txt);
    
    zip.generateAsync({type:"blob"}).then((content: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${projectName.replace(/\\s+/g, '_')}_project.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
  };

  const restartWizard = () => {
    setCurrentStep(1);
    setProjectName('');
    setAppDescription('');
    setAiDesign(null);
    // setTargetGeminiApiKey(''); // Will be reset by wizardApiKey effect if wizardApiKey exists
    setTargetGeminiModel(DEFAULT_TARGET_GEMINI_MODEL);
    setTargetGoogleSheetId('');
    setFinalSheetName('');
    setFinalUiElementsString('');
    setApplyStylishDesign(true);
    setIncludeResponsiveCss(true);
    setOtherRequests('');
    setGeneratedCode(null);
    setError(null);
    setIsLoadingAiDesign(false);
    setIsGeneratingCode(false);
    setIsGlobalLoading(false);
    
    // API key state is not reset here, user might want to keep using the same key.
    // To force re-entry, they'd need to clear localStorage and refresh.
    // Or add a "Change Wizard API Key" button.
    if (!wizardApiKey) { // If there was no key to begin with, re-open modal.
        setIsApiKeyModalOpen(true);
    } else {
        // Re-initialize AI with existing key and update targetGeminiApiKey
        const success = initWizardAi(wizardApiKey);
        setIsWizardAiInitialized(success);
        if (success) {
            setTargetGeminiApiKey(wizardApiKey);
        } else {
            setError("마법사 AI 재초기화 실패. API 키를 확인해주세요.");
            setIsApiKeyModalOpen(true); // Prompt again if re-init fails
        }
    }
  };

  return (
    <>
      <GlobalLoadingOverlay isLoading={isGlobalLoading} />
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onSave={handleSaveWizardApiKey}
        // onClose={() => setIsApiKeyModalOpen(false)} // Typically save is the only way out
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 flex flex-col items-center p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
        <header className="w-full max-w-4xl mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">Google Script Wizard</h1>
          <p className="text-slate-400 mt-2 text-lg">AI의 도움으로 Google Apps Script 프로젝트를 손쉽게 만들어보세요!</p>
           {!isWizardAiInitialized && !isApiKeyModalOpen && (
            <p className="mt-2 text-yellow-400 bg-yellow-900/50 p-2 rounded-md border border-yellow-700">
              마법사 AI가 초기화되지 않았습니다. 페이지를 새로고침하거나 올바른 API 키를 제공해주세요.
            </p>
          )}
        </header>

        <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-300 border border-red-500 rounded-md">
              <p className="font-semibold">오류 발생:</p>
              <p>{error}</p>
              {error.includes("API 키") && 
                <button 
                  onClick={() => setIsApiKeyModalOpen(true)} 
                  className="mt-2 text-sm text-sky-400 hover:text-sky-300 underline">
                  API 키 다시 입력하기
                </button>
              }
            </div>
          )}

          {currentStep === 1 && (
            <Phase1Form
              projectName={projectName}
              setProjectName={setProjectName}
              appDescription={appDescription}
              setAppDescription={setAppDescription}
              onGetAiDesign={handleGetAiDesign}
              isLoadingAiDesign={isLoadingAiDesign}
              aiDesign={aiDesign}
              onDesignChange={handleDesignChange}
              onNextStep={goToPhase2}
              clearError={clearErrorHandler}
              setError={setErrorHandler}
              setIsGlobalLoading={setIsGlobalLoading}
              isWizardAiInitialized={isWizardAiInitialized} // Pass down
            />
          )}

          {currentStep === 2 && aiDesign && !generatedCode && (
            <Phase2Form
              targetGeminiApiKey={targetGeminiApiKey}
              setTargetGeminiApiKey={setTargetGeminiApiKey}
              targetGeminiModel={targetGeminiModel}
              setTargetGeminiModel={setTargetGeminiModel}
              targetGoogleSheetId={targetGoogleSheetId}
              setTargetGoogleSheetId={setTargetGoogleSheetId}
              finalSheetName={finalSheetName || aiDesign.sheet_name}
              setFinalSheetName={setFinalSheetName}
              finalUiElementsString={finalUiElementsString}
              setFinalUiElementsString={setFinalUiElementsString}
              applyStylishDesign={applyStylishDesign}
              setApplyStylishDesign={setApplyStylishDesign}
              includeResponsiveCss={includeResponsiveCss}
              setIncludeResponsiveCss={setIncludeResponsiveCss}
              otherRequests={otherRequests}
              setOtherRequests={setOtherRequests}
              onGenerateCode={handleGenerateCode}
              isLoading={isGeneratingCode}
              onBack={() => setCurrentStep(1)}
              isWizardAiInitialized={isWizardAiInitialized} // Pass down
            />
          )}
          
          {currentStep === 2 && generatedCode && (
            <CodeDisplay
              codeGs={generatedCode.code_gs}
              indexHtml={generatedCode.index_html}
              sheetStructureTxt={generatedCode.sheet_structure_txt}
              claudePromptTxt={generatedCode.claude_prompt_txt}
              onDownloadZip={downloadZip}
              onRestart={restartWizard}
            />
          )}
        </main>
        <footer className="mt-12 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} Google Script Wizard. AI의 힘을 빌려 창조하세요.</p>
        </footer>
      </div>
    </>
  );
};

export default App;