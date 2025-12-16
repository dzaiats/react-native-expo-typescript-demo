import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, lightTheme, darkTheme } from '@/types/theme';

interface ThemeState {
  colorScheme: ColorSchemeName;
  theme: Theme;
  setColorScheme: (scheme: ColorSchemeName) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => {
      const systemScheme = Appearance.getColorScheme();

      return {
        colorScheme: systemScheme,
        theme: systemScheme === 'dark' ? darkTheme : lightTheme,
        setColorScheme: (scheme) => {
          set({
            colorScheme: scheme,
            theme: scheme === 'dark' ? darkTheme : lightTheme,
          });
        },
        toggleTheme: () => {
          set((state) => {
            const newScheme = state.colorScheme === 'dark' ? 'light' : 'dark';
            return {
              colorScheme: newScheme,
              theme: newScheme === 'dark' ? darkTheme : lightTheme,
            };
          });
        },
      };
    },
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

