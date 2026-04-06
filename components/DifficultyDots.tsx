import { View, TouchableOpacity, StyleSheet } from "react-native";

interface DifficultyDotsProps {
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
}

const LEVELS = [1, 2, 3, 4, 5];

export function DifficultyDots({ selectedLevel, onSelectLevel }: DifficultyDotsProps) {
  return (
    <View style={styles.row}>
      {LEVELS.map((level) => {
        const isFilled = selectedLevel !== null && level <= selectedLevel;
        return (
          <TouchableOpacity
            key={level}
            onPress={() => onSelectLevel(level)}
            hitSlop={6}
          >
            <View style={[styles.dot, isFilled && styles.dotFilled]} />
          </TouchableOpacity>
        );
      })}
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
