// Dummy "model" illustrations for the hero banner.
// Replace with real model photos later: set `modelPhoto` on a slide in data/products.js.

function Person({ gender = 'f', skin = '#E7B48F', hair = '#2B1D16', top = '#1C2E6B', x = 0, y = 0, s = 1, stickTint = '#FFD45C' }) {
  const shade = 'rgba(0,0,0,.10)';
  const female = gender === 'f';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* long hair behind */}
      {female && <path d="M118 150 Q112 60 200 52 Q292 58 284 160 Q296 270 262 330 L140 330 Q104 262 118 150Z" fill={hair} />}
      {/* raised arm (behind head) holding the stick */}
      <path d="M262 300 Q300 230 300 150 Q300 118 282 104" fill="none" stroke={skin} strokeWidth="34" strokeLinecap="round" />
      <circle cx="282" cy="100" r="20" fill={skin} />
      <g transform="translate(286 52) rotate(18)">
        <rect x="-11" y="-30" width="22" height="50" rx="11" fill="#FFFFFF" fillOpacity=".75" stroke="#9DB0D6" strokeWidth="2" />
        <rect x="-7" y="-25" width="14" height="40" rx="7" fill={stickTint} />
        <rect x="-12" y="18" width="24" height="18" rx="4" fill="#FFFFFF" stroke="#D5DCEE" strokeWidth="2" />
      </g>
      {/* neck */}
      <rect x="178" y="205" width="44" height="70" rx="18" fill={skin} />
      <path d="M178 238 Q200 252 222 238 V250 Q200 262 178 250Z" fill={shade} />
      {/* torso */}
      <path d="M70 520 Q72 330 150 300 Q178 290 200 292 Q222 290 250 300 Q328 330 330 520Z" fill={top} />
      <path d={female ? 'M168 294 Q200 330 232 294' : 'M176 292 L200 322 L224 292'} fill={skin} />
      {/* head */}
      <ellipse cx="200" cy="160" rx="64" ry="76" fill={skin} />
      <circle cx="137" cy="168" r="11" fill={skin} />
      <circle cx="263" cy="168" r="11" fill={skin} />
      {/* hair front */}
      {female ? (
        <path d="M134 150 Q132 82 200 78 Q262 80 268 150 Q240 112 196 104 Q170 118 134 150Z" fill={hair} />
      ) : (
        <path d="M136 146 Q130 80 200 76 Q270 80 264 146 Q258 118 232 108 Q200 120 168 110 Q142 118 136 146Z" fill={hair} />
      )}
      {/* face */}
      <path d="M168 164 q10 -8 20 0" stroke="#2B1D16" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M212 164 q10 -8 20 0" stroke="#2B1D16" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M200 172 q-5 16 2 20" stroke="rgba(0,0,0,.25)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M184 204 q16 14 32 0" stroke="#8A3B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="166" cy="190" r="9" fill="#F28F8F" opacity=".35" />
      <circle cx="234" cy="190" r="9" fill="#F28F8F" opacity=".35" />
      {!female && <path d="M150 196 Q160 236 200 240 Q240 236 250 196" fill="none" stroke={hair} strokeOpacity=".18" strokeWidth="10" />}
      {female && <circle cx="139" cy="186" r="5" fill="#F2C14E" />}
    </g>
  );
}

const Backdrop = ({ tone }) => (
  <>
    <path d="M40 520 V200 Q40 40 200 40 Q360 40 360 200 V520Z" fill={tone} />
    <circle cx="330" cy="90" r="16" fill="#FFFFFF" opacity=".6" />
    <circle cx="66" cy="230" r="9" fill="#FFFFFF" opacity=".6" />
  </>
);

export function ModelFigure({ type = 'girl', tone = 'rgba(255,255,255,.45)', top = '#1C2E6B', stickTint = '#FFD45C' }) {
  return (
    <svg viewBox="0 0 400 520" className="h-full w-full" role="img" aria-label={`${type === 'couple' ? 'Couple' : type === 'boy' ? 'Male' : 'Female'} model using Drifton (illustration)`}>
      <Backdrop tone={tone} />
      {type === 'girl' && <Person gender="f" top={top} stickTint={stickTint} />}
      {type === 'girl2' && <Person gender="f" skin="#C98F68" hair="#1A120E" top={top} stickTint={stickTint} />}
      {type === 'boy' && <Person gender="m" skin="#D9A27A" hair="#1A120E" top={top} stickTint={stickTint} />}
      {type === 'couple' && (
        <>
          <Person gender="m" skin="#D9A27A" hair="#1A120E" top="#1C2E6B" x={-20} y={60} s={0.88} stickTint={stickTint} />
          <Person gender="f" skin="#E7B48F" hair="#3A2418" top={top} x={150} y={110} s={0.78} stickTint={stickTint} />
        </>
      )}
    </svg>
  );
}
