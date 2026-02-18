interface DamLogoProps {
  size?: number;
  showText?: boolean;
}

const DamLogo = ({ size = 120, showText = true }: DamLogoProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]"
      >
        {/* Background circle glow */}
        <circle cx="60" cy="60" r="58" fill="url(#bgGlow)" opacity="0.2" />

        {/* Dam structure */}
        <defs>
          <linearGradient id="damGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>
          <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" opacity="0.8" />
            <stop offset="100%" stopColor="#0077ff" opacity="0.6" />
          </linearGradient>
        </defs>

        {/* Dam wall */}
        <path
          d="M 30 50 L 40 70 L 40 90 L 80 90 L 80 70 L 90 50 Z"
          fill="url(#damGradient)"
          stroke="#4a5568"
          strokeWidth="2"
        />

        {/* Dam sections */}
        <line x1="50" y1="50" x2="50" y2="90" stroke="#2d3748" strokeWidth="1" />
        <line x1="60" y1="50" x2="60" y2="90" stroke="#2d3748" strokeWidth="1" />
        <line x1="70" y1="50" x2="70" y2="90" stroke="#2d3748" strokeWidth="1" />

        {/* Animated water waves behind dam */}
        <g className="animate-wave">
          <path
            d="M 20 60 Q 35 55, 50 60 T 80 60 T 110 60 L 110 95 L 20 95 Z"
            fill="url(#waterGradient)"
            opacity="0.4"
          />
        </g>
        <g className="animate-wave" style={{ animationDelay: '1s' }}>
          <path
            d="M 20 65 Q 35 60, 50 65 T 80 65 T 110 65 L 110 95 L 20 95 Z"
            fill="url(#waterGradient)"
            opacity="0.3"
          />
        </g>

        {/* Falling water droplets */}
        <g className="animate-float" style={{ animationDelay: '0.5s' }}>
          <ellipse cx="45" cy="92" rx="2" ry="3" fill="#00e5ff" opacity="0.6" />
        </g>
        <g className="animate-float" style={{ animationDelay: '1.5s' }}>
          <ellipse cx="75" cy="92" rx="2" ry="3" fill="#00e5ff" opacity="0.6" />
        </g>

        {/* AI indicator - pulsing green circle at top */}
        <circle
          cx="60"
          cy="35"
          r="8"
          fill="#00ff88"
          className="animate-pulse-glow"
        />
        <circle cx="60" cy="35" r="5" fill="#00ff88" opacity="0.8" />
        <text
          x="60"
          y="39"
          fontSize="8"
          fontWeight="bold"
          fill="#1a202c"
          textAnchor="middle"
        >
          AI
        </text>

        {/* Safety shield */}
        <path
          d="M 60 15 L 68 20 L 68 30 Q 68 35, 60 40 Q 52 35, 52 30 L 52 20 Z"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
        />
        <path
          d="M 56 28 L 59 32 L 65 24"
          stroke="#fbbf24"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Status indicator dots at bottom */}
        <g>
          <circle cx="50" cy="100" r="2.5" fill="#00ff88" className="animate-pulse-glow" />
          <circle
            cx="60"
            cy="100"
            r="2.5"
            fill="#00ff88"
            className="animate-pulse-glow"
            style={{ animationDelay: '0.3s' }}
          />
          <circle
            cx="70"
            cy="100"
            r="2.5"
            fill="#00ff88"
            className="animate-pulse-glow"
            style={{ animationDelay: '0.6s' }}
          />
        </g>
      </svg>

      {showText && (
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text mb-1">
            DAM AI GUARDIAN
          </h1>
          <p className="text-xs text-primary/80 tracking-[0.2em] font-semibold">
            AI-POWERED SAFETY
          </p>
        </div>
      )}
    </div>
  );
};

export default DamLogo;
