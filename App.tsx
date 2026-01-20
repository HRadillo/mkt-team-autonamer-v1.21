
import React, { useState, useEffect } from 'react';
import { 
  Clapperboard, Image, Megaphone, BookOpen, X, Sparkles, 
  FolderOpen, FileText, Layers, ChevronRight, Info, Save, Trash2, Copy
} from 'lucide-react';
import { FormData, AppMode, WorkLevel, GeneratedOutputs } from './types';
import { generateVideoOutputs, generateStaticOutputs } from './utils';
import { InputField, CheckboxField, SelectField, MultiSelectField, DataListField } from './components/InputField';
import { CopyRow } from './components/CopyRow';

// --- CONSTANTS ---

const ACCOUNT_OPTIONS = ['BM1', 'BM2', 'H1', 'H2', 'BMX'];
const PRODUCT_GEO_OPTIONS = ['ACF-US', 'ACN-US', 'ASU-US', 'CNC-US', 'CSU-US', 'ECZ-US', 'FOU-US', 'HYP-US', 'NEC-US', 'TWL-US'];
const TRIAL_OPTIONS = ['TRIAL', 'BUY', 'TBYB'];

const FOCUS_OPTIONS = [
  'ADLT', 'COMP', 'CONG', 'CONV', 'CVRG', 'CYST', 'DGST', 'EFCY', 'EMTN', 'FRML', 'HAIR', 'HRMN', 
  'INFL', 'MATR', 'MLSM', 'OFFR', 'PERS', 'PGMT', 'PIH', 'PRNT', 'PRVTN', 'RTN', 'SAG', 'SHD', 
  'SKNC', 'SUND', 'TSTMN', 'TXTR', 'UNCMPL', 'WRNKL'
].sort();

// --- CONTEXT-AWARE OPTIONS ---

// Theme
const VIDEO_THEME_OPTIONS = ['AES', 'CEL', 'DTC', 'EDUC', 'INT', 'MIX', 'NARR', 'POD', 'VLOG'];
const STATIC_THEME_OPTIONS = ['DSGN', 'SCRAP', 'CEL', 'MIX'];

// Age
const VIDEO_AGE_OPTIONS = ['TEEN', 'CORE', 'MID', 'MAT'];
const STATIC_AGE_OPTIONS = ['AG-CORE', 'AG-MID', 'AG-MAT', 'AG-MIX'];

// Graphic
const VIDEO_GRAPHIC_OPTIONS = ['GRX1', 'GRX2', 'GRX3', 'GRX4', 'GRX5', 'GRX6'];
const STATIC_GRAPHIC_OPTIONS = ['GRX1', 'GRX2', 'GRX3', 'GRX4', 'GRX5', 'GRX6'];

// Ratio
const RATIO_OPTIONS = ['9x16', '1x1', '4x5'];
const STATIC_RATIO_PREFIX = ['PAC'];

// Visuals
const HOOK_THEME_OPTIONS = ['POS', 'NEG', 'STAT', 'COMP', 'RSN', 'FUN', 'QST', 'EMO', 'PROMO', 'PB', 'INGR', 'RVW', 'OFFR', 'EMJ', 'EDUC', 'SOL', 'TRANSF', 'SZN'];
const VISUAL_THEME_OPTIONS_BASE = ['AI', 'UGC', 'PH', 'AUTH', 'APPLY', 'STUD', 'TXT', 'SPLT', 'BEF', 'BA', 'AFT', 'BROLL', 'LAB', 'TS', 'UI', 'CHT', 'MEME', 'UVT', 'INT', 'POD', 'SMD', 'TXTR', 'GS'];
const VISUAL_THEME_OPTIONS_STATIC = [...VISUAL_THEME_OPTIONS_BASE, 'PRE'].sort();

const STYLE_OPTIONS = ['native', 'brand'];
const SOUND_OPTIONS = ['SPE', 'VO', 'TRND', 'ASMR', 'FX'];
const ETHNICITY_OPTIONS = ['LTONE', 'DTONE', 'TTONE'];
const PRODUCT_CODE_OPTIONS = ['ACF', 'ACN', 'ASU', 'BPK', 'CNC', 'CSU', 'ECZ', 'FOU', 'HYP', 'NEC', 'TIT', 'TWL'];

