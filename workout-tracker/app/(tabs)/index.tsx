import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { ROUTES } from "@/constants/routes";

export default function HomeScreen() {
  const { routines, startWorkoutFromRoutine, deleteRoutine } = useWorkout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lifty - Workout Tracker</Text>

      <Pressable
        style={styles.newRoutineButton}
        onPress={() => router.push({ pathname: ROUTES.NEW_ROUTINE as any })}
      >
        <Text style={styles.newRoutineButtonText}>+ New Routine</Text>
      </Pressable>

      <View style={styles.routinesSection}>
        <Text style={styles.sectionTitle}>My Routines ({routines.length})</Text>

        {routines.length === 0 ? (
          <Text style={styles.emptyText}>
            No routines yet. Create one to get started!
          </Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={routines}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.routinesList}
            renderItem={({ item }) => (
              <View style={styles.routineCard}>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{item.name}</Text>
                  <Text style={styles.routineExercisesCount}>
                    {item.exercises.length} exercise
                    {item.exercises.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                <Pressable
                  style={styles.startButton}
                  onPress={() => {
                    startWorkoutFromRoutine(item.id);
                    router.push({ pathname: ROUTES.WORKOUT as any });
                  }}
                >
                  <Text style={styles.startButtonText}>Start Routine</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteRoutine(item.id)}
                >
                  <Text style={styles.deleteButtonText}>...</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
    color: "#fff",
  },
  newRoutineButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  newRoutineButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  routinesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#ccc",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  routinesList: {
    gap: 12,
  },
  routineCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  routineExercisesCount: {
    fontSize: 12,
    color: "#888",
  },
  startButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: "#888",
    fontSize: 20,
    fontWeight: "600",
  },
});
