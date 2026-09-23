import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'notion-blue': '#0075de',
        'paper-warmth': '#f6f5f4',
        'pure-white': '#ffffff',
        'ink-black': '#000000',
        charcoal: '#111111',
        stone: '#757575',
        graphite: '#615d59',
        slate: '#696969',
        'sky-tint': '#e6f3fe',
        marigold: '#ffb110',
        coral: '#f64932',
        saffron: '#e89d01',
        vermillion: '#e32d14',
        mocha: '#b18164',
        'signal-blue': '#097fe8',
        'sky-wash': '#62aef0',
        'midnight-ink': '#02093a',
        hairline: 'rgba(0,0,0,0.08)',
      },
      fontFamily: {
        notioninter: ['var(--font-notioninter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        lyon: ['var(--font-lyon-text)', 'Georgia', 'serif'],
      },
      borderRadius: {
        small: '4px',
        buttons: '8px',
        cards: '12px',
        pills: '9999px',
      },
      maxWidth: {
        page: '1440px',
      },
      transitionTimingFunction: {
        notion: 'ease',
      },
    },
  },
  plugins: [],
} satisfies Config;
