import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Audio } from 'remotion';
import { Boy, Expr, Fruit, Hero } from './characters';
import { BagCounter, Subtitles } from './overlay';
import { AUDIO_END, AUDIO_SEGMENTS, FPS, SHOTS, TOTAL_FRAMES, f, m, mf, wt } from './timeline';
import {
  Bird,
  Bush,
  Callout,
  Cam,
  Campfire,
  Dawn,
  FONT,
  H,
  IconBolt,
  IconDNA,
  IconFridge,
  Label,
  Stone,
  ThoughtBubble,
  Tree,
  W,
} from './world';

// ---------- helpers ----------
const ease = Easing.inOut(Easing.cubic);
const ip = (fr: number, a: number, b: number, v1: number, v2: number) =>
  interpolate(fr, [a, b], [v1, v2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
/** Цепочка ключевых кадров: [[frame, value], ...] */
const kf = (fr: number, keys: [number, number][]) => {
  if (fr <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (fr <= keys[i][0]) return ip(fr, keys[i - 1][0], keys[i][0], keys[i - 1][1], keys[i][1]);
  }
  return keys[keys.length - 1][1];
};
const pick = <T,>(fr: number, keys: [number, T][]): T => {
  let v = keys[0][1];
  for (const [k, val] of keys) if (fr >= k) v = val;
  return v;
};

type ShotProps = { os: number }; // исходное время начала кадра
const useAt = (os: number) => {
  const base = mf(os);
  return (t: number) => mf(t) - base;
};

const ShotSeq: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const a = mf(from);
  const b = to >= AUDIO_END ? f(m(AUDIO_END)) : mf(to);
  return (
    <Sequence from={a} durationInFrames={b - a} layout="none">
      <AbsoluteFill>{children}</AbsoluteFill>
    </Sequence>
  );
};

// ================= КАДР 6: куст, птица, завтрак =================
const Shot6: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const reach = at(0.9);
  const grab = at(1.55);
  const raise = at(2.4);
  const armR = kf(fr, [[reach, 6], [grab, 39], [grab + 2, 39], [raise, 118]]);
  const has = fr >= grab;
  const push = at(7.6);
  const s = fr < push ? ip(fr, 0, push, 1.0, 1.06) : ip(fr, push, push + 40, 1.06, 1.45);
  const cx = fr < push ? 960 : ip(fr, push, push + 40, 960, 1170);
  const cy = fr < push ? 560 : ip(fr, push, push + 40, 560, 640);
  return (
    <AbsoluteFill>
      <Cam s={s} cx={cx} cy={cy}>
        <Dawn />
        <Bush x={1230} y={900} scale={1.2} hidden={has ? [0] : []} />
        <Bird x={1245} y={612} scale={1.1} />
        <Hero
          x={980}
          y={940}
          armR={armR}
          holdR={has ? <Fruit r={18} /> : undefined}
          expr="happy"
          look={fr < raise ? [1, 0.2] : [1, -0.7]}
        />
      </Cam>
      <Label text="РАССВЕТ" x={W / 2} y={150} from={6} until={at(2.6)} size={110} big />
    </AbsoluteFill>
  );
};

// ================= КАДР 7–8a: крупный план, плод ко рту, свист =================
const Shot7: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const f0 = at(12.6);
  const f1 = at(13.9);
  const fx = ip(fr, f0, f1, 1150, 1040);
  const fy = ip(fr, f0, f1, 780, 585);
  const expr: Expr = fr > at(13.5) ? 'open' : 'happy';
  return (
    <Cam s={ip(fr, 0, at(14.4), 2.5, 2.75)} cx={1010} cy={520}>
      <Dawn />
      <Bush x={1230} y={900} scale={1.2} hidden={[0]} />
      <Hero x={980} y={940} armR={6} expr={expr} look={fr < f0 ? [1, 0.6] : [0.4, 0.9]} />
      <Fruit x={fx} y={fy} r={20} />
    </Cam>
  );
};

