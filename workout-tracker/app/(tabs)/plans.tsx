/**
 * Ekran gotowych planów treningowych
 * Wyświetla predefiniowane programy treningowe do wyboru
 */

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { ROUTES } from "@/constants/routes";
import { useRef, useEffect } from "react";

type PresetPlan = {
  id: string;
  name: string;
  description: string;
  difficulty: "Początkujący" | "Średniozaawansowany" | "Zaawansowany";
  exercises: Array<{
    name: string;
    sets: string;
  }>;
};

// Gotowe plany treningowe
const PRESET_PLANS: PresetPlan[] = [
  {
    id: "fbw-beginner",
    name: "FBW dla początkujących",
    description: "Trening całego ciała 3x w tygodniu",
    difficulty: "Początkujący",
    exercises: [
      { name: "Wyciskanie sztangi", sets: "3x10" },
      { name: "Przysiady", sets: "3x10" },
      { name: "Wiosłowanie sztangą", sets: "3x10" },
      { name: "Podciąganie", sets: "3x8" },
      { name: "Martwy ciąg", sets: "3x8" },
    ],
  },
  {
    id: "push-pull-legs",
    name: "Push/Pull/Legs",
    description: "Podział na mięśnie pchające, ciągnące i nogi",
    difficulty: "Średniozaawansowany",
    exercises: [
      { name: "Wyciskanie sztangi", sets: "4x8" },
      { name: "Wyciskanie hantli", sets: "3x10" },
      { name: "Dip", sets: "3x12" },
      { name: "Wyciskanie francuskie", sets: "3x12" },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper/Lower Split",
    description: "Podział góra/dół 4x w tygodniu",
    difficulty: "Średniozaawansowany",
    exercises: [
      { name: "Wyciskanie sztangi", sets: "4x6" },
      { name: "Podciąganie", sets: "4x8" },
      { name: "Wyciskanie hantli", sets: "3x10" },
      { name: "Wiosłowanie hantlami", sets: "3x10" },
    ],
  },
  {
    id: "strength-5x5",
    name: "Trening Siłowy 5x5",
    description: "Program budowania siły bazowy",
    difficulty: "Zaawansowany",
    exercises: [
      { name: "Przysiady", sets: "5x5" },
      { name: "Wyciskanie sztangi", sets: "5x5" },
      { name: "Wiosłowanie sztangą", sets: "5x5" },
      { name: "Martwy ciąg", sets: "1x5" },
    ],
  },
];

export default function PlansScreen() {
  const { addRoutine } = useWorkout();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelectPlan = (plan: PresetPlan) => {
    // Konwersja gotowego planu na rutynę
    const routine = {
      id: crypto.randomUUID(),
      name: plan.name,
      createdAt: new Date().toISOString(),
      exercises: plan.exercises.map((ex, idx) => ({
        id: crypto.randomUUID(),
        exercise: { id: String(idx + 1), name: ex.name },
        sets: [],
      })),
    };

    addRoutine(routine);
    router.push({ pathname: ROUTES.HOME as any });
  };

  const getDifficultyColor = (difficulty: PresetPlan["difficulty"]) => {
    switch (difficulty) {
      case "Początkujący":
        return "#10b981";
      case "Średniozaawansowany":
        return "#f59e0b";
      case "Zaawansowany":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.title}>Gotowe plany treningowe</Text>
        <Text style={styles.subtitle}>
          Wybierz plan i dostosuj go do siebie
        </Text>
      </Animated.View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {PRESET_PLANS.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(plan.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyText}>{plan.difficulty}</Text>
                </View>
              </View>

              <View style={styles.exercisesList}>
                {plan.exercises.map((ex, idx) => (
                  <View key={idx} style={styles.exerciseRow}>
                    <Text style={styles.exerciseBullet}>•</Text>
                    <Text style={styles.exerciseText}>{ex.name}</Text>
                    <Text style={styles.exerciseSets}>{ex.sets}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={styles.selectButton}
                onPress={() => handleSelectPlan(plan)}
              >
                <Text style={styles.selectButtonText}>Wybierz plan</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  planCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: "#888",
    maxWidth: "70%",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  exercisesList: {
    marginBottom: 16,
    gap: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseBullet: {
    color: "#2563eb",
    fontSize: 16,
    marginRight: 8,
  },
  exerciseText: {
    flex: 1,
    fontSize: 14,
    color: "#ddd",
  },
  exerciseSets: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  selectButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
