import { View, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";

interface DifficultyDotsProps {
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
}

interface AnimatedDotProps {
  level: number;
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
}

const LEVELS = [1, 2, 3, 4, 5];

function AnimatedDot({ level, selectedLevel, onSelectLevel }: AnimatedDotProps) {
  const scale = useSharedValue(1);
  const isFilled = selectedLevel !== null && level <= selectedLevel;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bounceAndSelect = () => {
    scale.value = withSequence(
      withSpring(1.6, { damping: 5, stiffness: 400 }),
      withSpring(1, { damping: 8 })
    );
    onSelectLevel(level);
  };

  return (
    <TouchableOpacity onPress={bounceAndSelect} hitSlop={6}>
      <Animated.View
        style={[styles.dot, isFilled && styles.dotFilled, animatedStyle]}
      />
    </TouchableOpacity>
  );
}

export function DifficultyDots({ selectedLevel, onSelectLevel }: DifficultyDotsProps) {
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => (
        <AnimatedDot
          key={level}
          level={level}
          selectedLevel={selectedLevel}
          onSelectLevel={onSelectLevel}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  dotFilled: {
    backgroundColor: "#F97316",
  },
});
