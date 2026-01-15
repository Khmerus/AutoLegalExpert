
import React, { useState } from 'react';
import { AppStage, DocumentFile, AnalysisResult } from './types.ts';
import { Button } from './components/Button.tsx';
import { analyzeDocuments } from './services/geminiService.ts';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.PRELIMINARY);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles: DocumentFile[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const base64 = await fileToBase64(file);
      newFiles.push({
        name: file.name,
        base64: base64.split(',')[1],
        mimeType: file.type
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Загрузите документы для проведения аудита");
      return;
    }
    if (!isVerified) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const text = await analyzeDocuments(files, stage);
      setResult({ text, timestamp: Date.now() });
    } catch (err: any) {
      setError(err.message || "Ошибка системы аналитики. Попробуйте позже.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="glass border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">AutoLegal <span className="text-indigo-600">Expert</span></span>
              <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">GIBDD Document Audit v4.0</div>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Gemini 3 Pro Online
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Безупречное переоборудование <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              под контролем интеллекта
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Автоматизированная проверка документов на соответствие Техническому регламенту Таможенного союза и требованиям ГИБДД.
          </p>
        </section>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Config & Upload */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Step 1: Stage Selection */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">1. Выбор этапа регистрации</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: AppStage.PRELIMINARY, title: 'Предварительный этап', desc: 'Доверенность + Экспертиза' },
                  { id: AppStage.FINAL, title: 'Финальный этап', desc: 'Протокол + Разрешение' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStage(s.id as AppStage)}
                    className={`text-left p-5 rounded-3xl border-2 transition-all duration-300 relative group ${
                      stage === s.id ? 'border-indigo-600 bg-indigo-50/40 shadow-xl shadow-indigo-100/50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900">{s.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
                    {stage === s.id && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Verification Checkbox */}
            <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 space-y-4 ${isVerified ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15.656c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">Проверка ограничений</span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600 font-medium">
                Подтвердите, что ТС проверено по базам ГИБДД и ФССП на предмет залогов и запретов.
              </p>
              <label className={`flex items-center gap-3 p-4 bg-white border-2 rounded-2xl cursor-pointer transition-all ${isVerified ? 'border-emerald-500 shadow-md' : 'border-slate-200'}`}>
                <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-xs font-bold text-slate-700">Ограничения отсутствуют</span>
              </label>
            </div>

            {/* Step 3: Action */}
            <Button 
              onClick={handleAnalyze} 
              isLoading={isAnalyzing}
              className="w-full py-5 text-lg shadow-2xl"
              disabled={files.length === 0 || !isVerified}
            >
              Запустить аудит
            </Button>
            {error && <p className="text-rose-500 text-center text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>}
          </div>

          {/* Right Column: File List */}
          <div className="lg:col-span-7 space-y-6">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">2. Документация (PDF, JPG)</label>
            
            <div className="relative group">
              <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*,application/pdf" />
              <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center bg-white group-hover:bg-slate-50 group-hover:border-indigo-300 transition-all duration-300">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-slate-900 font-extrabold">Добавить документы</div>
                <p className="text-xs text-slate-400 mt-1">Доверенность, Заключение, Протокол</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm animate-fade-in group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-xl ${file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <div className="space-y-10 py-10 animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)] border border-slate-100 overflow-hidden">
              <div className="bg-slate-900 px-10 py-8 flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-indigo-600 p-3 rounded-2xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight uppercase">Отчет эксперта ИИ</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Анализ завершен успешно</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Verified Content</div>
                  <div className="text-xs text-slate-500 font-bold">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="p-10 md:p-14">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-[15px] custom-scrollbar max-h-[60vh] overflow-y-auto pr-6">
                    {result.text}
                  </div>
                </div>

                {stage === AppStage.FINAL && (
                  <div className="mt-12 p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 flex gap-6 items-start relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    </div>
                    <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-200">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-rose-900 font-black text-xs uppercase tracking-[0.2em] mb-2">Глазами инспектора ГИБДД</h4>
                      <p className="text-rose-800 text-sm leading-relaxed font-bold italic">
                        "Внимание! Немедленно сверьте бумажное Заключение с реальным фото. ГИБДД крайне придирчивы к сторонам установки оборудования и маркировкам. Проверьте дважды."
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 px-10 py-5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                <span>AutoLegal Core v4.1 • Premium Audit</span>
                <span>Ready for submission</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-16 border-t border-slate-100 text-center space-y-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          AutoLegal Expert AI • {new Date().getFullYear()}
        </p>
        <p className="text-[9px] text-slate-300 max-w-xs mx-auto font-medium">
          Сервис носит справочный характер. Окончательное решение принимает инспектор технадзора ГИБДД.
        </p>
      </footer>
    </div>
  );
};

export default App;
