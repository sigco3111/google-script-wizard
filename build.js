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
    .items-center{align-items:center}
    .justify-center{justify-content:center}
    .bg-slate-800{--tw-bg-opacity:1;background-color:rgb(30 41 59 / var(--tw-bg-opacity))}
    .p-6{padding:1.5rem}
    .rounded-lg{border-radius:0.5rem}
    .shadow-lg{--tw-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-shadow)}
    .max-w-md{max-width:28rem}
    .w-full{width:100%}
    .text-xl{font-size:1.25rem;line-height:1.75rem}
    .font-semibold{font-weight:600}
    .mb-4{margin-bottom:1rem}
    .border{border-width:1px}
    .border-slate-600{--tw-border-opacity:1;border-color:rgb(71 85 105 / var(--tw-border-opacity))}
    .rounded{border-radius:0.25rem}
    .bg-slate-700{--tw-bg-opacity:1;background-color:rgb(51 65 85 / var(--tw-bg-opacity))}
    .bg-blue-600{--tw-bg-opacity:1;background-color:rgb(37 99 235 / var(--tw-bg-opacity))}
    .hover\\:bg-blue-700:hover{--tw-bg-opacity:1;background-color:rgb(29 78 216 / var(--tw-bg-opacity))}
    .py-2{padding-top:0.5rem;padding-bottom:0.5rem}
    .px-4{padding-left:1rem;padding-right:1rem}
    .font-medium{font-weight:500}
    .text-green-400{--tw-text-opacity:1;color:rgb(74 222 128 / var(--tw-text-opacity))}
    .text-red-400{--tw-text-opacity:1;color:rgb(248 113 113 / var(--tw-text-opacity))}
    .mt-8{margin-top:2rem}
    .text-sm{font-size:0.875rem;line-height:1.25rem}
    .text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128 / var(--tw-text-opacity))}
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
      
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
    </div>
  </div>

  <script>
    // 간단한 API 키 저장 기능
    document.addEventListener('DOMContentLoaded', function() {
      const form = document.getElementById('api-key-form');
      const input = document.getElementById('api-key-input');
      
      // localStorage에 API 키가 있는지 확인
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (storedKey) {
        // API 키가 있으면 간단한 성공 메시지 표시
        document.getElementById('root').innerHTML = \`
          <div class="container mx-auto p-4 max-w-6xl">
            <header class="mb-8">
              <h1 class="text-3xl font-bold text-center mb-2">Google Script Wizard</h1>
              <p class="text-center text-gray-400">
                Google Apps Script를 쉽게 생성하고 관리하세요
              </p>
            </header>
            
            <main>
              <div class="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                <h2 class="text-xl font-semibold mb-4">시작하기</h2>
                <p class="mb-4">
                  Google Apps Script Wizard에 오신 것을 환영합니다. 이 도구는 Google 앱스 스크립트 생성을 도와줍니다.
                </p>
                <div class="text-green-400">API 키가 설정되었습니다.</div>
              </div>
            </main>
            
            <footer class="mt-8 text-center text-gray-500 text-sm">
              <p>© 2025 Google Script Wizard</p>
            </footer>
          </div>
        \`;
      }
      
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        const apiKey = input.value.trim();
        
        if (apiKey) {
          localStorage.setItem('GEMINI_API_KEY', apiKey);
          // API 키 저장 후 페이지 새로고침
          window.location.reload();
        }
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