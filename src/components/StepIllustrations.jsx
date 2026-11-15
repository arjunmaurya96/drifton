// Animated SVG scenes for the "How to use" steps.
// Swap for real lifestyle photos any time: set `photo` on a step in HowToUse.jsx.

function Stick({ x = 0, y = 0, tint = '#FFD45C', scale = 1, rotate = 0, className = '' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} className={className} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
      <rect x="-34" y="-110" width="68" height="150" rx="34" fill="#FFFFFF" fillOpacity=".55" stroke="#9DB0D6" strokeWidth="3" />
      <rect x="-24" y="-96" width="48" height="128" rx="24" fill={tint} fillOpacity=".9" />
      <text x="4" y="-30" fill="#1C2E6B" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="22" transform="rotate(-90 4 -30)" textAnchor="middle">Drifton</text>
      <rect x="-38" y="34" width="76" height="62" rx="12" fill="#FFFFFF" stroke="#D5DCEE" strokeWidth="3" />
      <rect x="-38" y="34" width="76" height="12" rx="6" fill="#EEF1F8" />
    </g>
  );
}

export function ShowerScene() {
  const drops = Array.from({ length: 14 }, (_, i) => ({ x: 150 + (i % 7) * 22 + (i > 6 ? 11 : 0), d: (i * 0.23) % 1.6 }));
  return (
    <svg viewBox="0 0 400 440" className="h-full w-full" role="img" aria-label="Taking a shower">
      <rect width="400" height="440" fill="#E3EEFB" />
      {Array.from({ length: 6 }, (_, i) => <line key={`v${i}`} x1={i * 70 + 20} y1="0" x2={i * 70 + 20} y2="440" stroke="#D3E1F5" strokeWidth="2" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 70 + 20} x2="400" y2={i * 70 + 20} stroke="#D3E1F5" strokeWidth="2" />)}
      <path d="M330 0 V60 Q330 80 310 80 H250" fill="none" stroke="#8FA3C9" strokeWidth="12" strokeLinecap="round" />
      <path d="M150 92 Q215 50 280 92 Z" fill="#1C2E6B" />
      <rect x="146" y="90" width="138" height="10" rx="5" fill="#2B3558" />
      <g>
        {drops.map((d, i) => (
          <line key={i} x1={d.x} y1="118" x2={d.x - 4} y2="140" stroke="#5B8FD9" strokeWidth="4" strokeLinecap="round" className="animate-drip" style={{ animationDelay: `${d.d}s` }} />
        ))}
      </g>
      <path d="M90 300 q20 -30 0 -60 q-20 -30 0 -60" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".8" />
      <path d="M330 320 q20 -30 0 -60 q-20 -30 0 -60" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".8" />
      <ellipse cx="215" cy="400" rx="130" ry="18" fill="#C9DAF2" />
      <rect x="60" y="330" width="80" height="60" rx="12" fill="#FFFFFF" />
      <rect x="60" y="346" width="80" height="8" fill="#7BE0A6" />
      <circle cx="300" cy="370" r="22" fill="#FFFFFF" stroke="#C9DAF2" strokeWidth="4" />
      <circle cx="292" cy="362" r="6" fill="#E3EEFB" />
    </svg>
  );
}

export function RinseScene() {
  return (
    <svg viewBox="0 0 400 440" className="h-full w-full" role="img" aria-label="Wetting the crystal under water">
      <rect width="400" height="440" fill="#E5F5EC" />
      <circle cx="320" cy="90" r="120" fill="#D4EFDF" />
      <rect x="40" y="30" width="200" height="30" rx="15" fill="#8FA3C9" />
      <path d="M200 45 H250 Q270 45 270 65 V90" fill="none" stroke="#8FA3C9" strokeWidth="26" strokeLinecap="round" />
      <rect x="252" y="88" width="36" height="16" rx="6" fill="#2B3558" />
      <rect x="262" y="104" width="16" height="140" rx="8" fill="#7FB3EC" opacity=".8">
        <animate attributeName="opacity" values=".55;.9;.55" dur="1.2s" repeatCount="indefinite" />
      </rect>
      <Stick x={270} y={300} tint="#FFD45C" scale={0.95} rotate={8} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={235 + i * 16} cy="215" r="5" fill="#5B8FD9" className="animate-drip" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <ellipse cx="200" cy="420" rx="170" ry="20" fill="#C6E8D4" />
      <path d="M70 230 q18 -16 36 0 q18 16 36 0" fill="none" stroke="#1F8A4C" strokeWidth="5" strokeLinecap="round" opacity=".5" />
      <path d="M70 260 q18 -16 36 0 q18 16 36 0" fill="none" stroke="#1F8A4C" strokeWidth="5" strokeLinecap="round" opacity=".3" />
    </svg>
  );
}

export function ApplyScene() {
  return (
    <svg viewBox="0 0 400 440" className="h-full w-full" role="img" aria-label="Gliding the crystal on the underarm">
      <rect width="400" height="440" fill="#FFF1E2" />
      <circle cx="90" cy="90" r="110" fill="#FFE6CC" />
      {/* torso and raised arm */}
      <path d="M60 440 V300 Q60 230 120 215 L170 205 Q195 200 205 180 L262 60 Q275 34 300 44 Q324 56 312 82 L250 230 Q238 258 214 268 L200 274 Q230 330 230 440 Z" fill="#E7B48F" />
      <path d="M170 205 Q195 230 200 274" fill="none" stroke="#C98F68" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 440 V330 Q120 360 230 340 V440 Z" fill="#1C2E6B" />
      {/* crystal stick gliding */}
      <g className="animate-glide" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <Stick x={265} y={300} tint="#F7A8C4" scale={0.8} rotate={0} />
      </g>
      {[[150, 170], [230, 150], [120, 250]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 14} L${x + 4} ${y - 4} L${x + 14} ${y} L${x + 4} ${y + 4} L${x} ${y + 14} L${x - 4} ${y + 4} L${x - 14} ${y} L${x - 4} ${y - 4} Z`} fill="#1F8A4C">
          <animate attributeName="opacity" values="0;1;0" dur="2s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );
}
