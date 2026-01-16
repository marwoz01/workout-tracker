import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";

export default function WorkoutScreen() {
  const { workout, finishWorkout, addSet } = useWorkout();
  const [duration, setDuration] = useState(0);
  const [currentWeightInputs, setCurrentWeightInputs] = useState<
    Record<string, string>
  >({});
  const [currentRepsInputs, setCurrentRepsInputs] = useState<
    Record<string, string>
  >({});
  const [restTimers, setRestTimers] = useState<Record<string, number>>({});
  const REST_DURATION = 240; // 4 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
      setRestTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] -= 1;
            if (updated[key] === 0) {
              Alert.alert("Rest time is up!");
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h${mins}m`;
    }
    return `${mins}m${secs}s`;
  };

  const getRestTimer = (exerciseId: string) => {
    const remaining = restTimers[exerciseId] || 0;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}m${secs}s`;
  };

  const calculateTotalVolume = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, ex) => {
      const exerciseVolume = ex.sets.reduce(
        (sum, set) => sum + set.weight * set.reps,
        0
      );
      return total + exerciseVolume;
    }, 0);
  };

  const calculateTotalSets = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const handleAddSet = (exerciseId: string) => {
    const weight = currentWeightInputs[exerciseId];
    const reps = currentRepsInputs[exerciseId];

    if (!weight || !reps) {
      Alert.alert("Please enter weight and reps");
      return;
    }

    addSet(exerciseId, {
      weight: Number(weight),
      reps: Number(reps),
      rest: 0,
    });

    setCurrentWeightInputs((prev) => ({ ...prev, [exerciseId]: "" }));
    setCurrentRepsInputs((prev) => ({ ...prev, [exerciseId]: "" }));

    // Start rest timer for this exercise
    setRestTimers((prev) => ({ ...prev, [exerciseId]: REST_DURATION }));
  };

  const handleFinish = () => {
    finishWorkout();
    router.replace(ROUTES.HOME);
  };

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Brak aktywnego treningu</Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace(ROUTES.HOME)}
        >
          <Text style={styles.secondaryButtonText}>Wróć na start</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.collapseButton}>⋀</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Log Workout</Text>
        <Pressable style={styles.timerIcon}>
          <Text>⏱</Text>
        </Pressable>
        <Pressable style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </Pressable>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>{calculateTotalVolume()} kg</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Sets</Text>
          <Text style={styles.statValue}>{calculateTotalSets()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workout.exercises.map((exercise) => (
          <View key={exercise.exercise.id} style={styles.exerciseSection}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIcon}>
                <Text>💪</Text>
              </View>
              <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
              <Text style={styles.exerciseMenu}>⋮</Text>
            </View>

            <View style={styles.setsCountContainer}>
              <Text style={styles.setsCount}>{exercise.sets.length}p</Text>
            </View>

            <View style={styles.restTimerContainer}>
              <Text style={styles.restTimerIcon}>⏱</Text>
              <Text style={styles.restTimer}>
                Rest Timer: {getRestTimer(exercise.exercise.id)}
              </Text>
            </View>

            <View style={styles.setsTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.setCol]}>SET</Text>
                <Text style={[styles.tableHeaderCell, styles.kgCol]}>+KG</Text>
                <Text style={[styles.tableHeaderCell, styles.repsCol]}>
                  REPS
                </Text>
                <Text style={[styles.tableHeaderCell, styles.checkCol]}>✓</Text>
              </View>

              {exercise.sets.map((set, idx) => (
                <View key={set.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.setCol]}>
                    {idx + 1}
                  </Text>
                  <Text style={[styles.tableCell, styles.kgCol]}>
                    {set.weight}
                  </Text>
                  <Text style={[styles.tableCell, styles.repsCol]}>
                    {set.reps}
                  </Text>
                  <View style={styles.checkCellContainer}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                </View>
              ))}

              <View style={[styles.tableRow, styles.inputRow]}>
                <Text style={[styles.tableCell, styles.setCol]}>
                  {exercise.sets.length + 1}
                </Text>
                <TextInput
                  style={[styles.tableInputCell, styles.kgCol]}
                  placeholder="0"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  value={currentWeightInputs[exercise.exercise.id] || ""}
                  onChangeText={(text) =>
                    setCurrentWeightInputs((prev) => ({
                      ...prev,
                      [exercise.exercise.id]: text,
                    }))
                  }
                />
                <TextInput
                  style={[styles.tableInputCell, styles.repsCol]}
                  placeholder="0"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  value={currentRepsInputs[exercise.exercise.id] || ""}
                  onChangeText={(text) =>
                    setCurrentRepsInputs((prev) => ({
                      ...prev,
                      [exercise.exercise.id]: text,
                    }))
                  }
                />
                <Pressable
                  style={styles.checkCellButton}
                  onPress={() => handleAddSet(exercise.exercise.id)}
                >
                  <Text style={styles.checkMarkButton}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  collapseButton: {
    fontSize: 20,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  timerIcon: {
    padding: 8,
  },
  finishButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  exerciseSection: {
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    flex: 1,
  },
  exerciseMenu: {
    fontSize: 16,
    color: "#666",
  },
  setsCountContainer: {
    marginBottom: 8,
  },
  setsCount: {
    fontSize: 11,
    color: "#888",
  },
  restTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  restTimerIcon: {
    fontSize: 12,
    color: "#2563eb",
    marginRight: 4,
  },
  restTimer: {
    fontSize: 12,
    color: "#2563eb",
  },
  setsTable: {
    marginBottom: 12,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "600",
    color: "#888",
  },
  setCol: {
    width: 30,
  },
  kgCol: {
    flex: 1.2,
    textAlign: "center",
  },
  repsCol: {
    flex: 1.2,
    textAlign: "center",
  },
  checkCol: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCellContainer: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  checkCellButton: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    alignItems: "center",
  },
  inputRow: {
    paddingVertical: 6,
  },
  tableCell: {
    fontSize: 12,
    color: "#fff",
  },
  tableInputCell: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 8,
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  checkMarkButton: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    color: "#475569",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  secondaryButtonText: {
    textAlign: "center",
    fontSize: 16,
  },
});
