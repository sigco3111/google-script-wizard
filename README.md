
# Google Script Wizard

## 소개 (Introduction)

Google Script Wizard는 자연어 앱 아이디어를 입력받아, Google Apps Script 프로젝트를 위한 데이터 구조 설계(Google Sheets) 및 UI 요소 제안을 AI(Google Gemini API)를 통해 받고, 최종적으로 `Code.gs`와 `index.html` 파일을 생성해주는 단계별 마법사 도구입니다. 복잡한 설정 없이 빠르게 프로토타입을 만들거나, Apps Script 개발의 시작점으로 활용할 수 있습니다.

https://www.oppadu.com/ai-apps-script-10min/ 이 사이트에서 영감을 받아 만들었습니다.

<span style="color:green">**생성한 Code.gs와 index.html에 문제가 있거나 규모가 큰 프로젝트라면, 생성된 산출물 중 claude_prompt.txt를 이용해 클로드나 구글AI스튜디오를 통해 생성하시면 됩니다.**</span>

실행 주소 : https://dev-canvas-pi.vercel.app/

## 주요 기능 (Key Features)

*   **자연어 기반 아이디어 입력:** 만들고 싶은 앱에 대한 설명을 간단한 자연어로 입력합니다. <span style="color:green">(앱 제목만으로 생성 가능)</span>
*   **AI 기반 설계 제안:** Google Gemini API를 사용하여 앱 아이디어에 맞는 Google Sheet 데이터 구조(시트명, 필드)와 기본적인 화면 UI 요소들을 제안받습니다.
*   **사용자 수정 가능:** AI가 제안한 설계를 사용자가 직접 검토하고 필요에 따라 수정할 수 있습니다.
*   **코드 자동 생성:** 확정된 설계를 바탕으로 Google Apps Script용 `Code.gs` (백엔드 로직) 및 `index.html` (프론트엔드 UI, Tailwind CSS 및 인라인 JavaScript 포함) 파일을 자동으로 생성합니다.
*   **시트 구조 참조 파일 생성:** 생성된 앱이 사용할 Google 시트의 구조(`sheet_structure.txt`)를 별도 파일로 제공하여 참조하기 쉽도록 합니다.
*   **Claude 프롬프트 생성:** 마법사 과정을 통해 수집된 정보를 바탕으로, Claude와 같은 다른 AI 모델에 사용하여 프로젝트를 확장하거나 개선하는 데 도움이 될 수 있는 프롬프트(`claude_prompt.txt`)를 생성합니다.
*   **ZIP 파일 다운로드:** 생성된 모든 파일(`Code.gs`, `index.html`, `sheet_structure.txt`, `claude_prompt.txt`)을 한 번에 .zip 파일로 다운로드할 수 있습니다.
*   **디자인 및 반응형 옵션:** 생성되는 HTML 파일에 세련된 디자인(Tailwind CSS)을 적용하고, 모바일 반응형 CSS를 포함할지 여부를 선택할 수 있습니다.

## 작동 방식 (How It Works)

Google Script Wizard는 두 단계로 구성됩니다.

### Phase 1: 아이디어 구체화 및 AI 설계 제안

1.  **프로젝트 정보 입력:** 사용자는 "프로젝트 이름"과 "앱의 주요 기능 및 사용자 흐름"을 입력합니다.
    *   프로젝트 이름만 입력하고 "AI로 기능 설명 생성" 버튼을 통해 앱 설명을 자동으로 생성할 수도 있습니다.
2.  **AI 설계 제안 요청:** 입력된 정보를 바탕으로 "AI 설계 제안 받기" 버튼을 클릭합니다.
3.  **설계 검토 및 수정:** 마법사는 Google Gemini API를 호출하여 최적의 Google Sheet 구조(시트명, 필드 구성)와 앱의 핵심 UI 요소들을 제안합니다. 사용자는 이 제안을 검토하고 필요한 부분을 직접 수정할 수 있습니다.
4.  **다음 단계로 이동:** 설계가 만족스러우면 "이 설계로 코드 생성하기" 버튼을 눌러 2단계로 진행합니다.

### Phase 2: 세부 설정 및 코드 생성

1.  **세부 정보 입력:**
    *   **생성될 앱의 Gemini API 키:** 생성될 Google Apps Script 웹 앱이 자체적으로 Gemini API를 사용해야 할 경우 필요한 API 키입니다.
    *   **생성될 앱의 Gemini 모델:** 생성될 앱에서 사용할 Gemini 모델명 (예: `gemini-2.5-flash-preview-04-17`).
    *   **생성될 앱의 Google 시트 ID:** 생성될 앱이 데이터를 읽고 쓸 Google 스프레드시트의 ID.
    *   1단계에서 확정된 시트명과 UI 요소 목록을 최종 확인하고 필요시 수정합니다.
