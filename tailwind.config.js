/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 中国风色彩体系
      colors: {
        // 主色调
        'ink-paper': '#fefcf5',      // 仿古宣纸暖白 - 主背景
        'ink-dark': '#2c3e50',       // 墨青色 - 深色背景/重点色
        'ink-ochre': '#8b4513',      // 赭石 - 主点缀色
        'ink-green': '#556b2f',      // 秋香绿 - 次级点缀色
        
        // 辅助色
        'ink-sandalwood': '#c1a173', // 淡檀木 - 边框、分割线
        'ink-rice': '#d4b483',       // 米黄 - 边框、装饰
        'ink-hover': '#f5f1e8',      // 悬停背景色
        
        // 夜读模式（深色模式）
        'night-bg': '#1a1a1a',       // 夜读背景
        'night-text': '#c1a173',     // 夜读文字
        'night-accent': '#8b4513',   // 夜读强调色
      },
      
      // 字体配置
      fontFamily: {
        'wenkai': ['"LXGW WenKai"', '"Microsoft YaHei"', 'sans-serif'],
        'serif': ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
      },
      
      // 字体大小
      fontSize: {
        'title': ['2.5rem', { lineHeight: '1.4', fontWeight: '400' }],
        'subtitle': ['1.8rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.8', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      
      // 间距配置（增加留白）
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      
      // 边框圆角（极轻微）
      borderRadius: {
        'ink': '2px',
      },
      
      // 阴影配置
      boxShadow: {
        'paper': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'paper-lg': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.06)',
        'inner-paper': 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      
      // 动画配置
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'ink-ripple': 'inkRipple 0.6s ease-out',
        'brush-fill': 'brushFill 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        inkRipple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        brushFill: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // 过渡效果
      transitionDuration: {
        'ink': '300ms',
      },
      
      // 行高配置
      lineHeight: {
        'relaxed': '1.8',
        'loose': '2',
      },
      
      // 字间距配置
      letterSpacing: {
        'chinese': '0.05em',
        'chinese-wide': '0.1em',
      },
    },
  },
  plugins: [
    // 自定义插件：添加竖排文字支持
    function({ addUtilities }) {
      const verticalWritingUtilities = {
        '.writing-vertical': {
          'writing-mode': 'vertical-rl',
          'text-orientation': 'mixed',
        },
        '.writing-vertical-upright': {
          'writing-mode': 'vertical-rl',
          'text-orientation': 'upright',
        },
        '.writing-horizontal': {
          'writing-mode': 'horizontal-tb',
        },
      }
      addUtilities(verticalWritingUtilities)
    }
  ],
}
