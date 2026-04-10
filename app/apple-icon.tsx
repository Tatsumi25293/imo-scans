import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* الأجنحة البيضاء */}
          <path
            d="M150 200 C120 180, 100 220, 130 280 C140 300, 160 320, 180 340 L200 360 L180 380 C160 400, 140 420, 130 440 C100 500, 120 540, 150 520 L256 440"
            fill="#FFFFFF"
          />
          <path
            d="M362 200 C392 180, 412 220, 382 280 C372 300, 352 320, 332 340 L312 360 L332 380 C352 400, 372 420, 382 440 C412 500, 392 540, 362 520 L256 440"
            fill="#FFFFFF"
          />
          
          {/* التاج الأصفر */}
          <path
            d="M256 120 L280 180 L340 180 L300 220 L320 280 L256 240 L192 280 L212 220 L172 180 L232 180 Z"
            fill="#FFD700"
          />
          
          {/* العيون الصفراء */}
          <ellipse cx="200" cy="280" rx="30" ry="40" fill="#FFD700" />
          <ellipse cx="312" cy="280" rx="30" ry="40" fill="#FFD700" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