// Test Variables (Ad Set Level)
const TEST_VAR_OPTIONS = [
  'test-intro', 'test-vers', 'test-seq', 'test-adtext', 'test-title', 
  'test-intro-title', 'test-car', 'test-grx', 'test-title-seq', 'test-page'
];

const VARIANT_OPTIONS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

const INITIAL_VIDEO_STATE: FormData = {
  account: 'BM1',
  productGeo: 'ACF-US',
  trial: 'TBYB',
  conceptId: '',
  assetId: '',
  focus: '',
  theme: '',
  shortConceptDesc: '',
  testVariable: '', // Ad Set Level
  testDesc: '',
  age: '',
  ethnicity: '',
  ratio: '9x16',
  style: '',
  graphic: '',
  sound: '',
  productCode: 'ACF',
  projectCode: '',
  ncon: false,
  variant: '',
  adTextCode: '',
  seq: '',
  title: '',
  intro: '',
  seqDesc: '',
  hookTheme: '',
  hookDesc: '',
  visualTheme: '',
  visualObject: '',
  carouselCode: '',
  carouselDesc: '',
  visualIdentifier: '',
  titleDesc: '',
};

const INITIAL_STATIC_STATE: FormData = {
  ...INITIAL_VIDEO_STATE,
  ratio: 'PAC',
  // Static ads do not use sound in naming formulas.
  sound: '',
};

