

export interface AiDesignProposal {
  sheet_name: string;
  sheet_fields: string[];
  ui_elements: string[];
}

export interface GeneratedCode {
  code_gs?: string; // Made optional
  index_html?: string; // Made optional
  sheet_structure_txt: string;
  claude_prompt_txt: string; 
}

// Data collected from Phase 2 form to be sent to Gemini for code generation
export interface Phase2RequestData {
  projectName: string;
  appDescription: string; // Original description from Phase 1
  
  // From user input in Phase 2
  targetGeminiApiKey: string; 
  targetGeminiModel: string;
  targetGoogleSheetId: string;
  
  // From AI proposal in Phase 1, potentially modified by user
  finalSheetName: string;
  finalSheetFields: string[]; // Array of strings like "A1: Timestamp (Description)"
  finalUiElements: string[]; // Array of strings like "h1: Page Title" (derived from textarea in Phase 2)

  // Additional requests from Phase 2
  applyStylishDesign: boolean;
  includeResponsiveCss: boolean;
  otherRequests: string;
}

// Expected structure from Gemini for Phase 1 Design Proposal
export interface GeminiDesignResponse {
  sheet_name: string;
  sheet_fields: string[];
  ui_elements: string[];
}

// Expected structure from Gemini for Phase 2 Code Generation
export interface GeminiCodeResponse {
  code_gs: string;
  index_html: string;
}