import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeName } from '../theme/themes';

const STORAGE_KEY = '@knit_counter_app_data';

export type Language = 'ja' | 'en';

export type HistoryType =
  | 'row'
  | 'stitch'
  | 'mark';

export type HistoryItem = {
  id: string;
  row: number;
  stitch: number;
  type: HistoryType;
};

export type CounterState = {
  row: number;
  stitch: number;
  history: HistoryItem[];
};

export type Project = {
  id: string;
  name: string;
  memo: string;

  row: number;
  stitch: number;

  history: HistoryItem[];
  undoStack: CounterState[];
};

export type IntroStage =
  | 'onboarding'
  | 'tutorial'
  | 'done';

export type TutorialStep =
  | 'create'
  | 'createForm'
  | 'openProject'
  | 'row1'
  | 'stitch1'
  | 'progress'
  | 'stitchSeparator'
  | 'undo'
  | 'rowSeparator'
  | 'editProject'
  | 'deleteProject'
  | 'complete';

export type AppData = {
  projects: Project[];
  language: Language;
  theme: ThemeName;
  soundEnabled: boolean;
  introStage: IntroStage;
  tutorialStep: TutorialStep;
  tutorialProjectId: string | null;
};

const defaultData: AppData = {
  projects: [],
  language: 'ja',
  theme: 'beige',
  soundEnabled: true,
  introStage: 'onboarding',
  tutorialStep: 'create',
  tutorialProjectId: null,
};

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(
      STORAGE_KEY
    );

    if (!raw) {
      return defaultData;
    }

    const parsed =
      JSON.parse(raw);

    const migratedTutorialStep =
      parsed.tutorialStep === 'row' ||
      parsed.tutorialStep === 'row2'
        ? 'row1'
        : parsed.tutorialStep === 'stitch' ||
            parsed.tutorialStep === 'stitch2'
          ? 'stitch1'
          : parsed.tutorialStep === 'separator'
            ? 'rowSeparator'
            : parsed.tutorialStep;

    return {
      ...defaultData,
      ...parsed,
      tutorialStep:
        migratedTutorialStep ??
        defaultData.tutorialStep,

      // Users who already had app data before the onboarding
      // feature was added should continue directly to the app.
      introStage:
        parsed.introStage ??
        'done',
    };
  } catch (error) {
    console.error(
      'loadAppData error:',
      error
    );

    return defaultData;
  }
}

export async function saveAppData(
  data: AppData
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error(
      'saveAppData error:',
      error
    );

    throw error;
  }
}

export async function getProjectById(
  id: string
): Promise<Project | null> {
  const data =
    await loadAppData();

  return (
    data.projects.find(
      (project) =>
        project.id === id
    ) ?? null
  );
}

export async function updateProject(
  updatedProject: Project
): Promise<void> {
  const data =
    await loadAppData();

  const projects =
    data.projects.map(
      (project) =>
        project.id ===
        updatedProject.id
          ? updatedProject
          : project
    );

  await saveAppData({
    ...data,
    projects,
  });
}