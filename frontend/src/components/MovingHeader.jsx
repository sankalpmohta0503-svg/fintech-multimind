import LogoLoop from './LogoLoop';

// These files are inline SVG markup saved with a .html extension (confirmed by inspecting
// bank.html / wallet.html — they open with <svg ...>, not <!DOCTYPE html>). Vite's `?raw`
// suffix imports any file's contents as a plain string regardless of extension, which is
// what lets us use them as-is without renaming or converting them.
import analyticsIconSrc from '../assets/movingHeaderLogos/anayltics.html?raw';
import bankIconSrc from '../assets/movingHeaderLogos/bank.html?raw';
import debitIconSrc from '../assets/movingHeaderLogos/debit.html?raw';
import rupeeIconSrc from '../assets/movingHeaderLogos/rupee.html?raw';
import stocksUpIconSrc from '../assets/movingHeaderLogos/stocks_up.html?raw';
import walletIconSrc from '../assets/movingHeaderLogos/wallet.html?raw';
import wealthIconSrc from '../assets/movingHeaderLogos/wealth.html?raw';

// The icons use stroke="currentColor", so the wrapper's text color drives the icon color.
// dangerouslySetInnerHTML is safe here: the content is our own bundled build-time asset,
// not user input.
const IconBadge = ({ svg, label }) => (
  <div className="flex flex-col items-center gap-2 w-[104px]">
    <span
      className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-[#DCE3EC] text-[#0A2E5C]"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
    <span className="text-xs font-medium text-[#64748B]">{label}</span>
  </div>
);

const techLogos = [
  { type: 'node', node: <IconBadge svg={bankIconSrc} label="Banking" />, ariaLabel: 'Banking' },
  { type: 'node', node: <IconBadge svg={rupeeIconSrc} label="Currency" />, ariaLabel: 'Currency' },
  { type: 'node', node: <IconBadge svg={walletIconSrc} label="Wallets" />, ariaLabel: 'Wallets' },
  { type: 'node', node: <IconBadge svg={debitIconSrc} label="Payments" />, ariaLabel: 'Payments' },
  { type: 'node', node: <IconBadge svg={analyticsIconSrc} label="Analytics" />, ariaLabel: 'Analytics' },
  { type: 'node', node: <IconBadge svg={stocksUpIconSrc} label="Markets" />, ariaLabel: 'Markets' },
  { type: 'node', node: <IconBadge svg={wealthIconSrc} label="Wealth" />, ariaLabel: 'Wealth' },
];

function MovingHeader() {
  return (
    <div className="bg-white" style={{ height: '96px', position: 'relative', overflow: 'hidden' }}>
      <LogoLoop
        logos={techLogos}
        speed={90}
        direction="left"
        logoHeight={48}
        gap={56}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="FinAuditX platform capabilities"
      />
    </div>
  );
}

export default MovingHeader;
