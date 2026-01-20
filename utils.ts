
import { FormData, GeneratedOutputs } from './types';

// --- Excel-parity helpers ---
// Excel uses TEXTJOIN(delim, TRUE, ...) which ignores empty cells.
// It also uses TRIM(CLEAN()) checks and, for Ad Level, a SUBSTITUTE(", ", "-")
// to convert comma+space separated tag lists into hyphen-separated lists.

const CLEAN_RE = /[\u00A0\u200B\u200D\u2060]/g; // NBSP + zero-width variants

const clean = (s: unknown): string => {
  if (typeof s !== 'string') return '';
  // Match Excel-ish CLEAN/TRIM behavior for our use-case.
  return s.replace(CLEAN_RE, '').trim();
};

const textJoin = (delimiter: string, parts: unknown[]): string => {
  const filtered = parts
    .map(clean)
    .filter(p => p !== '');
  return filtered.join(delimiter);
};

const substituteCommaSpaceToDash = (s: string) => s.replace(/,\s/g, '-');

// --- Ad set parity helpers ---
// In the Excel "Naming Conventions Update" sheet, Ad Set outputs are built via:
//   TEXTJOIN("_", TRUE, SUBSTITUTE(SUBSTITUTE(...TRIM(CLEAN(range))... , " ", "")))
// Static Ad Set additionally substitutes commas to dashes and removes spaces.
const removeNormalSpaces = (s: string) => s.replace(/ /g, '');
const replaceCommasWithDash = (s: string) => s.replace(/,/g, '-');

const cleanAdSetVideo = (s: unknown): string => removeNormalSpaces(clean(s));
const cleanAdSetStatic = (s: unknown): string => removeNormalSpaces(replaceCommasWithDash(clean(s)));

const textJoinWith = (delimiter: string, parts: unknown[], cleaner: (v: unknown) => string): string => {
  const filtered = parts.map(cleaner).filter(p => p !== '');
  return filtered.join(delimiter);
};

export const generateVideoOutputs = (data: FormData): GeneratedOutputs => {
  const nconStr = data.ncon ? 'NCON' : '';
  const projectCodeVariant = data.variant ? `${clean(data.projectCode)}${clean(data.variant)}` : clean(data.projectCode);

  // --- AD SET LEVEL (Excel: =TEXTJOIN("_",TRUE,A6:Z6)) ---
  // Order (A..M, R..Y) per "Naming Conventions Update" sheet.
  // Note: Sound is NOT included at ad set level in the Excel formula.
  const adSet = textJoinWith('_', [
    data.account,
    data.productGeo,
    data.trial,
    data.conceptId,          // Test #
    data.assetId,            // Concept # (Vid ID)
    data.focus,
    data.theme,
    data.shortConceptDesc,
    data.seq,
    data.title,
    data.intro,
    data.testVariable,
    data.testDesc,
    nconStr,
    data.age,
    data.ethnicity,
    data.ratio,
    data.style,
    data.graphic,
    data.productCode,
    data.projectCode,
  ], cleanAdSetVideo);

  // --- AD LEVEL (Excel-parity) ---
  // Excel formula (B24):
  // =SUBSTITUTE(TEXTJOIN("_",TRUE,
  //   A23:K23,
  //   IF(L23<>"","S-"&L23,""),
  //   TEXTJOIN("-",TRUE, IF(M23<>"","T-"&M23,""),IF(N23<>"",N23,"")),
  //   TEXTJOIN("-",TRUE, IF(O23<>"","V-"&O23,""),IF(P23<>"",P23,"")),
  //   IF(Q23<>"","A-"&Q23,""),
  //   R23:Z23
  // ),", ","-")

  const sPart = clean(data.seqDesc) ? `S-${clean(data.seqDesc)}` : '';
  const tPart = textJoin('-', [
    clean(data.hookTheme) ? `T-${clean(data.hookTheme)}` : '',
    data.hookDesc,
  ]);
  const vPart = textJoin('-', [
    clean(data.visualTheme) ? `V-${clean(data.visualTheme)}` : '',
    data.visualObject,
  ]);
  const aPart = clean(data.sound) ? `A-${clean(data.sound)}` : '';

  const adLevelRaw = textJoin('_', [
    data.account,
    data.productGeo,
    data.trial,
    data.conceptId,
    data.assetId,
    data.focus,
    data.theme,
    data.shortConceptDesc,
    data.seq,
    data.title,
    data.intro,
    sPart,
    tPart,
    vPart,
    aPart,
    nconStr,
    data.age,
    data.ethnicity,
    data.ratio,
    data.style,
    data.graphic,
    data.productCode,
    projectCodeVariant,
    data.adTextCode,
  ]);

  const adLevel = substituteCommaSpaceToDash(adLevelRaw);

  return { adSet, adLevel };
};