const Shot8a: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const w = at(16.62);
  const shake = fr >= w && fr < w + 8 ? Math.sin(fr * 2.5) * 6 : 0;
  const expr: Expr = fr >= w ? 'surprised' : 'open';
  return (
    <Cam s={2.75} cx={1010 + shake} cy={520}>
      <Dawn />
      <Bush x={1230} y={900} scale={1.2} hidden={[0]} />
      <Hero x={980} y={940} armR={6} expr={expr} look={fr >= w ? [-1, 0] : [0.4, 0.9]} />
      <Fruit x={1040} y={585} r={20} />
    </Cam>
  );
};

// ================= КАДР 8b: мальчишка качает головой =================
const Shot8b: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const sh0 = at(18.6);
  const shaking = fr > sh0 && fr < sh0 + 45;
  const headRot = shaking ? Math.sin((fr - sh0) * 0.5) * 9 : 0;
  return (
    <Cam s={ip(fr, 0, at(20.3), 1.3, 1.38)} cx={960} cy={650}>
      <Dawn />
      <Bush x={420} y={900} scale={0.9} />
      <Boy x={960} y={960} scale={1.2} expr="skeptical" headRot={headRot} look={[-0.6, 0]} />
    </Cam>
  );
};

// ================= КАДР 9: «птица» / «положи» =================
const Shot9: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const i0 = at(20.55);
  const j0 = at(22.5);
  const k0 = at(24.46);
  const heroArmL = kf(fr, [[i0, 6], [i0 + 8, 150], [j0 + 4, 150], [j0 + 14, 8]]);
  const boyArmL = kf(fr, [[j0, 6], [j0 + 8, 38]]);
  const heroExpr: Expr = fr >= k0 ? 'sad' : fr >= j0 ? 'neutral' : 'happy';
  return (
    <Cam s={1} cx={960} cy={540}>
      <Dawn />
      <Bush x={330} y={900} scale={1.1} hidden={[0]} />
      <Bird x={340} y={615} scale={1} />
      <Hero
        x={760}
        y={940}
        armL={heroArmL}
        armR={22}
        holdR={<Fruit r={18} />}
        expr={heroExpr}
        look={fr < j0 ? [-1, -1] : fr < k0 ? [1, 0.2] : [0.6, 1]}
      />
      <Boy x={1260} y={940} armL={boyArmL} expr={fr >= j0 ? 'focused' : 'neutral'} look={fr >= j0 ? [-0.8, 0.8] : [-1, 0]} />
    </Cam>
  );
};

// ================= КАДР 10: «завтрак отменяется» =================
const Shot10: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const st = at(wt('L', 'отменя'));
  return (
    <AbsoluteFill>
      <Cam s={ip(fr, 0, at(29), 1.7, 1.8)} cx={960} cy={640}>
        <Dawn />
        <Bush x={1320} y={900} scale={1.2} hidden={[0]} />
        <Hero x={960} y={940} armR={kf(fr, [[0, 22], [20, 14]])} holdR={<Fruit r={18} />} expr="sad" look={[0.7, 1]} />
      </Cam>
      {fr >= st && (
        <div
          style={{
            position: 'absolute',
            left: 1320,
            top: 300,
            transform: `translate(-50%,-50%) rotate(-10deg) scale(${ip(fr, st, st + 6, 1.8, 1)})`,
            opacity: ip(fr, st, st + 4, 0, 1),
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 72,
            color: '#e2412f',
            border: '8px solid #e2412f',
            borderRadius: 14,
            padding: '4px 24px',
          }}
        >
          ОТМЕНЁН
        </div>
      )}
    </AbsoluteFill>
  );
};

// ================= КАДР 11a: долина =================
const Shot11a: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const walk = fr * 0.35;
  const dx = fr * 1.2;
  return (
    <Cam s={ip(fr, 0, at(32.4), 1.25, 1.0)} cx={960} cy={560}>
      <Dawn river />
      <Hero x={820 + dx} y={800} scale={0.26} walk={walk} armL={10 + Math.sin(walk) * 10} armR={10 - Math.sin(walk) * 10} />
      <Boy x={900 + dx} y={800} scale={0.26} walk={walk + 1} />
    </Cam>
  );
};

