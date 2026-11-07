import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

const steps = [
  {
    target: 'row',
    ja: 'まず、段の＋を押してみましょう。',
    en: 'First, tap + for Rows.',
  },
  {
    target: 'stitch',
    ja: '次に、目の＋を押してみましょう。',
    en: 'Next, tap + for Stitches.',
  },
  {
    target: 'reset',
    ja: '│→は、その時点の数を履歴に残して区切る操作です。',
    en: '│→ saves the current count to History and starts a new section.',
  },
  {
    target: 'progress',
    ja: '「途中を記録」で、今の位置を一時的に残せます。',
    en: 'Save Progress keeps a temporary marker for your current position.',
  },
  {
    target: 'undo',
    ja: '押し間違えたときはUndoで一手ずつ戻せます。',
    en: 'Use Undo to go back one action at a time.',
  },
] as const;

export default function TutorialScreen() {
  const [step, setStep] = useState(0);
  const [row, setRow] = useState(0);
  const [stitch, setStitch] = useState(0);
  const [language, setLanguage] =
    useState<'ja' | 'en'>('ja');

  const theme = themes.beige;
  const current = steps[step];
  const isJapanese = language === 'ja';

  useEffect(() => {
    loadAppData().then((data) => {
      setLanguage(data.language);
    });
  }, []);

  const finish = async () => {
    const data = await loadAppData();

    await saveAppData({
      ...data,
      introStage: 'done',
    });

    router.replace('/');
  };

  const advance = () => {
    if (step < steps.length - 1) {
      setStep((currentStep) => currentStep + 1);
    } else {
      finish();
    }
  };

  const handleRow = () => {
    if (current.target !== 'row') return;
    setRow((value) => value + 1);
    setTimeout(advance, 180);
  };

  const handleStitch = () => {
    if (current.target !== 'stitch') return;
    setStitch((value) => value + 1);
    setTimeout(advance, 180);
  };

  const handleReset = () => {
    if (current.target !== 'reset') return;
    setStitch(0);
    setTimeout(advance, 180);
  };

  const handleProgress = () => {
    if (current.target !== 'progress') return;
    setTimeout(advance, 180);
  };

  const handleUndo = () => {
    if (current.target !== 'undo') return;
    setStitch((value) => Math.max(0, value - 1));
    setTimeout(advance, 180);
  };

  const highlight = (target: string) =>
    current.target === target
      ? {
          borderColor: theme.accent,
          borderWidth: 3,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
          elevation: 4,
        }
      : null;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              { color: theme.text },
            ]}
          >
            {isJapanese
              ? '操作チュートリアル'
              : 'Quick Tutorial'}
          </Text>

          <Text
            style={[
              styles.stepText,
              { color: theme.subText },
            ]}
          >
            {step + 1} / {steps.length}
          </Text>
        </View>

        <View
          style={[
            styles.guide,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.guideText,
              { color: theme.text },
            ]}
          >
            {isJapanese
              ? current.ja
              : current.en}
          </Text>
        </View>

        <View style={styles.mockArea}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.soundButton,
                {
                  backgroundColor: theme.soft,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather
                name="volume-2"
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.progressButton,
                {
                  backgroundColor: theme.soft,
                  borderColor: theme.border,
                },
                highlight('progress'),
              ]}
              onPress={handleProgress}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: '700',
                }}
              >
                {isJapanese
                  ? '途中を記録'
                  : 'Save Progress'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.soundButton,
                {
                  backgroundColor: theme.soft,
                  borderColor: theme.border,
                },
                highlight('undo'),
              ]}
              onPress={handleUndo}
            >
              <Feather
                name="rotate-ccw"
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.counterCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.counterTop}>
              <View style={styles.countGroup}>
                <Text
                  style={[
                    styles.number,
                    { color: theme.text },
                  ]}
                >
                  {row}
                </Text>
                <Text
                  style={[
                    styles.unit,
                    { color: theme.text },
                  ]}
                >
                  {isJapanese ? '段' : 'Rows'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: theme.soft,
                    borderColor: theme.border,
                  },
                  highlight('reset'),
                ]}
                onPress={handleReset}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: '700',
                  }}
                >
                  │→
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.plusButton,
                { backgroundColor: theme.accent },
                highlight('row'),
              ]}
              onPress={handleRow}
            >
              <Text
                style={[
                  styles.plusText,
                  { color: theme.text },
                ]}
              >
                ＋
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.counterCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.counterTop}>
              <View style={styles.countGroup}>
                <Text
                  style={[
                    styles.number,
                    { color: theme.text },
                  ]}
                >
                  {stitch}
                </Text>
                <Text
                  style={[
                    styles.unit,
                    { color: theme.text },
                  ]}
                >
                  {isJapanese ? '目' : 'Stitches'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: theme.soft,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: '700',
                  }}
                >
                  │→
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.plusButton,
                { backgroundColor: theme.accent },
                highlight('stitch'),
              ]}
              onPress={handleStitch}
            >
              <Text
                style={[
                  styles.plusText,
                  { color: theme.text },
                ]}
              >
                ＋
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={finish}
        >
          <Text
            style={{
              color: theme.subText,
              fontWeight: '600',
            }}
          >
            {isJapanese
              ? 'チュートリアルをスキップ'
              : 'Skip tutorial'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '700',
  },
  guide: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'center',
    marginBottom: 14,
  },
  guideText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  mockArea: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  soundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  counterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  countGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  number: {
    fontSize: 50,
    fontWeight: '800',
  },
  unit: {
    fontSize: 17,
    fontWeight: '600',
  },
  resetButton: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    minHeight: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '500',
  },
  skipButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
});