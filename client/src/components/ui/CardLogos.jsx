/** Proper SVG card brand logos — VISA, Mastercard, AMEX, Discover */

export function VisaLogo({ width = 52, height = 33 }) {
  return (
    <svg viewBox="0 0 60 38" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="5" fill="#1A1F71" />
      {/* Gold bar at bottom */}
      <rect y="30" width="60" height="8" rx="0" fill="#F7A600" />
      <rect y="30" width="60" height="2" fill="#1A1F71" />
      {/* VISA wordmark */}
      <text
        x="30" y="23"
        textAnchor="middle"
        fill="white"
        fontSize="17"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="-1"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo({ width = 52, height = 33 }) {
  return (
    <svg viewBox="0 0 60 38" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="5" fill="#252525" />
      {/* Two overlapping circles */}
      <circle cx="23" cy="19" r="12" fill="#EB001B" />
      <circle cx="37" cy="19" r="12" fill="#F79E1B" />
      {/* Overlap blend area */}
      <path
        d="M30 9.6a12 12 0 0 1 0 18.8A12 12 0 0 1 30 9.6z"
        fill="#FF5F00"
      />
      {/* Mastercard text */}
      <text
        x="30" y="35"
        textAnchor="middle"
        fill="white"
        fontSize="4"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        letterSpacing="0.3"
      >
        mastercard
      </text>
    </svg>
  );
}

export function AmexLogo({ width = 52, height = 33 }) {
  return (
    <svg viewBox="0 0 60 38" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="5" fill="#016FD0" />
      {/* Centurion silhouette (simplified) */}
      <path
        d="M38 8 C44 8 50 13 50 19 C50 25 44 30 38 30 C32 30 26 25 26 19 C26 13 32 8 38 8z"
        fill="rgba(255,255,255,0.12)"
      />
      {/* AMERICAN EXPRESS text */}
      <text
        x="30" y="17"
        textAnchor="middle"
        fill="white"
        fontSize="6"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        letterSpacing="0.8"
      >
        AMERICAN
      </text>
      <text
        x="30" y="26"
        textAnchor="middle"
        fill="white"
        fontSize="6"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        letterSpacing="0.8"
      >
        EXPRESS
      </text>
    </svg>
  );
}

export function DiscoverLogo({ width = 52, height = 33 }) {
  return (
    <svg viewBox="0 0 60 38" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="38" rx="5" fill="white" />
      <rect width="60" height="38" rx="5" fill="none" stroke="#e5e7eb" strokeWidth="1" />
      {/* Orange circle accent (right side) */}
      <circle cx="52" cy="19" r="18" fill="#F76F20" />
      {/* White circle to clip orange to right side */}
      <rect x="0" y="0" width="38" height="38" fill="white" />
      {/* DISCOVER text */}
      <text
        x="8" y="22"
        fill="#231F20"
        fontSize="7.5"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        letterSpacing="0.2"
      >
        DISCOVER
      </text>
    </svg>
  );
}

/** Renders all 4 card logos in a row */
export default function CardLogos({ size = "md" }) {
  const dims = size === "sm" ? { width: 44, height: 28 } : { width: 52, height: 33 };
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <VisaLogo {...dims} />
      <MastercardLogo {...dims} />
      <AmexLogo {...dims} />
      <DiscoverLogo {...dims} />
    </div>
  );
}
