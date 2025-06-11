


import React, { useState, useCallback } from 'react';
import { AiDesignProposal, GeneratedCode, Phase2RequestData } from './types';
import { Phase1Form } from './components/Phase1Form';
import { Phase2Form } from './components/Phase2Form';
import { CodeDisplay } from './components/CodeDisplay';
import { GlobalLoadingOverlay } from './components/GlobalLoadingOverlay'; // Import GlobalLoadingOverlay
import { generateDesignProposal, generateAppCode } from './services/geminiService';
import { DEFAULT_TARGET_GEMINI_MODEL } from './constants';

// Declare JSZip for use with CDN
declare var JSZip: any;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Phase 1 state
  const [projectName, setProjectName] = useState<string>('');
  const [appDescription, setAppDescription] = useState<string>('');
  const [isLoadingAiDesign, setIsLoadingAiDesign] = useState<boolean>(false);
  const [aiDesign, setAiDesign] = useState<AiDesignProposal | null>(null);
  
  // Phase 2 state
  const [targetGeminiApiKey, setTargetGeminiApiKey] = useState<string>(process.env.API_KEY || '');
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
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false); // Global loading state

  const clearErrorHandler = useCallback(() => setError(null), []);
  const setErrorHandler = useCallback((message: string) => setError(message), []);

  const handleGetAiDesign = useCallback(async () => {
    if (!projectName.trim() || !appDescription.trim()) {
      setError('프로젝트 이름과 앱 설명을 모두 입력해주세요.');
      return;
    }
    setIsLoadingAiDesign(true);
    setIsGlobalLoading(true); // Start global loading
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
      setIsGlobalLoading(false); // End global loading
    }
  }, [projectName, appDescription]);

  const handleDesignChange = useCallback((updatedDesign: AiDesignProposal) => {
    setAiDesign(updatedDesign);
    setFinalSheetName(updatedDesign.sheet_name);
    setFinalUiElementsString(updatedDesign.ui_elements.join('\\n'));
  }, []);

  const goToPhase2 = () => {
    if (!aiDesign) {
      setError('먼저 AI 설계를 받아 확정해주세요.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };
  
  const handleGenerateCode = useCallback(async () => {
    if (!aiDesign) {
        setError('AI 디자인 데이터가 없습니다. 1단계로 돌아가세요.');
        return;
    }
    if (!targetGeminiApiKey.trim() || !targetGoogleSheetId.trim()) {
        setError('Gemini API 키와 구글 시트 ID를 입력해주세요.');
        return;
    }

    setIsGeneratingCode(true);
    setIsGlobalLoading(true); // Start global loading
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
      setIsGlobalLoading(false); // End global loading
    }
  }, [
    projectName, appDescription, targetGeminiApiKey, targetGeminiModel, targetGoogleSheetId, 
    finalSheetName, aiDesign, finalUiElementsString, applyStylishDesign, 
    includeResponsiveCss, otherRequests
  ]);

  const downloadZip = () => {
    if (!generatedCode || !projectName || !generatedCode.sheet_structure_txt || !generatedCode.claude_prompt_txt) return; 
    const zip = new JSZip();
    zip.file("Code.gs", generatedCode.code_gs);
    zip.file("index.html", generatedCode.index_html);
    zip.file("sheet_structure.txt", generatedCode.sheet_structure_txt);
    zip.file("claude_prompt.txt", generatedCode.claude_prompt_txt); // Add Claude prompt to zip
    
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
    setTargetGeminiApiKey(process.env.API_KEY || '');
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
    setIsGlobalLoading(false); // Reset global loading
  };

  return (
    <>
      <GlobalLoadingOverlay isLoading={isGlobalLoading} message="AI가 열심히 작업 중입니다... 잠시만 기다려주세요."/>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 flex flex-col items-center p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
        <header className="w-full max-w-4xl mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">Google Script Wizard</h1>
          <p className="text-slate-400 mt-2 text-lg">AI의 도움으로 Google Apps Script 프로젝트를 손쉽게 만들어보세요!</p>
        </header>

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
              setIsGlobalLoading={setIsGlobalLoading} // Pass down global loading setter
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
            />
          )}
          
          {currentStep === 2 && generatedCode && (
            <CodeDisplay
              codeGs={generatedCode.code_gs}
              indexHtml={generatedCode.index_html}
              sheetStructureTxt={generatedCode.sheet_structure_txt}
              claudePromptTxt={generatedCode.claude_prompt_txt} // Pass Claude prompt
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