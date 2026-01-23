import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";

export default function WorkoutScreen() {
  const { workout, finishWorkout, addSet, discardWorkout } = useWorkout();
  const [duration, setDuration] = useState(0);
  const [currentWeightInputs, setCurrentWeightInputs] = useState<
    Record<string, string>
  >({});
  const [currentRepsInputs, setCurrentRepsInputs] = useState<
    Record<string, string>
  >({});
  const [restTimers, setRestTimers] = useState<Record<string, number>>({});
  const [restDurations, setRestDurations] = useState<Record<string, number>>(
    {},
  );
  const [editingRestTimer, setEditingRestTimer] = useState<string | null>(null);
  const [restInputValue, setRestInputValue] = useState<string>("");
  const [currentNotes, setCurrentNotes] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [incompleteExercisesList, setIncompleteExercisesList] = useState<
    string[]
  >([]);
  const [plannedSetsCount] = useState<Record<string, number>>({});
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    exerciseId: string;
    setId: string;
    text: string;
  } | null>(null);
  const DEFAULT_PLANNED_SETS = 3;
  const REST_DURATION = 240;

  // Obliczanie czasu trwania na podstawie startTime z workout
  useEffect(() => {
    if (!workout || isFinishing) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - workout.startTime) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [workout, isFinishing]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFinishing) {
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
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinishing]);

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
        0,
      );
      return total + exerciseVolume;
    }, 0);
  };

  const calculateTotalSets = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const getPlannedSetsCount = (exerciseId: string) => {
    return plannedSetsCount[exerciseId] || DEFAULT_PLANNED_SETS;
  };

  const getEmptySetsToShow = (exerciseId: string, completedSets: number) => {
    const planned = getPlannedSetsCount(exerciseId);
    const remaining = Math.max(0, planned - completedSets);
    return remaining;
  };

  const handleAddSet = (exerciseId: string) => {
    const weight = currentWeightInputs[exerciseId];
    const reps = currentRepsInputs[exerciseId];
    const note = currentNotes[exerciseId];

    if (!weight || !reps) {
      Alert.alert("Please enter weight and reps");
      return;
    }

    addSet(exerciseId, {
      weight: Number(weight),
      reps: Number(reps),
      rest: 0,
      note,
    });

    setCurrentWeightInputs((prev) => ({ ...prev, [exerciseId]: "" }));
    setCurrentRepsInputs((prev) => ({ ...prev, [exerciseId]: "" }));
    setCurrentNotes((prev) => ({ ...prev, [exerciseId]: "" }));

    const duration = restDurations[exerciseId] || REST_DURATION;
    setRestTimers((prev) => ({ ...prev, [exerciseId]: duration }));
  };

  const handleRestTimerClick = (exerciseId: string) => {
    const currentDuration = restDurations[exerciseId] || REST_DURATION;
    setRestInputValue(String(Math.floor(currentDuration / 60)));
    setEditingRestTimer(exerciseId);
  };

  const handleRestTimerSave = (exerciseId: string) => {
    const minutes = Number(restInputValue);
    if (!isNaN(minutes) && minutes >= 0) {
      setRestDurations((prev) => ({ ...prev, [exerciseId]: minutes * 60 }));
    }
    setEditingRestTimer(null);
    setRestInputValue("");
  };

  const adjustRestTime = (exerciseId: string, delta: number) => {
    setRestDurations((prev) => {
      const current = prev[exerciseId] || REST_DURATION;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [exerciseId]: newValue };
    });
  };

  const handleFinish = () => {
    console.log("handleFinish called");
    console.log("Workout:", workout);

    if (!workout || workout.exercises.length === 0) {
      Alert.alert(
        "No exercises completed",
        "Add some exercises before finishing!",
      );
      return;
    }

    // Sprawdź czy wszystkie planowane serie zostały wypełnione
    const incompleteExercises: string[] = [];
    workout.exercises.forEach((exercise) => {
      const completed = exercise.sets.length;
      const planned = getPlannedSetsCount(exercise.exercise.id);
      console.log(
        `Exercise: ${exercise.exercise.name}, Completed: ${completed}, Planned: ${planned}`,
      );
      if (completed < planned) {
        incompleteExercises.push(
          `${exercise.exercise.name} (${completed}/${planned})`,
        );
      }
    });

    console.log("Incomplete exercises:", incompleteExercises);

    if (incompleteExercises.length > 0) {
      console.log("Showing warning for incomplete exercises");
      setIncompleteExercisesList(incompleteExercises);
      setShowIncompleteWarning(true);
    } else {
      console.log("All sets completed, showing summary");
      setIsFinishing(true);
      setShowSummary(true);
    }
  };

  const handleFinishAnyway = () => {
    setShowIncompleteWarning(false);
    setIsFinishing(true);
    setShowSummary(true);
  };

  const handleContinueTraining = () => {
    setShowIncompleteWarning(false);
  };

  const confirmFinish = () => {
    finishWorkout();
    setShowSummary(false);
    router.replace(ROUTES.HOME);
  };

  const saveNote = () => {
    if (!editingNote) return;
    updateSetNote(editingNote.exerciseId, editingNote.setId, editingNote.text);
    setEditingNote(null);
  };

  const getPersonalRecords = () => {
    if (!workout) return [];
    const records: Array<{ exercise: string; type: string; value: string }> =
      [];

    workout.exercises.forEach((ex) => {
      if (ex.sets.length === 0) return;

      const maxWeight = Math.max(...ex.sets.map((s) => s.weight));
      const maxReps = Math.max(...ex.sets.map((s) => s.reps));
      const maxVolume = Math.max(...ex.sets.map((s) => s.weight * s.reps));

      // Symulacja sprawdzania rekordów (w prawdziwej aplikacji porównaj z historią)
      if (maxWeight > 0) {
        records.push({
          exercise: ex.exercise.name,
          type: "Weight PR",
          value: `${maxWeight} kg`,
        });
      }
    });

    return records.slice(0, 3); // Max 3 rekordy
  };

  const getAchievements = () => {
    if (!workout) return [];
    const achievements = [];
    const totalSets = calculateTotalSets();
    const totalVolume = calculateTotalVolume();

    if (totalSets >= 20)
      achievements.push({ icon: "barbell", text: "Volume Beast!" });
    else if (totalSets >= 15)
      achievements.push({ icon: "flame", text: "Strong Session!" });
    else if (totalSets >= 10)
      achievements.push({ icon: "flash", text: "Solid Workout!" });

    if (totalVolume >= 5000)
      achievements.push({ icon: "trophy", text: "Heavy Lifter!" });
    if (duration >= 3600)
      achievements.push({ icon: "time", text: "Marathon Session!" });

    return achievements;
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Workout?",
      "Are you sure you want to discard this workout? All progress will be lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            discardWorkout();
            router.replace(ROUTES.HOME);
          },
        },
      ],
    );
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
        <Pressable onPress={() => setShowBackWarning(true)}>
          <Text style={styles.collapseButton}>⋀</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Log Workout</Text>
        <Pressable style={styles.timerIcon}>
          <Ionicons name="time-outline" size={20} color="#fff" />
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
                <Ionicons name="barbell" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
              <Text style={styles.exerciseMenu}>⋮</Text>
            </View>

            <View style={styles.setsCountContainer}>
              <Text style={styles.setsCount}>{exercise.sets.length}p</Text>
            </View>

            <Pressable
              style={styles.restTimerContainer}
              onPress={() => handleRestTimerClick(exercise.exercise.id)}
            >
              <Ionicons
                name="timer-outline"
                size={14}
                color="#3b82f6"
                style={styles.restTimerIcon}
              />
              <Text style={styles.restTimer}>
                Rest Timer: {getRestTimer(exercise.exercise.id)}
              </Text>
              {editingRestTimer === exercise.exercise.id ? (
                <View style={styles.restEditContainer}>
                  <Pressable
                    style={styles.restAdjustButton}
                    onPress={() => adjustRestTime(exercise.exercise.id, -30)}
                  >
                    <Text style={styles.restAdjustButtonText}>-30s</Text>
                  </Pressable>
                  <TextInput
                    style={styles.restInput}
                    value={restInputValue}
                    onChangeText={setRestInputValue}
                    keyboardType="numeric"
                    placeholder="min"
                    placeholderTextColor="#666"
                    autoFocus
                  />
                  <Pressable
                    style={styles.restAdjustButton}
                    onPress={() => adjustRestTime(exercise.exercise.id, 30)}
                  >
                    <Text style={styles.restAdjustButtonText}>+30s</Text>
                  </Pressable>
                  <Pressable
                    style={styles.restSaveButton}
                    onPress={() => handleRestTimerSave(exercise.exercise.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#999"
                  style={styles.restEditIcon}
                />
              )}
            </Pressable>

            <View style={styles.setsTable}>
              <View style={styles.tableHeader}>
                <View style={styles.setCol}>
                  <Text style={styles.tableHeaderCell}>SET</Text>
                </View>
                <View style={styles.kgCol}>
                  <Text style={styles.tableHeaderCell}>+KG</Text>
                </View>
                <View style={styles.repsCol}>
                  <Text style={styles.tableHeaderCell}>REPS</Text>
                </View>
                <View style={styles.noteCol}>
                  <Ionicons
                    name="document-text-outline"
                    size={12}
                    color="#999"
                  />
                </View>
                <View style={styles.checkCol}>
                  <Ionicons name="checkmark" size={12} color="#999" />
                </View>
              </View>

              {exercise.sets.map((set, idx) => (
                <View key={set.id} style={styles.tableRow}>
                  <View style={styles.setCol}>
                    <Text style={styles.tableCell}>{idx + 1}</Text>
                  </View>
                  <View style={styles.kgCol}>
                    <Text style={styles.tableCell}>{set.weight}</Text>
                  </View>
                  <View style={styles.repsCol}>
                    <Text style={styles.tableCell}>{set.reps}</Text>
                  </View>
                  <Pressable
                    style={styles.noteCell}
                    onPress={() => {
                      setEditingNote({
                        exerciseId: exercise.exercise.id,
                        setId: set.id,
                        text: set.note || "",
                      });
                    }}
                  >
                    <Ionicons
                      name={set.note ? "document-text" : "create-outline"}
                      size={16}
                      color={set.note ? "#3b82f6" : "#666"}
                    />
                  </Pressable>
                  <View style={styles.checkCellContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#10b981"
                    />
                  </View>
                </View>
              ))}

              {/* Puste wiersze dla planowanych serii */}
              {Array.from({
                length: getEmptySetsToShow(
                  exercise.exercise.id,
                  exercise.sets.length,
                ),
              }).map((_, idx) => {
                const setNumber = exercise.sets.length + idx + 1;
                const isCurrentInput = idx === 0;

                return (
                  <View
                    key={`empty-${idx}`}
                    style={[styles.tableRow, isCurrentInput && styles.inputRow]}
                  >
                    <View style={styles.setCol}>
                      <Text style={styles.tableCell}>{setNumber}</Text>
                    </View>
                    {isCurrentInput ? (
                      <>
                        <View style={styles.kgCol}>
                          <TextInput
                            style={styles.tableInputCell}
                            placeholder="0"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={
                              currentWeightInputs[exercise.exercise.id] || ""
                            }
                            onChangeText={(text) =>
                              setCurrentWeightInputs((prev) => ({
                                ...prev,
                                [exercise.exercise.id]: text,
                              }))
                            }
                          />
                        </View>
                        <View style={styles.repsCol}>
                          <TextInput
                            style={styles.tableInputCell}
                            placeholder="0"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={
                              currentRepsInputs[exercise.exercise.id] || ""
                            }
                            onChangeText={(text) =>
                              setCurrentRepsInputs((prev) => ({
                                ...prev,
                                [exercise.exercise.id]: text,
                              }))
                            }
                          />
                        </View>
                        <View style={styles.noteCol}>
                          <TextInput
                            style={styles.tableInputCell}
                            placeholder="nota"
                            placeholderTextColor="#555"
                            value={currentNotes[exercise.exercise.id] || ""}
                            onChangeText={(text) =>
                              setCurrentNotes((prev) => ({
                                ...prev,
                                [exercise.exercise.id]: text,
                              }))
                            }
                          />
                        </View>
                        <Pressable
                          style={styles.checkCellButton}
                          onPress={() => handleAddSet(exercise.exercise.id)}
                        >
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#10b981"
                          />
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <View style={styles.kgCol}>
                          <Text style={styles.emptySetPlaceholder}>-</Text>
                        </View>
                        <View style={styles.repsCol}>
                          <Text style={styles.emptySetPlaceholder}>-</Text>
                        </View>
                        <View style={styles.noteCol}>
                          <Text style={styles.emptySetPlaceholder}>-</Text>
                        </View>
                        <View style={styles.checkCellContainer}>
                          <Ionicons
                            name="ellipse-outline"
                            size={18}
                            color="#333"
                          />
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.bottomButtons}>
          <Pressable style={styles.discardButton} onPress={handleDiscard}>
            <Text style={styles.discardButtonText}>Discard Workout</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal ostrzeżenia o niekompletnym treningu */}
      <Modal
        visible={showIncompleteWarning}
        transparent
        animationType="fade"
        onRequestClose={handleContinueTraining}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={48} color="#f59e0b" />
            <Text style={styles.warningTitle}>Incomplete Workout</Text>
            <Text style={styles.warningMessage}>
              You haven't completed all planned sets:
            </Text>
            <View style={styles.incompleteList}>
              {incompleteExercisesList.map((exercise, idx) => (
                <Text key={idx} style={styles.incompleteItem}>
                  • {exercise}
                </Text>
              ))}
            </View>
            <Text style={styles.warningQuestion}>
              Are you sure you want to finish?
            </Text>
            <View style={styles.warningButtons}>
              <Pressable
                style={styles.continueButton}
                onPress={handleContinueTraining}
              >
                <Text style={styles.continueButtonText}>Continue Training</Text>
              </Pressable>
              <Pressable
                style={styles.finishAnywayButton}
                onPress={handleFinishAnyway}
              >
                <Text style={styles.finishAnywayButtonText}>Finish Anyway</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal podsumowania */}
      <Modal
        visible={showSummary}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSummary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.summaryContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.summaryTitleContainer}>
                <Ionicons name="trophy" size={28} color="#fbbf24" />
                <Text style={styles.summaryTitle}>Workout Complete!</Text>
              </View>

              {/* Statystyki */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons
                    name="time-outline"
                    size={32}
                    color="#3b82f6"
                    style={styles.statIconMargin}
                  />
                  <Text style={styles.statValue}>
                    {formatDuration(duration)}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons
                    name="barbell-outline"
                    size={32}
                    color="#3b82f6"
                    style={styles.statIconMargin}
                  />
                  <Text style={styles.statValue}>{calculateTotalSets()}</Text>
                  <Text style={styles.statLabel}>Total Sets</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons
                    name="trending-up"
                    size={32}
                    color="#3b82f6"
                    style={styles.statIconMargin}
                  />
                  <Text style={styles.statValue}>{calculateTotalVolume()}</Text>
                  <Text style={styles.statLabel}>Volume (kg)</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons
                    name="fitness"
                    size={32}
                    color="#3b82f6"
                    style={styles.statIconMargin}
                  />
                  <Text style={styles.statValue}>
                    {workout?.exercises.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Exercises</Text>
                </View>
              </View>

              {/* Osiągnięcia */}
              {getAchievements().length > 0 && (
                <View style={styles.achievementsSection}>
                  <Text style={styles.sectionTitle}>Achievements</Text>
                  <View style={styles.achievementsList}>
                    {getAchievements().map((achievement, idx) => (
                      <View key={idx} style={styles.achievementBadge}>
                        <Ionicons
                          name={achievement.icon as any}
                          size={18}
                          color="#3b82f6"
                        />
                        <Text style={styles.achievementText}>
                          {achievement.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Rekordy osobiste */}
              {getPersonalRecords().length > 0 && (
                <View style={styles.recordsSection}>
                  <View style={styles.recordsTitleContainer}>
                    <Ionicons name="flash" size={20} color="#10b981" />
                    <Text style={styles.sectionTitle}>New Records</Text>
                  </View>
                  {getPersonalRecords().map((record, idx) => (
                    <View key={idx} style={styles.recordItem}>
                      <Text style={styles.recordExercise}>
                        {record.exercise}
                      </Text>
                      <View style={styles.recordBadge}>
                        <Text style={styles.recordType}>{record.type}</Text>
                        <Text style={styles.recordValue}>{record.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Przyciski */}
              <Pressable style={styles.doneButton} onPress={confirmFinish}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal powrotu do menu */}
      <Modal
        visible={showBackWarning}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBackWarning(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={32} color="#f59e0b" />
              <Text style={styles.modalTitle}>Trening w toku</Text>
            </View>

            <Text style={styles.modalMessage}>
              Twój trening jeszcze trwa. Co chcesz zrobić?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonResume]}
                onPress={() => setShowBackWarning(false)}
              >
                <Ionicons name="barbell" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Wróć do treningu</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalButtonDiscard]}
                onPress={() => {
                  setShowBackWarning(false);
                  discardWorkout();
                  router.replace(ROUTES.HOME);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Zrezygnuj</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal edycji notatki */}
      <Modal
        visible={!!editingNote}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingNote(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.noteModalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="document-text" size={26} color="#3b82f6" />
              <Text style={styles.modalTitle}>Notatka do serii</Text>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="np. ciężko na 3 powtórzeniu, dodać pas"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={editingNote?.text || ""}
              onChangeText={(text) =>
                setEditingNote((prev) => (prev ? { ...prev, text } : prev))
              }
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDiscard]}
                onPress={() => setEditingNote(null)}
              >
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.modalButtonText}>Anuluj</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonResume]}
                onPress={saveNote}
              >
                <Ionicons name="save" size={18} color="#fff" />
                <Text style={styles.modalButtonText}>Zapisz</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#3b82f6",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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
    marginBottom: 24,
    backgroundColor: "#0a0a0a",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3b82f6",
    flex: 1,
    letterSpacing: 0.3,
  },
  exerciseMenu: {
    fontSize: 18,
    color: "#666",
    paddingHorizontal: 8,
  },
  setsCountContainer: {
    marginBottom: 10,
  },
  setsCount: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  restTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "#1a1a1a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  restTimerIcon: {
    fontSize: 14,
    color: "#3b82f6",
    marginRight: 6,
  },
  restTimer: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "600",
    flex: 1,
  },
  restEditIcon: {
    fontSize: 14,
    color: "#999",
    marginLeft: 8,
  },
  restEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },
  restInput: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: "#fff",
    fontSize: 13,
    width: 50,
    textAlign: "center",
    fontWeight: "600",
  },
  restAdjustButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  restAdjustButtonText: {
    color: "#3b82f6",
    fontSize: 11,
    fontWeight: "600",
  },
  restSaveButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  restSaveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  setsTable: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#222",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#151515",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    gap: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  setCol: {
    width: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  kgCol: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  repsCol: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  noteCol: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  checkCol: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCellContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "700",
  },
  checkCellButton: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    height: 34,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    gap: 8,
  },
  inputRow: {
    paddingVertical: 10,
    backgroundColor: "#121212",
  },
  tableCell: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  tableInputCell: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    width: "100%",
  },
  noteCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkMarkButton: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "700",
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
  bottomButtons: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
  },
  discardButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  discardButtonText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  summaryContainer: {
    backgroundColor: "#0a0a0a",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  noteModalContainer: {
    backgroundColor: "#111",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 14,
  },
  noteInput: {
    backgroundColor: "#0c0c0c",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    color: "#fff",
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  summaryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  statIconMargin: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
  recordsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  achievementBadge: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  achievementText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  recordsSection: {
    marginBottom: 24,
  },
  recordItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  recordExercise: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  recordBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  recordValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  doneButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  emptySetPlaceholder: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  warningContainer: {
    backgroundColor: "#0a0a0a",
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: "#f59e0b",
    alignItems: "center",
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginTop: 16,
    marginBottom: 12,
  },
  warningMessage: {
    fontSize: 15,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 16,
  },
  incompleteList: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  incompleteItem: {
    fontSize: 14,
    color: "#f59e0b",
    marginBottom: 8,
    fontWeight: "500",
  },
  warningQuestion: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  warningButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  finishAnywayButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  finishAnywayButtonText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
});
