// Таймлайн сцены 1. Источник фраз: ../scripts/scene01_timings.json (границы найдены по паузам).
// Все времена в "исходных" секундах аудио; m() переводит их во время монтажа с добавленными паузами.

export const FPS = 30;

export type Phrase = { id: string; start: number; end: number; text: string };

export const PHRASES: Phrase[] = [
  { id: 'A', start: 0.0, end: 3.5, text: 'Ты нашёл завтрак. На поиски ушло секунд двадцать.' },
  { id: 'B', start: 3.9, end: 5.6, text: 'Плод красивый, мягкий,' },
  { id: 'C', start: 6.02, end: 7.33, text: 'вокруг таких ещё полно.' },
  { id: 'D', start: 7.74, end: 10.55, text: 'На ветке сидит птица и ест точно такой же.' },
  { id: 'E', start: 10.92, end: 12.12, text: 'Выглядит убедительно.' },
  { id: 'F', start: 12.6, end: 14.21, text: 'Ты подносишь находку ко рту.' },
  { id: 'G', start: 14.61, end: 16.6, text: 'Сзади раздаётся короткий свист.' },
  { id: 'H', start: 17.05, end: 20.04, text: 'Мальчишка, которого отправили с тобой, качает головой.' },
  { id: 'I', start: 20.49, end: 22.0, text: 'Ты показываешь ему птицу.' },
  { id: 'J', start: 22.45, end: 24.06, text: 'Он показывает тебе на землю:' },
  { id: 'K', start: 24.46, end: 24.92, text: 'положи.' },
  { id: 'L', start: 25.45, end: 28.7, text: 'Хорошо. Допустим, этот завтрак отменяется.' },
  { id: 'M', start: 29.24, end: 32.24, text: 'Представь, что ты оказался среди древних собирателей.' },
  { id: 'N', start: 32.65, end: 40.11, text: 'Тело у тебя обычное, знания — современные. А вот отличать один дикий куст от другого ты почти не умеешь.' },
  { id: 'O', start: 40.54, end: 46.69, text: 'Сегодня ты идёшь за едой с подростком из местной группы. У него заострённая палка и небольшая сумка.' },
  { id: 'P', start: 47.05, end: 52.28, text: 'У тебя — общее представление об эволюции, электричестве и устройстве холодильника.' },
  { id: 'Q', start: 52.66, end: 53.95, text: 'Холодильника здесь нет.' },
  { id: 'R', start: 54.45, end: 58.45, text: 'К вечеру нужно вернуться на стоянку и принести еду людям у огня.' },
  { id: 'S', start: 58.84, end: 60.87, text: 'И вот что тебе предстоит выяснить:' },
  { id: 'T', start: 61.36, end: 63.41, text: 'как они вообще узнают еду?' },
  { id: 'U', start: 63.9, end: 70.92, text: 'Почему один человек останавливается возле неприметной травы, а другой проходит мимо дерева, которое ломится от плодов?' },
  { id: 'V', start: 71.4, end: 72.08, text: 'И главное —' },
  { id: 'W', start: 72.46, end: 76.67, text: 'если их кто-то научил, кто научил самого первого?' },
];

export const AUDIO_END = 76.67;

// Дополнительные паузы для шуток и смысловых акцентов (резка внутри существующих пауз).
export const GAPS = [
  { at: 12.36, add: 0.4 }, // после «Выглядит убедительно.»
  { at: 28.97, add: 0.5 }, // после «…завтрак отменяется.»
  { at: 52.47, add: 0.3 }, // перед «Холодильника здесь нет.»
  { at: 54.2, add: 0.6 }, // после «Холодильника здесь нет.»
  { at: 71.16, add: 0.5 }, // перед «И главное —»
];

export const m = (t: number) => t + GAPS.filter((g) => g.at <= t).reduce((s, g) => s + g.add, 0);
export const f = (sec: number) => Math.round(sec * FPS);
export const mf = (t: number) => f(m(t));

export const TAIL = 2.0; // кадр 17 без текста
export const TOTAL_SEC = m(AUDIO_END) + TAIL;
export const TOTAL_FRAMES = f(TOTAL_SEC);

// Аудио-куски между точками резки
export const AUDIO_SEGMENTS = (() => {
  const cuts = [0, ...GAPS.map((g) => g.at), AUDIO_END];
  return cuts.slice(0, -1).map((s, i) => ({ start: s, end: cuts[i + 1] }));
})();

// ---- Пословная оценка времени (пропорционально длине слов) ----
export type Word = { text: string; start: number; end: number; phrase: string };

const PUNCT_W: Record<string, number> = { ',': 3, '.': 5, ':': 4, '?': 5, '!': 5 };

export const WORDS: Word[] = (() => {
  const out: Word[] = [];
  for (const p of PHRASES) {
    const raw = p.text.split(/\s+/);
    // «—» приклеиваем к предыдущему слову
    const toks: string[] = [];
    for (const r of raw) {
      if (r === '—' && toks.length) toks[toks.length - 1] += ' —';
      else toks.push(r);
    }
    const weights = toks.map((t) => {
      const letters = t.replace(/[^\p{L}]/gu, '').length;
      const last = t.trim().slice(-1);
      return { w: letters + 2, pause: PUNCT_W[last] ?? (t.endsWith('—') ? 3 : 0) };
    });
    const total = weights.reduce((s, x) => s + x.w + x.pause, 0) - weights[weights.length - 1].pause;
    const unit = (p.end - p.start) / total;
    let c = p.start;
    toks.forEach((t, i) => {
      const s = c;
      const e = s + weights[i].w * unit;
      out.push({ text: t, start: s, end: e, phrase: p.id });
      c = e + weights[i].pause * unit;
    });
  }
  return out;
})();

/** Исходное время начала слова, содержащего stem, в фразе phraseId */
export const wt = (phraseId: string, stem: string, nth = 0): number => {
  const ws = WORDS.filter((w) => w.phrase === phraseId && w.text.toLowerCase().includes(stem.toLowerCase()));
  const w = ws[nth];
  if (!w) throw new Error(`word not found: ${phraseId}/${stem}`);
  return w.start;
};

// ---- Кадры (исходное время начала/конца) ----
export const SHOTS = {
  s6: [0, 10.7],
  s7: [10.7, 14.4],
  s8a: [14.4, 16.95],
  s8b: [16.95, 20.3],
  s9: [20.3, 25.2],
  s10: [25.2, 29.0],
  s11a: [29.0, 32.4],
  s11b: [32.4, 40.3],
  s12: [40.3, 46.9],
  s13: [46.9, 54.3],
  s14: [54.3, 58.6],
  s15a: [58.6, 63.6],
  s15b: [63.6, 71.2],
  s16: [71.2, AUDIO_END],
} as const;
