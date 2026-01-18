
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
      newFiles.push({ 
        name: file.name, 
        base64: await base64Promise, 
        mimeType: file.type 
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Пожалуйста, загрузите хотя бы один документ.");
      return;
    }
    if (!isVerified) {
      setError("Необходимо подтвердить проверку на запреты.");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const text = await analyzeDocuments(files, stage);
      setResult({ text, timestamp: Date.now() });
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setError(err.message || "Произошла непредвиденная ошибка.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">AutoLegal <span className="text-indigo-600">Expert</span></h1>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Audit System v6.2</p>
            </div>
          </div>
          <div className="flex gap-2 items-center px-4 py-2 bg-slate-100 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">AI Connected</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-tight">
            Аудит документов <br className="hidden md:block"/>
            <span className="text-indigo-600">ГИБДД за секунды</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Автоматическая проверка переоборудования ТС на соответствие техническому регламенту 018/2011.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-slate-200">01</span>
                <h3 className="text-xs font-black uppercase tracking-widest">Выберите этап</h3>
              </div>
              <div className="grid gap-4">
                {[
                  { id: AppStage.PRELIMINARY, title: 'Этап 1: Предварительный', desc: 'Доверенность + Заключение' },
                  { id: AppStage.FINAL, title: 'Этап 2: Итоговый', desc: 'Протокол + Разрешение' }
                ].map((s) => (
                  <button 
                    key={s.id} 
                    onClick={() => setStage(s.id)} 
                    className={`text-left p-6 rounded-[2.5rem] border-2 transition-all duration-300 relative ${stage === s.id ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                  >
                    <div className={`text-lg font-black ${stage === s.id ? 'text-indigo-600' : 'text-slate-900'}`}>{s.title}</div>
                    <div className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider leading-tight">{s.desc}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-amber-100 shadow-sm'}`}>
               <div className="flex gap-5 mb-6">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-amber-500 text-white animate-pulse'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15.656c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <div>
                   <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">VIN-контроль</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 leading-relaxed">Проверьте машину на ограничения в базе ГИБДД перед аудитом.</p>
                 </div>
               </div>
               <label className={`flex items-center gap-4 p-5 bg-white border-2 rounded-[1.5rem] cursor-pointer transition-all ${isVerified ? 'border-emerald-500 shadow-lg' : 'border-slate-100 hover:border-amber-200'}`}>
                 <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="w-6 h-6 rounded-lg text-indigo-600" />
                 <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Ограничений по базе ГИБДД нет</span>
               </label>
            </section>

            <Button onClick={handleAnalyze} isLoading={isAnalyzing} className="w-full h-20 text-xl shadow-2xl shadow-indigo-200 rounded-[2rem]" disabled={files.length === 0 || !isVerified}>
              Начать AI-проверку
            </Button>
            
            {error && (
              <div className="p-6 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-2xl border border-rose-200 text-center leading-relaxed animate-in fade-in zoom-in duration-300">
                <div className="uppercase tracking-widest mb-1">Критическая ошибка</div>
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-slate-200">02</span>
                <h3 className="text-xs font-black uppercase tracking-widest">Загрузка документов</h3>
              </div>
              <div className="relative group">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*,application/pdf" />
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3.5rem] p-16 flex flex-col items-center justify-center text-center group-hover:bg-indigo-50/10 group-hover:border-indigo-300 transition-all duration-500 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h5 className="text-2xl font-black text-slate-900 tracking-tight">Добавить файлы</h5>
                  <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-[0.3em]">PDF или Фото (до 10 шт.)</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden border-l-4 border-l-indigo-500">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[13px] font-black text-slate-800 truncate">{file.name}</div>
                          <div className="text-[9px] text-slate-400 font-black uppercase">{file.mimeType.split('/')[1]}</div>
                        </div>
                      </div>
                      <button onClick={() => removeFile(idx)} className="p-3 text-slate-300 hover:text-rose-500 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {result && (
          <section id="results" className="mt-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="bg-slate-900 px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Отчет эксперта</h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mt-1">Audit Documentation Ready</p>
                  </div>
                </div>
                <div className="text-right text-white">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ВРЕМЯ АНАЛИЗА</div>
                   <div className="text-2xl font-black">{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              <div className="p-12 md:p-20">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-semibold text-lg max-h-[75vh] overflow-y-auto pr-6 custom-scrollbar">
                  {result.text}
                </div>

                {stage === AppStage.FINAL && (
                  <div className="mt-16 p-10 bg-rose-50 rounded-[3.5rem] border border-rose-100 flex flex-col md:flex-row gap-8 items-start shadow-sm">
                    <div className="w-16 h-16 bg-rose-600 text-white rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-rose-900 font-black text-[11px] uppercase tracking-[0.4em] mb-3">Важное предупреждение</h4>
                      <p className="text-rose-800 text-xl leading-snug font-black italic">
                        "Сверьте Заключение и Протокол по каждой цифре! ГИБДД отказывает даже из-за опечатки в одной букве маркировки баллона ГБО."
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-12 py-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
                <span>AutoLegal AI v6.2.0</span>
                <span className="text-indigo-600">Secure Protocol</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="py-20 border-t border-slate-100 text-center space-y-4 bg-white/50">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.8em]">AutoLegal Expert AI • 2024</p>
        <p className="text-[10px] text-slate-300 font-bold max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
          Профессиональный аудит документов для регистрации изменений в конструкцию ТС.
        </p>
      </footer>
    </div>
  );
};

export default App;
