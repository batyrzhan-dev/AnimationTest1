import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Fruit } from './characters';

export const W = 1920;
export const H = 1080;
export const FONT = 'Montserrat, sans-serif';

// ---------- Камера: фокус (cx, cy) в центр кадра с масштабом s ----------
export const Cam: React.FC<{ s: number; cx: number; cy: number; children: React.ReactNode }> = ({ s, cx, cy, children }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <g transform={`translate(${W / 2},${H / 2}) scale(${s}) translate(${-cx},${-cy})`}>{children}</g>
    </svg>
  </AbsoluteFill>
);

// ---------- Фон: рассвет в речной долине ----------
export const Dawn: React.FC<{ variant?: 'day' | 'dusk'; river?: boolean; smoke?: boolean }> = ({
  variant = 'day',
  river = false,
  smoke = true,
}) => {
  const fr = useCurrentFrame();
  const sky = variant === 'dusk' ? ['#3b2f5c', '#c86b4a'] : ['#f4b77e', '#fde6bd'];
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <radialGradient id="sunglow">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-1000} y={-600} width={W + 2000} height={H + 1200} fill={`url(#sky-${variant})`} />
      <circle cx={1450} cy={470} r={260} fill="url(#sunglow)" />
      <circle cx={1450} cy={470} r={70} fill="#ffd77a" />
      <path d="M-1000,560 C-200,470 300,500 700,520 C1100,540 1500,470 2100,500 L2900,520 L2900,1700 L-1000,1700 Z" fill="#d7a978" />
      <path d="M-1000,620 C-300,560 400,610 900,590 C1400,570 1700,620 2900,600 L2900,1700 L-1000,1700 Z" fill="#b8925f" />
      {/* дальние деревья */}
      {[120, 380, 560, 1180, 1660, 1820].map((tx, i) => (
        <g key={tx} transform={`translate(${tx},${600 - (i % 2) * 12})`}>
          <rect x={-3} y={-30} width={6} height={30} fill="#6d5536" />
          <ellipse cx={0} cy={-38} rx={42} ry={14} fill="#7f8a49" />
        </g>
      ))}
      <path d="M-1000,690 C-200,650 500,700 1000,680 C1500,660 2000,700 2900,680 L2900,1700 L-1000,1700 Z" fill="#a7a457" />
      {river && (
        <path
          d="M-200,700 C300,690 600,720 800,740 C1000,760 900,820 1200,840 C1500,860 1800,830 2400,820 L2400,880 C1800,900 1400,920 1150,900 C850,880 950,800 700,780 C500,760 200,760 -200,760 Z"
          fill="#6fb3c2"
          opacity={0.9}
        />
      )}
      <rect x={-1000} y={860} width={W + 2000} height={900} fill="#9aa152" />
      {/* дымок стоянки */}
      {smoke &&
        [0, 1, 2].map((i) => {
          const t = ((fr + i * 30) % 90) / 90;
          return (
            <circle
              key={i}
              cx={300 + t * 30 + Math.sin(t * 6) * 6}
              cy={590 - t * 140}
              r={8 + t * 18}
              fill="#efe6da"
              opacity={0.55 * (1 - t)}
            />
          );
        })}
      {/* травинки */}
      {Array.from({ length: 40 }).map((_, i) => {
        const gx = (i * 211) % 2600 - 300;
        const gy = 880 + ((i * 97) % 160);
        return <path key={i} d={`M${gx},${gy} l6,-26 l4,22 l6,-20 l3,24`} fill="none" stroke="#7d8a3f" strokeWidth={4} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ---------- Куст с плодами (вымышленное растение) ----------
export const Bush: React.FC<{ x: number; y: number; scale?: number; hidden?: number[]; alt?: boolean; sway?: number }> = ({
  x,
  y,
  scale = 1,
  hidden = [],
  alt = false,
  sway = 0,
}) => {
  const fruits = alt
    ? [[-70, -150], [10, -190], [80, -130], [-20, -100], [50, -70], [-90, -80]]
    : [[-80, -140], [0, -200], [70, -150], [-30, -95], [40, -80], [100, -95], [-110, -90]];
  const leaf = alt ? ['#56783a', '#6a8a44', '#4c6c33'] : ['#5b7d38', '#6f9142', '#4f7031'];
  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${sway})`}>
      <ellipse cx={0} cy={0} rx={150} ry={18} fill="#000" opacity={0.15} />
      <circle cx={-90} cy={-80} r={80} fill={leaf[2]} />
      <circle cx={90} cy={-85} r={78} fill={leaf[2]} />
      <circle cx={-40} cy={-150} r={90} fill={leaf[0]} />
      <circle cx={50} cy={-140} r={92} fill={leaf[1]} />
      <circle cx={0} cy={-70} r={100} fill={leaf[0]} />
      {fruits.map(([fx, fy], i) =>
        hidden.includes(i) ? null : <Fruit key={i} x={fx} y={fy} r={alt ? 15 : 17} />
      )}
    </g>
  );
};

// ---------- Дерево ----------
export const Tree: React.FC<{ x: number; y: number; scale?: number; fruits?: boolean }> = ({ x, y, scale = 1, fruits = false }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={150} ry={20} fill="#000" opacity={0.15} />
    <path d="M-28,0 L-20,-260 L-60,-330 M-20,-260 L20,-260 L28,0 Z" fill="#6b4a2b" />
    <rect x={-22} y={-300} width={44} height={300} fill="#6b4a2b" />
    <circle cx={-110} cy={-360} r={110} fill="#5e7b37" />
    <circle cx={100} cy={-370} r={115} fill="#5e7b37" />
    <circle cx={0} cy={-450} r={140} fill="#6f8f41" />
    <circle cx={-40} cy={-330} r={100} fill="#6f8f41" />
    <circle cx={60} cy={-320} r={90} fill="#678a3d" />
    {fruits &&
      [[-140, -360], [-60, -470], [40, -500], [120, -400], [0, -380], [-100, -300], [90, -310], [-20, -560], [150, -330]].map(
        ([fx, fy], i) => <Fruit key={i} x={fx} y={fy} r={18} />
      )}
  </g>
);

// ---------- Птица ----------
export const Bird: React.FC<{ x: number; y: number; scale?: number; peck?: boolean; flip?: boolean }> = ({
  x,
  y,
  scale = 1,
  peck = true,
  flip = false,
}) => {
  const fr = useCurrentFrame();
  const p = fr % 24;
  const headDown = peck && p < 8 ? Math.sin((p / 8) * Math.PI) * 28 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <path d="M-34,-6 L-64,-22 L-58,4 Z" fill="#6b4a32" />
      <ellipse cx={0} cy={0} rx={36} ry={24} fill="#8a6142" />
      <ellipse cx={-4} cy={4} rx={20} ry={13} fill="#6b4a32" />
      <ellipse cx={8} cy={10} rx={20} ry={12} fill="#c9a37a" />
      <g transform={`translate(26,-14) rotate(${headDown})`}>
        <circle r={17} fill="#8a6142" />
        <circle cx={6} cy={-4} r={3.5} fill="#1d1410" />
        <path d="M14,-2 L30,3 L14,8 Z" fill="#e0a030" />
      </g>
      <line x1={-6} y1={22} x2={-8} y2={34} stroke="#5a3d1e" strokeWidth={3} />
      <line x1={8} y1={22} x2={10} y2={34} stroke="#5a3d1e" strokeWidth={3} />
    </g>
  );
};

export const Stone: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-60,0 C-62,-30 -30,-48 0,-46 C36,-44 64,-26 60,0 Z" fill="#a8a093" />
    <path d="M-40,-30 C-20,-40 10,-40 30,-32" stroke="#c4bdb1" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- Экранная метка (плашка) ----------
export const Label: React.FC<{
  text: string;
  x: number;
  y: number;
  from: number; // кадр появления (локальный)
  size?: number;
  dark?: boolean;
  big?: boolean;
  until?: number;
}> = ({ text, x, y, from, size = 46, dark = true, big = false, until }) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (fr < from || (until !== undefined && fr > until + 8)) return null;
  const s = spring({ frame: fr - from, fps, config: { damping: 12, stiffness: 180 } });
  const out = until !== undefined ? interpolate(fr, [until, until + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${s * out})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: big ? '#fff6e0' : '#ffc531',
        background: big ? 'transparent' : dark ? 'rgba(35,28,24,0.88)' : 'transparent',
        padding: big ? 0 : '10px 26px',
        borderRadius: 14,
        letterSpacing: 1,
        whiteSpace: 'nowrap',
        textShadow: big ? '0 6px 0 rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.25)' : 'none',
      }}
    >
      {text}
    </div>
  );
};

// ---------- Выноска со стрелкой ----------
export const Callout: React.FC<{ text: string; from: number; lx: number; ly: number; tx: number; ty: number }> = ({
  text,
  from,
  lx,
  ly,
  tx,
  ty,
}) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (fr < from) return null;
  const s = spring({ frame: fr - from, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <line x1={lx} y1={ly} x2={lx + (tx - lx) * s} y2={ly + (ty - ly) * s} stroke="#ffc531" strokeWidth={6} strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={10 * s} fill="#ffc531" />
      </svg>
      <Label text={text} x={lx} y={ly} from={from} size={44} />
    </AbsoluteFill>
  );
};

// ---------- Облачко мысли ----------
export const ThoughtBubble: React.FC<{
  x: number;
  y: number;
  from: number;
  popAt?: number;
  fromX: number;
  fromY: number;
  children: React.ReactNode;
}> = ({ x, y, from, popAt, fromX, fromY, children }) => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (fr < from) return null;
  const s = spring({ frame: fr - from, fps, config: { damping: 10, stiffness: 160 } });
  if (popAt !== undefined && fr >= popAt) {
    const t = (fr - popAt) / 10;
    if (t > 1) return null;
    return (
      <g>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={x + Math.cos(a) * 140 * t} cy={y + Math.sin(a) * 110 * t} r={14 * (1 - t)} fill="#ffffff" />;
        })}
      </g>
    );
  }
  return (
    <g>
      <circle cx={fromX + (x - fromX) * 0.25} cy={fromY + (y - fromY) * 0.25} r={10 * s} fill="#fff" />
      <circle cx={fromX + (x - fromX) * 0.5} cy={fromY + (y - fromY) * 0.5} r={16 * s} fill="#fff" />
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={120} ry={95} fill="#fff" />
        <circle cx={-80} cy={-50} r={50} fill="#fff" />
        <circle cx={80} cy={-48} r={52} fill="#fff" />
        <circle cx={0} cy={-80} r={55} fill="#fff" />
        {children}
      </g>
    </g>
  );
};

export const IconDNA: React.FC = () => (
  <g>
    {Array.from({ length: 9 }).map((_, i) => {
      const yy = -70 + i * 17;
      const xx = Math.sin(i * 0.8) * 38;
      return <line key={i} x1={-xx} y1={yy} x2={xx} y2={yy} stroke="#9aa0a6" strokeWidth={5} />;
    })}
    <path d={Array.from({ length: 41 }).map((_, i) => `${i ? 'L' : 'M'}${Math.sin(i * 0.18) * 38},${-70 + i * 3.4}`).join(' ')} stroke="#17a2a4" strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d={Array.from({ length: 41 }).map((_, i) => `${i ? 'L' : 'M'}${-Math.sin(i * 0.18) * 38},${-70 + i * 3.4}`).join(' ')} stroke="#ff7a1a" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);

export const IconBolt: React.FC = () => <path d="M10,-80 L-40,10 L-2,10 L-16,80 L40,-14 L2,-14 Z" fill="#ffc531" stroke="#e09a12" strokeWidth={5} strokeLinejoin="round" />;

export const IconFridge: React.FC = () => (
  <g>
    <rect x={-42} y={-80} width={84} height={160} rx={12} fill="#e8eef2" stroke="#9aa0a6" strokeWidth={5} />
    <line x1={-42} y1={-22} x2={42} y2={-22} stroke="#9aa0a6" strokeWidth={5} />
    <rect x={24} y={-62} width={7} height={26} rx={3} fill="#9aa0a6" />
    <rect x={24} y={-6} width={7} height={36} rx={3} fill="#9aa0a6" />
  </g>
);

export const Campfire: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const fr = useCurrentFrame();
  const fl = 1 + Math.sin(fr * 0.6) * 0.08;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <rect x={-40} y={-10} width={80} height={14} rx={7} fill="#6b4a2b" transform="rotate(15)" />
      <rect x={-40} y={-10} width={80} height={14} rx={7} fill="#5a3d24" transform="rotate(-15)" />
      <g transform={`scale(1,${fl})`}>
        <path d="M-30,-6 C-34,-50 -6,-60 0,-96 C10,-60 36,-50 30,-6 Z" fill="#ff8a1e" />
        <path d="M-14,-6 C-16,-34 -2,-40 0,-60 C6,-40 18,-34 14,-6 Z" fill="#ffd24a" />
      </g>
    </g>
  );
};
