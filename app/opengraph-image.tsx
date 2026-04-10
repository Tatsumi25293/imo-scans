import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'IMO Scans - مانهوا عربي';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          backgroundImage: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="200"
            height="200"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M150 200 C120 180, 100 220, 130 280 C140 300, 160 320, 180 340 L200 360 L180 380 C160 400, 140 420, 130 440 C100 500, 120 540, 150 520 L256 440"
              fill="#FFFFFF"
            />
            <path
              d="M362 200 C392 180, 412 220, 382 280 C372 300, 352 320, 332 340 L312 360 L332 380 C352 400, 372 420, 382 440 C412 500, 392 540, 362 520 L256 440"
              fill="#FFFFFF"
            />
            <path
              d="M256 120 L280 180 L340 180 L300 220 L320 280 L256 240 L192 280 L212 220 L172 180 L232 180 Z"
              fill="#FFD700"
            />
            <ellipse cx="200" cy="280" rx="30" ry="40" fill="#FFD700" />
            <ellipse cx="312" cy="280" rx="30" ry="40" fill="#FFD700" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          IMO Scans
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#FFD700',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          اقرأ أفضل المانهوا والويبتون مترجمة عربي
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
