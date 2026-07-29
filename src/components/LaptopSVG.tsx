"use client";

interface LaptopSVGProps {
  color1?: string;
  color2?: string;
  size?: number;
  className?: string;
}

export default function LaptopSVG({ color1 = "#5b2a86", color2 = "#ff5a1f", size = 260, className = "" }: LaptopSVGProps) {
  const id = `lg-${color1.replace(/[^a-z0-9]/gi, "")}-${color2.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 0.75}
      className={`laptop-svg ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color1} />
          <stop offset="1" stopColor={color2} />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="262" rx="135" ry="13" fill="#000" opacity=".08" />
      <rect x="65" y="15" width="270" height="178" rx="15" fill="#232128" />
      <rect x="78" y="28" width="244" height="152" rx="8" fill={`url(#${id})`} />
      <rect x="90" y="42" width="70" height="7" rx="3.5" fill="rgba(255,255,255,.4)" />
      <rect x="90" y="58" width="140" height="5" rx="2.5" fill="rgba(255,255,255,.18)" />
      <rect x="90" y="70" width="100" height="5" rx="2.5" fill="rgba(255,255,255,.1)" />
      <rect x="90" y="140" width="220" height="22" rx="6" fill="rgba(255,255,255,.12)" />
      <circle cx="200" cy="21" r="2" fill="#555" />
      <rect x="145" y="195" width="110" height="7" rx="3.5" fill="#38363e" />
      <path d="M35 203 Q200 224 365 203 L354 220 Q200 236 46 220 Z" fill="#2b292f" />
      <rect x="170" y="222" width="60" height="5" rx="2.5" fill="#18171b" />
      <rect x="52" y="216" width="296" height="3" rx="1.5" fill={`${color2}cc`} />
    </svg>
  );
}

// Dark sleek laptop for office/business
export function OfficeLaptopSVG({ size = 260, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * 0.75}
      className={`laptop-svg ${className}`}
    >
      <ellipse cx="200" cy="262" rx="135" ry="13" fill="#000" opacity=".08" />
      <rect x="70" y="15" width="260" height="176" rx="15" fill="#e9ebee" />
      <rect x="82" y="28" width="236" height="150" rx="8" fill="#111214" />
      <rect x="94" y="42" width="90" height="7" rx="3.5" fill="rgba(255,255,255,.5)" />
      <rect x="94" y="58" width="150" height="5" rx="2.5" fill="rgba(255,255,255,.25)" />
      <rect x="94" y="70" width="120" height="5" rx="2.5" fill="rgba(255,255,255,.15)" />
      <rect x="94" y="82" width="80" height="5" rx="2.5" fill="rgba(255,255,255,.1)" />
      <circle cx="200" cy="21" r="2" fill="#9a9ca1" />
      <rect x="148" y="193" width="104" height="7" rx="3.5" fill="#d3d5da" />
      <path d="M38 201 Q200 222 362 201 L351 218 Q200 234 49 218 Z" fill="#f1f2f4" />
      <rect x="170" y="220" width="60" height="5" rx="2.5" fill="#c6c8ce" />
    </svg>
  );
}
