
import React, { useState } from 'react';
import { AppStage, DocumentFile, AnalysisResult } from './types';
import { analyzeDocuments } from './geminiService';
import Button from './Button';

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
      setError("Сначала загрузите документы.");
      return;
    }
    if (!isVerified) {
      setError("Пожалуйста, подтвердите проверку на запреты.");
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
      setError(err.message || "Ошибка системы. Попробуйте обновить страницу.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">AutoLegal <span className="text-indigo-600">Expert</span></h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Flat Root System v6.0</p>
            </div>
          </div>
          <div className="flex gap-2 items-center px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Gemini 3 Pro</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
            Профессиональный аудит <br className="hidden md:block"/>
            <span className="text-indigo-600">переоборудования ТС</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium">
            Автоматическая проверка документов на соответствие техрегламенту ГИБДД.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">01</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Этап оформления</h3>
              </div>
              <div className="grid gap-3">
                {[
                  { id: AppStage.PRELIMINARY, title: 'Этап 1: Предварительный', desc: 'Доверенность + Заключение' },
                  { id: AppStage.FINAL, title: 'Этап 2: Финальный', desc: 'Протокол + Разрешение' }
                ].map((s) => (
                  <button key={s.id} onClick={() => setStage(s.id)} className={`text-left p-6 rounded-[2rem] border-2 transition-all duration-300 relative ${stage === s.id ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                    <div className={`text-lg font-black ${stage === s.id ? 'text-indigo-600' : 'text-slate-900'}`}>{s.title}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">{s.desc}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-amber-100'}`}>
               <div className="flex gap-4 mb-6">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15.656c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <div>
                   <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Напоминание</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 leading-tight">Проверьте VIN на запреты ГИБДД и ФССП перед подачей.</p>
                 </div>
               </div>
               <label className={`flex items-center gap-4 p-5 bg-white border-2 rounded-2xl cursor-pointer transition-all ${isVerified ? 'border-emerald-500 shadow-md shadow-emerald-50' : 'border-slate-100 hover:border-amber-200'}`}>
                 <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-5 h-5 rounded text-indigo-600" />
                 <span className="text-[11px] font-black text-slate-700 uppercase">Машина проверена на запреты</span>
               </label>
            </section>

            <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="w-full h-20 text-xl shadow-2xl shadow-indigo-100" disabled={files.length === 0 || !isVerified}>
              Запустить аудит
            </Button>
            {error && <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl border border-rose-100 text-center uppercase tracking-widest">{error}</div>}
          </div>

          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">02</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Загрузка документов</h3>
              </div>
              <div className="relative">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*,application/pdf" />
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center hover:bg-indigo-50/10 hover:border-indigo-300 transition-all duration-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h5 className="text-xl font-black text-slate-900">Выбрать файлы</h5>
                  <p className="text-xs text-slate-400 font-bold mt-2 uppercase">PDF или Изображения (До 10 шт.)</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm animate-fade-in overflow-hidden">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[12px] font-black text-slate-800 truncate">{file.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{file.mimeType.split('/')[1]}</div>
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
          <section id="results" className="mt-16 animate-fade-in scroll-mt-24">
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="bg-slate-900 px-10 py-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Отчет аудита</h2>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Verified Document Analysis</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ВРЕМЯ</div>
                   <div className="text-lg font-black text-white leading-none mt-1">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="p-10 md:p-16">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-semibold text-lg max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                  {result.text}
                </div>

                {stage === AppStage.FINAL && (
                  <div className="mt-12 p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-rose-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-rose-900 font-black text-[10px] uppercase tracking-widest mb-2">ВНИМАНИЕ ПРИ ПРОВЕРКЕ ПРОТОКОЛА</h4>
                      <p className="text-rose-800 text-lg leading-snug font-black italic">
                        "Открой заключение и фото! Сравни все досконально, не путай стороны расположения элементов. Это критично для ГИБДД."
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>AutoLegal Core v6.0.0</span>
                <span className="text-indigo-600">Document Legally Scanned</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
        AutoLegal Expert AI • 2024 • Профессиональный инструмент контроля документов ТС
      </footer>
    </div>
  );
};

export default App;
