import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { ThemeModel } from '../models/ThemeModel';
import { BRAND_COLOR_PALETTE } from '../../workspace/types/WorkspaceConfig';

export class ThemeBuilder {
  static build(workspace: WorkspaceConfig): ThemeModel {
    const slug = workspace.primary_color || 'charcoal';
    const colorSpec = BRAND_COLOR_PALETTE.find(c => c.slug === slug) || BRAND_COLOR_PALETTE[11];
    
    // Simulate shade generation (in a real app you'd use polished or d3-color)
    const primary = colorSpec.hex;
    const primaryLight = `${primary}20`; // 20% opacity as a naive light version
    
    const isDarkTheme = workspace.theme === 'dark';
    
    return {
      tokens: {
        primary,
        primaryLight,
        background: isDarkTheme ? '#1A1A1A' : '#FAFAFA',
        surface: isDarkTheme ? '#242424' : '#FFFFFF',
        text: isDarkTheme ? '#FFFFFF' : '#2D2D2D',
        textMuted: isDarkTheme ? '#A0A0A0' : '#6B6B6B',
      },
      variables: {
        '--brand-primary': primary,
        '--brand-primary-light': primaryLight,
        '--brand-background': isDarkTheme ? '#1A1A1A' : '#FAFAFA',
        '--brand-surface': isDarkTheme ? '#242424' : '#FFFFFF',
        '--brand-text': isDarkTheme ? '#FFFFFF' : '#2D2D2D',
        '--brand-text-muted': isDarkTheme ? '#A0A0A0' : '#6B6B6B',
      },
      accessibility: {
        isDarkTheme,
        // Naive calculation, usually you'd compute relative luminance
        recommendedTextColorOnPrimary: ['charcoal', 'slate', 'burgundy'].includes(slug) ? '#FFFFFF' : '#000000',
      }
    };
  }
}
