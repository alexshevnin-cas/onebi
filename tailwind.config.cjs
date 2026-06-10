/** @type {import('tailwindcss').Config} */
module.exports = {
  // 'class' strategy: the embedded cas-configurator components carry `dark:`
  // variants (from their Next.js origin) that default to the OS preference.
  // With no `.dark` ancestor here, they stay in their native light theme,
  // which we render inside a white card — predictable regardless of OS.
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
