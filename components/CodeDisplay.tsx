

import React, { useState } from 'react';
import { Button } from './Button';

interface CodeDisplayProps {
  codeGs?: string; // Optional
  indexHtml?: string; // Optional
  sheetStructureTxt: string;
  claudePromptTxt: string;
  onDownloadZip: () => void;
  onRestart: () => void;
}

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375m7.5-10.375l-1.5-1.5m1.5 1.5l-1.5 1.5" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const CodeBlock: React.FC<{ title: string; code: string; onCopy: () => void; copyLabel: string }> = ({ title, code, onCopy, copyLabel }) => {
  return (
    <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden flex-1 min-w-0 md:min-w-[300px] flex flex-col">
      <div className="flex justify-between items-center p-3 bg-slate-700/50">
        <h3 className="text-md font-semibold text-sky-300">{title}</h3>
        <Button onClick={onCopy} size="sm" variant="ghost" className="text-slate-300 hover:text-sky-400 !px-2 !py-1">
          <CopyIcon className="mr-1.5" /> {copyLabel}
        </Button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto h-96 bg-opacity-50 text-slate-200 whitespace-pre-wrap break-all flex-grow">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ codeGs, indexHtml, sheetStructureTxt, claudePromptTxt, onDownloadZip, onRestart }) => {
  const [gsCopied, setGsCopied] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [structureCopied, setStructureCopied] = useState(false);
  const [claudePromptCopied, setClaudePromptCopied] = useState(false);

  const copyToClipboard = (text: string, setCopied: (isCopied: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasCodeFiles = codeGs || indexHtml;
  const titleText = hasCodeFiles ? "🎉 코드 생성 완료! 🎉" : "📜 프롬프트 파일 생성 완료! 📜";
  const downloadButtonText = hasCodeFiles ? 
    "프로젝트 (.gs, .html, .txt) .zip으로 다운로드" : 
    "프롬프트 파일 (.txt) .zip으로 다운로드";

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-sky-400 text-center">{titleText}</h2>
      
      <div className="flex flex-col lg:flex-row flex-wrap gap-6 justify-center">
        {codeGs && (
          <CodeBlock 
            title="Code.gs" 
            code={codeGs} 
            onCopy={() => copyToClipboard(codeGs, setGsCopied)}
            copyLabel={gsCopied ? '복사됨!' : 'Code.gs 복사'}
          />
        )}
        {indexHtml && (
          <CodeBlock 
            title="index.html" 
            code={indexHtml}
            onCopy={() => copyToClipboard(indexHtml, setHtmlCopied)}
            copyLabel={htmlCopied ? '복사됨!' : 'index.html 복사'}
          />
        )}
        <CodeBlock 
          title="sheet_structure.txt" 
          code={sheetStructureTxt}
          onCopy={() => copyToClipboard(sheetStructureTxt, setStructureCopied)}
          copyLabel={structureCopied ? '복사됨!' : '구조 복사'}
        />
        <CodeBlock 
          title="claude_prompt.txt" 
          code={claudePromptTxt}
          onCopy={() => copyToClipboard(claudePromptTxt, setClaudePromptCopied)}
          copyLabel={claudePromptCopied ? '복사됨!' : '프롬프트 복사'}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button onClick={onDownloadZip} fullWidth color="primary" className="items-center justify-center">
           <DownloadIcon className="mr-2"/> {downloadButtonText}
        </Button>
        <Button onClick={onRestart} fullWidth color="secondary">
          ✨ 새 마법 시작하기
        </Button>
      </div>
    </div>
  );
};