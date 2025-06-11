

import React, { useState, useCallback, useEffect } from 'react';
import { AiDesignProposal, GeneratedCode, Phase2RequestData } from './types';
import { Phase1Form } from './components/Phase1Form';
import { Phase2Form } from './components/Phase2Form';
import { CodeDisplay } from './components/CodeDisplay';
import { GlobalLoadingOverlay } from './components/GlobalLoadingOverlay';
import { WizardApiKeyManager } from './components/WizardApiKeyManager'; // Import new manager
import { generateDesignProposal, generateAppCode, initWizardAi, generatePromptFilesOnly } from './services/geminiService';
import { DEFAULT_TARGET_GEMINI_MODEL } from './constants';

declare var JSZip: any;
const WIZARD_API_KEY_STORAGE_KEY = 'wizard_gemini_api_key';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const [wizardApiKey, setWizardApiKey] = useState<string | null>(null);
  const [isWizardAiInitialized, setIsWizardAiInitialized] = useState<boolean>(false);

  const [projectName, setProjectName] = useState<string>('');
  const [appDescription, setAppDescription] = useState<string>('');
  const [isLoadingAiDesign, setIsLoadingAiDesign] = useState<boolean>(false);
  const [aiDesign, setAiDesign] = useState<AiDesignProposal | null>(null);
  
  const [targetGeminiApiKey, setTargetGeminiApiKey] = useState<string>('');
  const [targetGeminiModel, setTargetGeminiModel] = useState<string>(DEFAULT_TARGET_GEMINI_MODEL);
  const [targetGoogleSheetId, setTargetGoogleSheetId] = useState<string>('');
  const [finalSheetName, setFinalSheetName] = useState<string>('');
  const [finalUiElementsString, setFinalUiElementsString] = useState<string>('');
  const [applyStylishDesign, setApplyStylishDesign] = useState<boolean>(true);
  const [includeResponsiveCss, setIncludeResponsiveCss] = useState<boolean>(true);
  const [otherRequests, setOtherRequests] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [isGeneratingPromptsOnly, setIsGeneratingPromptsOnly] = useState<boolean>(false); // New state
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);

  useEffect(() => {
    let key = (window as any).process?.env?.API_KEY || null;
    if (!key) {
      key = localStorage.getItem(WIZARD_API_KEY_STORAGE_KEY);
    }
    if (key) {
      // Don't call setWizardApiKey here directly to avoid loop with the next useEffect
      // Instead, call initWizardAi and then set the state
      const success = initWizardAi(key);
      setIsWizardAiInitialized(success);
      setWizardApiKey(key); // Store the key regardless of init success for display
      if (success) {
        setTargetGeminiApiKey(key);
      } else {
        setError("마법사 AI 초기화 실패. API 키를 확인해주세요. 유효한 Gemini API 키가 필요합니다.");
      }
    } else {
      setIsWizardAiInitialized(false); // No key found, AI not initialized.
      // User will be prompted by WizardApiKeyManager UI.
    }
  }, []); // Run only on mount

  const handleSaveWizardApiKey = useCallback((key: string) => {
    if (key && key.trim() !== '') {
      localStorage.setItem(WIZARD_API_KEY_STORAGE_KEY, key);
      const success = initWizardAi(key); // Attempt to initialize AI with the new key
      setIsWizardAiInitialized(success);
      setWizardApiKey(key); // Update state to reflect the new key
      if (success) {
        setTargetGeminiApiKey(key); // Update default Phase 2 key
        setError(null); // Clear previous errors
      } else {
        setError("마법사 AI 초기화 실패. API 키를 확인해주세요. 유효한 Gemini API 키가 필요합니다.");
      }
    } else {
      setError("유효한 API 키를 입력해주세요.");
      setIsWizardAiInitialized(false); // If key is empty, AI is not initialized
      setWizardApiKey(null); // Clear the key
    }
  }, []);

  const clearErrorHandler = useCallback(() => setError(null), []);
  const setErrorHandler = useCallback((message: string | null) => setError(message), []);


  const handleGetAiDesign = useCallback(async () => {
    if (!isWizardAiInitialized) {
      setError('마법사 AI가 초기화되지 않았습니다. API 키를 먼저 설정해주세요.');
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

  const handleGeneratePromptsOnly = useCallback(async () => {
    if (!isWizardAiInitialized) {
        setError('마법사 AI가 초기화되지 않았습니다. API 키를 먼저 설정해주세요.');
        return;
    }
    if (!aiDesign) {
        setError('AI 디자인 데이터가 없습니다. 1단계로 돌아가세요.');
        return;
    }
    if (!targetGeminiApiKey.trim() || !targetGoogleSheetId.trim()) {
        setError('생성될 앱의 Gemini API 키와 구글 시트 ID를 입력해주세요 (프롬프트 파일 내용에 영향을 줍니다).');
        return;
    }

    setIsGeneratingPromptsOnly(true);
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
      const promptFiles = await generatePromptFilesOnly(phase2Data);
      setGeneratedCode({
        sheet_structure_txt: promptFiles.sheet_structure_txt,
        claude_prompt_txt: promptFiles.claude_prompt_txt,
        // code_gs and index_html will be undefined
      });
    } catch (err) {
      console.error("Prompt files generation failed:", err);
      setError(err instanceof Error ? err.message : '프롬프트 파일 생성에 실패했습니다.');
    } finally {
      setIsGeneratingPromptsOnly(false);
      setIsGlobalLoading(false);
    }
  }, [
    projectName, appDescription, targetGeminiApiKey, targetGeminiModel, targetGoogleSheetId,
    finalSheetName, aiDesign, finalUiElementsString, applyStylishDesign,
    includeResponsiveCss, otherRequests, isWizardAiInitialized
  ]);


  const downloadZip = () => {
    if (!generatedCode || !projectName) return; 
    
    const zip = new JSZip();
    
    // These are guaranteed if generatedCode is not null and generation was successful.
    zip.file("sheet_structure.txt", generatedCode.sheet_structure_txt);
    zip.file("claude_prompt.txt", generatedCode.claude_prompt_txt);
    
    if (generatedCode.code_gs) {
      zip.file("Code.gs", generatedCode.code_gs);
    }
    if (generatedCode.index_html) {
      zip.file("index.html", generatedCode.index_html);
    }
    
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
    setIsGeneratingPromptsOnly(false); // Reset new loading state
    setIsGlobalLoading(false);
    
    // API key and AI initialization state are preserved.
    // If wizardApiKey exists, targetGeminiApiKey will be reset to it.
    if (wizardApiKey) {
        setTargetGeminiApiKey(wizardApiKey);
    } else {
        setTargetGeminiApiKey(''); // Clear if wizard key was also cleared/never set
    }
  };

  return (
    <>
      <GlobalLoadingOverlay isLoading={isGlobalLoading} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 flex flex-col items-center p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
        <header className="w-full max-w-4xl mb-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">구글 앱스크립트 마법사</h1>
          <p className="text-slate-400 mt-2 text-lg">AI의 도움으로 Google Apps Script 프로젝트를 손쉽게 만들어보세요!</p>
        </header>

        <div className="w-full max-w-4xl">
          <WizardApiKeyManager
            initialApiKey={wizardApiKey}
            onSaveApiKey={handleSaveWizardApiKey}
            isWizardAiInitialized={isWizardAiInitialized}
            clearGlobalError={clearErrorHandler}
            setGlobalError={setErrorHandler}
          />
        </div>
        
        <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-300 border border-red-500 rounded-md">
              <p className="font-semibold">오류 발생:</p>
              <p>{error}</p>
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
              isWizardAiInitialized={isWizardAiInitialized}
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
              isGeneratingCode={isGeneratingCode}
              onGeneratePromptsOnly={handleGeneratePromptsOnly} // Pass new handler
              isGeneratingPromptsOnly={isGeneratingPromptsOnly} // Pass new loading state
              onBack={() => setCurrentStep(1)}
              isWizardAiInitialized={isWizardAiInitialized}
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
          <p>&copy; {new Date().getFullYear()} 구글 앱스크립트 마법사. AI의 힘을 빌려 창조하세요.</p>
        </footer>
      </div>
    </>
  );
};

export default App;