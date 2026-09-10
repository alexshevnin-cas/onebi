/** @type {import('tailwindcss').Config} */
module.exports = {
  // Тему задаёт [data-theme] на <html> — тот же переключатель управляет и
  // `dark:` вариантами встроенного cas-configurator (они пришли из Next.js
  // и по умолчанию слушали настройку ОС). Так редактор медиации следует
  // теме кабинета, а не системе.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // — поверхности —
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface-1)',
        'surface-2': 'var(--bg-surface-2)',
        'surface-3': 'var(--bg-surface-3)',
        line: 'var(--border-default)',
        // — текст —
        ink: 'var(--text-primary)',
        'ink-2': 'var(--text-secondary)',
        'ink-3': 'var(--text-muted)',
        'gray-1': 'var(--gray-1)',
        // — акцент —
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-deep': 'var(--accent-deep)',
        'accent-line': 'var(--accent-border)',
        'accent-4': 'var(--accent-subtle-4)',
        'accent-12': 'var(--accent-subtle-12)',
        'accent-70': 'var(--accent-subtle-70)',
        // — статусы —
        success: 'var(--success)',
        'success-subtle': 'var(--success-subtle)',
        error: 'var(--error)',
        'error-subtle': 'var(--error-subtle)',
        warning: 'var(--warning)',
        'warning-subtle': 'var(--warning-subtle)',
        info: 'var(--info)',
        'info-subtle': 'var(--info-subtle)',
        purple: 'var(--purple)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Host Grotesk', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Шкала из design/4_new.png
        hero:     ['96px', { lineHeight: '104px', letterSpacing: '-0.04em', fontWeight: '800' }],
        display:  ['64px', { lineHeight: '70px',  letterSpacing: '-0.04em', fontWeight: '800' }],
        h1:       ['48px', { lineHeight: '52px',  letterSpacing: '-0.04em', fontWeight: '700' }],
        h2:       ['40px', { lineHeight: '44px',  letterSpacing: '-0.035em', fontWeight: '700' }],
        h3:       ['32px', { lineHeight: '36px',  letterSpacing: '-0.02em', fontWeight: '700' }],
        h4:       ['24px', { lineHeight: '28px',  letterSpacing: '-0.02em', fontWeight: '500' }],
        h5:       ['20px', { lineHeight: '28px',  letterSpacing: '-0.015em', fontWeight: '500' }],
        lead:     ['18px', { lineHeight: '24px',  letterSpacing: '-0.01em' }],
        label:    ['16px', { lineHeight: '28px',  letterSpacing: '-0.01em', fontWeight: '600' }],
        body:     ['16px', { lineHeight: '24px' }],
        tooltip:  ['14px', { lineHeight: '20px' }],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
