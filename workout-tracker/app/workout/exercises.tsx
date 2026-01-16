import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";

type Exercise = {
  id: string;
  name: string;
};

const MOCK_EXERCISES: Exercise[] = [
  { id: "1", name: "Wyciskanie sztangi" },
  { id: "2", name: "Przysiady" },
  { id: "3", name: "Martwy ciąg" },
  { id: "4", name: "Podciąganie" },
  { id: "5", name: "Wyciskanie hantli" },
];

export default function ExercisesScreen() {
  const { addExercise } = useWorkout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj ćwiczenie</Text>

      <FlatList
        data={MOCK_EXERCISES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.exerciseCard}
            onPress={() => {
              addExercise({
                exercise: item,
                sets: [],
              } as any);
              router.back();
            }}
          >
            <Text style={styles.exerciseName}>{item.name}</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Anuluj</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  exerciseCard: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 16,
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