// ================= КАДР 11b: два одинаковых куста =================
const Shot11b: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const lx = kf(fr, [[at(33.4), 0], [at(33.6), -1], [at(35.0), -1], [at(35.2), 1], [at(36.4), 1], [at(36.6), -1], [at(37.6), -1], [at(37.8), 1]]);
  const shrug = at(wt('N', 'почти'));
  const arm = kf(fr, [[shrug, 8], [shrug + 8, 48]]);
  return (
    <AbsoluteFill>
      <Cam s={ip(fr, 0, at(40.3), 1.0, 1.06)} cx={960} cy={560}>
        <Dawn />
        <Bush x={520} y={920} scale={1.3} />
        <Bush x={1400} y={920} scale={1.3} alt />
        <Hero x={960} y={950} armL={arm} armR={arm} expr={fr >= shrug ? 'sad' : 'neutral'} look={[lx, 0.2]} />
      </Cam>
      <Label text="?" x={520} y={330} from={at(wt('N', 'отличать'))} size={120} big />
      <Label text="?" x={1400} y={330} from={at(wt('N', 'отличать')) + 6} size={120} big />
    </AbsoluteFill>
  );
};

// ================= КАДР 12: спутник, выноски =================
const Shot12: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #f7e7c6 0%, #e6c896 70%, #d7b47c 100%)' }}>
      <Cam s={1} cx={960} cy={540}>
        <Boy x={960} y={1010} scale={1.45} expr={fr > at(46.0) ? 'happy' : 'neutral'} look={[0, 0]} />
      </Cam>
      <Label text="ТВОЙ СПУТНИК" x={W / 2} y={110} from={at(wt('O', 'подростк'))} size={64} />
      <Callout text="ПАЛКА-КОПАЛКА" from={at(wt('O', 'палк'))} lx={1450} ly={470} tx={1052} ty={620} />
      <Callout text="СУМКА" from={at(wt('O', 'сумк'))} lx={470} ly={720} tx={880} ty={765} />
    </AbsoluteFill>
  );
};

// ================= КАДР 13: облачка мыслей и холодильник =================
const Shot13: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const no = at(wt('Q', 'нет'));
  const expr: Expr = fr >= no + 4 ? 'sad' : fr >= at(52.66) ? 'surprised' : 'happy';
  const hx = 640;
  const hy = 1000;
  return (
    <Cam s={1} cx={960} cy={540}>
      <Dawn />
      <Hero x={hx} y={hy} scale={1.12} expr={expr} look={[0.8, -0.8]} armL={6} armR={fr < no ? 6 : kf(fr, [[no, 6], [no + 8, 40]])} />
      <ThoughtBubble x={1050} y={300} fromX={760} fromY={420} from={at(wt('P', 'эволюц'))}>
        <IconDNA />
      </ThoughtBubble>
      <ThoughtBubble x={1380} y={250} fromX={760} fromY={420} from={at(wt('P', 'электр'))}>
        <IconBolt />
      </ThoughtBubble>
      <ThoughtBubble x={1560} y={560} fromX={760} fromY={420} from={at(wt('P', 'холодильн'))} popAt={no}>
        <IconFridge />
      </ThoughtBubble>
    </Cam>
  );
};

// ================= КАДР 14: схема маршрута =================
const ROUTE: [number, number][] = [
  [360, 640], [520, 700], [700, 760], [900, 780], [1100, 740], [1300, 680], [1480, 620], [1560, 600],
];
const partial = (pts: [number, number][], p: number) => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * p;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1]);
      left -= seg[i];
    } else {
      const t = left / seg[i];
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
      break;
    }
  }
  return out;
};