function App() {
  const [mode, setMode] = useState<AppMode>('video');
  const [workLevel, setWorkLevel] = useState<WorkLevel>('ad-set');
  // Keep VIDEO and STATIC data isolated (no auto-transfer between modes).
  const [videoData, setVideoData] = useState<FormData>(INITIAL_VIDEO_STATE);
  const [staticData, setStaticData] = useState<FormData>(INITIAL_STATIC_STATE);
  const formData = mode === 'video' ? videoData : staticData;
  const [outputs, setOutputs] = useState<GeneratedOutputs>({ adSet: '', adLevel: '' });
  const [isLexiconOpen, setIsLexiconOpen] = useState(false);

  // Saved output library (local-only)
  const [savedNames, setSavedNames] = useState<Array<{ id: string; mode: AppMode; level: WorkLevel; value: string; createdAt: number }>>([]);

  // Generate outputs
  useEffect(() => {
    if (mode === 'video') {
      setOutputs(generateVideoOutputs(formData));
    } else {
      setOutputs(generateStaticOutputs(formData));
    }
  }, [formData, mode]);

  // Handle Mode Switch Defaults for Ratio
  useEffect(() => {
     if (mode === 'video' && !formData.ratio) updateField('ratio', '9x16');
     if (mode === 'static' && !formData.ratio) updateField('ratio', 'PAC');
  }, [mode]);

  // --- STRICT AUTO-CLEAR LOGIC ---
  // When switching to Ad Level, if a field has a "MIX" value (which is only allowed in Ad Set),
  // we must clear it to ensure valid propagation logic.
  useEffect(() => {
    if (workLevel === 'ad-level') {
      const clears: Partial<FormData> = {};
      
      if (formData.style === 'MIX') clears.style = '';
      if (formData.graphic === 'MIX') clears.graphic = '';
      if (formData.age === 'AG-MIX') clears.age = '';
      if (formData.ratio === 'MIX') clears.ratio = '';

      if (Object.keys(clears).length > 0) {
        setCurrentData(prev => ({ ...prev, ...clears }));
      }
    }
  }, [workLevel, mode, formData.style, formData.graphic, formData.age, formData.ratio]);


  const setCurrentData = (updater: (prev: FormData) => FormData) => {
    if (mode === 'video') setVideoData(updater);
    else setStaticData(updater);
  };


  const updateField = (field: keyof FormData, value: string | boolean) => {
    setCurrentData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    if (window.confirm("Clear all data?")) {
        if (mode === 'video') setVideoData(INITIAL_VIDEO_STATE);
        else setStaticData(INITIAL_STATIC_STATE);
    }
  }

  // --- Saved name library (localStorage) ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mkt_autonamer_saved_v1');
      if (raw) setSavedNames(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mkt_autonamer_saved_v1', JSON.stringify(savedNames));
    } catch {
      // ignore
    }
  }, [savedNames]);

  const saveCurrentOutput = () => {
    const value = workLevel === 'ad-set' ? outputs.adSet : outputs.adLevel;
    if (!value) return;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      mode,
      level: workLevel,
      value,
      createdAt: Date.now(),
    };
    setSavedNames(prev => [entry, ...prev].slice(0, 200));

    // Convenience: auto-increment Variant when saving Ad Level names.
    if (workLevel === 'ad-level') {
      const current = (formData.variant || '').trim();
      if (!current) {
        updateField('variant', 'a');
      } else {
        const idx = VARIANT_OPTIONS.indexOf(current);
        if (idx >= 0 && idx < VARIANT_OPTIONS.length - 1) {
          updateField('variant', VARIANT_OPTIONS[idx + 1]);
        }
      }
    }
  };

  const deleteSaved = (id: string) => setSavedNames(prev => prev.filter(x => x.id !== id));
  const clearSaved = () => {
    if (window.confirm('Clear saved names library?')) setSavedNames([]);
  };

  // --- HELPER: CONTEXT AWARE OPTIONS ---
  // If we are at Ad Set Level, we allow "MIX". 
  // If we are at Ad Level, we forbid "MIX".

  const getStyleOptions = () => {
    return workLevel === 'ad-set' ? [...STYLE_OPTIONS, 'MIX'] : STYLE_OPTIONS;
  }

  const getGraphicOptions = () => {
    const base = mode === 'video' ? VIDEO_GRAPHIC_OPTIONS : STATIC_GRAPHIC_OPTIONS;
    return workLevel === 'ad-set' ? [...base, 'MIX'] : base;
  }

  const getAgeOptions = () => {
    const base = mode === 'video' ? VIDEO_AGE_OPTIONS : STATIC_AGE_OPTIONS;
    // Static Ad Set can be mixed, but Ad Level cannot.
    if (workLevel === 'ad-level' && mode === 'static') {
      return base.filter(o => o !== 'AG-MIX');
    }
    return base;
  }

  const getRatioOptions = () => {
    const base = mode === 'video' ? RATIO_OPTIONS : [...STATIC_RATIO_PREFIX, ...RATIO_OPTIONS];
    return workLevel === 'ad-set' ? [...base, 'MIX'] : base;
  }

  const currentVisualOptions = mode === 'video' ? VISUAL_THEME_OPTIONS_BASE : VISUAL_THEME_OPTIONS_STATIC;
  const currentThemeOptions = mode === 'video' ? VIDEO_THEME_OPTIONS : STATIC_THEME_OPTIONS;

  return (
    <div className="min-h-screen bg-black text-white flex font-sans overflow-hidden">
      
      {/* 1. SIDEBAR (NAVIGATION) */}
      <aside className="w-72 border-r border-zinc-900 bg-zinc-950 flex flex-col h-screen fixed left-0 top-0 z-20 shadow-2xl shadow-black">
        <div className="p-8 border-b border-zinc-900">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#ffff99] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,153,0.25)] shrink-0">
               <Megaphone className="text-black w-6 h-6" strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
               <h1 className="font-bold text-2xl text-white tracking-tight mb-1.5">Autonamer</h1>
               <p className="text-[#ffff99] text-[10px] font-bold uppercase tracking-[0.25em]">MKT Team V1</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-4">
          <div className="px-2 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Select Work Level</div>
          
          <button
            onClick={() => setWorkLevel('ad-set')}
            className={`w-full group flex items-start gap-4 px-4 py-5 rounded-xl transition-all duration-300 border-l-[3px]
              ${workLevel === 'ad-set' 
                ? 'bg-[#ffff99]/5 text-[#ffff99] border-[#ffff99] shadow-[0_0_30px_rgba(255,255,153,0.05)]' 
                : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}
            `}
          >
            <FolderOpen size={20} className={workLevel === 'ad-set' ? 'text-[#ffff99]' : 'text-zinc-600 group-hover:text-zinc-400'} />
            <div className="text-left">
              <span className={`block font-bold text-sm mb-1 ${workLevel === 'ad-set' ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>Ad Set Level</span>
              <span className="text-[11px] opacity-60 font-medium leading-tight block">Campaign & Testing Variables</span>
            </div>
          </button>

          <button
            onClick={() => setWorkLevel('ad-level')}
            className={`w-full group flex items-start gap-4 px-4 py-5 rounded-xl transition-all duration-300 border-l-[3px]
              ${workLevel === 'ad-level' 
                ? 'bg-[#ffff99]/5 text-[#ffff99] border-[#ffff99] shadow-[0_0_30px_rgba(255,255,153,0.05)]' 
                : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}
            `}
          >
            <FileText size={20} className={workLevel === 'ad-level' ? 'text-[#ffff99]' : 'text-zinc-600 group-hover:text-zinc-400'} />
            <div className="text-left">
              <span className={`block font-bold text-sm mb-1 ${workLevel === 'ad-level' ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>Ad Level</span>
              <span className="text-[11px] opacity-60 font-medium leading-tight block">Creative Execution Details</span>
            </div>
          </button>
        </nav>

        <div className="p-6 border-t border-zinc-900 space-y-3 bg-zinc-950/50">
           <button 
             onClick={() => setIsLexiconOpen(true)}
             className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-[#ffff99] text-xs font-bold uppercase tracking-wider transition-colors p-3 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
           >
             <Info size={14} />
             Lexicon
           </button>
           <button 
             onClick={clearForm}
             className="w-full flex items-center justify-center gap-2 text-zinc-600 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors p-3 rounded-lg hover:bg-red-950/10 border border-transparent hover:border-red-900/30"
           >
             <X size={14} />
             Reset Data
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="ml-72 flex-1 flex flex-col h-screen overflow-hidden bg-black relative">
        {/* Background Grid for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        
        {/* Top Bar: Tabs */}
        <header className="h-20 border-b border-zinc-900 bg-black/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
           <div className="flex gap-1.5 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800/50">
              <button
                onClick={() => setMode('video')}
                className={`
                  flex items-center gap-2.5 px-6 py-2 rounded-md text-xs font-bold tracking-widest transition-all duration-300 uppercase
                  ${mode === 'video' 
                    ? 'bg-zinc-800 text-[#ffff99] shadow-lg shadow-black/50 ring-1 ring-[#ffff99]/20' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
                `}
              >
                <Clapperboard size={14} />
                Video Ads
              </button>
              <button
                onClick={() => setMode('static')}
                className={`
                  flex items-center gap-2.5 px-6 py-2 rounded-md text-xs font-bold tracking-widest transition-all duration-300 uppercase
                  ${mode === 'static' 
                    ? 'bg-zinc-800 text-[#ffff99] shadow-lg shadow-black/50 ring-1 ring-[#ffff99]/20' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
                `}
              >
                <Image size={14} />
                Static Ads
              </button>
           </div>
           
           <div className="flex items-center gap-3 bg-zinc-900/40 px-4 py-2 rounded-full border border-zinc-800/50">
             <span className={`w-2 h-2 rounded-full ${workLevel === 'ad-set' ? 'bg-[#ffff99] animate-pulse shadow-[0_0_10px_#ffff99]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}></span>
             <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
               {workLevel === 'ad-set' ? 'Parent Configuration' : 'Child Asset Details'}
             </span>
           </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative z-0">
          
          {/* 3. SCROLLABLE FORM AREA */}
          <main className="flex-1 overflow-y-auto p-10 pb-40 custom-scrollbar">
             <div className="max-w-3xl mx-auto space-y-12">
               
               {/* --- SHARED PARENT DATA --- */}
               <div className={`space-y-10 transition-all duration-500 ${workLevel === 'ad-level' ? 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'opacity-100'}`}>
                  {/* Account / Header */}
                  <div className="bg-zinc-900/20 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <h3 className="text-[#ffff99] text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Layers size={14} /> Global Context
                    </h3>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                       <SelectField label="Ad Account" value={formData.account} onChange={(v) => updateField('account', v)} options={ACCOUNT_OPTIONS} />
                       <SelectField label="Product-Geo" value={formData.productGeo} onChange={(v) => updateField('productGeo', v)} options={PRODUCT_GEO_OPTIONS} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <SelectField label="Trial Type" value={formData.trial} onChange={(v) => updateField('trial', v)} options={TRIAL_OPTIONS} />
                       <InputField label="Concept ID" value={formData.conceptId} onChange={(v) => updateField('conceptId', v)} placeholder="1.040" />
                    </div>
                  </div>

                  {/* Creative Strategy */}
                  <section>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <InputField label={mode === 'video' ? 'Vid ID' : 'Stat ID'} value={formData.assetId} onChange={(v) => updateField('assetId', v)} placeholder={mode === 'video' ? 'vid025.01' : 'stat101'} />
                      <SelectField label="Focus" value={formData.focus} onChange={(v) => updateField('focus', v)} options={FOCUS_OPTIONS} />
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <SelectField label="Concept Theme" value={formData.theme} onChange={(v) => updateField('theme', v)} options={currentThemeOptions} />
                      <InputField label="Short Concept Desc" value={formData.shortConceptDesc} onChange={(v) => updateField('shortConceptDesc', v)} placeholder="1-2 words (e.g. celeb-uncmpl)" />
                    </div>

                    {/* Ad Set: required codes (Excel Ad Set sections) */}
                    {workLevel === 'ad-set' && mode === 'video' && (
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <InputField label="SEQ Code" value={formData.seq} onChange={(v) => updateField('seq', v)} placeholder="SEQ1" />
                        <InputField label="Title Code" value={formData.title} onChange={(v) => updateField('title', v)} placeholder="T1" />
                        <InputField label="Intro Code" value={formData.intro} onChange={(v) => updateField('intro', v)} placeholder="V1" />
                      </div>
                    )}

                    {workLevel === 'ad-set' && mode === 'static' && (
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <InputField label="CAR Code" value={formData.carouselCode} onChange={(v) => updateField('carouselCode', v)} placeholder="CAR1" />
                        <InputField label="Title Code" value={formData.title} onChange={(v) => updateField('title', v)} placeholder="T1" />
                        <InputField label="Intro Code" value={formData.intro} onChange={(v) => updateField('intro', v)} placeholder="V1" />
                      </div>
                    )}

                    {/* Ad Set Specific: Test Variable + Test Desc (Excel: L + M) */}
                    {workLevel === 'ad-set' && (
                      <div className="grid grid-cols-2 gap-6">
                        <DataListField 
                          label="Test Variable (Ad Set)" 
                          value={formData.testVariable} 
                          onChange={(v) => updateField('testVariable', v)} 
                          options={TEST_VAR_OPTIONS}
                          placeholder="test-seq"
                        />
                        <InputField 
                          label="Test Desc (Ad Set)" 
                          value={formData.testDesc} 
                          onChange={(v) => updateField('testDesc', v)} 
                          placeholder="1-2 words (e.g. candice-king)"
                        />
                      </div>
                    )}
                  </section>

                  {/* Creative Specs (Context Aware) */}
                  <section>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Specs</h3>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                       <SelectField label="Age Tag" value={formData.age} onChange={(v) => updateField('age', v)} options={getAgeOptions()} />
                       <SelectField label="Ethnicity" value={formData.ethnicity} onChange={(v) => updateField('ethnicity', v)} options={ETHNICITY_OPTIONS} />
                       <SelectField label="Ratio" value={formData.ratio} onChange={(v) => updateField('ratio', v)} options={getRatioOptions()} />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                       <SelectField label="Style" value={formData.style} onChange={(v) => updateField('style', v)} options={getStyleOptions()} />
                       <SelectField label="Graphic" value={formData.graphic} onChange={(v) => updateField('graphic', v)} options={getGraphicOptions()} />
                       {(mode === 'video' && workLevel === 'ad-level') && (
                         <SelectField label="Sound" value={formData.sound} onChange={(v) => updateField('sound', v)} options={SOUND_OPTIONS} />
                       )}
                    </div>
                  </section>
               </div>

               {/* --- AD LEVEL SPECIFIC FIELDS --- */}
               {/* Only visible when Work Level is 'ad-level' */}
               {workLevel === 'ad-level' && (
                  <div className="pt-10 border-t-2 border-[#ffff99] animate-in slide-in-from-bottom-8 duration-700 relative">
                     <div className="absolute -top-3.5 left-0 bg-black pr-4 text-[#ffff99] text-sm font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_30px_rgba(0,0,0,1)]">
                        <FileText size={16} /> Creative Execution
                     </div>

                     {mode === 'video' ? (
                        <div className="space-y-8 mt-6">
                           <div className="grid grid-cols-3 gap-6">
                             <InputField label="SEQ Code" value={formData.seq} onChange={(v) => updateField('seq', v)} placeholder="SEQ1" />
                             <InputField label="Title Code" value={formData.title} onChange={(v) => updateField('title', v)} placeholder="T1" />
                             <InputField label="Intro Code" value={formData.intro} onChange={(v) => updateField('intro', v)} placeholder="V1" />
                           </div>
                           <div className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                             <InputField label="SEQ Desc (S-)" value={formData.seqDesc} onChange={(v) => updateField('seqDesc', v)} placeholder="exactly-looking-for" />
                             <div className="grid grid-cols-2 gap-6">
                               <MultiSelectField label="Hook Theme (T-)" value={formData.hookTheme} onChange={(v) => updateField('hookTheme', v)} options={HOOK_THEME_OPTIONS} />
                               <InputField label="Hook Desc" value={formData.hookDesc} onChange={(v) => updateField('hookDesc', v)} placeholder="ck-goto-hack" />
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                               <MultiSelectField label="Visual Theme (V-)" value={formData.visualTheme} onChange={(v) => updateField('visualTheme', v)} options={currentVisualOptions} />
                               <InputField label="Visual Object" value={formData.visualObject} onChange={(v) => updateField('visualObject', v)} placeholder="candice-king" />
                             </div>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-8 mt-6">
                           <div className="grid grid-cols-3 gap-6">
                             <InputField label="CAR Code" value={formData.carouselCode} onChange={(v) => updateField('carouselCode', v)} placeholder="CAR1" />
                             <InputField label="Title Code" value={formData.title} onChange={(v) => updateField('title', v)} placeholder="T1" />
                             <InputField label="Intro Code" value={formData.intro} onChange={(v) => updateField('intro', v)} placeholder="V1" />
                           </div>

                           <div className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                             <InputField label="CAR Desc (S-)" value={formData.carouselDesc} onChange={(v) => updateField('carouselDesc', v)} placeholder="ingred-texture" />

                             <div className="grid grid-cols-2 gap-6">
                               <MultiSelectField label="Hook Theme (T-)" value={formData.hookTheme} onChange={(v) => updateField('hookTheme', v)} options={HOOK_THEME_OPTIONS} />
                               <InputField label="Title Desc" value={formData.titleDesc} onChange={(v) => updateField('titleDesc', v)} placeholder="tailored-formula" />
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                               <MultiSelectField label="Visual Theme (V-)" value={formData.visualTheme} onChange={(v) => updateField('visualTheme', v)} options={currentVisualOptions} />
                               <InputField label="Visual Object" value={formData.visualObject} onChange={(v) => updateField('visualObject', v)} placeholder="spotshield" />
                             </div>

                             <InputField label="Visual Identifier (A-)" value={formData.visualIdentifier} onChange={(v) => updateField('visualIdentifier', v)} placeholder="splatter-ph" />
                           </div>
                        </div>
                     )}

                     {/* TECH & VARIANT (Ad Level Only) */}
                     <div className="mt-8 grid grid-cols-12 gap-6 items-end bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                        <div className="col-span-3">
                           <SelectField label="Prod Code" value={formData.productCode} onChange={(v) => updateField('productCode', v)} options={PRODUCT_CODE_OPTIONS} />
                        </div>
                        <div className="col-span-5">
                           <InputField label="Base Project Code" value={formData.projectCode} onChange={(v) => updateField('projectCode', v)} placeholder="087.01-001" />
                        </div>
                        <div className="col-span-2">
                           <SelectField label="Variant" value={formData.variant} onChange={(v) => updateField('variant', v)} options={VARIANT_OPTIONS} placeholder="-" />
                        </div>
                        <div className="col-span-2">
                           <InputField label="Ad Text" value={formData.adTextCode} onChange={(v) => updateField('adTextCode', v)} placeholder="h2p2" />
                        </div>
                     </div>
                     <CheckboxField label="Include NCON (Non-Qualified Concept)" checked={formData.ncon} onChange={(v) => updateField('ncon', v)} />
                  </div>
               )}

               {/* AD SET PROJECT CODE (If we are in Ad Set mode, allow editing base code) */}
               {workLevel === 'ad-set' && (
                  <div className="pt-8 border-t border-zinc-800">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Tracking Base</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <SelectField label="Prod Code" value={formData.productCode} onChange={(v) => updateField('productCode', v)} options={PRODUCT_CODE_OPTIONS} />
                       <InputField label="Base Project Code" value={formData.projectCode} onChange={(v) => updateField('projectCode', v)} placeholder="087.01-001" />
                    </div>
                    <CheckboxField label="Include NCON (Non-Qualified Concept)" checked={formData.ncon} onChange={(v) => updateField('ncon', v)} />
                  </div>
               )}

             </div>
          </main>

          {/* 4. RIGHT PANEL: OUTPUTS (Dynamic based on Work Level) */}
          <aside className="w-80 bg-zinc-950 border-l border-zinc-900 p-8 flex flex-col shrink-0 shadow-2xl z-10">
             <div className="mb-10">
               <h2 className="text-[#ffff99] text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <Sparkles size={14} /> Live Preview
               </h2>
               <p className="text-zinc-500 text-[11px] leading-relaxed">
                 Names are generated in real-time based on the selected Work Level.
               </p>
             </div>

             <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2">
               {workLevel === 'ad-set' ? (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                   <div className="bg-[#ffff99]/10 border border-[#ffff99]/20 p-4 rounded-lg mb-8">
                     <p className="text-[#ffff99] text-xs font-bold mb-1 uppercase tracking-wider">Active Mode</p>
                     <p className="text-zinc-400 text-xs">Generating Ad Set Level naming conventions.</p>
                   </div>
                   <CopyRow label="AD SET NAME" value={outputs.adSet} isPrimary={true} />
                   <div className="opacity-40 pointer-events-none grayscale">
                     <CopyRow label="AD LEVEL (Preview)" value={outputs.adLevel} />
                   </div>
                 </div>
               ) : (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                   <div className="bg-[#ffff99]/10 border border-[#ffff99]/20 p-4 rounded-lg mb-8">
                     <p className="text-[#ffff99] text-xs font-bold mb-1 uppercase tracking-wider">Active Mode</p>
                     <p className="text-zinc-400 text-xs">Generating Creative Asset names.</p>
                   </div>
                   <CopyRow label="AD LEVEL NAME" value={outputs.adLevel} isPrimary={true} />
                   <div className="opacity-40 pointer-events-none grayscale mt-8 pt-8 border-t border-zinc-900">
                     <CopyRow label="PARENT AD SET" value={outputs.adSet} />
                   </div>
                 </div>
               )}

               {/* Saved output library */}
               <div className="mt-10 pt-8 border-t border-zinc-900">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">Saved Names</h3>
                   <div className="flex items-center gap-2">
                     <button
                       onClick={saveCurrentOutput}
                       className="flex items-center gap-2 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 hover:border-[#ffff99]/40 hover:text-[#ffff99] transition-colors"
                       title="Save current output to your local library"
                     >
                       <Save size={14} /> Save
                     </button>
                     <button
                       onClick={clearSaved}
                       className="p-2 rounded-md bg-zinc-900 border border-zinc-800 hover:border-red-500/40 hover:text-red-400 transition-colors"
                       title="Clear library"
                     >
                       <Trash2 size={14} />
                     </button>
                   </div>
                 </div>

                 <p className="text-zinc-600 text-[11px] leading-relaxed mb-4">
                   Stored locally in this browser (no server). Use it to keep multiple ad names without erasing fields.
                 </p>

                 <div className="space-y-2">
                   {savedNames.filter(x => x.mode === mode).slice(0, 30).map((entry) => (
                     <div key={entry.id} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3">
                       <div className="flex items-start justify-between gap-3">
                         <div className="min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{entry.level === 'ad-set' ? 'AD SET' : 'AD LEVEL'}</span>
                             <span className="text-[10px] text-zinc-700 font-mono">•</span>
                             <span className="text-[10px] text-zinc-600 font-mono">{new Date(entry.createdAt).toLocaleString()}</span>
                           </div>
                           <div className="text-[11px] font-mono text-zinc-300 break-all leading-relaxed">
                             {entry.value}
                           </div>
                         </div>

                         <div className="flex items-center gap-2 shrink-0">
                           <button
                             onClick={() => navigator.clipboard.writeText(entry.value)}
                             className="p-2 rounded-md border border-zinc-800 bg-black/20 hover:bg-[#ffff99] hover:text-black hover:border-[#ffff99] transition-all"
                             title="Copy"
                           >
                             <Copy size={14} />
                           </button>
                           <button
                             onClick={() => deleteSaved(entry.id)}
                             className="p-2 rounded-md border border-zinc-800 bg-black/20 hover:border-red-500/40 hover:text-red-400 transition-colors"
                             title="Delete"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}

                   {savedNames.filter(x => x.mode === mode).length === 0 && (
                     <div className="text-zinc-600 text-sm italic">No saved names yet.</div>
                   )}
                 </div>
               </div>
             </div>
          </aside>

        </div>
      </div>

      {/* Lexicon Modal */}
      {isLexiconOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-zinc-950 border border-zinc-800 w-full max-w-5xl rounded-2xl relative shadow-[0_0_100px_rgba(255,255,153,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
              
              <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex items-center gap-4">
                  <div className="bg-[#ffff99] p-2 rounded-lg">
                    <BookOpen className="text-black" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide text-lg">MKT Lexicon</h3>
                    <p className="text-xs text-[#ffff99] uppercase tracking-widest font-bold">Naming Conventions Reference</p>
                  </div>
                </div>
                <button onClick={() => setIsLexiconOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-black/40 p-2 rounded-full hover:bg-zinc-800">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto space-y-12 custom-scrollbar bg-black/50">
                
                {/* Product Codes & Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-zinc-800 pb-3">Product Codes</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400">
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">ACN</span> <span>Acne</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">CNC</span> <span>Concealer</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">FOU</span> <span>Foundation</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">ASU</span> <span>Acne Supp</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">HYP</span> <span>Hyper-pig</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">ECZ</span> <span>Eczema</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">GSU</span> <span>Collagen</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">NEC</span> <span>Neck</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-zinc-800 pb-3">Demographics</h4>
                    <div className="space-y-3 text-sm text-zinc-400">
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">TEEN</span> <span>&lt; 24 Years</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">CORE</span> <span>25 - 35 Years</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">MID</span> <span>36 - 50 Years</span></div>
                      <div className="flex justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50"><span className="text-white font-mono font-bold">MAT</span> <span>51+ Years</span></div>
                      <div className="flex justify-between p-3 bg-[#ffff99]/10 rounded-lg border border-[#ffff99]/30"><span className="text-[#ffff99] font-mono font-bold">AG-MIX</span> <span className="text-white">Multiple (Ad Set Only)</span></div>
                    </div>
                  </div>
                </div>

                {/* Themes & Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-zinc-800 pb-3">Intro Themes</h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">AI</strong> <span>AI-Generated</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">UGC</strong> <span>User Generated (Selfie)</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">PH</strong> <span>Product Hero (Pack/Texture)</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">AUTH</strong> <span>Authority (Doctor/Derm)</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">APPLY</strong> <span>Application Moment</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">STUD</strong> <span>Studio / High-end</span></li>
                    </ul>
                   </div>
                   
                   <div>
                    <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-zinc-800 pb-3">Graphic Styles (GRX)</h4>
                    <ul className="space-y-3 text-sm text-zinc-400">
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">GRX1</strong> <span>Brand Style</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">GRX2</strong> <span>Native White Box</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">GRX3</strong> <span>Native Black Stroke</span></li>
                      <li className="flex items-center gap-4 p-2 hover:bg-zinc-900 rounded"><strong className="text-white font-mono w-16 shrink-0 bg-zinc-800 text-center rounded py-1">GRX4</strong> <span>Native Minimalistic</span></li>
                    </ul>
                   </div>
                </div>

                {/* Concepts */}
                <div>
                   <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 border-b border-zinc-800 pb-3">Concept Clusters</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-zinc-400">
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">ADLT</span> Adult</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">COMP</span> Comparison</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">CONG</span> Congestion</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">CVRG</span> Coverage</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">EMTN</span> Emotion</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">FRML</span> Formula</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">PERS</span> Personalization</div>
                      <div className="p-3 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"><span className="text-[#ffff99] font-bold block mb-1 font-mono">RTN</span> Routine</div>
                   </div>
                </div>

              </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default App;
