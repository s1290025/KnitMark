import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  loadAppData,
  saveAppData,
} from '../storage/appStorage';
import { themes } from '../theme/themes';

const pages = [
  {
    eyebrowJa: 'Knit Markへようこそ',
    eyebrowEn: 'Welcome to Knit Mark',
    titleJa: '作品ごとに、編み進みを記録',
    bodyJa: '段数・目数・メモを作品ごとにまとめて管理できます。',
    titleEn: 'Keep each project organized',
    bodyEn: 'Track rows, stitches, and notes separately for every knitting project.',
  },
  {
    eyebrowJa: 'シンプルなカウント',
    eyebrowEn: 'Simple counting',
    titleJa: '編んだら、大きな＋をタップ',
    bodyJa: '段と目を分けて数えられるので、編むことに集中できます。',
    titleEn: 'Tap the big + as you knit',
    bodyEn: 'Count rows and stitches separately without breaking your rhythm.',
  },
  {
    eyebrowJa: '迷子にならない',
    eyebrowEn: 'Never lose your place',
    titleJa: '途中も、履歴も、あとから確認',
    bodyJa: '途中を記録したり、履歴を見返したり、Undoで操作を戻せます。',
    titleEn: 'Save progress and review history',
    bodyEn: 'Mark your place, check history, and undo mistakes when needed.',
  },
  {
    eyebrowJa: '準備完了',
    eyebrowEn: 'Ready to begin',
    titleJa: '記録は自動保存されます',
    bodyJa: '次は実際の画面を使って、基本操作を一緒に試します。',
    titleEn: 'Your progress is saved automatically',
    bodyEn: 'Next, you’ll try the basic controls on the actual app screens.',
  },
];