const Shot14: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const p = ip(fr, at(54.6), at(57.6), 0, 1);
  const pts = partial(ROUTE, p);
  const head = pts[pts.length - 1];
  const sunT = ip(fr, 0, at(58.6), 0.15, 0.85);
  const sx = 260 + sunT * 1400;
  const sy = 330 - Math.sin(sunT * Math.PI) * 170;
  return (
    <AbsoluteFill style={{ background: '#f3e2bf' }}>
      <Cam s={1} cx={960} cy={540}>
        <path d="M120,300 Q960,90 1800,300" stroke="#d8c39a" strokeWidth={6} strokeDasharray="4 18" fill="none" strokeLinecap="round" />
        <circle cx={sx} cy={sy} r={46} fill="#ffc531" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={sx + Math.cos(a) * 60} y1={sy + Math.sin(a) * 60} x2={sx + Math.cos(a) * 78} y2={sy + Math.sin(a) * 78} stroke="#ffc531" strokeWidth={8} strokeLinecap="round" />;
        })}
        <path d="M150,860 C500,820 700,900 1000,870 C1300,840 1500,900 1800,860" stroke="#6fb3c2" strokeWidth={40} fill="none" strokeLinecap="round" />
        <Bush x={340} y={680} scale={0.55} hidden={[0]} />
        <Campfire x={1580} y={620} scale={1.4} />
        <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke="#2b211c" strokeWidth={10} strokeDasharray="26 20" strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={16} fill="#17a2a4" stroke="#fff" strokeWidth={5} />
      </Cam>
      <Label text="СТОЯНКА" x={1580} y={720} from={at(54.6) + 10} size={40} />
      <Label text="ВЕРНУТЬСЯ ДО ТЕМНОТЫ" x={W / 2} y={470} from={at(wt('R', 'вернуть'))} size={60} />
    </AbsoluteFill>
  );
};

// ================= КАДР 15a: «зелёная стена» и указатели =================
const LEAVES = Array.from({ length: 70 }).map((_, i) => ({
  x: ((i * 173) % 2100) - 90,
  y: ((i * 97) % 760) - 40,
  r: 60 + ((i * 31) % 70),
  c: ['#5b7d38', '#6f9142', '#4f7031', '#668a3e'][i % 4],
}));
const Shot15a: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const t0 = at(61.36);
  const marks = [[1180, 380], [1460, 260], [1640, 470]];
  return (
    <Cam s={1} cx={960} cy={540}>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#4a6a2e" />
      {LEAVES.map((l, i) => (
        <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={l.c} />
      ))}
      <rect x={-100} y={820} width={W + 200} height={400} fill="#8f9a4a" />
      {marks.map(([mx, my], i) => {
        const a = t0 + i * 7;
        if (fr < a) return null;
        const s = ip(fr, a, a + 8, 0, 1);
        return <circle key={i} cx={mx} cy={my} r={44 * s} fill="none" stroke="#ffc531" strokeWidth={8} />;
      })}
      <Hero x={520} y={1000} scale={1.05} expr="neutral" look={[Math.sin(fr * 0.08), -0.8]} />
      <Boy x={1320} y={1000} scale={1.1} expr="focused" look={fr < t0 ? [-0.3, -0.8] : [0.8, -0.9]} />
    </Cam>
  );
};

