import Feather from '@expo/vector-icons/Feather';
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
    icon: 'folder-plus' as const,
    titleJa: '作品ごとに記録',
    bodyJa: '編み物の作品を作成して、段数・目数・メモをまとめて管理できます。',
    titleEn: 'Track each project',
    bodyEn: 'Create knitting projects and keep rows, stitches, and notes together.',
  },
  {
    icon: 'plus-circle' as const,
    titleJa: '編んだら＋を押す',
    bodyJa: '大きな＋ボタンで段数と目数をカウント。編むことに集中できるシンプルな操作です。',
    titleEn: 'Tap + as you knit',
    bodyEn: 'Use the large + buttons to count rows and stitches with minimal interruption.',
  },
  {
    icon: 'clock' as const,
    titleJa: '途中も履歴も残せる',
    bodyJa: '途中を記録、履歴、Undoで、どこまで編んだかをあとから確認できます。',
    titleEn: 'Keep your place',
    bodyEn: 'Save progress, review history, and use Undo when you need to go back.',
  },
  {
    icon: 'save' as const,
    titleJa: '自動で保存',
    bodyJa: 'カウントや履歴、メモ、設定は端末内に自動保存されます。',
    titleEn: 'Saved automatically',
    bodyEn: 'Counts, history, notes, and settings are saved automatically on your device.',
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

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
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
              { backgroundColor: theme.soft },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.languageOption,
                isJapanese && {
                  backgroundColor: theme.surface,
                },
              ]}
              onPress={() => setLanguage('ja')}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: isJapanese ? '700' : '400',
                }}
              >
                日本語
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                !isJapanese && {
                  backgroundColor: theme.surface,
                },
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: !isJapanese ? '700' : '400',
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
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.soft },
              ]}
            >
              <Feather
                name={item.icon}
                size={72}
                color={theme.accent}
              />
            </View>

            <View
              style={styles.visualDecorationRow}
            >
              <View
                style={[
                  styles.visualDecorationDot,
                  {
                    backgroundColor:
                      theme.accent,
                  },
                ]}
              />
              <View
                style={[
                  styles.visualDecorationLine,
                  {
                    backgroundColor:
                      theme.border,
                  },
                ]}
              />
              <View
                style={[
                  styles.visualDecorationDotSmall,
                  {
                    backgroundColor:
                      theme.soft,
                  },
                ]}
              />
            </View>
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
              { color: theme.subText },
            ]}
          >
            {isJapanese
              ? item.bodyJa
              : item.bodyEn}
          </Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {pages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === page
                        ? theme.accent
                        : theme.border,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.accent },
            ]}
            onPress={next}
          >
            <Text
              style={[
                styles.buttonText,
                { color: theme.text },
              ]}
            >
              {page === pages.length - 1
                ? isJapanese
                  ? 'はじめる'
                  : 'Get Started'
                : isJapanese
                  ? '次へ'
                  : 'Next'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.backButton,
              page === 0 && styles.backButtonHidden,
            ]}
            onPress={() =>
              setPage((current) => Math.max(0, current - 1))
            }
            disabled={page === 0}
          >
            <Text
              style={{
                color: theme.subText,
                fontWeight: '600',
              }}
            >
              {isJapanese ? '戻る' : 'Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
  },
  topRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
  },
  languageSwitch: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 3,
  },
  languageOption: {
    minHeight: 34,
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
  },
  visual: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 1.18,
    borderWidth: 1,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  iconCircle: {
    width: 152,
    height: 152,
    borderRadius: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualDecorationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
  },
  visualDecorationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  visualDecorationLine: {
    width: 54,
    height: 5,
    borderRadius: 3,
  },
  visualDecorationDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    maxWidth: 430,
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
  },
  bottom: {
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    maxWidth: 420,
    minHeight: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
  },
  backButton: {
    minHeight: 42,
    justifyContent: 'center',
    marginTop: 6,
  },
  backButtonHidden: {
    opacity: 0,
  },
});