export default function OnboardingScreen() {
  const [page, setPage] = useState(0);
  const [language, setLanguage] =
    useState<'ja' | 'en'>('ja');

  const theme = themes.beige;
  const item = pages[page];
  const isJapanese = language === 'ja';

  const finishOnboarding = async () => {
    const data = await loadAppData();

    await saveAppData({
      ...data,
      language,
      introStage: 'tutorial',
      tutorialStep: 'create',
      tutorialProjectId: null,
    });

    router.replace('/');
  };

  const next = async () => {
    if (page < pages.length - 1) {
      setPage((current) => current + 1);
      return;
    }

    await finishOnboarding();
  };

  const renderProjectsVisual = () => (
    <View style={styles.mockScreen}>
      <View style={styles.mockHeader}>
        <Text
          style={[
            styles.mockHeaderTitle,
            { color: theme.text },
          ]}
        >
          {isJapanese ? '作品一覧' : 'Projects'}
        </Text>

        <View
          style={[
            styles.mockRoundButton,
            { backgroundColor: theme.soft },
          ]}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={theme.text}
          />
        </View>
      </View>

      <View style={styles.projectStack}>
        <View
          style={[
            styles.projectCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.projectTextArea}>
            <Text
              style={[
                styles.projectTitle,
                { color: theme.text },
              ]}
            >
              {isJapanese ? 'セーター' : 'Sweater'}
            </Text>
            <Text
              style={[
                styles.projectMeta,
                { color: theme.subText },
              ]}
            >
              {isJapanese ? '12段  36目' : '12 Rows  36 Stitches'}
            </Text>
          </View>

          <Feather
            name="edit-2"
            size={15}
            color={theme.subText}
          />
        </View>

        <View
          style={[
            styles.projectCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.projectTextArea}>
            <Text
              style={[
                styles.projectTitle,
                { color: theme.text },
              ]}
            >
              {isJapanese ? 'マフラー' : 'Scarf'}
            </Text>
            <Text
              style={[
                styles.projectMeta,
                { color: theme.subText },
              ]}
            >
              {isJapanese ? '28段  0目' : '28 Rows  0 Stitches'}
            </Text>
          </View>

          <Feather
            name="edit-2"
            size={15}
            color={theme.subText}
          />
        </View>
      </View>

      <View
        style={[
          styles.mockFloatingPlus,
          { backgroundColor: theme.accent },
        ]}
      >
        <Text
          style={[
            styles.mockFloatingPlusText,
            { color: theme.text },
          ]}
        >
          ＋
        </Text>
      </View>
    </View>
  );

  const renderCounterVisual = () => (
    <View style={styles.counterMock}>
      <View
        style={[
          styles.counterPanel,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.counterValueRow}>
          <Text
            style={[
              styles.counterNumber,
              { color: theme.text },
            ]}
          >
            12
          </Text>
          <Text
            style={[
              styles.counterUnit,
              { color: theme.text },
            ]}
          >
            {isJapanese ? '段' : 'Rows'}
          </Text>
        </View>

        <View
          style={[
            styles.counterPlus,
            { backgroundColor: theme.accent },
          ]}
        >
          <Text
            style={[
              styles.counterPlusText,
              { color: theme.text },
            ]}
          >
            ＋
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.counterPanel,
          styles.counterPanelSmall,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.counterValueRow}>
          <Text
            style={[
              styles.counterNumber,
              { color: theme.text },
            ]}
          >
            36
          </Text>
          <Text
            style={[
              styles.counterUnit,
              { color: theme.text },
            ]}
          >
            {isJapanese ? '目' : 'Stitches'}
          </Text>
        </View>

        <View
          style={[
            styles.counterPlus,
            styles.counterPlusRound,
            { backgroundColor: theme.accent },
          ]}
        >
          <Text
            style={[
              styles.counterPlusText,
              { color: theme.text },
            ]}
          >
            ＋
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHistoryVisual = () => (
    <View style={styles.historyMock}>
      <View style={styles.actionMockRow}>
        <View
          style={[
            styles.mockRoundButton,
            { backgroundColor: theme.soft },
          ]}
        >
          <Feather
            name="volume-2"
            size={16}
            color={theme.text}
          />
        </View>

        <View
          style={[
            styles.progressPill,
            {
              backgroundColor: theme.soft,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.progressPillText,
              { color: theme.text },
            ]}
          >
            {isJapanese ? '途中を記録' : 'Save Progress'}
          </Text>
        </View>

        <View
          style={[
            styles.mockRoundButton,
            { backgroundColor: theme.soft },
          ]}
        >
          <Feather
            name="rotate-ccw"
            size={16}
            color={theme.text}
          />
        </View>
      </View>

      <View
        style={[
          styles.historyCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.historyHeadingRow}>
          <Text
            style={[
              styles.historyHeading,
              { color: theme.text },
            ]}
          >
            {isJapanese ? '履歴' : 'History'}
          </Text>
          <Text
            style={[
              styles.historyMore,
              { color: theme.subText },
            ]}
          >
            {isJapanese ? 'すべて' : 'All'} ›
          </Text>
        </View>

        <View style={styles.historyLine}>
          <Text
            style={[
              styles.historyCount,
              { color: theme.text },
            ]}
          >
            {isJapanese ? '11段 36目' : '11 Rows 36 Stitches'}
          </Text>
        </View>

        <View style={styles.historyLine}>
          <Text
            style={[
              styles.historyCount,
              { color: theme.text },
            ]}
          >
            {isJapanese ? '12段 18目' : '12 Rows 18 Stitches'}
          </Text>

          <View
            style={[
              styles.pausedBadge,
              { backgroundColor: theme.soft },
            ]}
          >
            <Text
              style={[
                styles.pausedBadgeText,
                { color: theme.text },
              ]}
            >
              {isJapanese ? '途中' : 'Paused'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSaveVisual = () => (
    <View style={styles.saveMock}>
      <View
        style={[
          styles.saveIconCircle,
          { backgroundColor: theme.soft },
        ]}
      >
        <Feather
          name="check"
          size={40}
          color={theme.text}
        />
      </View>

      <Text
        style={[
          styles.saveTitle,
          { color: theme.text },
        ]}
      >
        {isJapanese ? '自動保存' : 'Auto Save'}
      </Text>

      <Text
        style={[
          styles.saveSubText,
          { color: theme.subText },
        ]}
      >
        {isJapanese
          ? 'カウント・履歴・メモ・設定'
          : 'Counts · History · Notes · Settings'}
      </Text>

      <View
        style={[
          styles.saveStatus,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.saveStatusDot,
            { backgroundColor: theme.accent },
          ]}
        />
        <Text
          style={[
            styles.saveStatusText,
            { color: theme.text },
          ]}
        >
          {isJapanese
            ? 'この端末に保存されています'
            : 'Saved on this device'}
        </Text>
      </View>
    </View>
  );

  const renderVisual = () => {
    if (page === 0) {
      return renderProjectsVisual();
    }

    if (page === 1) {
      return renderCounterVisual();
    }

    if (page === 2) {
      return renderHistoryVisual();
    }

    return renderSaveVisual();
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.brand,
              { color: theme.text },
            ]}
          >
            Knit Mark
          </Text>

          <View
            style={[
              styles.languageSwitch,
              {
                backgroundColor:
                  theme.soft,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.languageOption,

                isJapanese && {
                  backgroundColor:
                    theme.surface,
                },
              ]}
              onPress={() =>
                setLanguage('ja')
              }
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight:
                    isJapanese
                      ? '700'
                      : '400',
                }}
              >
                日本語
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,

                !isJapanese && {
                  backgroundColor:
                    theme.surface,
                },
              ]}
              onPress={() =>
                setLanguage('en')
              }
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight:
                    !isJapanese
                      ? '700'
                      : '400',
                }}
              >
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View
            style={[
              styles.visual,
              {
                backgroundColor:
                  theme.soft,
                borderColor:
                  theme.border,
              },
            ]}
          >
            {renderVisual()}
          </View>

          <View
            style={[
              styles.eyebrow,
              {
                backgroundColor:
                  theme.soft,
              },
            ]}
          >
            <Text
              style={[
                styles.eyebrowText,
                { color: theme.subText },
              ]}
            >
              {isJapanese
                ? item.eyebrowJa
                : item.eyebrowEn}
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            {isJapanese
              ? item.titleJa
              : item.titleEn}
          </Text>

          <Text
            style={[
              styles.body,
              {
                color: theme.subText,
              },
            ]}
          >
            {isJapanese
              ? item.bodyJa
              : item.bodyEn}
          </Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {pages.map(
              (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === page &&
                      styles.dotActive,
                    {
                      backgroundColor:
                        index === page
                          ? theme.accent
                          : theme.border,
                    },
                  ]}
                />
              )
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  theme.accent,
              },
            ]}
            onPress={next}
          >
            <Text
              style={[
                styles.buttonText,
                { color: theme.text },
              ]}
            >
              {page ===
              pages.length - 1
                ? isJapanese
                  ? '操作を試してみる'
                  : 'Try the controls'
                : isJapanese
                  ? '次へ'
                  : 'Next'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.backButton,
              page === 0 &&
                styles.backButtonHidden,
            ]}
            onPress={() =>
              setPage((current) =>
                Math.max(
                  0,
                  current - 1
                )
              )
            }
            disabled={page === 0}
          >
            <Text
              style={[
                styles.backButtonText,
                { color: theme.subText },
              ]}
            >
              {isJapanese
                ? '戻る'
                : 'Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    container: {
      flex: 1,
      paddingHorizontal: 22,
      paddingTop: 10,
      paddingBottom: 16,
    },

    topRow: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    brand: {
      fontSize: 21,
      fontWeight: '800',
      letterSpacing: -0.4,
    },

    languageSwitch: {
      flexDirection: 'row',
      borderRadius: 18,
      padding: 3,
    },

    languageOption: {
      minHeight: 32,
      minWidth: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },

    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 10,
    },

    visual: {
      width: '100%',
      maxWidth: 420,
      height: 300,
      borderWidth: 1,
      borderRadius: 32,
      padding: 18,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 2,
    },

    eyebrow: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 10,
    },

    eyebrowText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    title: {
      maxWidth: 430,
      fontSize: 29,
      lineHeight: 36,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -0.7,
      marginBottom: 10,
    },

    body: {
      maxWidth: 390,
      minHeight: 48,
      fontSize: 15,
      lineHeight: 23,
      textAlign: 'center',
    },

    bottom: {
      alignItems: 'center',
    },

    dots: {
      height: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginBottom: 16,
    },

    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    dotActive: {
      width: 22,
    },

    button: {
      width: '100%',
      maxWidth: 420,
      minHeight: 56,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonText: {
      fontSize: 16,
      fontWeight: '800',
    },

    backButton: {
      minHeight: 40,
      justifyContent: 'center',
      marginTop: 4,
    },

    backButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },

    backButtonHidden: {
      opacity: 0,
    },

    mockScreen: {
      flex: 1,
      position: 'relative',
    },

    mockHeader: {
      height: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    mockHeaderTitle: {
      fontSize: 19,
      fontWeight: '800',
    },

    mockRoundButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },

    projectStack: {
      gap: 10,
      paddingRight: 10,
    },

    projectCard: {
      minHeight: 68,
      borderRadius: 19,
      borderWidth: 1,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    projectTextArea: {
      flex: 1,
    },

    projectTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },

    projectMeta: {
      fontSize: 12,
      fontWeight: '500',
    },

    mockFloatingPlus: {
      position: 'absolute',
      right: 2,
      bottom: 0,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },

    mockFloatingPlusText: {
      fontSize: 34,
      lineHeight: 37,
      fontWeight: '400',
    },

    counterMock: {
      flex: 1,
      justifyContent: 'center',
      gap: 10,
    },

    counterPanel: {
      flex: 1,
      minHeight: 0,
      borderWidth: 1,
      borderRadius: 23,
      padding: 13,
    },

    counterPanelSmall: {
      flex: 0.9,
    },

    counterValueRow: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 5,
    },

    counterNumber: {
      fontSize: 35,
      lineHeight: 39,
      fontWeight: '800',
    },

    counterUnit: {
      fontSize: 15,
      fontWeight: '600',
    },

    counterPlus: {
      flex: 1,
      minHeight: 58,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },

    counterPlusRound: {
      alignSelf: 'center',
      width: '72%',
      borderRadius: 999,
    },

    counterPlusText: {
      fontSize: 38,
      lineHeight: 42,
      fontWeight: '400',
    },

    historyMock: {
      flex: 1,
      justifyContent: 'center',
      gap: 14,
    },

    actionMockRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 6,
    },

    progressPill: {
      minHeight: 38,
      borderRadius: 19,
      borderWidth: 1,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },

    progressPillText: {
      fontSize: 13,
      fontWeight: '700',
    },

    historyCard: {
      minHeight: 150,
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
    },

    historyHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    historyHeading: {
      fontSize: 16,
      fontWeight: '800',
    },

    historyMore: {
      fontSize: 12,
      fontWeight: '600',
    },

    historyLine: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        'rgba(120,100,85,0.18)',
      gap: 8,
    },

    historyCount: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
    },

    pausedBadge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },

    pausedBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },

    saveMock: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveIconCircle: {
      width: 82,
      height: 82,
      borderRadius: 41,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
    },

    saveTitle: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 7,
    },

    saveSubText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 18,
    },

    saveStatus: {
      minHeight: 46,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    saveStatusDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },

    saveStatusText: {
      fontSize: 13,
      fontWeight: '700',
    },
  });
