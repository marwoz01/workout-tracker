import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { ROUTES } from "@/constants/routes";
import type { RoutineExercise } from "@/types/models";

export default function NewRoutineScreen() {
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    [],
  );
  const { addRoutine, selectedExercise, clearSelectedExercise } = useWorkout();

  useEffect(() => {
    if (selectedExercise) {
      const exists = selectedExercises.some(
        (se) => se.exercise.id === selectedExercise.id,
      );
      if (exists) {
        clearSelectedExercise();
        return;
      }

      const newExercise: RoutineExercise = {
        id: crypto.randomUUID(),
        exercise: selectedExercise,
        sets: [],
      };

      setSelectedExercises((prev) => [...prev, newExercise]);
      clearSelectedExercise();
    }
  }, [selectedExercise, clearSelectedExercise, selectedExercises]);

  const handleAddSet = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: crypto.randomUUID(),
                  weight: 20,
                  reps: 10,
                },
              ],
            }
          : ex,
      ),
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s,
              ),
            }
          : ex,
      ),
    );
  };

  const handleRemoveExercise = (id: string) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleSaveRoutine = () => {
    console.log("handleSaveRoutine called");
    console.log("routineName:", routineName);
    console.log("selectedExercises:", selectedExercises);

    if (!routineName.trim()) {
      Alert.alert("Please enter a routine name");
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert("Please add at least one exercise");
      return;
    }

    const incompleteExercises = selectedExercises.filter(
      (ex) => ex.sets.length === 0,
    );
    if (incompleteExercises.length > 0) {
      Alert.alert("Please add at least one set for each exercise");
      return;
    }

    addRoutine({
      id: crypto.randomUUID(),
      name: routineName,
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
    });

    router.replace({ pathname: ROUTES.HOME as any });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Routine</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nameSection}>
          <TextInput
            style={styles.routineNameInput}
            placeholder="Enter routine name"
            placeholderTextColor="#666"
            value={routineName}
            onChangeText={setRoutineName}
          />
        </View>

        {selectedExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises added yet</Text>
          </View>
        ) : (
          <View style={styles.exercisesList}>
            {selectedExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseSection}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseTitle}>
                    {exercise.exercise.name}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveExercise(exercise.id)}
                    style={styles.removeExerciseButton}
                  >
                    <Text style={styles.removeExerciseIcon}>✕</Text>
                  </Pressable>
                </View>

                <View style={styles.setsInfo}>
                  <Text style={styles.setsCount}>{exercise.sets.length}p</Text>
                </View>

                {exercise.sets.length > 0 && (
                  <View style={styles.setsTable}>
                    <View style={styles.tableHeader}>
                      <Text
                        style={[styles.tableHeaderCell, styles.setNumberCell]}
                      >
                        SET
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.kgCell]}>
                        +KG
                      </Text>
                      <Text style={[styles.tableHeaderCell, styles.repsCell]}>
                        REPS
                      </Text>
                    </View>

                    {exercise.sets.map((set, index) => (
                      <View key={set.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.setNumberCell]}>
                          {index + 1}
                        </Text>
                        <View
                          style={[
                            styles.tableCell,
                            styles.kgCell,
                            styles.inputCell,
                          ]}
                        >
                          <Pressable
                            onPress={() =>
                              set.weight > 0 &&
                              handleUpdateSet(
                                exercise.id,
                                set.id,
                                "weight",
                                set.weight - 5,
                              )
                            }
                          >
                            <Text style={styles.inputButton}>−</Text>
                          </Pressable>
                          <Text style={styles.inputValue}>{set.weight}</Text>
                          <Pressable
                            onPress={() =>
                              handleUpdateSet(
                                exercise.id,
                                set.id,
                                "weight",
                                set.weight + 5,
                              )
                            }
                          >
                            <Text style={styles.inputButton}>+</Text>
                          </Pressable>
                        </View>
                        <View
                          style={[
                            styles.tableCell,
                            styles.repsCell,
                            styles.inputCell,
                          ]}
                        >
                          <Pressable
                            onPress={() =>
                              set.reps > 1 &&
                              handleUpdateSet(
                                exercise.id,
                                set.id,
                                "reps",
                                set.reps - 1,
                              )
                            }
                          >
                            <Text style={styles.inputButton}>−</Text>
                          </Pressable>
                          <Text style={styles.inputValue}>{set.reps}</Text>
                          <Pressable
                            onPress={() =>
                              handleUpdateSet(
                                exercise.id,
                                set.id,
                                "reps",
                                set.reps + 1,
                              )
                            }
                          >
                            <Text style={styles.inputButton}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable
                  style={styles.addSetButton}
                  onPress={() => handleAddSet(exercise.id)}
                >
                  <Text style={styles.addSetButtonText}>+ Add Set</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.addExerciseButton}
          onPress={() => router.push({ pathname: ROUTES.ADD_EXERCISE as any })}
        >
          <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
        </Pressable>
        <Pressable style={styles.createButton} onPress={handleSaveRoutine}>
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  nameSection: {
    marginBottom: 24,
  },
  routineNameInput: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  exercisesList: {
    gap: 24,
  },
  exerciseSection: {
    marginBottom: 8,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  removeExerciseButton: {
    padding: 4,
  },
  removeExerciseIcon: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
  setsInfo: {
    marginBottom: 12,
  },
  setsCount: {
    fontSize: 12,
    color: "#888",
  },
  setsTable: {
    marginBottom: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
  },
  setNumberCell: {
    flex: 0.8,
  },
  kgCell: {
    flex: 1.2,
  },
  repsCell: {
    flex: 1.2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  tableCell: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    justifyContent: "center",
  },
  inputCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  inputButton: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  inputValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  addSetButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  addSetButtonText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  addExerciseButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  addExerciseButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
