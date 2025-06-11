import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiDesignProposal, GeneratedCode, Phase2RequestData, GeminiDesignResponse, GeminiCodeResponse } from '../types';
import { WIZARD_GEMINI_MODEL, PHASE1_SYSTEM_PROMPT, PHASE2_SYSTEM_PROMPT, DESCRIPTION_GENERATION_SYSTEM_PROMPT } from '../constants';

let ai: GoogleGenAI | null = null;

/**
 * Initializes the Wizard's AI client with the provided API key.
 * @param apiKey The Gemini API key for the wizard.
 * @returns True if initialization was successful, false otherwise.
 */
export const initWizardAi = (apiKey: string): boolean => {
  if (!apiKey || apiKey.trim() === '') {
    console.error("Wizard AI: Attempted to initialize with an empty API key.");
    ai = null;
    return false;
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("Wizard AI: GoogleGenAI client initialized successfully.");
    return true;
  } catch (error) {
    console.error("Wizard AI: Failed to initialize GoogleGenAI client:", error);
    ai = null;
    return false;
  }
};

function parseJsonFromText(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  jsonStr = jsonStr.replace(/\\\$/g, '$');
  jsonStr = jsonStr.replace(/,\s*(?=}})$/, '');

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON string (after attempting fixes):", jsonStr, e);
    let errorContext = "";
    if (e instanceof SyntaxError && typeof e.message === 'string') {
        const positionMatch = e.message.match(/position (\d+)/);
        if (positionMatch && positionMatch[1]) {
            const errorPos = parseInt(positionMatch[1], 10);
            const contextChars = 100;
            const start = Math.max(0, errorPos - contextChars);
            const end = Math.min(jsonStr.length, errorPos + contextChars);
            errorContext = ` Context around error (pos ${errorPos}): "...${jsonStr.substring(start, end)}..."`;
        }
    }
    throw new Error(`AI 응답이 올바른 JSON 형식이 아닙니다 (수정 시도 후에도 실패). 응답 앞부분: ${jsonStr.substring(0,1000)}${errorContext}`);
  }
}

