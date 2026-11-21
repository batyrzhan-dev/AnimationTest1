import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WORDS, mf } from './timeline';
import { FONT } from './world';

// Ключевые слова подсвечиваются жёлтым (как смысловые акценты, не каждое слово)
const KEY = [
  'завтрак', 'птиц', 'свист', 'положи', 'отменя', 'собирател', 'куст', 'палк', 'сумк',
  'холодильник', 'нет.', 'темнот', 'огня', 'еду', 'первого', 'травы', 'плодов', 'современ', 'ко рту',
];

type Chunk = { words: string[]; start: number; end: number };

const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: typeof WORDS = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({ words: cur.map((w) => w.text), start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (prev && prev.phrase !== w.phrase) flush();
    cur.push(w);
    const chars = cur.map((x) => x.text).join(' ').length;
    if (/[.,:?!—]$/.test(w.text)) flush();
    else if (chars >= 16 || cur.length >= 3) {
      // не заканчиваем строку коротким служебным словом («ты», «и», «на»)
      const last = cur[cur.length - 1];
      if (cur.length > 1 && last.text.replace(/[^\p{L}]/gu, '').length <= 2) {
        cur.pop();
        flush();
        cur.push(last);
      } else flush();
    }
  });
  flush();
  return out;
})();

export const Subtitles: React.FC = () => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = CHUNKS.findIndex((c, i) => {
    const s = mf(c.start);
    const next = CHUNKS[i + 1];
    const e = next ? Math.min(mf(next.start), mf(c.end) + 12) : mf(c.end) + 15;
    return fr >= s && fr < e;
  });
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const pop = spring({ frame: fr - mf(c.start), fps, config: { damping: 15, stiffness: 260 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 66,
          textTransform: 'uppercase',
          letterSpacing: 1,
          transform: `scale(${0.85 + 0.15 * pop})`,
          WebkitTextStroke: '14px #1c1512',
          paintOrder: 'stroke fill',
          textAlign: 'center',
        }}
      >
        {c.words.map((w, i) => {
          const isKey = KEY.some((k) => w.toLowerCase().includes(k));
          return (
            <span key={i} style={{ color: isKey ? '#ffc531' : '#ffffff' }}>
              {w.replace(/[.,:]$/, '')}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Счётчик добычи в сумке (будет меняться по ходу ролика)
export const BagCounter: React.FC<{ count: number; slots?: number }> = ({ count, slots = 6 }) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: fr, fps, config: { damping: 13 } });
  return (
    <div
      style={{
        position: 'absolute',
        right: 48,
        top: 40,
        transform: `translateY(${(1 - s) * -120}px)`,
        background: 'rgba(35,28,24,0.85)',
        borderRadius: 18,
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 34,
        color: '#ffc531',
      }}
    >
      <svg width={44} height={44} viewBox="-30 -30 60 60">
        <path d="M-12,-26 L12,-26" stroke="#b07a45" strokeWidth={5} strokeLinecap="round" />
        <path d="M-24,-14 Q0,-24 24,-14 L20,20 Q0,30 -20,20 Z" fill="#b07a45" />
      </svg>
      СУМКА
      <div style={{ display: 'flex', gap: 8, marginLeft: 6 }}>
        {Array.from({ length: slots }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              border: '4px solid #ffc531',
              background: i < count ? '#ff7a1a' : 'transparent',
              opacity: i < count ? 1 : 0.55,
            }}
          />
        ))}
      </div>
    </div>
  );
};
