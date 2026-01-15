
import React, { useState } from 'react';
import { AppStage, DocumentFile, AnalysisResult } from './types';
import { analyzeDocuments } from './services/geminiService';

// Integrated Button component to avoid file resolution issues on Vercel build
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden px-8 py-4 rounded-3xl font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-sm",
    danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Анализируем...</span>
        </div>
      ) : children}
    </button>
  );
};

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
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      newFiles.push({ name: file.name, base64: await base64Promise, mimeType: file.type });
    }
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Загрузите хотя бы один документ.");
      return;
    }
    if (!isVerified) {
      setError("Подтвердите проверку автомобиля на запреты.");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const text = await analyzeDocuments(files, stage);
      setResult({ text, timestamp: Date.now() });
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.message || "Ошибка системы. Попробуйте снова.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">AutoLegal <span className="text-indigo-600 underline decoration-indigo-200">Expert</span></h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">GIBDD Standards v5.0</p>
            </div>
          </div>
          <div className="hidden md:flex gap-6 items-center">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase text-indigo-700">Gemini 3 Pro Active</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-[1.1]">
            Проверьте документы <br/>
            <span className="text-indigo-600 italic">как лучший автоюрист</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Автоматический аудит для регистрации переоборудования. Мы найдем ошибки, которые не пропустит инспектор ГИБДД.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Этап оформления</h3>
              </div>
              <div className="grid gap-3">
                {[
                  { id: AppStage.PRELIMINARY, title: 'Предварительный этап', desc: 'Доверенность + Заключение экспертизы' },
                  { id: AppStage.FINAL, title: 'Финальный этап', desc: 'Протокол + Разрешение + Доверенность' }
                ].map((s) => (
                  <button key={s.id} onClick={() => setStage(s.id)} className={`text-left p-6 rounded-[2rem] border-2 transition-all duration-300 relative ${stage === s.id ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                    <div className={`text-lg font-black ${stage === s.id ? 'text-indigo-600' : 'text-slate-900'}`}>{s.title}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{s.desc}</div>
                    {stage === s.id && <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
                  </button>
                ))}
              </div>
            </section>

            <section className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-amber-100 shadow-sm'}`}>
               <div className="flex gap-4 mb-6">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-bounce'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15.656c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <div className="space-y-1">
                   <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Проверка на запреты</h4>
                   <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">VIN-номер и ФССП базы</p>
                 </div>
               </div>
               <label className={`flex items-center gap-4 p-5 bg-white border-2 rounded-2xl cursor-pointer transition-all ${isVerified ? 'border-emerald-500 shadow-lg shadow-emerald-100' : 'border-slate-100 hover:border-amber-200'}`}>
                 <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-6 h-6 rounded-lg text-indigo-600 border-slate-300" />
                 <span className="text-xs font-black text-slate-700">Машина чиста от ограничений</span>
               </label>
            </section>

            <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="w-full h-20 text-xl shadow-2xl shadow-indigo-200" disabled={files.length === 0 || !isVerified}>
              Запустить ИИ-Аудит
            </Button>
            {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100 text-center animate-pulse">{error}</div>}
          </div>

          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Документация</h3>
              </div>
              <div className="relative group">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*,application/pdf" />
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center group-hover:bg-indigo-50/20 group-hover:border-indigo-400 transition-all duration-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-slate-400 group-hover:bg-indigo-600 group-hover:text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h5 className="text-xl font-black text-slate-900">Загрузить файлы</h5>
                  <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-tighter">Снимки или PDF документы</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                          {file.mimeType.includes('pdf') ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[13px] font-black text-slate-800 truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{file.mimeType.split('/')[1]}</div>
                        </div>
                      </div>
                      <button onClick={() => removeFile(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {result && (
          <section id="results" className="mt-20 space-y-12 animate-fade-in scroll-mt-32">
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="bg-slate-900 px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Отчет автоюриста</h2>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1">Verified Audit Analysis</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ФИНАЛЬНЫЙ АНАЛИЗ</div>
                   <div className="text-xl font-black text-white">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="p-12 md:p-16">
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-semibold text-[17px] custom-scrollbar max-h-[80vh] overflow-y-auto pr-8">
                    {result.text}
                  </div>
                </div>

                {stage === AppStage.FINAL && (
                  <div className="mt-16 p-10 bg-rose-50 rounded-[3rem] border border-rose-100 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-16 h-16 bg-rose-600 text-white rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl shadow-rose-200">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-rose-900 font-black text-sm uppercase tracking-[0.2em] mb-3 underline underline-offset-8">Важное примечание технадзора</h4>
                      <p className="text-rose-800 text-lg leading-relaxed font-black italic">
                        "Открой заключение и фото! Сравни все досконально, не путай стороны расположения элементов. ГИБДД крайне придирчивы к маркировкам и сторонам установки (лево/право)."
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-12 py-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Expert System 5.1.0</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Authenticated Output</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="py-20 border-t border-slate-200 bg-white/50 text-center space-y-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">AutoLegal Expert AI • {new Date().getFullYear()}</p>
        <p className="text-[9px] text-slate-300 font-bold max-w-xs mx-auto leading-relaxed">Система автоматизированного аудита на базе Техрегламента ТС 018/2011.</p>
      </footer>
    </div>
  );
};

export default App;
