import React from 'react';
import { useCurrentFrame } from 'remotion';

export type Expr = 'neutral' | 'happy' | 'sad' | 'surprised' | 'skeptical' | 'focused' | 'open';

export type CharProps = {
  x: number;
  y: number; // точка между ступнями
  scale?: number;
  armL?: number; // экранная левая рука: 0 = вниз, + наружу (градусы)
  armR?: number; // экранная правая рука: 0 = вниз, + наружу
  expr?: Expr;
  look?: [number, number]; // смещение зрачков, -1..1
  headRot?: number;
  sil?: string; // заливка силуэтом
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  walk?: number; // фаза ходьбы (радианы), undefined = стоит
  blinkSeed?: number;
  opacity?: number;
};

const DARK = '#2a1d17';

const useBlink = (seed = 0) => {
  const fr = useCurrentFrame() + seed * 37;
  const p = fr % 97;
  return p < 4 ? 0.12 : 1;
};

const Face: React.FC<{ r: number; expr: Expr; look: [number, number]; blink: number; sil?: string }> = ({
  r,
  expr,
  look,
  blink,
  sil,
}) => {
  if (sil) return null;
  const ex = r * 0.34;
  const ey = -r * 0.02;
  const lx = look[0] * r * 0.08;
  const ly = look[1] * r * 0.06;
  const eyeR = r * 0.085 * (expr === 'surprised' ? 1.25 : 1);
  const by = expr === 'surprised' ? -r * 0.42 : expr === 'focused' ? -r * 0.24 : -r * 0.3;
  const brow = (side: -1 | 1) => {
    const cx = side * ex;
    let tiltInner = 0;
    if (expr === 'sad') tiltInner = -r * 0.07;
    if (expr === 'focused') tiltInner = r * 0.06;
    let lift = 0;
    if (expr === 'skeptical' && side === 1) lift = -r * 0.1;
    const x1 = cx - side * r * 0.14; // внутренний край (ближе к центру)
    const x2 = cx + side * r * 0.14;
    return (
      <line
        x1={x1}
        y1={by + tiltInner + lift}
        x2={x2}
        y2={by + lift}
        stroke={DARK}
        strokeWidth={r * 0.06}
        strokeLinecap="round"
      />
    );
  };
  const my = r * 0.45;
  const mw = r * 0.24;
  let mouth: React.ReactNode;
  switch (expr) {
    case 'happy':
      mouth = <path d={`M${-mw},${my - 6} Q0,${my + r * 0.26} ${mw},${my - 6}`} fill="none" stroke={DARK} strokeWidth={r * 0.06} strokeLinecap="round" />;
      break;
    case 'sad':
      mouth = <path d={`M${-mw * 0.8},${my + 8} Q0,${my - r * 0.12} ${mw * 0.8},${my + 8}`} fill="none" stroke={DARK} strokeWidth={r * 0.06} strokeLinecap="round" />;
      break;
    case 'surprised':
      mouth = <ellipse cx={0} cy={my + 4} rx={r * 0.1} ry={r * 0.14} fill={DARK} />;
      break;
    case 'open':
      mouth = <ellipse cx={0} cy={my + 2} rx={r * 0.2} ry={r * 0.15} fill={DARK} />;
      break;
    case 'skeptical':
      mouth = <line x1={-mw * 0.7} y1={my + 4} x2={mw * 0.7} y2={my - 4} stroke={DARK} strokeWidth={r * 0.06} strokeLinecap="round" />;
      break;
    case 'focused':
      mouth = <line x1={-mw * 0.45} y1={my} x2={mw * 0.45} y2={my} stroke={DARK} strokeWidth={r * 0.06} strokeLinecap="round" />;
      break;
    default:
      mouth = <path d={`M${-mw * 0.7},${my} Q0,${my + r * 0.08} ${mw * 0.7},${my}`} fill="none" stroke={DARK} strokeWidth={r * 0.06} strokeLinecap="round" />;
  }
  return (
    <g>
      {[-1, 1].map((s) => (
        <ellipse key={s} cx={s * ex + lx} cy={ey + ly} rx={eyeR} ry={eyeR * blink} fill={DARK} />
      ))}
      {brow(-1)}
      {brow(1)}
      <ellipse cx={-r * 0.55} cy={r * 0.25} rx={r * 0.12} ry={r * 0.07} fill="#e88b6a" opacity={0.35} />
      <ellipse cx={r * 0.55} cy={r * 0.25} rx={r * 0.12} ry={r * 0.07} fill="#e88b6a" opacity={0.35} />
      {mouth}
    </g>
  );
};

