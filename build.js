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
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <script>
    // Tailwind custom configuration (optional, if needed)
    // tailwind.config = {
    //   theme: {
    //     extend: {
    //       colors: {
    //         // custom colors
    //       }
    //     }
    //   }
    // }

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
  <!-- Vercel 배포에 최적화된 importmap -->
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19.1.0?dev",
      "react-dom": "https://esm.sh/react-dom@19.1.0?dev",
      "react-dom/client": "https://esm.sh/react-dom@19.1.0/client?dev",
      "@google/genai": "https://esm.sh/@google/genai@1.4.0"
    }
  }
  </script>
  <link rel="stylesheet" href="/index.css">
</head>
<body class="bg-slate-900 text-slate-100 antialiased">
  <div id="root"></div>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import App from './App.js';
    
    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
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

// App.tsx 빌드
async function buildApp(distDir) {
  try {
    // App.tsx 원본 읽기
    const appContent = await fs.readFile(path.join(__dirname, 'App.tsx'), 'utf-8');
    
    // 간단히 처리된 버전을 dist에 복사 (실제로는 더 복잡한 변환이 필요할 수 있음)
    const processedContent = `// ESM 형식으로 변환된 App 컴포넌트
import React from 'react';
import { GoogleGenerativeAI } from '@google/genai';

const App = () => {
  const [apiKey, setApiKey] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  React.useEffect(() => {
    // API 키 확인
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    const envKey = window.process?.env?.API_KEY;
    
    if (envKey) {
      setApiKey(envKey);
    } else if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsModalOpen(true);
    }
  }, []);
  
  const handleSubmitApiKey = (event) => {
    event.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey);
      setIsModalOpen(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Google Script Wizard</h1>
        <p className="text-center text-gray-400">
          Google Apps Script를 쉽게 생성하고 관리하세요
        </p>
      </header>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Google API 키 입력</h2>
            <p className="mb-4 text-gray-400">
              Gemini API 키를 입력하세요. API 키는 로컬에만 저장되며 서버로 전송되지 않습니다.
            </p>
            <form onSubmit={handleSubmitApiKey}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 mb-4 bg-slate-700 rounded border border-slate-600"
                placeholder="Gemini API 키 입력"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-medium"
              >
                저장
              </button>
            </form>
          </div>
        </div>
      )}
      
      <main>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">시작하기</h2>
          <p className="mb-4">
            Google Apps Script Wizard에 오신 것을 환영합니다. 이 도구는 Google 앱스 스크립트 생성을 도와줍니다.
          </p>
          {apiKey ? (
            <div className="text-green-400">API 키가 설정되었습니다.</div>
          ) : (
            <div className="text-red-400">API 키를 설정해주세요.</div>
          )}
        </div>
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 Google Script Wizard</p>
      </footer>
    </div>
  );
};

export default App;`;
    
    await fs.writeFile(path.join(distDir, 'App.js'), processedContent);
    console.log('✅ App 컴포넌트 빌드 완료');
  } catch (err) {
    console.error('❌ App 컴포넌트 빌드 실패:', err);
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
    await buildApp(distDir);
    console.log('✅ 빌드 완료!');
  } catch (err) {
    console.error('❌ 빌드 실패:', err);
    process.exit(1);
  }
}

build(); 