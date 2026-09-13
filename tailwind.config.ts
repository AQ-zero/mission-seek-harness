import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Songti SC', 'Noto Serif SC', 'serif'],
        // 去仪表化：mono 复用 sans（数字对齐靠 tabular-nums）
        mono: ['var(--font-sans)', 'system-ui', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      colors: {
        // 暖象牙灰（MissionSeek）
        neutral: {
          50: '#F2F0EA',
          100: '#ECEAE2',
          200: '#E5E1D6',
          300: '#DAD4C6',
          400: '#A8A392',
          500: '#7C7869',
          600: '#5E5A4E',
          700: '#454239',
          800: '#2A2820',
          900: '#1B1A16',
          950: '#15140F',
        },
        // 深松绿强调（替代 v2 黄铜金）；700=浅底文字 600=按钮底 500=深底文字
        amber: {
          50: '#F0F5F3',
          100: '#E0EDE8',
          200: '#C6DBD2',
          300: '#AACCC0',
          400: '#9BC4B6',
          500: '#84B4A1',
          600: '#2E5A49',
          700: '#274E40',
          800: '#1F4034',
          900: '#1A362C',
        },
        green: { ...colors.green, 500: '#4E8E6E', 600: '#3E7A5C' },
        red: { ...colors.red, 500: '#C06A61', 600: '#B0554C' },
        sky: { ...colors.sky, 500: '#5E82A8', 600: '#4A6E96' },
      },
    },
  },
  plugins: [],
} satisfies Config;
