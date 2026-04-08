// Hybrid System Themes - COTE × Solo Leveling
import type { ThemeType } from '@/types';

export interface ThemeConfig {
  name: string;
  colors: {
    background: string;
    backgroundGradient: string;
    surface: string;
    surfaceGlass: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    text: string;
    textMuted: string;
    border: string;
    glow: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  effects: {
    glowIntensity: number;
    glassBlur: string;
    borderRadius: string;
    animationSpeed: string;
  };
  sounds?: {
    levelUp: string;
    achievement: string;
    taskComplete: string;
    stageUnlock: string;
  };
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  // Classroom of the Elite Theme
  cote: {
    name: 'Classroom of the Elite',
    colors: {
      background: '#0a0a0f',
      backgroundGradient: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      surface: '#14141f',
      surfaceGlass: 'rgba(20, 20, 31, 0.85)',
      primary: '#e0e0e0',
      secondary: '#8b8b9a',
      accent: '#c9a227',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#ef4444',
      info: '#60a5fa',
      text: '#f0f0f5',
      textMuted: '#6b6b7b',
      border: 'rgba(255, 255, 255, 0.08)',
      glow: 'rgba(201, 162, 39, 0.3)'
    },
    fonts: {
      heading: '"Inter", "Noto Sans JP", sans-serif',
      body: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace'
    },
    effects: {
      glowIntensity: 0.5,
      glassBlur: '12px',
      borderRadius: '4px',
      animationSpeed: '0.3s'
    }
  },

  // Solo Leveling Theme
  'solo-leveling': {
    name: 'Solo Leveling',
    colors: {
      background: '#050508',
      backgroundGradient: 'radial-gradient(ellipse at top, #0a0a1a 0%, #050508 50%, #000000 100%)',
      surface: '#0f0f1a',
      surfaceGlass: 'rgba(15, 15, 26, 0.9)',
      primary: '#00d9ff',
      secondary: '#9d4edd',
      accent: '#ff006e',
      success: '#00f5d4',
      warning: '#fee440',
      danger: '#ff006e',
      info: '#00d9ff',
      text: '#ffffff',
      textMuted: '#6b6b8a',
      border: 'rgba(0, 217, 255, 0.2)',
      glow: 'rgba(0, 217, 255, 0.5)'
    },
    fonts: {
      heading: '"Orbitron", "Rajdhani", sans-serif',
      body: '"Rajdhani", system-ui, sans-serif',
      mono: '"Share Tech Mono", "JetBrains Mono", monospace'
    },
    effects: {
      glowIntensity: 1,
      glassBlur: '16px',
      borderRadius: '8px',
      animationSpeed: '0.2s'
    }
  },

  // Hybrid Theme (Default)
  hybrid: {
    name: 'Hybrid System',
    colors: {
      background: '#07070a',
      backgroundGradient: 'linear-gradient(135deg, #07070a 0%, #0f0f1a 25%, #1a0a1a 50%, #0a0f1a 75%, #07070a 100%)',
      surface: '#12121c',
      surfaceGlass: 'rgba(18, 18, 28, 0.88)',
      primary: '#00d9ff',
      secondary: '#9d4edd',
      accent: '#00f5d4',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      text: '#f8fafc',
      textMuted: '#64748b',
      border: 'rgba(0, 217, 255, 0.15)',
      glow: 'rgba(0, 217, 255, 0.4)'
    },
    fonts: {
      heading: '"Orbitron", "Inter", sans-serif',
      body: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace'
    },
    effects: {
      glowIntensity: 0.8,
      glassBlur: '14px',
      borderRadius: '6px',
      animationSpeed: '0.25s'
    }
  }
};

// CSS Variable generator
export function generateThemeCSS(theme: ThemeConfig): string {
  return `
    :root {
      /* Colors */
      --bg-primary: ${theme.colors.background};
      --bg-gradient: ${theme.colors.backgroundGradient};
      --surface: ${theme.colors.surface};
      --surface-glass: ${theme.colors.surfaceGlass};
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --accent: ${theme.colors.accent};
      --success: ${theme.colors.success};
      --warning: ${theme.colors.warning};
      --danger: ${theme.colors.danger};
      --info: ${theme.colors.info};
      --text: ${theme.colors.text};
      --text-muted: ${theme.colors.textMuted};
      --border: ${theme.colors.border};
      --glow: ${theme.colors.glow};
      
      /* Fonts */
      --font-heading: ${theme.fonts.heading};
      --font-body: ${theme.fonts.body};
      --font-mono: ${theme.fonts.mono};
      
      /* Effects */
      --glow-intensity: ${theme.effects.glowIntensity};
      --glass-blur: ${theme.effects.glassBlur};
      --border-radius: ${theme.effects.borderRadius};
      --animation-speed: ${theme.effects.animationSpeed};
    }
  `;
}

// Animation keyframes
export const ANIMATION_KEYFRAMES = `
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px var(--glow); }
    50% { box-shadow: 0 0 40px var(--glow), 0 0 60px var(--glow); }
  }
  
  @keyframes border-glow {
    0%, 100% { border-color: rgba(0, 217, 255, 0.3); }
    50% { border-color: rgba(0, 217, 255, 0.8); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes level-up-burst {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes xp-fill {
    from { width: 0%; }
    to { width: var(--xp-percent); }
  }
  
  @keyframes aura-pulse {
    0%, 100% { 
      opacity: 0.3;
      transform: scale(1);
    }
    50% { 
      opacity: 0.6;
      transform: scale(1.05);
    }
  }
  
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes blink {
    50% { border-color: transparent; }
  }
  
  @keyframes slide-up {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-in {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes particle-float {
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translate(var(--tx), var(--ty)) rotate(360deg);
      opacity: 0;
    }
  }
`;

// Glassmorphism utilities
export const GLASS_STYLES = {
  base: `
    background: var(--surface-glass);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--border);
  `,
  hover: `
    transition: all var(--animation-speed) ease;
    &:hover {
      border-color: rgba(0, 217, 255, 0.4);
      box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
    }
  `,
  active: `
    border-color: var(--primary);
    box-shadow: 0 0 30px rgba(0, 217, 255, 0.2);
  `
};

// Neon glow utilities
export const GLOW_STYLES = {
  primary: `
    box-shadow: 
      0 0 10px rgba(0, 217, 255, 0.3),
      0 0 20px rgba(0, 217, 255, 0.2),
      0 0 30px rgba(0, 217, 255, 0.1);
  `,
  strong: `
    box-shadow: 
      0 0 20px rgba(0, 217, 255, 0.5),
      0 0 40px rgba(0, 217, 255, 0.3),
      0 0 60px rgba(0, 217, 255, 0.2);
  `,
  text: `
    text-shadow: 
      0 0 10px rgba(0, 217, 255, 0.5),
      0 0 20px rgba(0, 217, 255, 0.3);
  `
};