export const generateAppDescriptionFromIdea = async (idea: string): Promise<string> => {
  if (!ai) {
    console.error("Wizard AI (generateAppDescriptionFromIdea): AI client not initialized.");
    throw new Error("마법사 AI가 초기화되지 않았습니다. API 키를 설정하고 다시 시도해주세요.");
  }

  const userPrompt = `프로젝트 아이디어: ${idea}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: WIZARD_GEMINI_MODEL,
      contents: userPrompt, 
      config: {
        systemInstruction: DESCRIPTION_GENERATION_SYSTEM_PROMPT,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating app description:", error);
    if (error instanceof Error) {
      throw new Error(`앱 설명 생성 중 오류: ${error.message}`);
    }
    throw new Error("알 수 없는 오류로 앱 설명 생성에 실패했습니다.");
  }
};


export const generateDesignProposal = async (projectName: string, appDescription: string): Promise<AiDesignProposal> => {
  if (!ai) {
    console.error("Wizard AI (generateDesignProposal): AI client not initialized.");
    throw new Error("마법사 AI가 초기화되지 않았습니다. API 키를 설정하고 다시 시도해주세요.");
  }
  
  const userPrompt = `프로젝트 이름: ${projectName}\\n앱 설명: ${appDescription}`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: WIZARD_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: PHASE1_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    const design = parseJsonFromText(response.text) as GeminiDesignResponse;
    if (!design || !design.sheet_name || !Array.isArray(design.sheet_fields) || !Array.isArray(design.ui_elements)) {
        throw new Error("AI 응답에서 필요한 디자인 구조(sheet_name, sheet_fields, ui_elements)를 찾을 수 없습니다.");
    }
    return design;
  } catch (error) {
    console.error("Error generating design proposal:", error);
    if (error instanceof Error) {
        throw new Error(`디자인 제안 생성 중 오류: ${error.message}`);
    }
    throw new Error("알 수 없는 오류로 디자인 제안 생성에 실패했습니다.");
  }
};

export const generateAppCode = async (data: Phase2RequestData): Promise<GeneratedCode> => {
  if (!ai) {
    console.error("Wizard AI (generateAppCode): AI client not initialized.");
    throw new Error("마법사 AI가 초기화되지 않았습니다. API 키를 설정하고 다시 시도해주세요.");
  }

  const userPromptParts = [
    `프로젝트 이름: ${data.projectName}`,
    `원래 앱 설명: ${data.appDescription}`,
    `---`,
    `최종 구글 시트 이름: ${data.finalSheetName}`,
    `최종 구글 시트 필드 (헤더):\\n${data.finalSheetFields.map(f => `- ${f}`).join('\\n')}`,
    `---`,
    `최종 UI 요소 목록:\\n${data.finalUiElements.map(el => `- ${el}`).join('\\n')}`,
    `---`,
    `사용자 앱용 Gemini API 키: ${data.targetGeminiApiKey}`,
    `사용자 앱용 Gemini 모델: ${data.targetGeminiModel}`,
    `사용자 앱용 구글 시트 ID: ${data.targetGoogleSheetId}`,
    `---`,
    `추가 요청 사항:`,
    `- 최신 트렌드의 세련된 디자인 적용: ${data.applyStylishDesign ? '예' : '아니오'}`,
    `- 모바일 반응형 CSS 포함: ${data.includeResponsiveCss ? '예' : '아니오'}`,
    `${data.otherRequests ? `- 기타: ${data.otherRequests}` : ''}`
  ];
  const userPrompt = userPromptParts.join('\\n\\n');

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: WIZARD_GEMINI_MODEL, 
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: PHASE2_SYSTEM_PROMPT,
        responseMimeType: "application/json",
      }
    });

    const geminiCodeResponse = parseJsonFromText(response.text) as GeminiCodeResponse;
    if (!geminiCodeResponse || typeof geminiCodeResponse.code_gs !== 'string' || typeof geminiCodeResponse.index_html !== 'string') {
        throw new Error("AI 응답에서 필요한 코드 구조(code_gs, index_html)를 찾을 수 없습니다.");
    }

    const sheetStructureContent = `Sheet Name: ${data.finalSheetName}\n\nSheet Fields (Headers):\n${data.finalSheetFields.map(f => `- ${f}`).join('\n')}`;
    
    const claudePromptPart1 = `
1-1. 앱과 연동할 구글시트 및 화면 인터페이스 구성하기

자, 너는 지금부터 지상 최고의 구글 Apps Sciprt 웹 앱 개발자다!
이번에 새로운 프로젝트로 "${data.projectName}"을 만들려고 해.
앱 주요 기능과 사용자 흐름은 다음과 같아.

== [앱 설명] 시작 ==
${data.appDescription}
== [앱 설명] 끝 ==

데이터는 구글 시트에서 "${data.finalSheetName}" 시트 하나로 관리할 거야.
위와 같이 만들려면, 구글 시트의 필드와 화면 인터페이스는 어떻게 구성하면 좋을까?
머리글 순번으로 간략하게 알려줘.
    `.trim();

    const claudePromptPart2 = `
1-2. 앱 제작이 필요한 코드 작성하기

좋아. 너가 알려준 대로 아래와 같이 구성했어.
웹 앱 개발을 시작해보자. code.gs 와 index.html 코드를 각각 작성해줘.

== [백엔드 구성] 시작 ===
1. 사용할 외부 API
- Gemini API 키: ${data.targetGeminiApiKey || '(API 키 입력 필요)'}
- Gemini 모델: ${data.targetGeminiModel}

2. 구글 시트 구조
- 구글시트 ID: ${data.targetGoogleSheetId || '(구글 시트 ID 입력 필요)'}
- 시트명: ${data.finalSheetName}
- 필드 구조:
${data.finalSheetFields.map(f => `  - ${f}`).join('\n')}
== [백엔드 구성] 끝 ===

== [화면 인터페이스 구성] 시작 ==
${data.finalUiElements.map(el => `  - ${el}`).join('\n')}
== [화면 인터페이스 구성] 끝 ==

== [개발 환경 및 추가 요청] 시작 ==
- 모든 개발은 구글 Apps Script + HTML/CSS/JS 로 진행할거야.
- 최신 트렌드에 맞춰서 세련된 디자인으로 꾸며줘: ${data.applyStylishDesign ? '예' : '아니오'}
- 모바일에 대응할 수 있도록 반응형 CSS로 작성해: ${data.includeResponsiveCss ? '예' : '아니오'}
${data.otherRequests ? `- 기타: ${data.otherRequests}` : ''}
== [개발 환경 및 추가 요청] 끝 ==
    `.trim();

    const claudePromptContent = `${claudePromptPart1}\n\n\f\n\n${claudePromptPart2}`;

    return {
      code_gs: geminiCodeResponse.code_gs,
      index_html: geminiCodeResponse.index_html,
      sheet_structure_txt: sheetStructureContent,
      claude_prompt_txt: claudePromptContent
    } as GeneratedCode;

  } catch (error) {
    console.error("Error generating app code:", error);
     if (error instanceof Error) {
        throw new Error(`앱 코드 생성 중 오류: ${error.message}`);
    }
    throw new Error("알 수 없는 오류로 앱 코드 생성에 실패했습니다.");
  }
};