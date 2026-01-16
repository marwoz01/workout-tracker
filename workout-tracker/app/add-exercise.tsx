import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import type { Exercise } from "@/types/models";

const MOCK_EXERCISES: Exercise[] = [
  { id: "1", name: "Wyciskanie sztangi" },
  { id: "2", name: "Przysiady" },
  { id: "3", name: "Martwy ciąg" },
  { id: "4", name: "Podciąganie" },
  { id: "5", name: "Dip" },
];

export default function AddExerciseScreen() {
  const [searchText, setSearchText] = useState("");
  const { selectExercise } = useWorkout();

  const filteredExercises = MOCK_EXERCISES.filter((ex) =>
    ex.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectExercise = (exercise: Exercise) => {
    selectExercise(exercise);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Add Exercise</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercise"
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredExercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises found</Text>
        ) : (
          <View style={styles.exercisesList}>
            {filteredExercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                style={styles.exerciseItem}
                onPress={() => handleSelectExercise(exercise)}
              >
                <View style={styles.exerciseIconPlaceholder}>
                  <Text style={styles.exerciseIcon}>💪</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseCategory}>Full Body</Text>
                </View>
                <View style={styles.exerciseAdd}>
                  <Text style={styles.addIcon}>⊕</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  cancelButton: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  exercisesList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  exerciseIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseIcon: {
    fontSize: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  exerciseCategory: {
    fontSize: 12,
    color: "#888",
  },
  exerciseAdd: {
    padding: 8,
  },
  addIcon: {
    fontSize: 20,
    color: "#2563eb",
  },
});
