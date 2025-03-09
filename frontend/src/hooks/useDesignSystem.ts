import { colors, spacing, typography, borders, effects, animation, gradients, containers } from '../styles/design-system';

// Define a type for the nested object structure
type NestedObject = Record<string, string | Record<string, string | Record<string, string>>>;

export const useDesignSystem = () => {
  const getColor = (path: string) => {
    const parts = path.split('.');
    let result: NestedObject | string = colors;
    for (const part of parts) {
      if (typeof result === 'object' && part in result) {
        result = result[part] as NestedObject | string;
      }
    }
    return result as string;
  };

  const getGradient = (path: string) => {
    const parts = path.split('.');
    let result: NestedObject | string = gradients;
    for (const part of parts) {
      if (typeof result === 'object' && part in result) {
        result = result[part] as NestedObject | string;
      }
    }
    return result as string;
  };

  const getSpacing = (size: keyof typeof spacing) => spacing[size];

  const getTypography = (category: keyof typeof typography, variant: string) => typography[category][variant];

  const getBorder = (category: keyof typeof borders, variant: string) => borders[category][variant];

  const getEffect = (category: keyof typeof effects, variant: string) => effects[category][variant];

  const getAnimation = (category: keyof typeof animation, variant: string | number) => animation[category][variant];

  const getContainer = (category: keyof typeof containers, variant: string) => containers[category][variant];

  const getButtonVariant = (variant: 'primary' | 'secondary' | 'outline' | 'ghost') => {
    const variants = {
      primary: `bg-${colors.primary.base} text-zinc-50 hover:bg-${colors.primary.dark}`,
      secondary: `bg-${colors.secondary.base} text-zinc-50 hover:bg-${colors.secondary.dark}`,
      outline: `border border-${colors.neutral[700]} bg-transparent hover:bg-${colors.neutral[800]} hover:text-zinc-50`,
      ghost: `hover:bg-${colors.neutral[800]} hover:text-zinc-50`,
    };
    return variants[variant];
  };

  const getCardStyle = (variant: 'primary' | 'secondary' | 'neutral') => {
    const variants = {
      primary: {
        gradient: `from-${colors.primary.base} to-${colors.secondary.base}`,
        border: `border-${colors.primary.base}/20`,
        glow: `bg-${colors.primary.base}/20`,
      },
      secondary: {
        gradient: `from-${colors.secondary.base} to-${colors.accent.blue.base}`,
        border: `border-${colors.secondary.base}/20`,
        glow: `bg-${colors.secondary.base}/20`,
      },
      neutral: {
        gradient: `from-${colors.neutral[700]} to-${colors.neutral[800]}`,
        border: `border-${colors.neutral[700]}/50`,
        glow: `bg-${colors.neutral[700]}/20`,
      },
    };
    return variants[variant];
  };

  return {
    getColor,
    getGradient,
    getSpacing,
    getTypography,
    getBorder,
    getEffect,
    getAnimation,
    getContainer,
    getButtonVariant,
    getCardStyle,
  };
};
