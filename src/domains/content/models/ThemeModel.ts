export interface ThemeModel {
  tokens: {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  variables: Record<string, string>; // e.g. '--brand-primary': '#FF5733'
  accessibility: {
    isDarkTheme: boolean;
    recommendedTextColorOnPrimary: '#FFFFFF' | '#000000';
  };
}