2.  **추가 요청 선택:**
    *   세련된 디자인 적용 여부 (Tailwind CSS 활용).
    *   모바일 반응형 CSS 포함 여부.
    *   기타 개발 관련 요청사항 입력.
3.  **코드 생성 요청:** "마법으로 코드 생성하기" 버튼을 클릭합니다.
4.  **결과 확인:** 마법사는 Gemini API를 다시 호출하여 입력된 모든 정보를 바탕으로 `Code.gs`, `index.html`, `sheet_structure.txt`, `claude_prompt.txt` 파일을 생성하여 화면에 표시합니다.

## 기술 스택 (Tech Stack)

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI:** Google Gemini API (마법사 자체는 `gemini-2.5-flash-preview-04-17` 모델 사용)
*   **Packaging:** JSZip (클라이언트 측에서 .zip 파일 생성)

## 사용 방법 (Getting Started)

1.  **사전 준비:**
    *   **Google Gemini API 키:**
        *   **마법사 자체용 API 키 (Wizard's Own API Key):** 이 Google Script Wizard 애플리케이션을 실행하고 AI 기능을 사용하려면, 애플리케이션 실행 환경에 `process.env.API_KEY`로 유효한 Gemini API 키가 설정되어 있어야 합니다. 이 키는 마법사가 AI 설계 제안 및 코드 생성을 위해 Google Gemini API와 통신하는 데 사용됩니다. (현재 이 애플리케이션 구조에서는 브라우저에서 직접 API를 호출하므로, 이 키는 `index.html` 내 `process.env.API_KEY`를 통해 접근 가능해야 합니다. 실제 배포 시에는 보안을 위해 백엔드를 통해 API를 호출하는 것이 권장됩니다.)
        *   **생성될 앱용 API 키 (Target App's API Key):** 마법사의 2단계 "세부 정보 입력" 화면에서 "생성될 앱의 Gemini API 키" 필드에 입력하는 키입니다. 이 키는 마법사가 생성하는 `Code.gs` 파일 내에 포함될 수 있으며, 최종적으로 만들어진 Google Apps Script 웹 앱이 자체적으로 Gemini API를 호출해야 할 경우 사용됩니다. Google AI Studio 등에서 발급받을 수 있습니다.
    *   **Google Sheet ID (생성될 앱용):** 생성될 앱이 데이터를 저장하고 읽어올 Google 스프레드시트의 ID입니다. 새 시트를 만들고 해당 시트의 URL에서 ID 부분을 복사하여 준비합니다. (예: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`)

2.  **마법사 실행:**
    *   웹 브라우저에서 Google Script Wizard 애플리케이션을 엽니다.

3.  **1단계: 아이디어 입력 및 AI 설계 받기**
    *   "프로젝트 이름"을 입력합니다. (예: "해외 여행 가이드 앱")
    *   "앱의 주요 기능과 사용자 흐름을 자유롭게 설명해주세요"란에 만들고 싶은 앱에 대해 상세히 기술합니다. 또는 프로젝트 이름 입력 후 "AI로 기능 설명 생성" 버튼을 클릭하여 설명을 자동 생성할 수 있습니다.
    *   "AI 설계 제안 받기" 버튼을 클릭합니다.
    *   AI가 제안한 "구글 시트 구조" (시트명, 필드)와 "화면 인터페이스 구성" (UI 요소)을 확인하고, 필요한 경우 직접 수정합니다.
    *   설계가 확정되면 "이 설계로 코드 생성하기 (Step 2로 이동)" 버튼을 클릭합니다.

4.  **2단계: 세부 정보 입력 및 코드 생성**
    *   앞서 준비한 "생성될 앱의 Gemini API 키", "생성될 앱의 Gemini 모델" (기본값 확인 또는 변경), "생성될 앱의 Google 시트 ID"를 정확히 입력합니다.
    *   1단계에서 확정된 "시트명"과 "UI 요소 목록"을 최종 확인하고 필요하다면 수정합니다. (UI 요소 목록은 한 줄에 하나의 요소를 설명합니다.)
    *   "추가 요청" 섹션에서 "최신 트렌드의 세련된 디자인 적용", "모바일 반응형 CSS 포함" 옵션을 선택하고, "기타 요청사항"이 있다면 입력합니다.
    *   "🔥 마법으로 코드 생성하기" 버튼을 클릭합니다.

5.  **결과 확인 및 다운로드**
    *   잠시 후, 생성된 `Code.gs`, `index.html`, `sheet_structure.txt`, `claude_prompt.txt` 파일의 내용이 화면에 표시됩니다.
    *   각 코드 블록의 복사 버튼을 사용하여 내용을 클립보드에 복사할 수 있습니다.
    *   "프로젝트 (.gs, .html, sheet_structure.txt, claude_prompt.txt) .zip으로 다운로드" 버튼을 클릭하여 모든 생성 파일을 한 번에 다운로드합니다.

6.  **Google Apps Script 프로젝트에 적용:**
    *   다운로드한 `Code.gs`와 `index.html` 파일의 내용을 Google Drive에서 새로 만든 Apps Script 프로젝트에 각각 복사하여 붙여넣습니다.
    *   `sheet_structure.txt` 파일의 내용을 참고하여 Google 스프레드시트의 시트명과 헤더(필드)를 구성합니다.
    *   Apps Script 편집기에서 `doGet` 함수를 실행하거나 웹 앱으로 배포하여 권한을 부여하고 테스트합니다. (Google Sheets 접근, 외부 API 호출 등에 대한 권한 필요)

## 생성되는 파일 (Generated Files)

*   **`Code.gs`**: Google Apps Script의 서버 사이드 로직을 담고 있는 파일입니다. Google Sheet와의 데이터 연동, 외부 API 호출 등의 함수가 포함됩니다.
*   **`index.html`**: 웹 앱의 사용자 인터페이스(UI)를 구성하는 HTML 파일입니다. Tailwind CSS를 사용한 스타일과 클라이언트 사이드 JavaScript 로직이 `<script>` 태그 내에 포함될 수 있습니다.
*   **`sheet_structure.txt`**: 생성된 앱이 사용할 Google 시트의 이름과 필드(헤더) 구조를 명시한 텍스트 파일입니다. 실제 Google Sheet를 구성할 때 참조용으로 사용됩니다.
    ```
    Sheet Name: [AI가 제안하거나 사용자가 수정한 시트명]

    Sheet Fields (Headers):
    - [필드1 설명 (예: Timestamp (요청 시간))]
    - [필드2 설명 (예: UserQuery (사용자 질문))]
    ...
    ```
*   **`claude_prompt.txt`**: 마법사 1, 2단계에서 수집된 정보를 바탕으로 구성된, Claude와 같은 다른 LLM(Large Language Model)에 활용할 수 있는 프롬프트입니다. 이 프롬프트를 사용하여 프로젝트 아이디어를 더 발전시키거나, 코드/디자인을 다른 관점에서 재생성/개선하는 데 활용할 수 있습니다. 예시 구조는 다음과 같습니다:

    ```
    1-1. 앱과 연동할 구글시트 및 화면 인터페이스 구성하기

    자, 너는 지금부터 지상 최고의 구글 Apps Sciprt 웹 앱 개발자다!
    이번에 새로운 프로젝트로 "[사용자가 입력한 프로젝트 이름]"을 만들려고 해.
    앱 주요 기능과 사용자 흐름은 다음과 같아.

    == [앱 설명] 시작 ==
    [사용자가 입력하거나 AI가 생성한 앱 설명]
    == [앱 설명] 끝 ==

    데이터는 구글 시트에서 "[최종 시트명]" 시트 하나로 관리할 거야.
    위와 같이 만들려면, 구글 시트의 필드와 화면 인터페이스는 어떻게 구성하면 좋을까?
    머리글 순번으로 간략하게 알려줘.

    ------------------------------ (Form Feed Character) ------------------------------

    1-2. 앱 제작이 필요한 코드 작성하기

    좋아. 너가 알려준 대로 아래와 같이 구성했어.
    웹 앱 개발을 시작해보자. code.gs 와 index.html 코드를 각각 작성해줘.

    == [백엔드 구성] 시작 ===
    1. 사용할 외부 API
    - Gemini API 키: [사용자가 입력한 대상 앱의 API 키]
    - Gemini 모델: [사용자가 입력한 대상 앱의 Gemini 모델]

    2. 구글 시트 구조
    - 구글시트 ID: [사용자가 입력한 대상 앱의 시트 ID]
    - 시트명: [최종 시트명]
    - 필드 구조:
      - [최종 필드1]
      - [최종 필드2]
      ...
    == [백엔드 구성] 끝 ===

    == [화면 인터페이스 구성] 시작 ==
      - [최종 UI 요소1]
      - [최종 UI 요소2]
      ...
    == [화면 인터페이스 구성] 끝 ==

    == [개발 환경 및 추가 요청] 시작 ==
    - 모든 개발은 구글 Apps Script + HTML/CSS/JS 로 진행할거야.
    - 최신 트렌드에 맞춰서 세련된 디자인으로 꾸며줘: [예/아니오]
    - 모바일에 대응할 수 있도록 반응형 CSS로 작성해: [예/아니오]
    - 기타: [사용자가 입력한 기타 요청]
    == [개발 환경 및 추가 요청] 끝 ==
    ```

## 중요 참고 사항 (Important Notes)

*   **API 키 관리:**
    *   **마법사 자체용 API 키 (`process.env.API_KEY`):** 이 키는 Google Script Wizard 애플리케이션의 운영에 필요하며, 클라이언트에 직접 노출되지 않도록 안전하게 관리해야 합니다. 현재 애플리케이션은 클라이언트 사이드에서 API를 호출하므로, 이 키가 브라우저 환경에서 접근 가능하도록 설정되어야 합니다. 프로덕션 환경에서는 보안 강화를 위해 백엔드 서버를 통해 API를 호출하는 아키텍처를 고려하는 것이 좋습니다.
    *   **생성될 앱용 API 키:** 사용자가 2단계에서 "생성될 앱의 Gemini API 키"로 입력하는 키는, 생성된 `Code.gs` 파일 내에 직접 포함되거나 Google Apps Script의 속성 서비스(Property Service) 등을 통해 사용될 수 있습니다. 생성된 스크립트의 접근 권한 및 공유 설정을 신중히 관리하여 API 키가 부적절하게 노출되지 않도록 주의해야 합니다.
*   **AI 생성 코드 검토:** AI가 생성한 코드는 훌륭한 시작점을 제공하지만, 모든 경우에 완벽하다고 보장할 수는 없습니다. 실제 사용 전 반드시 코드를 검토하고, 필요에 따라 수정 및 테스트하는 과정이 필요합니다.
*   **Google Apps Script 권한:** 생성된 `Code.gs` 파일을 실제 Google Apps Script 프로젝트에 배포한 후, 해당 스크립트가 Google Sheets, 외부 API (Gemini API 등) 호출, 사용자의 Google Drive 접근 등 필요한 작업에 대한 권한을 사용자의 Google 계정으로부터 부여받아야 정상적으로 작동합니다. 스크립트 편집기에서 함수를 처음 실행하거나 웹 앱에 처음 접속할 때 권한 요청 창이 나타납니다.
*   **오류 처리 및 디버깅:** 네트워크 문제, Gemini API 할당량 초과, 잘못된 입력값 등으로 인해 AI 요청이 실패하거나 생성된 코드에 오류가 있을 수 있습니다. 브라우저 개발자 콘솔의 오류 메시지와 Google Apps Script 편집기의 실행 로그를 확인하여 문제를 해결하세요.

## 알려진 제한 사항 (Known Limitations)

*   **복잡도 한계:** 매우 복잡하거나 특수한 로직을 요구하는 앱의 경우, AI가 완벽한 코드를 생성하지 못할 수 있습니다. 이 경우 생성된 코드를 기반으로 추가 개발이 필요합니다.
*   **UI 커스터마이징:** 생성된 UI는 Tailwind CSS 기반으로 기본적인 구조를 제공합니다. 더 세밀한 디자인 커스터마이징이나 복잡한 JavaScript 상호작용은 사용자가 직접 추가해야 할 수 있습니다.
*   **파일 업로드 처리:** `Code.gs`에서 파일 업로드와 Google Drive 연동 로직은 기본적인 형태로 제공될 수 있으나, 세부적인 오류 처리나 고급 기능은 추가 구현이 필요할 수 있습니다.

## 향후 개선 아이디어 (Potential Future Enhancements)

*   다양한 UI 프레임워크 또는 템플릿 선택 기능 추가.
*   Google Drive 외 다른 저장소 연동 옵션 제공.
*   생성된 앱 코드의 실시간 미리보기 기능.
*   더 많은 Google Workspace 서비스 (Gmail, Calendar, Docs 등)와의 연동 자동화 기능.
*   사용자 계정 시스템을 도입하여 프로젝트 저장, 이력 관리 기능 제공.
*   팀 공동 작업을 위한 기능.

