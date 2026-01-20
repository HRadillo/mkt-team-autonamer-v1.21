
export type AppMode = 'video' | 'static';
export type WorkLevel = 'ad-set' | 'ad-level';

export interface FormData {
  // --- Global / Ad Set Level Data ---
  account: string;
  productGeo: string;
  trial: string;

  // --- Concept ---
  conceptId: string;
  assetId: string; // VidID or StatID
  focus: string;
  theme: string;
  shortConceptDesc: string; // Excel: Short Concept Desc.
  
  // --- Ad Set Specific ---
  testVariable: string; // The "Summary" of the ad set testing strategy
  testDesc: string;     // Excel: Test Desc.

  // --- Creative Specs (Shared) ---
  age: string;
  ethnicity: string;
  ratio: string;
  style: string;
  graphic: string;
  sound: string; // Video Only

  // --- Tech (Shared) ---
  productCode: string;
  projectCode: string; // Base e.g. 087.01-001
  ncon: boolean;

  // --- Ad Level Specifics (The "Differences") ---
  variant: string;     // a, b, c...
  adTextCode: string;  // h2p2

  // --- Video Ad Level Details ---
  seq: string;
  title: string;
  intro: string;
  seqDesc: string;      // Excel: SEQ Desc. (prefixed with S-)
  hookTheme: string;    // Excel: Hook Theme (prefixed with T-). Multi-select.
  hookDesc: string;     // Excel: Hook Desc
  visualTheme: string;  // Excel: Visual Theme (prefixed with V-). Multi-select.
  visualObject: string; // Excel: Visual Object

  // --- Static Ad Level Details ---
  carouselCode: string;      // CAR
  carouselDesc: string;      // Optional
  titleDesc: string;         // Static: Title Desc
  visualIdentifier: string;  // Static: Visual Identifier (e.g. VIS1)
}

export interface GeneratedOutputs {
  adSet: string;
  adLevel: string;
}
