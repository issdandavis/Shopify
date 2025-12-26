import { Project } from '../types.ts';

const STORAGE_KEY = 'shopguide_ai_data';
const PREFS_KEY = 'shopguide_ai_prefs';

export interface UserPrefs {
  language: string;
  isEInkMode: boolean;
  onboardingCompleted: boolean;
}

export const saveProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to local storage', e);
  }
};

export const loadProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load projects', e);
    return [];
  }
};

export const savePrefs = (prefs: UserPrefs) => {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
};

export const loadPrefs = (): UserPrefs => {
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? JSON.parse(data) : { language: 'English', isEInkMode: false, onboardingCompleted: false };
  } catch (e) {
    return { language: 'English', isEInkMode: false, onboardingCompleted: false };
  }
};