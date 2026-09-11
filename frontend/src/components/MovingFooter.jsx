import LogoLoop from './LogoLoop';

// These are ordinary raster images (.png / .jfif), so — unlike the header icons — they're
// imported and used the normal Vite way, as image src URLs.
import bse from '../assets/movingFooterLogos/bse.png';
import ministry from '../assets/movingFooterLogos/ministry.png';
import niti from '../assets/movingFooterLogos/niti.jfif';
import nse from '../assets/movingFooterLogos/nse.png';
import rbi from '../assets/movingFooterLogos/rbi.png';
import sbi from '../assets/movingFooterLogos/sbi.png';
import sebi from '../assets/movingFooterLogos/sebi.jfif';
import upi from '../assets/movingFooterLogos/upi.png';

const techLogos = [
  { type: 'img', src: rbi, alt: 'Reserve Bank of India' },
  { type: 'img', src: sebi, alt: 'Securities and Exchange Board of India' },
  { type: 'img', src: nse, alt: 'National Stock Exchange' },
  { type: 'img', src: bse, alt: 'Bombay Stock Exchange' },
  { type: 'img', src: sbi, alt: 'State Bank of India' },
  { type: 'img', src: upi, alt: 'Unified Payments Interface' },
  { type: 'img', src: ministry, alt: 'Ministry of Finance' },
  { type: 'img', src: niti, alt: 'NITI Aayog' },
];

function MovingFooter() {
  return (
    <div className="bg-white pt-3">
      <p className="text-center text-[11px] tracking-wide text-[#94A3B8] mb-2">
        Aligned with India&apos;s financial &amp; regulatory ecosystem
      </p>
      <div style={{ height: '70px', position: 'relative', overflow: 'hidden' }}>
        <LogoLoop
          logos={techLogos}
          speed={110}
          direction="left"
          logoHeight={40}
          gap={48}
          pauseOnHover
          scaleOnHover
          fadeOut
          fadeOutColor="#ffffff"
          ariaLabel="India's financial and regulatory ecosystem"
        />
      </div>
    </div>
  );
}

export default MovingFooter;