// ================= КАДР 15b: сплит «трава / дерево» =================
const Panel: React.FC<{ left: number; children: React.ReactNode }> = ({ left, children }) => (
  <div style={{ position: 'absolute', left, top: 0, width: W / 2, height: H, overflow: 'hidden' }}>
    <svg width={W / 2} height={H} viewBox={`0 0 ${W / 2} ${H}`}>
      {children}
    </svg>
  </div>
);
const Shot15b: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const r0 = at(wt('U', 'другой'));
  const walkX = ip(fr, r0, at(70.9), 820, 120);
  return (
    <AbsoluteFill>
      <Panel left={0}>
        <g transform="translate(-480,0)">
          <Dawn smoke={false} />
        </g>
        <Boy x={430} y={1080} scale={1.15} expr="focused" look={[0.4, 1]} headRot={8} armR={30} />
        {/* неприметная трава: без признаков съедобности */}
        {[300, 360, 520, 600, 660].map((gx, i) => (
          <path key={i} d={`M${gx},960 l-10,-60 M${gx},960 l2,-80 M${gx},960 l14,-56`} stroke="#5e7a35" strokeWidth={7} strokeLinecap="round" />
        ))}
        <rect x={0} y={950} width={W / 2} height={200} fill="#9aa152" />
      </Panel>
      <Panel left={W / 2}>
        <Dawn smoke={false} />
        <Tree x={520} y={960} scale={1.05} fruits />
        <Boy x={walkX} y={990} scale={1.0} adult tunic="#8b6a4a" withStick={false} withBag={false} walk={fr * 0.35} look={[-1, 0]} />
      </Panel>
      <div style={{ position: 'absolute', left: W / 2 - 5, top: 0, width: 10, height: H, background: '#fff6e0' }} />
      <Label text="ОСТАНАВЛИВАЕТСЯ" x={W / 4} y={210} from={at(wt('U', 'останавл'))} size={50} />
      <Label text="ПРОХОДИТ МИМО" x={(W * 3) / 4} y={210} from={at(wt('U', 'проходит'))} size={50} />
    </AbsoluteFill>
  );
};

// ================= КАДР 16: цепочка учителей =================
const Shot16: React.FC<ShotProps> = ({ os }) => {
  const fr = useCurrentFrame();
  const at = useAt(os);
  const q = at(wt('W', 'первого'));
  const pairs = Array.from({ length: 6 }).map((_, i) => {
    const k = Math.pow(0.66, i);
    const side = i % 2 === 0 ? 1 : -1;
    return { i, k, x: 960 + side * 430 * k, y: 600 + 420 * k };
  });
  const shade = (i: number) => ['#23182a', '#3a2a40', '#553f55', '#6f566a', '#8a6f7e', '#a48a92'][i];
  return (
    <AbsoluteFill>
      <Cam s={ip(fr, 0, f(m(AUDIO_END)) - mf(os), 1.0, 1.55)} cx={960} cy={600}>
        <Dawn variant="dusk" smoke={false} />
        <rect x={-1000} y={600} width={4000} height={1000} fill="#3d3040" opacity={0.55} />
        {pairs
          .slice()
          .reverse()
          .map(({ i, k, x, y }) => {
            const appear = at(71.3) + (5 - i) * 4;
            if (fr < appear) return null;
            const o = ip(fr, appear, appear + 8, 0, 1);
            return (
              <g key={i}>
                <Boy x={x - 70 * k} y={y} scale={0.85 * k} adult sil={shade(i)} withBag={false} withStick={false} armR={30} opacity={o} />
                <Boy x={x + 90 * k} y={y} scale={0.55 * k} sil={shade(i)} withBag={false} withStick={false} opacity={o} />
              </g>
            );
          })}
      </Cam>
      <Label text="?" x={W / 2} y={380} from={q} size={220} big />
    </AbsoluteFill>
  );
};

// ================= КАДР 17: плод на камень, догоняешь =================
const Shot17: React.FC = () => {
  const fr = useCurrentFrame();
  const place = 10;
  const run = 26;
  const hx = fr < run ? 900 : 900 + Math.pow(fr - run, 1.35) * 9;
  const fade = interpolate(fr, [44, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Cam s={1} cx={960} cy={540}>
        <Dawn />
        <Bush x={500} y={900} scale={1.2} hidden={[0]} />
        <Stone x={1080} y={950} scale={1.1} />
        {fr >= place && <Fruit x={1085} y={890} r={18} />}
        <Boy x={1700 + fr * 9} y={940} walk={fr * 0.45} look={[1, 0]} />
        <Hero
          x={hx}
          y={940}
          armR={fr < place ? 30 : 8}
          holdR={fr < place ? <Fruit r={18} /> : undefined}
          walk={fr >= run ? fr * 0.55 : undefined}
          look={[1, 0]}
          expr="neutral"
        />
      </Cam>
      <AbsoluteFill style={{ background: '#000', opacity: fade }} />
    </AbsoluteFill>
  );
};

// ================= Сборка =================
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={mf(at)} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} />
  </Sequence>
);

