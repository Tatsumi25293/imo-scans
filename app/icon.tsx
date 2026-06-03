import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
        }}
      >
        <svg
          width="380"
          height="380"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* IMO Scans Gothic Red Logo */}
          {/* Outer wing curls - left */}
          <path d="M180 380 C120 320, 80 280, 100 220 C115 170, 160 165, 190 195 C210 215, 215 250, 200 280 C185 310, 165 330, 180 380Z" fill="#8B0000" />
          <path d="M100 220 C80 180, 90 140, 130 130 C160 122, 185 145, 175 175 C165 200, 140 205, 125 195Z" fill="#9B0000" />
          <path d="M175 175 C168 155, 178 135, 198 130 C215 126, 225 140, 218 158Z" fill="#8B1010" />

          {/* Outer wing curls - right */}
          <path d="M844 380 C904 320, 944 280, 924 220 C909 170, 864 165, 834 195 C814 215, 809 250, 824 280 C839 310, 859 330, 844 380Z" fill="#8B0000" />
          <path d="M924 220 C944 180, 934 140, 894 130 C864 122, 839 145, 849 175 C859 200, 884 205, 899 195Z" fill="#9B0000" />
          <path d="M849 175 C856 155, 846 135, 826 130 C809 126, 799 140, 806 158Z" fill="#8B1010" />

          {/* Main body - left side curved elements */}
          <path d="M280 350 C240 310, 225 270, 245 230 C262 195, 300 190, 330 215 C355 237, 358 275, 340 310 C322 345, 295 360, 280 350Z" fill="#9B0000" />
          <path d="M245 230 C232 205, 238 175, 262 162 C283 150, 308 160, 315 182 C322 202, 308 220, 285 225Z" fill="#AA0000" />

          {/* Main body - right side curved elements */}
          <path d="M744 350 C784 310, 799 270, 779 230 C762 195, 724 190, 694 215 C669 237, 666 275, 684 310 C702 345, 729 360, 744 350Z" fill="#9B0000" />
          <path d="M779 230 C792 205, 786 175, 762 162 C741 150, 716 160, 709 182 C702 202, 716 220, 739 225Z" fill="#AA0000" />

          {/* Center spike - tall gothic spire */}
          <path d="M512 100 L525 200 L535 350 L525 450 L512 520 L499 450 L489 350 L499 200Z" fill="#CC0000" />
          <path d="M512 100 L520 160 L512 180 L504 160Z" fill="#EE0000" />

          {/* Cross slash - diagonal sword cut */}
          <path d="M650 180 L750 190 L420 750 L320 740Z" fill="#AA0000" opacity="0.9" />
          <path d="M660 185 L740 192 L430 745 L330 738Z" fill="#CC1010" opacity="0.7" />

          {/* Center body mass */}
          <path d="M350 380 C330 340, 340 300, 380 280 C420 260, 470 270, 512 265 C554 270, 604 260, 644 280 C684 300, 694 340, 674 380 C654 420, 610 450, 560 460 L512 480 L464 460 C414 450, 370 420, 350 380Z" fill="#8B0000" />

          {/* Inner decorative elements */}
          <path d="M420 360 C410 340, 420 315, 445 308 C465 302, 490 312, 495 335 C500 355, 487 372, 465 375Z" fill="#AA1010" />
          <path d="M604 360 C614 340, 604 315, 579 308 C559 302, 534 312, 529 335 C524 355, 537 372, 559 375Z" fill="#AA1010" />

          {/* Bottom pointed elements */}
          <path d="M464 460 L490 530 L512 580 L534 530 L560 460" fill="#8B0000" />
          <path d="M490 530 L500 580 L512 620 L524 580 L534 530 L512 555Z" fill="#9B0000" />

          {/* Bottom horns/claws */}
          <path d="M400 480 C380 500, 360 520, 340 550 C320 580, 315 610, 330 630 C345 650, 375 640, 390 615 C405 590, 405 560, 415 535 L430 500Z" fill="#8B0000" />
          <path d="M624 480 C644 500, 664 520, 684 550 C704 580, 709 610, 694 630 C679 650, 649 640, 634 615 C619 590, 619 560, 609 535 L594 500Z" fill="#8B0000" />

          {/* Small decorative wing tips */}
          <path d="M165 350 C145 360, 130 380, 140 405 C148 425, 170 428, 182 412 C192 398, 188 375, 175 360Z" fill="#771010" />
          <path d="M859 350 C879 360, 894 380, 884 405 C876 425, 854 428, 842 412 C832 398, 836 375, 849 360Z" fill="#771010" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
