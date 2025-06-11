import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 빌드 디렉토리 생성
async function createBuildDir() {
  const distDir = path.join(__dirname, 'dist');
  try {
    await fs.mkdir(distDir, { recursive: true });
    console.log('✅ 빌드 디렉토리 생성 완료');
    return distDir;
  } catch (err) {
    console.error('❌ 빌드 디렉토리 생성 실패:', err);
    throw err;
  }
}

// 정적 파일 복사
async function copyStaticFiles(distDir) {
  try {
    // favicon.svg 복사
    await fs.copyFile(
      path.join(__dirname, 'favicon.svg'),
      path.join(distDir, 'favicon.svg')
    );
    
    // index.css 복사
    await fs.copyFile(
      path.join(__dirname, 'index.css'),
      path.join(distDir, 'index.css')
    );
    
    console.log('✅ 정적 파일 복사 완료');
  } catch (err) {
    console.error('❌ 정적 파일 복사 실패:', err);
    throw err;
  }
}

// HTML 생성
async function generateHTML(distDir) {
  try {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Script Wizard</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <meta name="theme-color" content="#4285F4">
  
  <!-- Tailwind CSS 직접 포함 -->
  <style>
    /* Tailwind의 기본 스타일 */
    *, ::before, ::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
    html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}
    body{margin:0;line-height:inherit}
    .bg-slate-900{--tw-bg-opacity:1;background-color:rgb(15 23 42 / var(--tw-bg-opacity))}
    .text-slate-100{--tw-text-opacity:1;color:rgb(241 245 249 / var(--tw-text-opacity))}
    .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    .container{width:100%}
    .mx-auto{margin-left:auto;margin-right:auto}
    .p-4{padding:1rem}
    .max-w-6xl{max-width:72rem}
    .mb-8{margin-bottom:2rem}
    .text-3xl{font-size:1.875rem;line-height:2.25rem}
    .font-bold{font-weight:700}
    .text-center{text-align:center}
    .mb-2{margin-bottom:0.5rem}
    .text-gray-400{--tw-text-opacity:1;color:rgb(156 163 175 / var(--tw-text-opacity))}
    .fixed{position:fixed}
    .inset-0{top:0;right:0;bottom:0;left:0}
    .bg-black{--tw-bg-opacity:1;background-color:rgb(0 0 0 / var(--tw-bg-opacity))}
    .bg-opacity-50{--tw-bg-opacity:0.5}
    .flex{display:flex}
    .flex-col{flex-direction:column}
    .items-center{align-items:center}
    .justify-center{justify-content:center}
    .justify-between{justify-content:space-between}
    .bg-slate-800{--tw-bg-opacity:1;background-color:rgb(30 41 59 / var(--tw-bg-opacity))}
    .p-6{padding:1.5rem}
    .rounded-lg{border-radius:0.5rem}
    .shadow-lg{--tw-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-shadow)}
    .max-w-md{max-width:28rem}
    .w-full{width:100%}
    .text-xl{font-size:1.25rem;line-height:1.75rem}
    .font-semibold{font-weight:600}
    .mb-4{margin-bottom:1rem}
    .mb-6{margin-bottom:1.5rem}
    .border{border-width:1px}
    .border-slate-600{--tw-border-opacity:1;border-color:rgb(71 85 105 / var(--tw-border-opacity))}
    .rounded{border-radius:0.25rem}
    .bg-slate-700{--tw-bg-opacity:1;background-color:rgb(51 65 85 / var(--tw-bg-opacity))}
    .bg-blue-600{--tw-bg-opacity:1;background-color:rgb(37 99 235 / var(--tw-bg-opacity))}
    .bg-indigo-600{--tw-bg-opacity:1;background-color:rgb(79 70 229 / var(--tw-bg-opacity))}
    .hover\\:bg-blue-700:hover{--tw-bg-opacity:1;background-color:rgb(29 78 216 / var(--tw-bg-opacity))}
    .hover\\:bg-indigo-700:hover{--tw-bg-opacity:1;background-color:rgb(67 56 202 / var(--tw-bg-opacity))}
    .py-2{padding-top:0.5rem;padding-bottom:0.5rem}
    .px-4{padding-left:1rem;padding-right:1rem}
    .font-medium{font-weight:500}
    .text-green-400{--tw-text-opacity:1;color:rgb(74 222 128 / var(--tw-text-opacity))}
    .text-red-400{--tw-text-opacity:1;color:rgb(248 113 113 / var(--tw-text-opacity))}
    .mt-8{margin-top:2rem}
    .mt-4{margin-top:1rem}
    .mt-2{margin-top:0.5rem}
    .ml-2{margin-left:0.5rem}
    .text-sm{font-size:0.875rem;line-height:1.25rem}
    .text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128 / var(--tw-text-opacity))}
    .space-y-4 > :not([hidden]) ~ :not([hidden]) {--tw-space-y-reverse: 0;margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));margin-bottom: calc(1rem * var(--tw-space-y-reverse));}
    .text-blue-400{--tw-text-opacity:1;color:rgb(96 165 250 / var(--tw-text-opacity))}
    .text-2xl{font-size:1.5rem;line-height:2rem}
    .grid{display:grid}
    .grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
    .gap-4{gap:1rem}
    .py-3{padding-top:0.75rem;padding-bottom:0.75rem}
    .text-left{text-align:left}
    .hidden{display:none}
    .resize-none{resize:none}
    .h-32{height:8rem}
    .cursor-pointer{cursor:pointer}
    .overflow-auto{overflow:auto}
    .pre{white-space:pre;font-family:monospace}
    @media (min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
  </style>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script>
    // --- API KEY Handling Example ---
    // 개발 환경에서 직접 API 키를 설정하거나,
    // 또는 이 Wizard를 호스팅하는 환경에서 아래와 같이 전역으로 API_KEY를 주입할 수 있습니다.
    // 이 Wizard 앱 자체를 실행하기 위한 Gemini API 키입니다.
    // 실제 프로덕션 환경에서는 이 키를 클라이언트에 직접 노출하는 것보다
    // 백엔드를 통해 API를 호출하는 것이 보안상 권장됩니다.
    /*
    window.process = {
      env: {
        API_KEY: 'YOUR_WIZARD_GEMINI_API_KEY_HERE' // 여기에 Wizard용 API 키를 넣으세요.
      }
    };
    */
    // 만약 위와 같이 설정하지 않으면, 앱 시작 시 localStorage를 확인하고,
    // 없으면 사용자에게 직접 입력받는 모달이 나타납니다.
  </script>
  <script src="https://unpkg.com/react@19.1.0/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@19.1.0/umd/react-dom.production.min.js"></script>
  <link rel="stylesheet" href="/index.css">
</head>
<body class="bg-slate-900 text-slate-100 antialiased">
  <div id="root">
    <!-- 초기 로딩 UI -->
    <div class="container mx-auto p-4 max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-center mb-2">Google Script Wizard</h1>
        <p class="text-center text-gray-400">
          Google Apps Script를 쉽게 생성하고 관리하세요
        </p>
      </header>
      
      <div id="api-key-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-xl font-semibold mb-4">Google API 키 입력</h2>
          <p class="mb-4 text-gray-400">
            Gemini API 키를 입력하세요. API 키는 로컬에만 저장되며 서버로 전송되지 않습니다.
          </p>
          <form id="api-key-form">
            <input
              type="password"
              id="api-key-input"
              class="w-full p-2 mb-4 bg-slate-700 rounded border border-slate-600"
              placeholder="Gemini API 키 입력"
              required
            />
            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-medium"
            >
              저장
            </button>
          </form>
        </div>
      </div>

      <!-- 메인 앱 UI (초기에는 숨김) -->
      <div id="app-content" class="hidden">
        <h2 class="text-2xl text-blue-400 font-bold mb-4">AI의 도움으로 Google Apps Script 프로젝트를 손쉽게 만들어보세요!</h2>
        
        <div class="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
          <h3 class="text-xl font-semibold mb-4">Step 1: 만들고 싶은 앱을 설명해주세요.</h3>
          <p class="text-gray-400 mb-4">아이디어를 구체적인 설계로 변환하는 단계입니다.</p>
          
          <div class="space-y-4">
            <div>
              <label for="project-name" class="block mb-2">프로젝트 이름 <span class="text-red-400">*</span></label>
              <input 
                type="text" 
                id="project-name" 
                class="w-full p-2 bg-slate-700 rounded border border-slate-600"
                placeholder="예: AI 음식 분석 앱"
              >
            </div>
            
            <div>
              <label for="project-description" class="block mb-2">앱의 주요 기능과 사용자 흐름을 자유롭게 설명해주세요 <span class="text-red-400">*</span></label>
              <div class="flex justify-between mb-2">
                <button id="ai-suggestion-btn" class="bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded font-medium text-sm">
                  AI로 기능설명 받기
                </button>
              </div>
              <textarea 
                id="project-description" 
                class="w-full p-2 bg-slate-700 rounded border border-slate-600 h-32 resize-none"
                placeholder="예: 사용자가 사진을 올리면 AI가 분석하고 그 결과를 Google Sheet에 저장하는 웹앱니다. 주요 기능과 사용자의 앱 사용 순서를 설명해주세요."
              ></textarea>
            </div>
            
            <div class="flex">
              <button id="generate-script-btn" class="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-medium">
                AI 스크립트 생성 받기
              </button>
            </div>
          </div>
        </div>
        
        <!-- 결과 섹션 -->
        <div id="result-section" class="hidden bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
          <h3 class="text-xl font-semibold mb-4">생성된 Google Apps Script</h3>
          <div class="mb-4">
            <pre id="script-result" class="bg-slate-700 p-4 rounded overflow-auto"></pre>
          </div>
          <button id="download-script-btn" class="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-medium">
            스크립트 다운로드 (.gs)
          </button>
        </div>
      </div>
    </div>
    
    <footer class="mt-8 text-center text-gray-500 text-sm">
      <p>© 2025 Google Script Wizard. AI의 힘을 믿고 창조하세요.</p>
    </footer>
  </div>

  <script>
    // API 키 관리 및 앱 초기화
    document.addEventListener('DOMContentLoaded', function() {
      const apiKeyModal = document.getElementById('api-key-modal');
      const apiKeyForm = document.getElementById('api-key-form');
      const apiKeyInput = document.getElementById('api-key-input');
      const appContent = document.getElementById('app-content');
      const generateScriptBtn = document.getElementById('generate-script-btn');
      const resultSection = document.getElementById('result-section');
      const scriptResult = document.getElementById('script-result');
      const downloadScriptBtn = document.getElementById('download-script-btn');
      const aiSuggestionBtn = document.getElementById('ai-suggestion-btn');
      const projectNameInput = document.getElementById('project-name');
      const projectDescriptionInput = document.getElementById('project-description');
      
      // localStorage에 API 키가 있는지 확인
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (storedKey) {
        // API 키가 있으면 모달 숨기고 앱 내용 표시
        apiKeyModal.classList.add('hidden');
        appContent.classList.remove('hidden');
      }
      
      // API 키 저장 폼 제출 처리
      apiKeyForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey) {
          localStorage.setItem('GEMINI_API_KEY', apiKey);
          apiKeyModal.classList.add('hidden');
          appContent.classList.remove('hidden');
        }
      });

      // AI로 기능설명 받기 버튼 클릭 처리
      aiSuggestionBtn.addEventListener('click', function() {
        const projectName = projectNameInput.value.trim();
        
        if (!projectName) {
          alert('프로젝트 이름을 먼저 입력해주세요.');
          return;
        }
        
        // 버튼 상태 변경
        aiSuggestionBtn.textContent = '생성 중...';
        aiSuggestionBtn.disabled = true;
        
        // 실제로는 여기서 Gemini API를 호출해야 하지만, 간단한 데모를 위해 예시 설명 생성
        setTimeout(() => {
          const apiKey = localStorage.getItem('GEMINI_API_KEY');
          // 실제 앱에서는 여기서 apiKey를 사용하여 Gemini API 호출
          
          // 프로젝트 이름에 따른 예시 설명 생성
          let description = '';
          
          if (projectName.toLowerCase().includes('음식') || projectName.toLowerCase().includes('요리')) {
            description = '이 앱은 사용자가 음식 사진을 업로드하면 AI가 분석하여 음식 종류, 칼로리, 영양소 정보를 제공합니다. 분석된 데이터는 Google 스프레드시트에 자동으로 저장되어 사용자의 식단 기록을 관리합니다. 주요 기능으로는 1) 이미지 인식을 통한 음식 분석, 2) 영양정보 제공, 3) 식단 기록 관리, 4) 주간/월간 리포트 생성이 있습니다.';
          } else if (projectName.toLowerCase().includes('일정') || projectName.toLowerCase().includes('스케줄')) {
            description = '이 앱은 Google 캘린더와 연동하여 사용자의 일정을 관리합니다. 자연어 처리를 통해 사용자가 간단히 텍스트로 입력한 일정을 분석하여 자동으로 캘린더에 등록합니다. 주요 기능으로는 1) 자연어 일정 입력, 2) 일정 자동 분류, 3) 알림 설정, 4) 반복 일정 관리, 5) 팀원과 일정 공유 기능이 있습니다.';
          } else if (projectName.toLowerCase().includes('학습') || projectName.toLowerCase().includes('교육')) {
            description = '이 앱은 학생들의 학습 진도와 성과를 추적하는 교육용 도구입니다. 교사가 학생별 과제를 할당하고, 제출된 과제를 평가하며, 학습 데이터를 분석하여 맞춤형 피드백을 제공합니다. 주요 기능으로는 1) 과제 생성 및 할당, 2) 자동 채점, 3) 학습 분석 대시보드, 4) 개인별 학습 추천, 5) 학부모 연계 보고서 생성이 있습니다.';
          } else {
            description = projectName + ' 앱은 사용자의 업무 효율을 높이기 위한 Google Workspace 통합 솔루션입니다. 데이터 수집, 처리, 분석 과정을 자동화하여 업무 시간을 절약해줍니다. 주요 기능으로는 1) 데이터 자동 수집 및 정리, 2) 사용자 정의 보고서 생성, 3) 알림 및 트리거 설정, 4) 스프레드시트와 문서 간 데이터 연동, 5) 팀 협업 기능이 있습니다. 사용자는 간단한 설정만으로 복잡한 작업을 자동화할 수 있습니다.';
          }
          
          // 설명 입력 필드에 추가
          projectDescriptionInput.value = description;
          
          // 버튼 상태 복구
          aiSuggestionBtn.textContent = 'AI로 기능설명 받기';
          aiSuggestionBtn.disabled = false;
        }, 1500);
      });
      
      // 스크립트 생성 버튼 클릭 처리
      generateScriptBtn.addEventListener('click', function() {
        const projectName = projectNameInput.value.trim();
        const projectDescription = projectDescriptionInput.value.trim();
        
        if (!projectName || !projectDescription) {
          alert('프로젝트 이름과 설명을 모두 입력해주세요.');
          return;
        }
        
        // 로딩 상태 표시
        generateScriptBtn.textContent = '생성 중...';
        generateScriptBtn.disabled = true;
        
        // 실제로는 여기서 Gemini API를 호출해야 하지만, 간단한 데모를 위해 예시 코드 생성
        setTimeout(() => {
          const apiKey = localStorage.getItem('GEMINI_API_KEY');
          // 실제 앱에서는 여기서 apiKey를 사용하여 Gemini API 호출
          
          // 예시 스크립트 생성 - 문자열로 처리
          const scriptDate = new Date().toLocaleDateString();
          const exampleScript = 
\`/**
 * \${projectName}
 * 설명: \${projectDescription}
 * 생성일: \${new Date().toLocaleDateString()}
 */

// 전역 변수 설정
const SHEET_NAME = '데이터';

/**
 * 앱이 시작될 때 실행되는 함수
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('AI 앱')
    .addItem('분석 시작', 'showSidebar')
    .addToUi();
}

/**
 * 사이드바를 표시하는 함수
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('AI 분석 도구')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * 데이터를 처리하는 함수
 * @param {Object} data - 처리할 데이터 객체
 * @return {Object} 처리 결과
 */
function processData(data) {
  // 여기에 데이터 처리 로직 추가
  const sheet = getOrCreateSheet();
  const result = analyzeData(data);
  saveToSheet(sheet, result);
  return result;
}

/**
 * 시트를 가져오거나 생성하는 함수
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // 헤더 설정
    sheet.appendRow(['날짜', '입력 데이터', '분석 결과']);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * 데이터를 분석하는 함수
 */
function analyzeData(data) {
  // 실제 분석 로직 구현
  return {
    timestamp: new Date().toISOString(),
    input: data,
    result: '분석 결과: ' + JSON.stringify(data)
  };
}

/**
 * 데이터를 시트에 저장하는 함수
 */
function saveToSheet(sheet, data) {
  sheet.appendRow([
    new Date(),
    JSON.stringify(data.input),
    data.result
  ]);
}
\`.replace(/\${projectName}/g, projectName)
  .replace(/\${projectDescription}/g, projectDescription)
  .replace(/\${new Date\(\)\.toLocaleDateString\(\)}/g, scriptDate);

          // 결과 표시
          scriptResult.textContent = exampleScript;
          resultSection.classList.remove('hidden');
          
          // 버튼 상태 복구
          generateScriptBtn.textContent = 'AI 스크립트 생성 받기';
          generateScriptBtn.disabled = false;
          
          // 다운로드 버튼 설정
          downloadScriptBtn.onclick = function() {
            const blob = new Blob([exampleScript], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.gs';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };
        }, 2000); // 2초 지연으로 로딩 효과
      });
    });
  </script>
</body>
</html>`;

    await fs.writeFile(path.join(distDir, 'index.html'), htmlContent);
    console.log('✅ HTML 파일 생성 완료');
  } catch (err) {
    console.error('❌ HTML 파일 생성 실패:', err);
    throw err;
  }
}

// 메인 빌드 프로세스
async function build() {
  console.log('🚀 빌드 시작...');
  try {
    const distDir = await createBuildDir();
    await copyStaticFiles(distDir);
    await generateHTML(distDir);
    console.log('✅ 빌드 완료!');
  } catch (err) {
    console.error('❌ 빌드 실패:', err);
    process.exit(1);
  }
}

build(); 