export const generateStaticOutputs = (data: FormData): GeneratedOutputs => {
  const nconStr = data.ncon ? 'NCON' : '';
  const projectCodeVariant = data.variant ? `${clean(data.projectCode)}${clean(data.variant)}` : clean(data.projectCode);
  const ageStr = data.age;

  // --- STATIC AD SET LEVEL (Excel: B43) ---
  // =TEXTJOIN("_", TRUE,
  //   SUBSTITUTE(SUBSTITUTE(...TRIM(CLEAN(A42:Z42))..., ",", "-"), " ", "")
  // )
  // Order is A..Z (empty cells ignored by TEXTJOIN TRUE).
  const adSet = textJoinWith('_', [
    data.account,          // A
    data.productGeo,       // B
    data.trial,            // C
    data.conceptId,        // D (Test #)
    data.assetId,          // E (Concept #)
    data.focus,            // F
    data.theme,            // G
    data.shortConceptDesc, // H
    data.carouselCode,     // I (CAR)
    data.title,            // J (TITLE)
    data.intro,            // K (INTRO)
    data.testVariable,     // L
    data.testDesc,         // M
    '', '', '', '',        // N..Q (unused)
    nconStr,               // R
    ageStr,                // S
    data.ethnicity,        // T
    data.ratio,            // U
    data.style,            // V
    data.graphic,          // W
    data.productCode,      // X
    data.projectCode,      // Y
    '',                    // Z
  ], cleanAdSetStatic);

  // --- STATIC AD LEVEL (Excel: B59) ---
  // =SUBSTITUTE(TEXTJOIN("_",TRUE,
  //   A58:K58,
  //   IF(L58<>"","S-"&L58,""),
  //   TEXTJOIN("-",TRUE, IF(M58<>"","T-"&M58,""),IF(N58<>"",N58,"")),
  //   TEXTJOIN("-",TRUE, IF(O58<>"","V-"&O58,""),IF(P58<>"",P58,"")),
  //   IF(Q58<>"","A-"&Q58,""),
  //   R58:Z58
  // ),", ","-")

  const sPart = clean(data.carouselDesc) ? `S-${clean(data.carouselDesc)}` : '';
  const tPart = textJoin('-', [
    clean(data.hookTheme) ? `T-${clean(data.hookTheme)}` : '',
    data.titleDesc,
  ]);
  const vPart = textJoin('-', [
    clean(data.visualTheme) ? `V-${clean(data.visualTheme)}` : '',
    data.visualObject,
  ]);
  const aPart = clean(data.visualIdentifier) ? `A-${clean(data.visualIdentifier)}` : '';

  const adLevelRaw = textJoin('_', [
    data.account,
    data.productGeo,
    data.trial,
    data.conceptId,
    data.assetId,
    data.focus,
    data.theme,
    data.shortConceptDesc,
    data.carouselCode,
    data.title,
    data.intro,
    sPart,
    tPart,
    vPart,
    aPart,
    nconStr,
    ageStr,
    data.ethnicity,
    data.ratio,
    data.style,
    data.graphic,
    data.productCode,
    projectCodeVariant,
    data.adTextCode,
  ]);

  const adLevel = substituteCommaSpaceToDash(adLevelRaw);

  return { adSet, adLevel };
};
