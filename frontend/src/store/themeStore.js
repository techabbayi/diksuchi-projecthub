import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light';
                    // Update DOM
                    if (newTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { theme: newTheme };
                }),
            setTheme: (theme) =>
                set(() => {
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { theme };
                }),
        }),
        {
            name: 'theme-storage',
        }
    )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme-storage');
    if (storedTheme) {
        const { state } = JSON.parse(storedTheme);
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }
}
