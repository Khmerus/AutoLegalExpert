
export enum AppStage {
  PRELIMINARY = 'PRELIMINARY', // Этап 1: Доверенность + Заключение
  FINAL = 'FINAL'              // Этап 2: Протокол + Разрешение + Доверенность
}

export interface DocumentFile {
  name: string;
  base64: string;
  mimeType: string;
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}