export const Scene01: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ShotSeq from={SHOTS.s6[0]} to={SHOTS.s6[1]}><Shot6 os={SHOTS.s6[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s7[0]} to={SHOTS.s7[1]}><Shot7 os={SHOTS.s7[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s8a[0]} to={SHOTS.s8a[1]}><Shot8a os={SHOTS.s8a[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s8b[0]} to={SHOTS.s8b[1]}><Shot8b os={SHOTS.s8b[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s9[0]} to={SHOTS.s9[1]}><Shot9 os={SHOTS.s9[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s10[0]} to={SHOTS.s10[1]}><Shot10 os={SHOTS.s10[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s11a[0]} to={SHOTS.s11a[1]}><Shot11a os={SHOTS.s11a[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s11b[0]} to={SHOTS.s11b[1]}><Shot11b os={SHOTS.s11b[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s12[0]} to={SHOTS.s12[1]}><Shot12 os={SHOTS.s12[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s13[0]} to={SHOTS.s13[1]}><Shot13 os={SHOTS.s13[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s14[0]} to={SHOTS.s14[1]}><Shot14 os={SHOTS.s14[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s15a[0]} to={SHOTS.s15a[1]}><Shot15a os={SHOTS.s15a[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s15b[0]} to={SHOTS.s15b[1]}><Shot15b os={SHOTS.s15b[0]} /></ShotSeq>
      <ShotSeq from={SHOTS.s16[0]} to={SHOTS.s16[1]}><Shot16 os={SHOTS.s16[0]} /></ShotSeq>
      <Sequence from={f(m(AUDIO_END))} durationInFrames={TOTAL_FRAMES - f(m(AUDIO_END))} layout="none">
        <Shot17 />
      </Sequence>

      {/* HUD: сумка появляется на слове «сумка» */}
      <Sequence from={mf(wt('O', 'сумк'))} durationInFrames={mf(SHOTS.s16[0]) - mf(wt('O', 'сумк'))} layout="none">
        <BagCounter count={0} />
      </Sequence>

      <Subtitles />

      {/* Голос: куски с добавленными паузами */}
      {AUDIO_SEGMENTS.map((seg, i) => (
        <Sequence key={i} from={mf(seg.start)} durationInFrames={f(seg.end - seg.start) + 2} layout="none">
          <Audio src={staticFile('vo/scene01_vo.mp3')} trimBefore={f(seg.start)} trimAfter={f(seg.end)} />
        </Sequence>
      ))}

      {/* Атмосфера и эффекты */}
      <Audio src={staticFile('sfx/wind.wav')} volume={0.12} loop />
      <Sfx at={0.3} src="chirp.wav" volume={0.35} />
      <Sfx at={7.9} src="chirp.wav" volume={0.45} />
      <Sfx at={9.5} src="chirp.wav" volume={0.35} />
      <Sfx at={16.62} src="whistle.wav" volume={0.55} />
      <Sfx at={wt('L', 'отменя')} src="pop.wav" volume={0.5} />
      <Sfx at={28.98} src="whoosh.wav" volume={0.45} />
      <Sfx at={wt('O', 'палк')} src="ding.wav" volume={0.4} />
      <Sfx at={wt('O', 'сумк')} src="ding.wav" volume={0.4} />
      <Sfx at={wt('P', 'эволюц')} src="pop.wav" volume={0.45} />
      <Sfx at={wt('P', 'электр')} src="pop.wav" volume={0.45} />
      <Sfx at={wt('P', 'холодильн')} src="pop.wav" volume={0.45} />
      <Sfx at={wt('Q', 'нет')} src="pop.wav" volume={0.7} />
      <Sfx at={63.6} src="whoosh.wav" volume={0.35} />
      <Sfx at={71.17} src="whoosh.wav" volume={0.45} />
      <Sfx at={wt('W', 'первого')} src="ding.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

export const SCENE01_FRAMES = TOTAL_FRAMES;
export const SCENE01_FPS = FPS;
