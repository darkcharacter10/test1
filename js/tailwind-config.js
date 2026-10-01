// Tailwind CDN theme (same palette/fonts/shadows as the original tailwind.config.ts)
tailwind.config = {
  theme: { extend: {
    screens: { xs: '420px' },
    fontSize: {
      'fluid-hero': ['clamp(2.1rem, 1.3rem + 3.6vw, 3.4rem)', { lineHeight: '1.15' }],
      'fluid-h1': ['clamp(1.9rem, 1.3rem + 2.4vw, 2.6rem)', { lineHeight: '1.2' }],
      'fluid-h2': ['clamp(1.65rem, 1.2rem + 1.8vw, 2.3rem)', { lineHeight: '1.25' }],
    },
    colors: {
      saffron: { DEFAULT: '#E07B39', dark: '#C65D1F', light: '#F4A261' },
      amber: { DEFAULT: '#D4A017', glow: '#E8A33D' },
      cream: { DEFAULT: '#FFF8F0', dark: '#FAF5EF' },
      peach: { DEFAULT: '#FFE8D6', dark: '#FFD4B2' },
      terracotta: '#C84B31',
      ink: { dark: '#2D2420', medium: '#5C4A42', light: '#8B7A72' },
      alert: '#DC2626', success: '#2D6A4F',
    },
    fontFamily: { display: ['Capriola', 'sans-serif'], sans: ['Inter', 'sans-serif'] },
    borderRadius: { sm: '12px', md: '20px', lg: '32px' },
    boxShadow: {
      soft: '0 4px 20px rgba(224,123,57,0.08)',
      medium: '0 8px 30px rgba(224,123,57,0.12)',
      heavy: '0 20px 60px rgba(45,36,32,0.15)',
    },
    backgroundImage: { 'saffron-gradient': 'linear-gradient(135deg, #E07B39 0%, #D4A017 100%)' },
  } },
};
