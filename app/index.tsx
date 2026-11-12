import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  AppData,
  loadAppData,
  Project,
  saveAppData,
} from '../storage/appStorage';

import {
  themes,
} from '../theme/themes';

export default function ProjectListScreen() {
  const { width, height } =
    useWindowDimensions();

  const isLandscape =
    width > height;

  const shortSide =
    Math.min(width, height);

  const longSide =
    Math.max(width, height);

  const isSmallScreen =
    shortSide < 380 ||
    longSide < 700;

  const isTablet =
    shortSide >= 600;

  const useGrid =
    isTablet ||
    (isLandscape &&
      width >= 650);

  const horizontalPadding =
    isSmallScreen
      ? 14
      : isTablet
        ? 28
        : 20;

  const projectCardWidth =
    useGrid
      ? '48.5%'
      : '100%';

  const [
    appData,
    setAppData,
  ] =
    useState<AppData | null>(
      null
    );

  const [
    createModalVisible,
    setCreateModalVisible,
  ] = useState(false);

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  const [
    projectName,
    setProjectName,
  ] = useState('');

  const [
    memo,
    setMemo,
  ] = useState('');

  const [
    editingProject,
    setEditingProject,
  ] =
    useState<Project | null>(
      null
    );

  const [
    editName,
    setEditName,
  ] = useState('');

  const [
    editMemo,
    setEditMemo,
  ] = useState('');

  const tutorialPulse =
    useRef(
      new Animated.Value(0)
    ).current;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load =
        async () => {
          const data =
            await loadAppData();

          if (active) {
            setAppData(data);
          }
        };

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    const loop =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            tutorialPulse,
            {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }
          ),
          Animated.timing(
            tutorialPulse,
            {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }
          ),
        ])
      );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [tutorialPulse]);

  useEffect(() => {
    if (!appData) {
      return;
    }

    if (
      appData.introStage ===
      'onboarding'
    ) {
      router.replace(
        '/onboarding'
      );
      return;
    }


  }, [appData]);

  if (
    !appData ||
    appData.introStage ===
      'onboarding'
  ) {
    return (
      <SafeAreaView
        style={
          styles.loadingSafeArea
        }
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentTheme =
    themes[appData.theme];

  const isJapanese =
    appData.language === 'ja';

  const isTutorial =
    appData.introStage ===
    'tutorial';

  const tutorialStep =
    appData.tutorialStep;

  const tutorialStepNumber =
    tutorialStep === 'create'
      ? 1
      : tutorialStep ===
          'createForm'
        ? 2
        : tutorialStep ===
            'openProject'
          ? 3
          : tutorialStep ===
              'editProject'
            ? 8
            : tutorialStep ===
                'deleteProject'
              ? 9
              : 10;

  const pulseStyle = {
    opacity:
      tutorialPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.55, 0.12],
      }),

    transform: [
      {
        scale:
          tutorialPulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.18],
          }),
      },
    ],
  };

  const updateTutorial =
    async (
      updates: Partial<AppData>
    ) => {
      const nextData: AppData = {
        ...appData,
        ...updates,
      };

      setAppData(nextData);
      await saveAppData(nextData);
    };

  const finishTutorial =
    async () => {
      const nextData: AppData = {
        ...appData,
        introStage: 'done',
        tutorialStep: 'create',
        tutorialProjectId: null,
      };

      await saveAppData(
        nextData
      );

      setAppData(nextData);
    };

  const openCreateModal =
    async () => {
      const tutorialCreating =
        isTutorial &&
        tutorialStep === 'create';

      setProjectName('');
      setMemo('');

      setCreateModalVisible(
        true
      );

      if (tutorialCreating) {
        await updateTutorial({
          tutorialStep:
            'createForm',
        });
      }
    };

  const closeCreateModal =
    async () => {
      Keyboard.dismiss();

      setCreateModalVisible(
        false
      );

      setProjectName('');
      setMemo('');

      if (
        isTutorial &&
        tutorialStep ===
          'createForm'
      ) {
        await updateTutorial({
          tutorialStep:
            'create',
        });
      }
    };

  const createProject =
    async () => {
      const name =
        projectName.trim();

      if (!name) {
        return;
      }

      if (
        appData.projects
          .length >= 5 &&
        !isTutorial
      ) {
        return;
      }

      const project:
        Project = {
        id: `${Date.now()}-${Math.random()}`,
        name,
        memo: memo.trim(),
        row: 0,
        stitch: 0,
        history: [],
        undoStack: [],
      };

      const tutorialCreating =
        isTutorial &&
        tutorialStep ===
          'createForm';

      const nextData:
        AppData = {
        ...appData,

        projects: [
          ...appData.projects,
          project,
        ],

        ...(tutorialCreating
          ? {
              tutorialStep:
                'openProject' as const,
              tutorialProjectId:
                project.id,
            }
          : {}),
      };

      await saveAppData(
        nextData
      );

      setAppData(nextData);

      // When creation succeeds, close the modal without running
      // the cancel handler. The cancel handler intentionally rewinds
      // the tutorial from createForm back to create.
      Keyboard.dismiss();
      setCreateModalVisible(false);
      setProjectName('');
      setMemo('');
    };

  const openProject =
    async (
      project: Project
    ) => {
      if (
        isTutorial &&
        (tutorialStep !==
          'openProject' ||
          appData.tutorialProjectId !==
            project.id)
      ) {
        return;
      }

      if (
        isTutorial &&
        tutorialStep ===
          'openProject' &&
        appData.tutorialProjectId ===
          project.id
      ) {
        await updateTutorial({
          tutorialStep: 'row',
        });
      }

      router.push({
        pathname:
          '/counter/[id]',

        params: {
          id: project.id,
        },
      });
    };

  const openSettings =
    () => {
      router.push(
        '/settings'
      );
    };

  const openEditModal =
    async (
      project: Project
    ) => {
      if (
        isTutorial &&
        (tutorialStep !==
          'editProject' ||
          appData.tutorialProjectId !==
            project.id)
      ) {
        return;
      }

      setEditingProject(
        project
      );

      setEditName(
        project.name
      );

      setEditMemo(
        project.memo
      );

      setEditModalVisible(
        true
      );

      if (
        isTutorial &&
        tutorialStep ===
          'editProject'
      ) {
        await updateTutorial({
          tutorialStep:
            'deleteProject',
        });
      }
    };

  const closeEditModal =
    () => {
      if (
        isTutorial &&
        tutorialStep ===
          'deleteProject'
      ) {
        return;
      }

      Keyboard.dismiss();

      setEditModalVisible(
        false
      );

      setEditingProject(
        null
      );

      setEditName('');
      setEditMemo('');
    };

  const saveEditedProject =
    async () => {
      if (
        !editingProject
      ) {
        return;
      }

      const name =
        editName.trim();

      if (!name) {
        return;
      }

      const projects =
        appData.projects.map(
          (project) =>
            project.id ===
            editingProject.id
              ? {
                  ...project,
                  name,
                  memo:
                    editMemo.trim(),
                }
              : project
        );

      const nextData:
        AppData = {
        ...appData,
        projects,
      };

      await saveAppData(
        nextData
      );

      setAppData(
        nextData
      );

      closeEditModal();
    };

  const deleteProject =
    () => {
      if (
        !editingProject
      ) {
        return;
      }

      Alert.alert(
        isJapanese
          ? '作品を削除'
          : 'Delete Project',

        isJapanese
          ? `「${editingProject.name}」を削除しますか？\n履歴もすべて削除されます。`
          : `Delete "${editingProject.name}"?\nAll history will also be deleted.`,

        [
          {
            text:
              isJapanese
                ? 'キャンセル'
                : 'Cancel',

            style:
              'cancel',
          },

          {
            text:
              isJapanese
                ? '削除'
                : 'Delete',

            style:
              'destructive',

            onPress:
              async () => {
                const projects =
                  appData.projects.filter(
                    (
                      project
                    ) =>
                      project.id !==
                      editingProject.id
                  );

                const tutorialDeleting =
                  isTutorial &&
                  tutorialStep ===
                    'deleteProject' &&
                  appData.tutorialProjectId ===
                    editingProject.id;

                const nextData:
                  AppData = {
                  ...appData,
                  projects,
                  ...(tutorialDeleting
                    ? {
                        tutorialStep:
                          'complete' as const,
                        tutorialProjectId:
                          null,
                      }
                    : {}),
                };

                await saveAppData(
                  nextData
                );

                setAppData(
                  nextData
                );

                Keyboard.dismiss();
                setEditModalVisible(
                  false
                );
                setEditingProject(
                  null
                );
                setEditName('');
                setEditMemo('');
              },
          },
        ]
      );
    };

  const renderProjectForm =
    (
      mode:
        | 'create'
        | 'edit'
    ) => {
      const isCreate =
        mode === 'create';

      const name =
        isCreate
          ? projectName
          : editName;

      const note =
        isCreate
          ? memo
          : editMemo;

      const setName =
        isCreate
          ? setProjectName
          : setEditName;

      const setNote =
        isCreate
          ? setMemo
          : setEditMemo;

      const close =
        isCreate
          ? closeCreateModal
          : closeEditModal;

      const save =
        isCreate
          ? createProject
          : saveEditedProject;

      return (
        <KeyboardAvoidingView
          style={
            styles.modalKeyboardView
          }
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : 'height'
          }
        >
          <TouchableWithoutFeedback
            onPress={
              Keyboard.dismiss
            }
            accessible={
              false
            }
          >
            <View
              style={[
                styles.modalOverlay,

                isLandscape &&
                  styles.modalOverlayLandscape,
              ]}
            >
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalContent,

                    isLandscape
                      ? styles.modalContentLandscape
                      : styles.modalContentPortrait,

                    isTablet &&
                      styles.modalContentTablet,

                    {
                      backgroundColor:
                        currentTheme.surface,
                    },
                  ]}
                >
                  <ScrollView
                    style={
                      styles.modalScroll
                    }
                    contentContainerStyle={
                      styles.modalScrollContent
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                      false
                    }
                  >
                    {isCreate &&
                      isTutorial &&
                      tutorialStep ===
                        'createForm' && (
                        <View
                          style={[
                            styles.tutorialBanner,
                            {
                              backgroundColor:
                                currentTheme.soft,
                              borderColor:
                                currentTheme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tutorialStepBadgeText,
                              {
                                color:
                                  currentTheme.subText,
                              },
                            ]}
                          >
                            2 / 7
                          </Text>

                          <Text
                            style={[
                              styles.tutorialBannerTitle,
                              {
                                color:
                                  currentTheme.text,
                              },
                            ]}
                          >
                            {isJapanese
                              ? '作品を作成'
                              : 'Create the project'}
                          </Text>

                          <Text
                            style={[
                              styles.tutorialBannerText,
                              {
                                color:
                                  currentTheme.subText,
                              },
                            ]}
                          >
                            {isJapanese
                              ? '作品名を入力して、下の「作成」をタップしてください。'
                              : 'Enter a project name, then tap Create below.'}
                          </Text>
                        </View>
                      )}

                    <Text
                      style={[
                        styles.modalTitle,

                        isSmallScreen &&
                          styles.modalTitleSmall,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      {isCreate
                        ? isJapanese
                          ? '新しい作品'
                          : 'New Project'
                        : isJapanese
                          ? '作品を編集'
                          : 'Edit Project'}
                    </Text>

                    <Text
                      style={[
                        styles.label,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      {isJapanese
                        ? '作品名'
                        : 'Project Name'}
                    </Text>

                    <TextInput
                      style={[
                        styles.input,

                        isSmallScreen &&
                          styles.inputSmall,

                        {
                          color:
                            currentTheme.text,

                          backgroundColor:
                            currentTheme.surface,

                          borderColor:
                            currentTheme.border,
                        },
                      ]}
                      value={name}
                      onChangeText={
                        setName
                      }
                      placeholder={
                        isJapanese
                          ? '作品名'
                          : 'Project Name'
                      }
                      placeholderTextColor={
                        currentTheme.subText
                      }
                    />

                    <Text
                      style={[
                        styles.label,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      {isJapanese
                        ? 'メモ'
                        : 'Note'}
                    </Text>

                    <TextInput
                      style={[
                        styles.input,
                        styles.memoInput,

                        isLandscape &&
                          styles.memoInputLandscape,

                        isSmallScreen &&
                          styles.inputSmall,

                        {
                          color:
                            currentTheme.text,

                          backgroundColor:
                            currentTheme.surface,

                          borderColor:
                            currentTheme.border,
                        },
                      ]}
                      value={note}
                      onChangeText={
                        setNote
                      }
                      placeholder={
                        isJapanese
                          ? '任意'
                          : 'Optional'
                      }
                      placeholderTextColor={
                        currentTheme.subText
                      }
                      multiline
                      textAlignVertical="top"
                    />

                    <View
                      style={
                        styles.modalButtons
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,

                          isSmallScreen &&
                            styles.modalActionButtonSmall,

                          {
                            backgroundColor:
                              currentTheme.soft,
                          },
                        ]}
                        onPress={
                          close
                        }
                      >
                        <Text
                          style={{
                            color:
                              currentTheme.text,

                            fontWeight:
                              '600',
                          }}
                        >
                          {isJapanese
                            ? 'キャンセル'
                            : 'Cancel'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.createButton,

                          isSmallScreen &&
                            styles.modalActionButtonSmall,

                          {
                            backgroundColor:
                              currentTheme.accent,
                          },

                          name.trim() ===
                            '' &&
                            styles.disabledButton,
                        ]}
                        onPress={
                          save
                        }
                        disabled={
                          name.trim() ===
                          ''
                        }
                      >
                        {isCreate &&
                          isTutorial &&
                          tutorialStep ===
                            'createForm' && (
                            <Animated.View
                              pointerEvents="none"
                              style={[
                                styles.tutorialPulseRing,
                                styles.tutorialPulseButton,
                                pulseStyle,
                              ]}
                            />
                          )}

                        <Text
                          style={{
                            color:
                              currentTheme.text,

                            fontWeight:
                              '700',
                          }}
                        >
                          {isCreate
                            ? isJapanese
                              ? '作成'
                              : 'Create'
                            : isJapanese
                              ? '保存'
                              : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {!isCreate && (
                      <View>
                        {isTutorial &&
                          tutorialStep ===
                            'deleteProject' && (
                            <View
                              pointerEvents="none"
                              style={[
                                styles.tutorialInlineBubble,
                                {
                                  backgroundColor:
                                    currentTheme.surface,
                                  borderColor:
                                    currentTheme.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.tutorialStepBadgeText,
                                  {
                                    color:
                                      currentTheme.subText,
                                  },
                                ]}
                              >
                                9 / 10
                              </Text>

                              <Text
                                style={[
                                  styles.tutorialInlineTitle,
                                  {
                                    color:
                                      currentTheme.text,
                                  },
                                ]}
                              >
                                {isJapanese
                                  ? '作品を削除'
                                  : 'Delete the project'}
                              </Text>

                              <Text
                                style={[
                                  styles.tutorialInlineText,
                                  {
                                    color:
                                      currentTheme.subText,
                                  },
                                ]}
                              >
                                {isJapanese
                                  ? '最後に「この作品を削除」を押してください。'
                                  : 'Finally, tap Delete Project.'}
                              </Text>

                              <View
                                style={[
                                  styles.tutorialInlinePointer,
                                  {
                                    borderTopColor:
                                      currentTheme.surface,
                                  },
                                ]}
                              />
                            </View>
                          )}

                        <TouchableOpacity
                        style={[
                          styles.deleteButton,

                          isSmallScreen &&
                            styles.deleteButtonSmall,

                          {
                            backgroundColor:
                              currentTheme.dangerBackground,
                          },
                        ]}
                        onPress={
                          deleteProject
                        }
                      >
                        {isTutorial &&
                          tutorialStep ===
                            'deleteProject' && (
                            <Animated.View
                              pointerEvents="none"
                              style={[
                                styles.tutorialPulseRing,
                                styles.tutorialPulseButton,
                                pulseStyle,
                              ]}
                            />
                          )}

                        <Text
                          style={{
                            color:
                              currentTheme.dangerText,

                            fontWeight:
                              '700',
                          }}
                        >
                          {isJapanese
                            ? 'この作品を削除'
                            : 'Delete Project'}
                        </Text>
                      </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
    };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,

        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
    >
      <View
        style={[
          styles.container,

          {
            paddingHorizontal:
              horizontalPadding,

            backgroundColor:
              currentTheme.background,
          },
        ]}
      >
        <View
          style={[
            styles.header,

            isTutorial &&
              styles.tutorialDim,

            isSmallScreen &&
              styles.headerSmall,

            isLandscape &&
              styles.headerLandscape,
          ]}
        >
          <Text
            style={[
              styles.title,

              isSmallScreen &&
                styles.titleSmall,

              isTablet &&
                styles.titleTablet,

              {
                color:
                  currentTheme.text,
              },
            ]}
          >
            {isJapanese
              ? '作品一覧'
              : 'Projects'}
          </Text>

          <TouchableOpacity
            style={[
              styles.settingsButton,

              isSmallScreen &&
                styles.settingsButtonSmall,

              {
                backgroundColor:
                  currentTheme.soft,
              },
            ]}
            onPress={
              openSettings
            }
          >
            <Ionicons
              name="settings-outline"
              size={
                isSmallScreen
                  ? 22
                  : 25
              }
              color={
                currentTheme.text
              }
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={
            styles.projectList
          }
          contentContainerStyle={[
            styles.projectListContent,

            useGrid &&
              styles.projectListGrid,

            {
              paddingBottom:
                isSmallScreen
                  ? 85
                  : 105,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
        >
          {appData.projects.map(
            (project) => (
              <View
                key={project.id}
                style={[
                  styles.projectCard,

                  isSmallScreen &&
                    styles.projectCardSmall,

                  isLandscape &&
                    styles.projectCardLandscape,

                  isTablet &&
                    styles.projectCardTablet,

                  {
                    width:
                      projectCardWidth,

                    backgroundColor:
                      currentTheme.surface,

                    borderColor:
                      currentTheme.border,
                  },

                  isTutorial &&
                    tutorialStep ===
                      'openProject' &&
                    appData.tutorialProjectId !==
                      project.id &&
                    styles.tutorialDim,
                ]}
              >
                {isTutorial &&
                  tutorialStep ===
                    'openProject' &&
                  appData.tutorialProjectId ===
                    project.id && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.tutorialPulseRing,
                        styles.tutorialPulseCard,
                        pulseStyle,
                      ]}
                    />
                  )}

                <TouchableOpacity
                  style={[
                    styles.projectInfoButton,

                    isSmallScreen &&
                      styles.projectInfoButtonSmall,
                  ]}
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    openProject(
                      project
                    )
                  }
                >
                  <View
                    style={
                      styles.projectInfo
                    }
                  >
                    <Text
                      style={[
                        styles.projectName,

                        isSmallScreen &&
                          styles.projectNameSmall,

                        isTablet &&
                          styles.projectNameTablet,

                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                      numberOfLines={
                        1
                      }
                    >
                      {project.name}
                    </Text>

                    <Text
                      style={[
                        styles.projectCount,

                        isSmallScreen &&
                          styles.projectCountSmall,

                        {
                          color:
                            currentTheme.subText,
                        },
                      ]}
                      numberOfLines={
                        1
                      }
                    >
                      {isJapanese
                        ? `${project.row}段 / ${project.stitch}目`
                        : `${project.row} ${project.row === 1 ? 'Row' : 'Rows'} / ${project.stitch} ${project.stitch === 1 ? 'Stitch' : 'Stitches'}`}
                    </Text>

                    {project.memo !==
                      '' && (
                      <Text
                        style={[
                          styles.projectMemo,

                          isSmallScreen &&
                            styles.projectMemoSmall,

                          {
                            color:
                              currentTheme.subText,
                          },
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {project.memo}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.editButton,

                    isSmallScreen &&
                      styles.editButtonSmall,

                    isTutorial &&
                      tutorialStep !==
                        'editProject' &&
                      appData.tutorialProjectId ===
                        project.id &&
                      styles.tutorialDim,
                  ]}
                  onPress={() =>
                    openEditModal(
                      project
                    )
                  }
                >
                  {isTutorial &&
                    tutorialStep ===
                      'editProject' &&
                    appData.tutorialProjectId ===
                      project.id && (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.tutorialPulseRing,
                          pulseStyle,
                        ]}
                      />
                    )}

                  <FontAwesome
                    name="pencil-square-o"
                    size={
                      isSmallScreen
                        ? 21
                        : isTablet
                          ? 27
                          : 24
                    }
                    color={
                      currentTheme.text
                    }
                  />
                </TouchableOpacity>
              </View>
            )
          )}
        </ScrollView>

        {(appData.projects.length <
          5 ||
          isTutorial) && (
          <TouchableOpacity
            style={[
              styles.addButton,

              isSmallScreen &&
                styles.addButtonSmall,

              isLandscape &&
                styles.addButtonLandscape,

              {
                backgroundColor:
                  currentTheme.accent,
              },

              isTutorial &&
                tutorialStep !==
                  'create' &&
                styles.tutorialDim,
            ]}
            onPress={
              openCreateModal
            }
          >
            {isTutorial &&
              tutorialStep ===
                'create' && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.tutorialPulseRing,
                    pulseStyle,
                  ]}
                />
              )}

            <Text
              style={[
                styles.addButtonText,

                isSmallScreen &&
                  styles.addButtonTextSmall,

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              ＋
            </Text>
          </TouchableOpacity>
        )}

        {isTutorial &&
          !createModalVisible &&
          !editModalVisible &&
          tutorialStep !==
            'complete' && (
            <View
              pointerEvents="none"
              style={[
                styles.tutorialMessage,
                tutorialStep ===
                  'create'
                  ? styles.tutorialMessageCreate
                  : tutorialStep ===
                      'openProject'
                    ? styles.tutorialMessageProject
                    : styles.tutorialMessageEdit,
                {
                  backgroundColor:
                    currentTheme.surface,
                  borderColor:
                    currentTheme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.tutorialStepBadge,
                  {
                    backgroundColor:
                      currentTheme.soft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tutorialStepBadgeText,
                    {
                      color:
                        currentTheme.text,
                    },
                  ]}
                >
                  {tutorialStepNumber} / 7
                </Text>
              </View>

              <Text
                style={[
                  styles.tutorialMessageTitle,
                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                {tutorialStep ===
                'create'
                  ? isJapanese
                    ? '作品を作ってみましょう'
                    : 'Create a project'
                  : tutorialStep ===
                      'openProject'
                    ? isJapanese
                      ? '作った作品を開きます'
                      : 'Open your project'
                    : isJapanese
                      ? '作品を編集します'
                      : 'Edit the project'}
              </Text>

              <Text
                style={[
                  styles.tutorialMessageText,
                  {
                    color:
                      currentTheme.subText,
                  },
                ]}
              >
                {tutorialStep ===
                'create'
                  ? isJapanese
                    ? '吹き出しの先にある＋をタップしてください。'
                    : 'Tap the + indicated by the bubble.'
                  : tutorialStep ===
                      'openProject'
                    ? isJapanese
                      ? '作った作品をタップして開いてください。'
                      : 'Tap the project you just created.'
                    : isJapanese
                      ? '右側の編集ボタンをタップしてください。'
                      : 'Tap the edit button on the right.'}
              </Text>

              <View
                style={[
                  styles.tutorialPointer,
                  tutorialStep ===
                    'create'
                    ? styles.tutorialPointerRight
                    : styles.tutorialPointerLeft,
                  {
                    borderTopColor:
                      currentTheme.surface,
                  },
                ]}
              />
            </View>
          )}

        {isTutorial &&
          tutorialStep ===
            'complete' && (
            <View
              style={
                styles.tutorialCompleteOverlay
              }
            >
              <View
                style={[
                  styles.tutorialCompleteCard,
                  {
                    backgroundColor:
                      currentTheme.surface,
                    borderColor:
                      currentTheme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tutorialCompleteIcon,
                    {
                      backgroundColor:
                        currentTheme.soft,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={34}
                    color={
                      currentTheme.text
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.tutorialCompleteTitle,
                    {
                      color:
                        currentTheme.text,
                    },
                  ]}
                >
                  {isJapanese
                    ? 'さあ、始めましょう'
                    : 'Ready to start'}
                </Text>

                <Text
                  style={[
                    styles.tutorialCompleteText,
                    {
                      color:
                        currentTheme.subText,
                    },
                  ]}
                >
                  {isJapanese
                    ? '基本操作は以上です。自分の作品を作って、Knit Markを使い始めましょう。'
                    : 'That’s the basics. Create your own project and start using Knit Mark.'}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.tutorialCompleteButton,
                    {
                      backgroundColor:
                        currentTheme.accent,
                    },
                  ]}
                  onPress={
                    finishTutorial
                  }
                >
                  <Text
                    style={[
                      styles.tutorialCompleteButtonText,
                      {
                        color:
                          currentTheme.text,
                      },
                    ]}
                  >
                    {isJapanese
                      ? '始める'
                      : 'Start'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        <Modal
          visible={
            createModalVisible
          }
          transparent
          animationType="fade"
          supportedOrientations={[
            'portrait',
            'portrait-upside-down',
            'landscape',
            'landscape-left',
            'landscape-right',
          ]}
          onRequestClose={
            closeCreateModal
          }
        >
          {renderProjectForm(
            'create'
          )}
        </Modal>

        <Modal
          visible={
            editModalVisible
          }
          transparent
          animationType="fade"
          supportedOrientations={[
            'portrait',
            'portrait-upside-down',
            'landscape',
            'landscape-left',
            'landscape-right',
          ]}
          onRequestClose={
            closeEditModal
          }
        >
          {renderProjectForm(
            'edit'
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    tutorialDim: {
      opacity: 0.16,
    },

    tutorialPulseRing: {
      position: 'absolute',
      top: -7,
      right: -7,
      bottom: -7,
      left: -7,
      borderWidth: 3,
      borderColor: '#8B684F',
      borderRadius: 999,
    },

    tutorialPulseCard: {
      borderRadius: 24,
    },

    tutorialPulseButton: {
      borderRadius: 22,
    },

    tutorialMessage: {
      position: 'absolute',
      zIndex: 80,
      width: 250,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingTop: 13,
      paddingBottom: 14,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 7,
    },

    tutorialMessageCreate: {
      right: 18,
      bottom: 112,
    },

    tutorialMessageProject: {
      left: 22,
      top: 96,
    },

    tutorialMessageEdit: {
      right: 22,
      top: 96,
    },

    tutorialMessageLegacy: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 112,
      zIndex: 80,
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 18,
      paddingTop: 15,
      paddingBottom: 17,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 7,
    },

    tutorialStepBadge: {
      alignSelf: 'flex-start',
      minWidth: 48,
      minHeight: 26,
      paddingHorizontal: 9,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    tutorialStepBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    tutorialMessageTitle: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
    },

    tutorialMessageText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },

    tutorialPointer: {
      position: 'absolute',
      right: 30,
      bottom: -12,
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderTopWidth: 12,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },

    tutorialBanner: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 15,
      marginBottom: 18,
    },

    tutorialBannerTitle: {
      fontSize: 17,
      fontWeight: '800',
      marginTop: 4,
      marginBottom: 4,
    },

    tutorialBannerText: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },

    tutorialPointerRight: {
      right: 26,
    },

    tutorialPointerLeft: {
      left: 34,
    },

    tutorialInlineBubble: {
      position: 'relative',
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      marginTop: 14,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 3,
    },

    tutorialInlineTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginTop: 4,
      marginBottom: 3,
    },

    tutorialInlineText: {
      fontSize: 13,
      lineHeight: 19,
    },

    tutorialInlinePointer: {
      position: 'absolute',
      left: '50%',
      bottom: -10,
      marginLeft: -10,
      width: 0,
      height: 0,
      borderLeftWidth: 10,
      borderRightWidth: 10,
      borderTopWidth: 10,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },

    tutorialCompleteOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 200,
      elevation: 30,
      backgroundColor:
        'rgba(36, 28, 22, 0.38)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },

    tutorialCompleteCard: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 28,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 22,
      alignItems: 'center',
    },

    tutorialCompleteIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },

    tutorialCompleteTitle: {
      fontSize: 23,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 10,
    },

    tutorialCompleteText: {
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 22,
    },

    tutorialCompleteButton: {
      width: '100%',
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },

    tutorialCompleteButtonText: {
      fontSize: 16,
      fontWeight: '800',
    },

    loadingSafeArea: {
      flex: 1,
      backgroundColor:
        '#FFF9F3',
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
    },

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 16,
    },

    headerSmall: {
      paddingTop: 12,
      paddingBottom: 10,
    },

    headerLandscape: {
      paddingTop: 8,
      paddingBottom: 8,
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
    },

    titleSmall: {
      fontSize: 23,
    },

    titleTablet: {
      fontSize: 32,
    },

    settingsButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    settingsButtonSmall: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },

    projectList: {
      flex: 1,
    },

    projectListContent: {
      paddingTop: 6,
    },

    projectListGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
    },

    projectCard: {
      minHeight: 100,
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: 22,
      marginBottom: 14,
      overflow: 'hidden',
      borderWidth: 1,
    },

    projectCardSmall: {
      minHeight: 86,
      borderRadius: 18,
      marginBottom: 10,
    },

    projectCardLandscape: {
      minHeight: 88,
    },

    projectCardTablet: {
      minHeight: 112,
      borderRadius: 24,
    },

    projectInfoButton: {
      flex: 1,
      justifyContent:
        'center',
      paddingLeft: 20,
      paddingVertical: 16,
      minWidth: 0,
    },

    projectInfoButtonSmall: {
      paddingLeft: 15,
      paddingVertical: 11,
    },

    projectInfo: {
      flex: 1,
      minWidth: 0,
      justifyContent:
        'center',
    },

    projectName: {
      fontSize: 20,
      fontWeight: '700',
    },

    projectNameSmall: {
      fontSize: 17,
    },

    projectNameTablet: {
      fontSize: 22,
    },

    projectCount: {
      marginTop: 6,
      fontSize: 15,
    },

    projectCountSmall: {
      marginTop: 4,
      fontSize: 13,
    },

    projectMemo: {
      marginTop: 5,
      fontSize: 14,
    },

    projectMemoSmall: {
      marginTop: 3,
      fontSize: 12,
    },

    editButton: {
      width: 68,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    editButtonSmall: {
      width: 54,
    },

    addButton: {
      position: 'absolute',
      right: 24,
      bottom: 28,
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    addButtonSmall: {
      right: 16,
      bottom: 18,
      width: 56,
      height: 56,
      borderRadius: 28,
    },

    addButtonLandscape: {
      bottom: 14,
    },

    addButtonText: {
      fontSize: 42,
      lineHeight: 46,
    },

    addButtonTextSmall: {
      fontSize: 36,
      lineHeight: 40,
    },

    modalKeyboardView: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal: 20,
      backgroundColor:
        'rgba(0,0,0,0.35)',
    },

    modalOverlayLandscape: {
      paddingVertical: 8,
    },

    modalContent: {
      borderRadius: 28,
      padding: 24,
      alignSelf: 'center',
    },

    modalContentPortrait: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '82%',
    },

    modalContentLandscape: {
      width: '68%',
      maxWidth: 620,
      maxHeight: '86%',
    },

    modalContentTablet: {
      maxWidth: 620,
    },

    modalScroll: {
      flexGrow: 0,
    },

    modalScrollContent: {
      paddingBottom: 8,
    },

    modalTitle: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 26,
    },

    modalTitleSmall: {
      fontSize: 22,
      marginBottom: 18,
    },

    label: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 8,
    },

    input: {
      minHeight: 56,
      borderWidth: 1.5,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 22,
      fontSize: 17,
    },

    inputSmall: {
      minHeight: 48,
      marginBottom: 14,
      fontSize: 15,
    },

    memoInput: {
      minHeight: 72,
      maxHeight: 150,
    },

    memoInputLandscape: {
      minHeight: 62,
      maxHeight: 100,
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },

    cancelButton: {
      flex: 1,
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    createButton: {
      flex: 1,
      minHeight: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    modalActionButtonSmall: {
      minHeight: 48,
      borderRadius: 16,
    },

    disabledButton: {
      opacity: 0.4,
    },

    deleteButton: {
      marginTop: 28,
      minHeight: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    deleteButtonSmall: {
      marginTop: 18,
      minHeight: 46,
    },
  });