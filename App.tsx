
import React, { useState } from 'react';
import { AppStage, DocumentFile, AnalysisResult } from './types';
import { Button } from './components/Button';
import { analyzeDocuments } from './services/geminiService';

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
      setError("Пожалуйста, загрузите документы для анализа");
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
      setError(err.message || "Ошибка соединения с сервером аналитики.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff]">
      {/* Premium Header */}
      <header className="glass border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">AutoLegal <span className="text-indigo-600">Expert</span></h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">AI Audit System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Gemini 3 Pro Active
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Проверка переоборудования <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">без ошибок в ГИБДД</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Профессиональный ИИ-аудит ваших документов на соответствие Техрегламенту и требованиям ГАИ.
          </p>
        </div>

        {/* 1. Stage Selection */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</span>
            <h3 className="text-lg font-extrabold text-slate-800">Выберите текущий этап</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setStage(AppStage.PRELIMINARY)}
              className={`step-card p-6 rounded-3xl border-2 text-left relative overflow-hidden group ${
                stage === AppStage.PRELIMINARY 
                ? 'border-indigo-600 bg-indigo-50/30' 
                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${stage === AppStage.PRELIMINARY ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.246.477-4.5 1.253" />
                </svg>
              </div>
              <div className="font-extrabold text-slate-900">Предварительный</div>
              <p className="text-xs text-slate-500 mt-1">Доверенность + Заключение</p>
              {stage === AppStage.PRELIMINARY && <div className="absolute top-4 right-4 text-indigo-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
            </button>

            <button
              onClick={() => setStage(AppStage.FINAL)}
              className={`step-card p-6 rounded-3xl border-2 text-left relative overflow-hidden group ${
                stage === AppStage.FINAL 
                ? 'border-indigo-600 bg-indigo-50/30' 
                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${stage === AppStage.FINAL ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="font-extrabold text-slate-900">Финальный аудит</div>
              <p className="text-xs text-slate-500 mt-1">Протокол + Разрешение + ГБО</p>
              {stage === AppStage.FINAL && <div className="absolute top-4 right-4 text-indigo-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>}
            </button>
          </div>
        </section>

        {/* 2. Upload Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2</span>
            <h3 className="text-lg font-extrabold text-slate-800">Загрузите документы</h3>
          </div>

          <div className="group relative bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer">
            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" />
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white text-slate-400 shadow-sm">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Перетащите файлы сюда</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">Сфотографируйте документы или прикрепите PDF. Наш ИИ распознает любой текст.</p>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${file.mimeType.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                      {file.mimeType.includes('pdf') ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.414l4.293 4.293V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(idx)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Verification Block */}
        <section className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className={`p-4 rounded-2xl shadow-sm ${isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-bounce'}`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15.656c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className={`text-xl font-black uppercase tracking-tight ${isVerified ? 'text-emerald-900' : 'text-amber-900'}`}>
                Критически важно
              </h3>
              <p className={`text-sm leading-relaxed font-medium ${isVerified ? 'text-emerald-800' : 'text-amber-800'}`}>
                Переоборудование будет отклонено в ГИБДД, если на автомобиле есть судебные запреты, аресты или неоплаченные штрафы. Вы проверили машину по VIN/ГРЗ в базах ГИБДД и ФССП?
              </p>
              
              <label className={`flex items-center gap-4 p-4 bg-white border-2 rounded-2xl cursor-pointer transition-all ${isVerified ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg' : 'border-amber-200 hover:border-amber-400 shadow-sm'}`}>
                <div className="relative">
                  <input type="checkbox" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} className="peer sr-only" />
                  <div className="w-6 h-6 border-2 border-slate-300 rounded-lg bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                    <svg className={`w-4 h-4 text-white transition-opacity ${isVerified ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className={`text-sm font-bold select-none ${isVerified ? 'text-slate-900' : 'text-slate-600'}`}>
                  Я подтверждаю отсутствие ограничений на ТС
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Start Action */}
        <div className="flex flex-col items-center gap-6 py-8">
          <Button 
            onClick={handleAnalyze} 
            isLoading={isAnalyzing}
            className="w-full text-xl"
            disabled={files.length === 0 || !isVerified}
          >
            {isAnalyzing ? "Эксперт изучает документы" : "Запустить глубокий аудит"}
          </Button>
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
        </div>

        {/* Analysis Result */}
        {result && (
          <div className="space-y-8 animate-fade-in mb-20">
            <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.1)] border border-slate-100 overflow-hidden">
              <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider">Отчет эксперта</h3>
                    <p className="text-[10px] opacity-70 font-bold tracking-widest uppercase">Verified by AutoLegal AI</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                    ID: {Math.floor(result.timestamp / 1000)}
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="prose prose-indigo max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium text-[15px] custom-scrollbar max-h-[60vh] overflow-y-auto pr-4">
                    {result.text}
                  </div>
                </div>

                {stage === AppStage.FINAL && (
                  <div className="mt-12 p-8 bg-rose-50 rounded-[2rem] border-2 border-rose-100/50 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-rose-900 font-black text-xs uppercase tracking-[0.2em] mb-2">Глазами инспектора ГИБДД</h4>
                      <p className="text-rose-800 text-sm leading-relaxed font-bold italic">
                        "Возьмите в руки бумажное заключение и сверьте с реальным расположением элементов на машине прямо сейчас. ГИБДД не прощает ошибок в сторонах установки (лево/право) и маркировках оборудования."
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>AutoLegal Core v3.1</span>
                <span>Ready for GIBDD Submission</span>
              </div>
            </div>
            
            <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mx-auto flex">
              К новому анализу
            </Button>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          AutoLegal Expert AI • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default App;