const Arm: React.FC<{
  sx: number;
  sy: number;
  angle: number; // уже в системе SVG
  len: number;
  w: number;
  color: string;
  skin: string;
  hold?: React.ReactNode;
  counter?: React.ReactNode; // элемент, который держится вертикально (палка)
}> = ({ sx, sy, angle, len, w, color, skin, hold, counter }) => (
  <g transform={`translate(${sx},${sy}) rotate(${angle})`}>
    <rect x={-w / 2} y={-w / 2} width={w} height={len} rx={w / 2} fill={color} />
    <circle cx={0} cy={len} r={w * 0.62} fill={skin} />
    {counter ? <g transform={`translate(0,${len}) rotate(${-angle})`}>{counter}</g> : null}
    {hold ? <g transform={`translate(0,${len + w * 0.6}) rotate(${-angle})`}>{hold}</g> : null}
  </g>
);

export const Fruit: React.FC<{ r?: number; x?: number; y?: number }> = ({ r = 16, x = 0, y = 0 }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="#ff7a1a" />
    <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.28} fill="#ffb066" />
    <path d={`M0,${-r} q4,-8 10,-10`} stroke="#5a3d1e" strokeWidth={3} fill="none" />
  </g>
);

// ---------------- Герой (современный зритель) ----------------
export const Hero: React.FC<CharProps> = ({
  x,
  y,
  scale = 1,
  armL = 6,
  armR = 6,
  expr = 'neutral',
  look = [0, 0],
  headRot = 0,
  sil,
  holdL,
  holdR,
  walk,
  blinkSeed = 0,
  opacity = 1,
}) => {
  const blink = useBlink(blinkSeed);
  const breath = 1 + Math.sin((useCurrentFrame() + blinkSeed * 11) * 0.11) * 0.008;
  const C = {
    skin: sil ?? '#f1c39b',
    hoodie: sil ?? '#17a2a4',
    hoodieDark: sil ?? '#0f7f81',
    jeans: sil ?? '#2e3f6b',
    shoe: sil ?? '#f4f4f0',
    sole: sil ?? '#9aa0a6',
    hair: sil ?? '#3b2a20',
  };
  const sw = walk === undefined ? 0 : Math.sin(walk) * 18;
  const bob = walk === undefined ? 0 : Math.abs(Math.cos(walk)) * -6;
  const leg = (side: -1 | 1, rot: number) => (
    <g transform={`translate(${side * 20},-180) rotate(${rot})`}>
      <rect x={-15} y={0} width={30} height={170} rx={10} fill={C.jeans} />
      <rect x={side === -1 ? -28 : -14} y={160} width={44} height={20} rx={9} fill={C.shoe} />
      <rect x={side === -1 ? -28 : -14} y={174} width={44} height={6} rx={3} fill={C.sole} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${scale},${scale * breath})`} opacity={opacity}>
      <ellipse cx={0} cy={2} rx={70} ry={12} fill="#000" opacity={sil ? 0 : 0.15} />
      {leg(-1, sw)}
      {leg(1, -sw)}
      {/* капюшон за шеей */}
      <ellipse cx={0} cy={-348} rx={56} ry={24} fill={C.hoodieDark} />
      <rect x={-64} y={-350} width={128} height={190} rx={36} fill={C.hoodie} />
      <rect x={-40} y={-236} width={80} height={42} rx={12} fill={C.hoodieDark} />
      {!sil && (
        <>
          <line x1={-12} y1={-344} x2={-14} y2={-300} stroke="#f4f4f0" strokeWidth={4} strokeLinecap="round" />
          <line x1={12} y1={-344} x2={14} y2={-300} stroke="#f4f4f0" strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      <Arm sx={-56} sy={-330} angle={armL} len={140} w={28} color={C.hoodie} skin={C.skin} hold={holdL} />
      <Arm sx={56} sy={-330} angle={-armR} len={140} w={28} color={C.hoodie} skin={C.skin} hold={holdR} />
      <g transform={`translate(0,-432) rotate(${headRot})`}>
        <rect x={-16} y={60} width={32} height={30} fill={C.skin} />
        <circle cx={-78} cy={6} r={14} fill={C.skin} />
        <circle cx={78} cy={6} r={14} fill={C.skin} />
        <circle r={80} fill={C.skin} />
        <path
          d="M-80,-6 C-86,-70 -40,-98 0,-98 C46,-98 88,-72 80,-6 C70,-40 40,-56 6,-52 C-24,-50 -60,-40 -80,-6 Z"
          fill={C.hair}
        />
        <Face r={80} expr={expr} look={look} blink={blink} sil={sil} />
      </g>
    </g>
  );
};

// ---------------- Мальчишка / собиратель ----------------
export const Boy: React.FC<
  CharProps & { tunic?: string; withStick?: boolean; withBag?: boolean; adult?: boolean }
> = ({
  x,
  y,
  scale = 1,
  armL = 6,
  armR = 6,
  expr = 'neutral',
  look = [0, 0],
  headRot = 0,
  sil,
  holdL,
  holdR,
  walk,
  blinkSeed = 3,
  tunic = '#a8743f',
  withStick = true,
  withBag = true,
  adult = false,
  opacity = 1,
}) => {
  const blink = useBlink(blinkSeed);
  const breath = 1 + Math.sin((useCurrentFrame() + blinkSeed * 11) * 0.11) * 0.008;
  const C = {
    skin: sil ?? '#7b4a2a',
    skinDark: sil ?? '#653b20',
    tunic: sil ?? tunic,
    tunicDark: sil ?? '#8a5a2e',
    belt: sil ?? '#d6bf86',
    hair: sil ?? '#1d1410',
    bag: sil ?? '#7d4f2a',
    strap: sil ?? '#5a3820',
    stick: sil ?? '#9a7443',
  };
  const sw = walk === undefined ? 0 : Math.sin(walk) * 20;
  const bob = walk === undefined ? 0 : Math.abs(Math.cos(walk)) * -6;
  const H = adult ? 1.1 : 1;
  const stick = withStick ? (
    <g>
      <line x1={0} y1={-150} x2={0} y2={120} stroke={C.stick} strokeWidth={11} strokeLinecap="round" />
      <path d="M-5.5,120 L0,150 L5.5,120 Z" fill={C.stick} />
    </g>
  ) : null;
  const leg = (side: -1 | 1, rot: number) => (
    <g transform={`translate(${side * 18},-140) rotate(${rot})`}>
      <rect x={-13} y={0} width={26} height={132} rx={11} fill={C.skin} />
      <ellipse cx={side * 6} cy={134} rx={20} ry={9} fill={C.skinDark} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${scale * H},${scale * H * breath})`} opacity={opacity}>
      <ellipse cx={0} cy={2} rx={62} ry={11} fill="#000" opacity={sil ? 0 : 0.15} />
      {leg(-1, sw)}
      {leg(1, -sw)}
      {/* туника */}
      <path d="M-50,-300 Q0,-318 50,-300 L66,-128 Q0,-114 -66,-128 Z" fill={C.tunic} />
      {!sil && <path d="M-66,-128 Q0,-114 66,-128 L64,-138 Q0,-124 -64,-138 Z" fill={C.tunicDark} />}
      {!sil && (
        <g stroke={C.tunicDark} strokeWidth={3}>
          {[-48, -30, -12, 6, 24, 42].map((sx) => (
            <line key={sx} x1={sx} y1={-130} x2={sx + 2} y2={-120} />
          ))}
        </g>
      )}
      <rect x={-56} y={-212} width={112} height={12} rx={6} fill={C.belt} />
      {withBag && (
        <g>
          <path d="M34,-300 L-44,-186" stroke={C.strap} strokeWidth={7} strokeLinecap="round" />
          {/* узел на ремешке — понадобится в сцене 5 */}
          <circle cx={-4} cy={-244} r={8} fill={C.strap} />
          <path d="M-4,-244 l-9,12 M-4,-244 l8,13" stroke={C.strap} strokeWidth={4} strokeLinecap="round" />
          <path d="M-74,-196 Q-50,-206 -24,-196 L-28,-150 Q-50,-138 -72,-150 Z" fill={C.bag} />
          {!sil && <path d="M-72,-188 Q-50,-178 -26,-188" stroke="#5a3820" strokeWidth={3} fill="none" />}
        </g>
      )}
      <Arm sx={-48} sy={-292} angle={armL} len={128} w={24} color={C.skin} skin={C.skin} hold={holdL} />
      <Arm
        sx={48}
        sy={-292}
        angle={-armR}
        len={128}
        w={24}
        color={C.skin}
        skin={C.skin}
        hold={holdR}
        counter={stick}
      />
      <g transform={`translate(0,-378) rotate(${headRot})`}>
        <rect x={-14} y={54} width={28} height={30} fill={C.skin} />
        <circle cx={-70} cy={6} r={12} fill={C.skin} />
        <circle cx={70} cy={6} r={12} fill={C.skin} />
        <circle r={72} fill={C.skin} />
        {/* кудрявые волосы */}
        <g fill={C.hair}>
          {[-60, -40, -20, 0, 20, 40, 60].map((hx, i) => (
            <circle key={hx} cx={hx} cy={-50 - (i % 2) * 10 + Math.abs(hx) * 0.35} r={22} />
          ))}
          {[-48, -16, 16, 48].map((hx) => (
            <circle key={hx} cx={hx} cy={-70 + Math.abs(hx) * 0.3} r={20} />
          ))}
        </g>
        <Face r={72} expr={expr} look={look} blink={blink} sil={sil} />
      </g>
    </g>
  );
};
