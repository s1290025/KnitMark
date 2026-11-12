import EvilIcons from '@expo/vector-icons/EvilIcons';
import Feather from '@expo/vector-icons/Feather';
import { useAudioPlayer } from 'expo-audio';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  HistoryItem,
  Language,
  loadAppData,
  Project,
  saveAppData,
  TutorialStep,
  updateProject,
} from '../../storage/appStorage';

import { themes } from '../../theme/themes';

export default function CounterScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;

  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);

  const isSmallScreen =
    shortSide < 380 ||
    longSide < 700;

  const isTablet =
    shortSide >= 600;

  const counterNumberSize =
    isSmallScreen
      ? 44
      : isTablet
        ? 78
        : 56;

  const counterUnitSize =
    isSmallScreen
      ? 21
      : isTablet
        ? 32
        : 26;

  const plusTextSize =
    isSmallScreen
      ? 58
      : isTablet
        ? 96
        : 72;

  const landscapeLeftWidth =
    isTablet ? '22%' : '20%';

  const recentHistoryScrollRef =
    useRef<ScrollView | null>(null);

  const fullHistoryScrollRef =
    useRef<ScrollView | null>(null);

  const [project, setProject] =
    useState<Project | null>(null);

  const [language, setLanguage] =
    useState<Language>('ja');

  const [themeName, setThemeName] =
    useState<keyof typeof themes>('beige');

  const [
    soundEnabled,
    setSoundEnabled,
  ] = useState(true);

  const [
    tutorialStep,
    setTutorialStep,
  ] =
    useState<TutorialStep | null>(
      null
    );

  const tapPlayer =
    useAudioPlayer(
      require('../../assets/sounds/tap.wav')
    );

  const [
    historyModalVisible,
    setHistoryModalVisible,
  ] = useState(false);

  const [
    memoModalVisible,
    setMemoModalVisible,
  ] = useState(false);

  const [
    memoEditing,
    setMemoEditing,
  ] = useState(false);

  const [
    memoDraft,
    setMemoDraft,
  ] = useState('');

  const rootRef =
    useRef<View | null>(null);

  const rowPlusRef =
    useRef<any>(null);
  const stitchPlusRef =
    useRef<any>(null);
  const rowSeparatorRef =
    useRef<any>(null);
  const stitchSeparatorRef =
    useRef<any>(null);
  const progressRef =
    useRef<any>(null);
  const undoRef =
    useRef<any>(null);

  const [
    tutorialTarget,
    setTutorialTarget,
  ] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const tutorialPulse =
    useRef(
      new Animated.Value(0)
    ).current;

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
    if (
      tutorialStep === null ||
      !rootRef.current ||
      !project
    ) {
      setTutorialTarget(null);
      return;
    }

    const ref =
      tutorialStep === 'row1' ||
      tutorialStep === 'row2'
        ? rowPlusRef
        : tutorialStep === 'stitch1' ||
            tutorialStep === 'stitch2'
          ? stitchPlusRef
          : tutorialStep === 'progress'
            ? progressRef
            : tutorialStep ===
                'stitchSeparator'
              ? stitchSeparatorRef
              : tutorialStep === 'undo'
                ? undoRef
                : tutorialStep ===
                    'rowSeparator'
                  ? rowSeparatorRef
                  : null;

    if (!ref?.current) {
      setTutorialTarget(null);
      return;
    }

    const timer = setTimeout(() => {
      ref.current?.measureLayout(
        rootRef.current,
        (
          x: number,
          y: number,
          measuredWidth: number,
          measuredHeight: number
        ) => {
          setTutorialTarget({
            x,
            y,
            width: measuredWidth,
            height: measuredHeight,
          });
        },
        () => {
          setTutorialTarget(null);
        }
      );
    }, 80);

    return () => {
      clearTimeout(timer);
    };
  }, [
    tutorialStep,
    width,
    height,
    project?.row,
    project?.stitch,
  ]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!id) return;

        const data =
          await loadAppData();

        const savedProject =
          data.projects.find(
            (project) =>
              project.id === id
          ) ?? null;

        if (active) {
          setProject(savedProject);
          setLanguage(data.language);
          setThemeName(data.theme);
          setSoundEnabled(
            data.soundEnabled
          );

          setTutorialStep(
            data.introStage ===
                'tutorial' &&
              data.tutorialProjectId ===
                id
              ? data.tutorialStep
              : null
          );
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [id])
  );

  if (!project) {
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
    themes[themeName];

  const isJapanese =
    language === 'ja';

  const isTutorial =
    tutorialStep !== null;

  const tutorialStepNumber =
    tutorialStep === 'row1' ||
    tutorialStep === 'stitch1'
      ? 4
      : tutorialStep === 'row2' ||
          tutorialStep === 'stitch2'
        ? 5
        : tutorialStep === 'progress' ||
            tutorialStep ===
              'stitchSeparator'
          ? 6
          : tutorialStep === 'undo'
            ? 7
            : 8;

  const pulseStyle = {
    opacity:
      tutorialPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.55, 0.1],
      }),

    transform: [
      {
        scale:
          tutorialPulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.16],
          }),
      },
    ],
  };



  const advanceTutorial =
    async (
      nextStep: TutorialStep
    ) => {
      const data =
        await loadAppData();

      if (
        data.introStage !==
          'tutorial' ||
        data.tutorialProjectId !==
          id
      ) {
        return;
      }

      const nextData = {
        ...data,
        tutorialStep:
          nextStep,
      };

      setTutorialStep(nextStep);
      await saveAppData(nextData);
    };

  const playTapSound =
    () => {
      if (!soundEnabled) {
        return;
      }

      void tapPlayer
        .seekTo(0)
        .then(() => {
          tapPlayer.play();
        })
        .catch(() => {});
    };

  const toggleSound =
    async () => {
      const nextSoundEnabled =
        !soundEnabled;

      setSoundEnabled(
        nextSoundEnabled
      );

      const data =
        await loadAppData();

      await saveAppData({
        ...data,
        soundEnabled:
          nextSoundEnabled,
      });
    };

  const persistProject =
    async (
      nextProject: Project
    ) => {
      setProject(nextProject);
      await updateProject(
        nextProject
      );
    };

  const saveUndo = (
    current: Project
  ) => ({
    row: current.row,
    stitch: current.stitch,
    history: [
      ...current.history,
    ],
  });

  const removePausedHistory = (
    history: HistoryItem[]
  ) => {
    const nextHistory = [
      ...history,
    ];

    while (
      nextHistory.length > 0 &&
      nextHistory[0].type ===
        'mark'
    ) {
      nextHistory.shift();
    }

    return nextHistory;
  };

  const addRow = async () => {
    if (
      isTutorial &&
      tutorialStep !== 'row1' &&
      tutorialStep !== 'row2'
    ) {
      return;
    }

    playTapSound();

    const previous =
      saveUndo(project);

    let history = [
      ...project.history,
    ];

    if (project.stitch > 0) {
      history =
        removePausedHistory(
          history
        );

      const item:
        HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        row: project.row,
        stitch:
          project.stitch,
        type: 'row',
      };

      history = [
        item,
        ...history,
      ];
    }

    await persistProject({
      ...project,
      row: project.row + 1,
      stitch: 0,
      history,
      undoStack: [
        ...project.undoStack,
        previous,
      ],
    });

    if (
      tutorialStep === 'row1'
    ) {
      await advanceTutorial(
        'stitch1'
      );
    }

    if (
      tutorialStep === 'row2'
    ) {
      await advanceTutorial(
        'stitch2'
      );
    }
  };

  const addStitch =
    async () => {
      if (
        isTutorial &&
        tutorialStep !==
          'stitch1' &&
        tutorialStep !==
          'stitch2'
      ) {
        return;
      }

      playTapSound();

      const previous =
        saveUndo(project);

      await persistProject({
        ...project,
        stitch:
          project.stitch + 1,
        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });

      const nextStitch =
        project.stitch + 1;

      if (
        tutorialStep ===
          'stitch1' &&
        nextStitch >= 3
      ) {
        await advanceTutorial(
          'row2'
        );
      }

      if (
        tutorialStep ===
          'stitch2' &&
        nextStitch >= 3
      ) {
        await advanceTutorial(
          'progress'
        );
      }
    };

  const startNewRow =
    async () => {
      if (
        isTutorial &&
        tutorialStep !==
          'rowSeparator'
      ) {
        return;
      }

      const previous =
        saveUndo(project);

      let history = [
        ...project.history,
      ];

      if (
        project.row > 0 ||
        project.stitch > 0
      ) {
        history =
          removePausedHistory(
            history
          );

        history = [
          {
            id: `${Date.now()}-${Math.random()}`,
            row: project.row,
            stitch:
              project.stitch,
            type: 'row',
          },
          ...history,
        ];
      }

      await persistProject({
        ...project,
        row: 0,
        stitch: 0,
        history,
        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const startNewStitch =
    async () => {
      if (
        isTutorial &&
        tutorialStep !==
          'stitchSeparator'
      ) {
        return;
      }

      const previous =
        saveUndo(project);

      let history = [
        ...project.history,
      ];

      if (project.stitch > 0) {
        history =
          removePausedHistory(
            history
          );

        history = [
          {
            id: `${Date.now()}-${Math.random()}`,
            row: project.row,
            stitch:
              project.stitch,
            type: 'stitch',
          },
          ...history,
        ];
      }

      await persistProject({
        ...project,
        stitch: 0,
        history,
        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });
    };

  const addMark =
    async () => {
      if (
        isTutorial &&
        tutorialStep !==
          'progress'
      ) {
        return;
      }

      const previous =
        saveUndo(project);

      const history =
        removePausedHistory(
          project.history
        );

      const item:
        HistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        row: project.row,
        stitch:
          project.stitch,
        type: 'mark',
      };

      await persistProject({
        ...project,
        history: [
          item,
          ...history,
        ],
        undoStack: [
          ...project.undoStack,
          previous,
        ],
      });

      if (
        tutorialStep ===
          'progress'
      ) {
        await advanceTutorial(
          'stitchSeparator'
        );
      }
    };

  const undo = async () => {
    if (
      isTutorial &&
      tutorialStep !== 'undo'
    ) {
      return;
    }

    if (
      project.undoStack
        .length === 0
    ) {
      return;
    }

    const previous =
      project.undoStack[
        project.undoStack
          .length - 1
      ];

    await persistProject({
      ...project,
      row: previous.row,
      stitch:
        previous.stitch,
      history:
        previous.history,
      undoStack:
        project.undoStack.slice(
          0,
          -1
        ),
    });

    if (
      tutorialStep === 'undo'
    ) {
      await advanceTutorial(
        'rowSeparator'
      );
    }
  };

  const openMemoViewer =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );
      setMemoEditing(false);
      setMemoModalVisible(true);
    };

  const startMemoEditing =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );
      setMemoEditing(true);
    };

  const cancelMemoEditing =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );
      setMemoEditing(false);
    };

  const saveMemo =
    async () => {
      await persistProject({
        ...project,
        memo: memoDraft,
      });

      setMemoEditing(false);
    };

  const closeMemoModal =
    () => {
      setMemoDraft(
        project.memo ?? ''
      );
      setMemoEditing(false);
      setMemoModalVisible(
        false
      );
    };

  const openHistoryModal =
    () => {
      setHistoryModalVisible(
        true
      );

      setTimeout(() => {
        fullHistoryScrollRef
          .current
          ?.scrollToEnd({
            animated: false,
          });
      }, 100);
    };

  const displayHistory = [
    ...project.history,
  ].reverse();

  const renderHistoryItem = (
    item: HistoryItem,
    isNewest: boolean
  ) => (
    <View
      key={item.id}
      style={styles.historyRow}
    >
      <View
        style={styles.historyLeft}
      >
        <Text
          style={[
            styles.historyCountText,
            {
              color:
                currentTheme.text,
            },
          ]}
          numberOfLines={1}
        >
          {isJapanese
            ? `${item.row}段 ${item.stitch}目`
            : `${item.row} ${item.row === 1 ? 'Row' : 'Rows'} ${item.stitch} ${item.stitch === 1 ? 'Stitch' : 'Stitches'}`}
        </Text>

        {item.type ===
          'mark' && (
          <View
            style={[
              styles.pausedBadge,
              {
                backgroundColor:
                  currentTheme.soft,
              },
            ]}
          >
            <Text
              style={{
                color:
                  currentTheme.text,
                fontSize: 10,
              }}
            >
              {isJapanese
                ? '途中'
                : 'Paused'}
            </Text>

          </View>
        )}
      </View>

      {isNewest && (
        <Text
          style={[
            styles.newLabel,
            {
              color:
                currentTheme.accent,
            },
          ]}
        >
          NEW
        </Text>
      )}
    </View>
  );

  const renderHistory = (
    landscape = false
  ) => (
    <View
      style={[
        styles.historyArea,
        landscape &&
          styles.historyAreaLandscape,
        {
          backgroundColor:
            currentTheme.surface,
          borderColor:
            currentTheme.border,
        },
      ]}
    >
      <TouchableOpacity
        style={
          styles.historyHeader
        }
        activeOpacity={0.7}
        onPress={
          openHistoryModal
        }
      >
        <Text
          style={[
            styles.sectionTitle,
            landscape &&
              styles.sectionTitleLandscape,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          {isJapanese
            ? '最近の履歴'
            : 'Recent History'}
        </Text>

        <Text
          style={[
            styles.openArrow,
            {
              color:
                currentTheme.subText,
            },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>

      {displayHistory.length ===
      0 ? (
        <Text
          style={[
            styles.emptyHistoryText,
            {
              color:
                currentTheme.subText,
            },
          ]}
        >
          {isJapanese
            ? '履歴はまだありません'
            : 'No history yet'}
        </Text>
      ) : (
        <ScrollView
          ref={
            recentHistoryScrollRef
          }
          style={
            styles.recentHistoryScroll
          }
          contentContainerStyle={
            styles.recentHistoryContent
          }
          nestedScrollEnabled
          showsVerticalScrollIndicator
          onContentSizeChange={() => {
            recentHistoryScrollRef
              .current
              ?.scrollToEnd({
                animated: false,
              });
          }}
        >
          {displayHistory.map(
            (
              item,
              index
            ) =>
              renderHistoryItem(
                item,
                index ===
                  displayHistory.length -
                    1
              )
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderMemo = (
    landscape = false
  ) => (
    <View
      style={[
        styles.memoArea,
        landscape &&
          styles.memoAreaLandscape,
        {
          backgroundColor:
            currentTheme.surface,
          borderColor:
            currentTheme.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={
          openMemoViewer
        }
        style={styles.memoHeader}
      >
        <Text
          style={[
            styles.sectionTitle,
            landscape &&
              styles.sectionTitleLandscape,
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

        <Text
          style={[
            styles.openArrow,
            {
              color:
                currentTheme.subText,
            },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={
          styles.memoPreviewScroll
        }
        contentContainerStyle={
          styles.memoPreviewContent
        }
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <Text
          style={[
            styles.memoText,
            landscape &&
              styles.memoTextLandscape,
            {
              color:
                project.memo
                  ? currentTheme.text
                  : currentTheme.subText,
            },
          ]}
        >
          {project.memo ||
            (isJapanese
              ? 'メモはまだありません'
              : 'No note yet')}
        </Text>
      </ScrollView>
    </View>
  );

  const renderPortraitActions =
    () => (
      <View
        style={
          styles.portraitActions
        }
      >
        <TouchableOpacity
          style={[
            styles.soundButton,
            {
              backgroundColor:
                currentTheme.soft,
              borderColor:
                currentTheme.accent,
            },

            isTutorial &&
              styles.tutorialDim,
          ]}
          activeOpacity={0.8}
          onPress={
            toggleSound
          }
          accessibilityRole="button"
          accessibilityLabel={
            soundEnabled
              ? isJapanese
                ? '操作音をオフにする'
                : 'Turn sound off'
              : isJapanese
                ? '操作音をオンにする'
                : 'Turn sound on'
          }
        >
          <Feather
            name={
              soundEnabled
                ? 'volume-2'
                : 'volume-x'
            }
            size={23}
            color={
              currentTheme.text
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          ref={progressRef}
          style={[
            styles.markButton,
            {
              backgroundColor:
                currentTheme.soft,
              borderColor:
                currentTheme.accent,
            },

            isTutorial &&
              tutorialStep !==
                'progress' &&
              styles.tutorialDim,
          ]}
          activeOpacity={0.8}
          onPress={addMark}
        >
          {isTutorial &&
            tutorialStep ===
              'progress' && (
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
              styles.markButtonText,
              {
                color:
                  currentTheme.text,
              },
            ]}
            numberOfLines={1}
          >
            {isJapanese
              ? '途中を記録'
              : 'Save Progress'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          ref={undoRef}
          style={[
            styles.undoButton,
            {
              backgroundColor:
                currentTheme.soft,
              borderColor:
                currentTheme.accent,
            },
            project.undoStack
              .length === 0 &&
              styles.undoDisabled,

            isTutorial &&
              tutorialStep !==
                'undo' &&
              styles.tutorialDim,
          ]}
          activeOpacity={0.8}
          onPress={undo}
          disabled={
            project.undoStack
              .length === 0
          }
        >
          {isTutorial &&
            tutorialStep ===
              'undo' && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tutorialPulseRing,
                  pulseStyle,
                ]}
              />
            )}

          <EvilIcons
            name="undo"
            size={34}
            color={
              currentTheme.text
            }
          />
        </TouchableOpacity>
      </View>
    );

  const renderLandscapeUndo =
    () => (
      <TouchableOpacity
        style={[
          styles.undoButton,
          styles.undoButtonLandscape,
          {
            backgroundColor:
              currentTheme.soft,
            borderColor:
              currentTheme.accent,
          },
          project.undoStack
            .length === 0 &&
            styles.undoDisabled,

          isTutorial &&
            tutorialStep !==
              'undo' &&
            styles.tutorialDim,
        ]}
        activeOpacity={0.8}
        onPress={undo}
        disabled={
          project.undoStack
            .length === 0
        }
      >
        <EvilIcons
          name="undo"
          size={32}
          color={
            currentTheme.text
          }
        />
      </TouchableOpacity>
    );

  const renderLandscapeMark =
    () => (
      <TouchableOpacity
        style={[
          styles.markButton,
          styles.markButtonLandscape,
          {
            backgroundColor:
              currentTheme.soft,
            borderColor:
              currentTheme.accent,
          },

          isTutorial &&
            tutorialStep !==
              'progress' &&
            styles.tutorialDim,
        ]}
        activeOpacity={0.8}
        onPress={addMark}
      >
        <Text
          style={[
            styles.markButtonText,
            styles.markButtonTextLandscape,
            {
              color:
                currentTheme.text,
            },
          ]}
          numberOfLines={1}
        >
          {isJapanese
            ? '途中を記録'
            : 'Save Progress'}
        </Text>
      </TouchableOpacity>
    );

  const renderCounter = (
    type: 'row' | 'stitch',
    landscape = false
  ) => {
    const isRow =
      type === 'row';

    const number =
      isRow
        ? project.row
        : project.stitch;

    const unit =
      isRow
        ? isJapanese
          ? '段'
          : 'Row'
        : isJapanese
          ? '目'
          : 'Stitch';

    return (
      <View
        style={[
          styles.counterSection,

          landscape &&
            styles.counterSectionLandscape,

          isTablet &&
            landscape &&
            styles.counterSectionLandscapeTablet,

          isTutorial &&
            ((tutorialStep ===
                'row1' &&
              !isRow) ||
              (tutorialStep ===
                'stitch' &&
                isRow) ||
              tutorialStep ===
                'progress' ||
              tutorialStep ===
                'undo' ||
              (tutorialStep ===
                'separator' &&
                !isRow)) &&
            styles.tutorialDim,
        ]}
      >
        <View
          style={[
            styles.counterTopRow,

            landscape &&
              styles.counterTopRowLandscape,

            isTablet &&
              !landscape &&
              styles.counterTopRowTablet,

            isTablet &&
              landscape &&
              styles.counterTopRowLandscapeTablet,
          ]}
        >
          <View
            style={
              styles.counterValueRow
            }
          >
            <Text
              style={[
                styles.counterNumber,

                landscape
                  ? [
                      styles.counterNumberLandscape,
                      isTablet &&
                        styles.counterNumberLandscapeTablet,
                    ]
                  : {
                      fontSize:
                        counterNumberSize,
                      lineHeight:
                        counterNumberSize +
                        4,
                    },

                {
                  color:
                    currentTheme.text,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {number}
            </Text>

            <Text
              style={[
                styles.counterUnit,

                landscape
                  ? [
                      styles.counterUnitLandscape,
                      isTablet &&
                        styles.counterUnitLandscapeTablet,
                    ]
                  : isTablet
                    ? styles.counterUnitTablet
                    : {
                        fontSize:
                          counterUnitSize,
                      },

                {
                  color:
                    currentTheme.text,
                },
              ]}
              numberOfLines={1}
            >
              {unit}
            </Text>
          </View>

          <TouchableOpacity
            ref={
              isRow
                ? rowSeparatorRef
                : stitchSeparatorRef
            }
            style={[
              styles.nextButton,

              landscape &&
                styles.nextButtonLandscape,

              isTablet &&
                !landscape &&
                styles.nextButtonTablet,

              isTablet &&
                landscape &&
                styles.nextButtonLandscapeTablet,

              {
                backgroundColor:
                  currentTheme.soft,
                borderColor:
                  currentTheme.accent,
              },
            ]}
            activeOpacity={0.7}
            onPress={
              isRow
                ? startNewRow
                : startNewStitch
            }
          >
            {isTutorial &&
              ((tutorialStep ===
                  'rowSeparator' &&
                isRow) ||
                (tutorialStep ===
                  'stitchSeparator' &&
                !isRow)) && (
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
                styles.nextButtonText,

                isTablet &&
                  !landscape &&
                  styles.nextButtonTextTablet,

                isTablet &&
                  landscape &&
                  styles.nextButtonTextTablet,

                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              │→
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          ref={
            isRow
              ? rowPlusRef
              : stitchPlusRef
          }
          style={[
            styles.plusButton,

            !landscape &&
              isRow &&
              styles.rowPlusButtonPortrait,

            isTablet &&
              !landscape &&
              styles.plusButtonTablet,

            landscape &&
              styles.plusButtonLandscape,

            isTablet &&
              landscape &&
              styles.plusButtonLandscapeTablet,

            !isRow &&
              !landscape &&
              styles.stitchPlusButton,

            !isRow &&
              isTablet &&
              !landscape &&
              styles.stitchPlusButtonTablet,

            !isRow &&
              landscape &&
              styles.stitchPlusButtonLandscape,

            !isRow &&
              isTablet &&
              landscape &&
              styles.stitchPlusButtonLandscapeTablet,

            {
              backgroundColor:
                currentTheme.accent,
            },


          ]}
          activeOpacity={0.8}
          onPress={
            isRow
              ? addRow
              : addStitch
          }
        >
          {isTutorial &&
            ((tutorialStep ===
                'row1' &&
              isRow) ||
              (tutorialStep ===
                'stitch' &&
              !isRow)) && (
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
              styles.plusText,

              landscape
                ? [
                    styles.plusTextLandscape,
                    isTablet &&
                      styles.plusTextLandscapeTablet,
                  ]
                : {
                    fontSize:
                      plusTextSize,
                    lineHeight:
                      plusTextSize +
                      6,
                  },

              {
                color:
                  currentTheme.text,
              },
            ]}
          >
            ＋
          </Text>
        </TouchableOpacity>
      </View>
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
        ref={rootRef}
        style={[
          styles.container,
          {
            backgroundColor:
              currentTheme.background,
          },
        ]}
      >
        {isTutorial &&
          tutorialTarget &&
          (tutorialStep === 'row1' ||
            tutorialStep === 'stitch1' ||
            tutorialStep === 'row2' ||
            tutorialStep === 'stitch2' ||
            tutorialStep === 'progress' ||
            tutorialStep === 'stitchSeparator' ||
            tutorialStep === 'undo' ||
            tutorialStep === 'rowSeparator') && (() => {
            const bubbleWidth = 236;
            const targetCenter =
              tutorialTarget.x +
              tutorialTarget.width / 2;
            const left = Math.max(
              12,
              Math.min(
                width -
                  bubbleWidth -
                  12,
                targetCenter -
                  bubbleWidth / 2
              )
            );
            const showAbove =
              tutorialTarget.y > 190;
            const top = showAbove
              ? Math.max(
                  8,
                  tutorialTarget.y - 150
                )
              : tutorialTarget.y +
                tutorialTarget.height +
                16;
            const pointerLeft = Math.max(
              20,
              Math.min(
                bubbleWidth - 30,
                targetCenter - left - 10
              )
            );

            const isFirstRow =
              tutorialStep === 'row1' ||
              tutorialStep === 'stitch1';
            const isSecondRow =
              tutorialStep === 'row2' ||
              tutorialStep === 'stitch2';

            const title =
              isFirstRow
                ? isJapanese
                  ? '1段目を数える'
                  : 'Count the first row'
                : isSecondRow
                  ? isJapanese
                    ? '2段目を数える'
                    : 'Count the second row'
                  : tutorialStep ===
                      'progress'
                    ? isJapanese
                      ? '途中を記録'
                      : 'Save Progress'
                    : tutorialStep ===
                        'stitchSeparator'
                      ? isJapanese
                        ? '目を区切る'
                        : 'Separate stitches'
                      : tutorialStep ===
                          'undo'
                        ? 'Undo'
                        : isJapanese
                          ? '段を区切る'
                          : 'Separate rows';

            const body =
              tutorialStep === 'row1'
                ? isJapanese
                  ? 'まず段の＋を1回押します。'
                  : 'Tap the row + once.'
                : tutorialStep ===
                    'stitch1'
                  ? isJapanese
                    ? `目の＋をあと${Math.max(0, 3 - project.stitch)}回押して、1段3目にします。`
                    : `Tap the stitch + ${Math.max(0, 3 - project.stitch)} more time(s) to reach 1 row, 3 stitches.`
                  : tutorialStep ===
                      'row2'
                    ? isJapanese
                      ? '次の段へ進むため、段の＋を1回押します。'
                      : 'Tap the row + once for the next row.'
                    : tutorialStep ===
                        'stitch2'
                      ? isJapanese
                        ? `目の＋をあと${Math.max(0, 3 - project.stitch)}回押して、2段3目にします。`
                        : `Tap the stitch + ${Math.max(0, 3 - project.stitch)} more time(s) to reach 2 rows, 3 stitches.`
                      : tutorialStep ===
                          'progress'
                        ? isJapanese
                          ? '2段3目の現在位置を「途中」として履歴に残します。'
                          : 'Save the current 2 rows, 3 stitches as a progress marker.'
                        : tutorialStep ===
                            'stitchSeparator'
                          ? isJapanese
                            ? '目側の│→を押します。2段はそのままで、3目が履歴に残り、目だけ0になります。'
                            : 'Tap the stitch │→. Rows stay at 2, while 3 stitches are saved and stitches reset to 0.'
                          : tutorialStep ===
                              'undo'
                            ? isJapanese
                              ? 'Undoを押して、2段3目の状態に戻します。'
                              : 'Tap Undo to return to 2 rows, 3 stitches.'
                            : isJapanese
                              ? '段側の│→を押します。2段3目を履歴に残し、段と目を両方0にします。'
                              : 'Tap the row │→. It saves 2 rows, 3 stitches and resets both to 0.';

            return (
              <View
                pointerEvents="none"
                style={[
                  styles.floatingTutorialBubble,
                  {
                    left,
                    top,
                    width:
                      bubbleWidth,
                    backgroundColor:
                      currentTheme.surface,
                    borderColor:
                      currentTheme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.floatingTutorialStep,
                    {
                      color:
                        currentTheme.subText,
                    },
                  ]}
                >
                  {tutorialStepNumber} / 11
                </Text>

                <Text
                  style={[
                    styles.floatingTutorialTitle,
                    {
                      color:
                        currentTheme.text,
                    },
                  ]}
                >
                  {title}
                </Text>

                <Text
                  style={[
                    styles.floatingTutorialText,
                    {
                      color:
                        currentTheme.subText,
                    },
                  ]}
                >
                  {body}
                </Text>

                <View
                  style={[
                    styles.floatingTutorialPointer,
                    {
                      left:
                        pointerLeft,
                    },
                    showAbove
                      ? {
                          bottom: -10,
                          borderTopWidth:
                            10,
                          borderTopColor:
                            currentTheme.surface,
                        }
                      : {
                          top: -10,
                          borderBottomWidth:
                            10,
                          borderBottomColor:
                            currentTheme.surface,
                        },
                  ]}
                />
              </View>
            );
          })()}

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
          <TouchableOpacity
            style={[
              styles.backButton,
              isTutorial &&
                styles.tutorialDim,
            ]}
            onPress={() =>
              router.back()
            }
            disabled={isTutorial}
          >
            <Text
              style={[
                styles.backText,
                {
                  color:
                    currentTheme.text,
                },
              ]}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.projectName,

              isSmallScreen &&
                styles.projectNameSmall,

              isLandscape &&
                styles.projectNameLandscape,

              {
                color:
                  currentTheme.text,
              },
            ]}
            numberOfLines={1}
          >
            {project.name}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {!isLandscape && (
          <View
            style={
              styles.portraitContent
            }
          >
            <View
              style={
                styles.portraitTopArea
              }
            >
              <View
                style={
                  styles.portraitActionBox
                }
              >
                {renderPortraitActions()}
              </View>

              <View
                style={
                  styles.portraitMemoBox
                }
              >
                {renderMemo()}
              </View>

              <View
                style={
                  styles.portraitHistoryBox
                }
              >
                {renderHistory()}
              </View>
            </View>

            <View
              style={
                styles.portraitCounters
              }
            >
              <View
                style={[
                  styles.portraitCounterItem,
                  styles.portraitRowCounterItem,
                ]}
              >
                {renderCounter(
                  'row'
                )}
              </View>

              <View
                style={[
                  styles.portraitDivider,
                  {
                    backgroundColor:
                      currentTheme.border,
                  },
                ]}
              />

              <View
                style={
                  styles.portraitCounterItem
                }
              >
                {renderCounter(
                  'stitch'
                )}
              </View>
            </View>
          </View>
        )}

        {isLandscape && (
          <View
            style={
              styles.landscapeContent
            }
          >
            <View
              style={[
                styles.landscapeLeft,
                {
                  width:
                    landscapeLeftWidth,
                },
              ]}
            >
              <View
                style={
                  styles.landscapeUndoBox
                }
              >
                {renderLandscapeUndo()}
              </View>

              <View
                style={
                  styles.landscapeMemoBox
                }
              >
                {renderMemo(true)}
              </View>

              <View
                style={
                  styles.landscapeHistoryBox
                }
              >
                {renderHistory(true)}
              </View>

              <View
                style={
                  styles.landscapeMarkBox
                }
              >
                {renderLandscapeMark()}
              </View>
            </View>

            <View
              style={
                styles.landscapeMain
              }
            >
              <View
                style={
                  styles.landscapeCounters
                }
              >
                <View
                  style={
                    styles.landscapeCounterColumn
                  }
                >
                  {renderCounter(
                    'row',
                    true
                  )}
                </View>

                <View
                  style={[
                    styles.landscapeDivider,
                    {
                      backgroundColor:
                        currentTheme.border,
                    },
                  ]}
                />

                <View
                  style={
                    styles.landscapeCounterColumn
                  }
                >
                  {renderCounter(
                    'stitch',
                    true
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        <Modal
          visible={
            memoModalVisible
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
            closeMemoModal
          }
        >
          <KeyboardAvoidingView
            style={
              styles.keyboardAvoidingView
            }
            behavior={
              Platform.OS ===
              'ios'
                ? 'padding'
                : 'height'
            }
          >
            <View
              style={
                styles.modalOverlay
              }
            >
              <View
                style={[
                  styles.memoModal,

                  isLandscape &&
                    styles.memoModalLandscape,

                  {
                    backgroundColor:
                      currentTheme.surface,
                  },
                ]}
              >
                <View
                  style={
                    styles.modalHeader
                  }
                >
                  <Text
                    style={[
                      styles.modalTitle,
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

                  <TouchableOpacity
                    style={
                      styles.modalCloseButton
                    }
                    onPress={
                      closeMemoModal
                    }
                  >
                    <Text
                      style={[
                        styles.modalCloseText,
                        {
                          color:
                            currentTheme.text,
                        },
                      ]}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>

                {!memoEditing ? (
                  <>
                    <View
                      style={[
                        styles.memoViewer,
                        {
                          backgroundColor:
                            currentTheme.background,
                          borderColor:
                            currentTheme.border,
                        },
                      ]}
                    >
                      <ScrollView
                        showsVerticalScrollIndicator
                      >
                        <Text
                          style={[
                            styles.memoViewerText,
                            {
                              color:
                                project.memo
                                  ? currentTheme.text
                                  : currentTheme.subText,
                            },
                          ]}
                        >
                          {project.memo ||
                            (isJapanese
                              ? 'メモはまだありません'
                              : 'No note yet')}
                        </Text>
                      </ScrollView>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.memoEditButton,
                        {
                          backgroundColor:
                            currentTheme.accent,
                        },
                      ]}
                      onPress={
                        startMemoEditing
                      }
                    >
                      <Text
                        style={[
                          styles.memoEditButtonText,
                          {
                            color:
                              currentTheme.text,
                          },
                        ]}
                      >
                        {isJapanese
                          ? '編集'
                          : 'Edit'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View
                    style={
                      styles.memoEditContainer
                    }
                  >
                    <View
                      style={
                        styles.memoInputWrapper
                      }
                    >
                      <TextInput
                        value={memoDraft}
                        onChangeText={
                          setMemoDraft
                        }
                        multiline
                        scrollEnabled
                        textAlignVertical="top"
                        placeholder={
                          isJapanese
                            ? 'メモを入力'
                            : 'Enter a note'
                        }
                        placeholderTextColor={
                          currentTheme.subText
                        }
                        style={[
                          styles.memoInput,
                          {
                            color:
                              currentTheme.text,
                            borderColor:
                              currentTheme.border,
                            backgroundColor:
                              currentTheme.background,
                          },
                        ]}
                      />
                    </View>

                    <View
                      style={
                        styles.memoModalButtons
                      }
                    >
                      <TouchableOpacity
                        style={[
                          styles.memoCancelButton,
                          {
                            backgroundColor:
                              currentTheme.soft,
                          },
                        ]}
                        onPress={
                          cancelMemoEditing
                        }
                      >
                        <Text
                          style={{
                            color:
                              currentTheme.text,
                          }}
                        >
                          {isJapanese
                            ? 'キャンセル'
                            : 'Cancel'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.memoSaveButton,
                          {
                            backgroundColor:
                              currentTheme.accent,
                          },
                        ]}
                        onPress={
                          saveMemo
                        }
                      >
                        <Text
                          style={[
                            styles.memoSaveText,
                            {
                              color:
                                currentTheme.text,
                            },
                          ]}
                        >
                          {isJapanese
                            ? '保存'
                            : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={
            historyModalVisible
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
          onRequestClose={() =>
            setHistoryModalVisible(
              false
            )
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={[
                styles.historyModal,

                isLandscape &&
                  styles.historyModalLandscape,

                {
                  backgroundColor:
                    currentTheme.surface,
                },
              ]}
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        currentTheme.text,
                    },
                  ]}
                >
                  {isJapanese
                    ? '履歴'
                    : 'History'}
                </Text>

                <TouchableOpacity
                  style={
                    styles.modalCloseButton
                  }
                  onPress={() =>
                    setHistoryModalVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={[
                      styles.modalCloseText,
                      {
                        color:
                          currentTheme.text,
                      },
                    ]}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={
                  fullHistoryScrollRef
                }
                style={
                  styles.fullHistoryScroll
                }
                showsVerticalScrollIndicator
                onContentSizeChange={() => {
                  if (
                    historyModalVisible
                  ) {
                    fullHistoryScrollRef
                      .current
                      ?.scrollToEnd({
                        animated:
                          false,
                      });
                  }
                }}
              >
                {displayHistory.map(
                  (
                    item,
                    index
                  ) => {
                    const isNewest =
                      index ===
                      displayHistory.length -
                        1;

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.fullHistoryRow,
                          {
                            borderBottomColor:
                              currentTheme.border,
                          },
                        ]}
                      >
                        <View
                          style={
                            styles.fullHistoryLeft
                          }
                        >
                          <Text
                            style={[
                              styles.fullHistoryCount,
                              {
                                color:
                                  currentTheme.text,
                              },
                            ]}
                          >
                            {isJapanese
                              ? `${item.row}段 ${item.stitch}目`
                              : `${item.row} ${item.row === 1 ? 'Row' : 'Rows'} ${item.stitch} ${item.stitch === 1 ? 'Stitch' : 'Stitches'}`}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.fullHistoryRight
                          }
                        >
                          {item.type ===
                            'mark' && (
                            <View
                              style={[
                                styles.pausedBadge,
                                {
                                  backgroundColor:
                                    currentTheme.soft,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color:
                                    currentTheme.text,
                                  fontSize:
                                    12,
                                }}
                              >
                                {isJapanese
                                  ? '途中'
                                  : 'Paused'}
                              </Text>
                            </View>
                          )}

                          {isNewest && (
                            <Text
                              style={[
                                styles.newLabelFull,
                                {
                                  color:
                                    currentTheme.accent,
                                },
                              ]}
                            >
                              NEW
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  }
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    tutorialDim: {
      opacity: 0.14,
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

    floatingTutorialBubble: {
      position: 'absolute',
      zIndex: 180,
      elevation: 30,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingTop: 11,
      paddingBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },

    floatingTutorialStep: {
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 4,
    },

    floatingTutorialTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 3,
    },

    floatingTutorialText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
    },

    floatingTutorialPointer: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderLeftWidth: 10,
      borderRightWidth: 10,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },

    loadingSafeArea: {
      flex: 1,
      backgroundColor:
        '#F8F3EC',
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
      height: 58,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
    },

    headerSmall: {
      height: 48,
    },

    headerLandscape: {
      height: 38,
      paddingHorizontal: 12,
    },

    backButton: {
      width: 44,
      height: 40,
      justifyContent:
        'center',
    },

    backText: {
      fontSize: 38,
      lineHeight: 40,
    },

    projectName: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
    },

    projectNameSmall: {
      fontSize: 15,
    },

    projectNameLandscape: {
      fontSize: 16,
    },

    headerSpacer: {
      width: 44,
    },

    portraitContent: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: 16,
      paddingBottom: 6,
      gap: 6,
    },

    portraitTopArea: {
      flex: 0.34,
      minHeight: 0,
      gap: 5,
    },

    portraitActionBox: {
      height: 44,
      flexShrink: 0,
    },

    portraitMemoBox: {
      flex: 0.38,
      minHeight: 58,
    },

    portraitHistoryBox: {
      flex: 0.62,
      minHeight: 78,
    },

    portraitCounters: {
      flex: 0.66,
      minHeight: 0,
    },

    portraitCounterItem: {
      flex: 1,
      minHeight: 0,
    },

    portraitRowCounterItem: {
      paddingBottom: 6,
    },

    portraitDivider: {
      height: 1,
      width: '100%',
      flexShrink: 0,
    },

    portraitActions: {
      flex: 1,
      position: 'relative',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
    },

    sectionTitleLandscape: {
      fontSize: 14,
    },

    openArrow: {
      fontSize: 23,
      lineHeight: 23,
    },

    markButton: {
      minWidth: 135,
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1.5,
    },

    markButtonLandscape: {
      minWidth: 0,
      width: '100%',
      height: 36,
      paddingHorizontal: 5,
    },

    markButtonText: {
      fontWeight: '700',
      fontSize: 16,
    },

    markButtonTextLandscape: {
      fontSize: 13,
    },

    soundButton: {
      position: 'absolute',
      left: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1.5,
    },

    undoButton: {
      position: 'absolute',
      right: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1.5,
    },

    undoButtonLandscape: {
      position: 'relative',
      right: undefined,
      width: 36,
      height: 36,
      borderRadius: 18,
    },

    undoDisabled: {
      opacity: 0.4,
    },

    memoArea: {
      flex: 1,
      minHeight: 0,
      borderRadius: 17,
      paddingHorizontal: 13,
      paddingTop: 8,
      paddingBottom: 6,
      borderWidth: 1,
    },

    memoAreaLandscape: {
      borderRadius: 13,
      paddingHorizontal: 8,
      paddingTop: 5,
      paddingBottom: 4,
    },

    memoHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    memoPreviewScroll: {
      flex: 1,
      minHeight: 0,
      marginTop: 3,
    },

    memoPreviewContent: {
      paddingBottom: 4,
    },

    memoText: {
      fontSize: 15,
      lineHeight: 19,
      paddingRight: 3,
    },

    memoTextLandscape: {
      fontSize: 14,
      lineHeight: 17,
    },

    historyArea: {
      flex: 1,
      minHeight: 0,
      borderRadius: 17,
      paddingHorizontal: 13,
      paddingTop: 8,
      paddingBottom: 6,
      borderWidth: 1,
    },

    historyAreaLandscape: {
      borderRadius: 13,
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 4,
    },

    historyHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    recentHistoryScroll: {
      flex: 1,
      minHeight: 0,
      marginTop: 3,
    },

    recentHistoryContent: {
      gap: 3,
      paddingBottom: 3,
    },

    emptyHistoryText: {
      marginTop: 5,
      fontSize: 11,
    },

    historyRow: {
      minHeight: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 3,
    },

    historyLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 0,
    },

    historyCountText: {
      flexShrink: 1,
      fontSize: 15,
      lineHeight: 18,
    },

    pausedBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 9,
    },

    newLabel: {
      fontSize: 9,
      fontWeight: '800',
      marginLeft: 3,
    },

    counterSection: {
      flex: 1,
      minHeight: 0,
      alignItems: 'center',
      justifyContent:
        'flex-start',
    },

    counterSectionLandscape: {
      flex: 1,
      minHeight: 0,
      justifyContent:
        'flex-start',
      paddingBottom: 2,
    },

    counterSectionLandscapeTablet: {
      flex: 1,
      minHeight: 0,
      paddingBottom: 2,
    },

    counterTopRow: {
      width: '82%',
      maxWidth: 340,
      height: 60,
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      position: 'relative',
    },

    counterTopRowLandscape: {
      width: '90%',
      maxWidth: 520,
      height: 58,
      flexShrink: 0,
    },

    counterTopRowTablet: {
      width: '80%',
      maxWidth: 560,
      height: 88,
    },

    counterTopRowLandscapeTablet: {
      flex: 1,
      flexShrink: 1,
      height: undefined,
      minHeight: 0,
      width: '90%',
      maxWidth: 650,
    },

    counterValueRow: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent:
        'center',
      gap: 6,
      paddingHorizontal: 4,
    },

    counterNumber: {
      flexShrink: 1,
      fontWeight: '700',
      textAlign: 'center',
    },

    counterNumberLandscape: {
      fontSize: 60,
      lineHeight: 64,
    },

    counterNumberLandscapeTablet: {
      fontSize: 78,
      lineHeight: 84,
    },

    counterUnit: {
      flexShrink: 0,
      fontWeight: '400',
    },

    counterUnitLandscape: {
      fontSize: 25,
    },

    counterUnitLandscapeTablet: {
      fontSize: 32,
    },

    counterUnitTablet: {
      fontSize: 32,
    },

    nextButton: {
      width: 62,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1.5,
      flexShrink: 0,
    },

    nextButtonLandscape: {
      transform: [
        {
          translateY: -4,
        },
      ],
      marginLeft: 10,
    },

    nextButtonTablet: {
      width: 76,
      height: 52,
      borderRadius: 18,
      marginLeft: 22,
    },

    nextButtonLandscapeTablet: {
      width: 82,
      height: 56,
      borderRadius: 20,
      marginLeft: 24,
    },

    nextButtonText: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: '600',
    },

    nextButtonTextTablet: {
      fontSize: 30,
      lineHeight: 34,
    },

    plusButton: {
      flex: 1,
      minHeight: 88,
      width: '86%',
      maxWidth: 520,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent:
        'center',
      marginBottom: 4,
    },

    rowPlusButtonPortrait: {
      width: '82%',
      maxWidth: 480,
    },

    plusButtonTablet: {
      width: '92%',
      maxWidth: 640,
      minHeight: 140,
      borderRadius: 42,
    },

    plusButtonLandscape: {
      flex: 1,
      width: '92%',
      minHeight: 90,
      maxWidth: 600,
      borderRadius: 34,
      marginBottom: 0,
    },

    plusButtonLandscapeTablet: {
      flex: 2,
      minHeight: 0,
      width: '94%',
      maxWidth: 760,
      borderRadius: 42,
      marginBottom: 0,
    },

    stitchPlusButton: {
      flex: 1,
      width: '64%',
      maxWidth: 300,
      minHeight: 110,
      borderRadius: 999,
    },

    stitchPlusButtonTablet: {
      flex: 1,
      width: '68%',
      maxWidth: 460,
      minHeight: 150,
      borderRadius: 999,
    },

    stitchPlusButtonLandscape: {
      flex: 1,
      width: '78%',
      maxWidth: 460,
      minHeight: 90,
      borderRadius: 999,
    },

    stitchPlusButtonLandscapeTablet: {
      flex: 2,
      minHeight: 0,
      width: '82%',
      maxWidth: 600,
      borderRadius: 999,
      marginBottom: 0,
    },

    plusText: {
      fontWeight: '500',
      textAlign: 'center',
    },

    plusTextLandscape: {
      fontSize: 72,
      lineHeight: 78,
    },

    plusTextLandscapeTablet: {
      fontSize: 96,
      lineHeight: 102,
    },

    landscapeContent: {
      flex: 1,
      minHeight: 0,
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingBottom: 3,
      gap: 8,
    },

    landscapeLeft: {
      minWidth: 120,
      maxWidth: 280,
      minHeight: 0,
      gap: 4,
    },

    landscapeUndoBox: {
      height: 36,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    landscapeMemoBox: {
      flex: 0.8,
      minHeight: 50,
    },

    landscapeHistoryBox: {
      flex: 1.2,
      minHeight: 70,
    },

    landscapeMarkBox: {
      height: 36,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    landscapeMain: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
    },

    landscapeCounters: {
      flex: 1,
      minHeight: 0,
      flexDirection: 'row',
      alignItems: 'stretch',
    },

    landscapeCounterColumn: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      alignSelf: 'stretch',
    },

    landscapeDivider: {
      width: 1,
      marginTop: 10,
      marginBottom: 3,
    },

    keyboardAvoidingView: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
    },

    memoModal: {
      width: '100%',
      maxWidth: 560,
      height: '72%',
      maxHeight: 620,
      borderRadius: 26,
      padding: 20,
    },

    memoModalLandscape: {
      width: '72%',
      maxWidth: 680,
      height: '96%',
      maxHeight: 520,
      padding: 14,
    },

    historyModal: {
      width: '100%',
      maxWidth: 560,
      height: '76%',
      borderRadius: 26,
      padding: 20,
    },

    historyModalLandscape: {
      width: '70%',
      maxWidth: 700,
      height: '88%',
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 14,
    },

    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
    },

    modalCloseButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    modalCloseText: {
      fontSize: 30,
      lineHeight: 32,
    },

    memoViewer: {
      flex: 1,
      minHeight: 100,
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
    },

    memoViewerText: {
      fontSize: 16,
      lineHeight: 23,
    },

    memoEditButton: {
      minHeight: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 14,
    },

    memoEditButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },

    memoEditContainer: {
      flex: 1,
      minHeight: 0,
    },

    memoInputWrapper: {
      flex: 1,
      minHeight: 0,
    },

    memoInput: {
      flex: 1,
      minHeight: 0,
      borderWidth: 1.5,
      borderRadius: 18,
      padding: 14,
      fontSize: 16,
      lineHeight: 22,
    },

    memoModalButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
      flexShrink: 0,
    },

    memoCancelButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoSaveButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    memoSaveText: {
      fontWeight: '700',
    },

    fullHistoryScroll: {
      flex: 1,
    },

    fullHistoryRow: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
      paddingVertical: 10,
    },

    fullHistoryLeft: {
      flex: 1,
      minWidth: 0,
    },

    fullHistoryRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginLeft: 10,
    },

    fullHistoryCount: {
      fontSize: 17,
      fontWeight: '600',
    },

    newLabelFull: {
      fontSize: 11,
      fontWeight: '800',
    },
  });