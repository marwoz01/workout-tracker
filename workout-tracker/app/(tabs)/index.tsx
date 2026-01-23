import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Animated,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useWorkout } from "@/context/WorkoutContext";
import { ROUTES } from "@/constants/routes";
import React, { useRef, useState } from "react";

export default function HomeScreen() {
  const {
    routines,
    startWorkoutFromRoutine,
    deleteRoutine,
    workout,
    discardWorkout,
  } = useWorkout();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Success starts with self-discipline.",
    "The pain you feel today will be the strength you feel tomorrow.",
  ];

  const todayQuote =
    motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  const [weeklyPlan, setWeeklyPlan] = useState([
    { label: "Mon", done: true },
    { label: "Tue", done: true },
    { label: "Wed", done: true },
    { label: "Thu", done: false },
    { label: "Fri", done: false },
    { label: "Sat", done: false },
    { label: "Sun", done: false },
  ]);
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const weeklyDone = weeklyPlan.filter((d) => d.done).length;
  const weeklyRatio = weeklyGoal > 0 ? Math.min(1, weeklyDone / weeklyGoal) : 0;
  const togglePlanDay = (label: string) => {
    setWeeklyPlan((prev) =>
      prev.map((d) => (d.label === label ? { ...d, done: !d.done } : d)),
    );
  };
  const adjustWeeklyGoal = (delta: number) => {
    setWeeklyGoal((prev) => Math.min(7, Math.max(1, prev + delta)));
  };

  const nextRoutine = routines[0];
  const nextRoutineName = nextRoutine ? nextRoutine.name : "Brak planu";

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text style={styles.title}>Lifty</Text>

          {/* Cytat dnia */}
          <View style={styles.quoteCard}>
            <Ionicons name="chatbox-ellipses" size={20} color="#3b82f6" />
            <Text style={styles.quoteText}>{todayQuote}</Text>
          </View>

          {/* Szybkie statystyki */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Ionicons name="flame" size={18} color="#ef4444" />
              <Text style={styles.quickStatValue}>7</Text>
              <Text style={styles.quickStatLabel}>dni z rzędu</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Ionicons name="barbell" size={18} color="#3b82f6" />
              <Text style={styles.quickStatValue}>12</Text>
              <Text style={styles.quickStatLabel}>treningów</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Ionicons name="trophy" size={18} color="#f59e0b" />
              <Text style={styles.quickStatValue}>3</Text>
              <Text style={styles.quickStatLabel}>rekordy</Text>
            </View>
          </View>

          {/* Widżet postępu */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Postęp tygodnia</Text>
                <Text style={styles.progressSubtitle}>
                  Cel: {weeklyGoal} treningi · Zrobione: {weeklyDone}
                </Text>
              </View>
              <View style={styles.progressHeaderRight}>
                <Text style={styles.progressPercent}>
                  {Math.round(weeklyRatio * 100)}%
                </Text>
                <Pressable
                  style={styles.editPlanButton}
                  onPress={() => setShowPlanModal(true)}
                >
                  <Ionicons name="settings-outline" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${weeklyRatio * 100}%` },
                ]}
              />
            </View>

            <View style={styles.weekRow}>
              {weeklyPlan.map((day) => (
                <View key={day.label} style={styles.weekDay}>
                  <View
                    style={[
                      styles.dayDot,
                      day.done ? styles.dayDotDone : styles.dayDotEmpty,
                    ]}
                  />
                  <Text style={styles.dayLabel}>{day.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.nextBox}>
              <View>
                <Text style={styles.nextLabel}>Następny trening</Text>
                <Text style={styles.nextValue}>{nextRoutineName}</Text>
              </View>
              <Pressable
                style={styles.nextButton}
                onPress={() => {
                  if (nextRoutine) {
                    startWorkoutFromRoutine(nextRoutine.id);
                    router.push({ pathname: ROUTES.WORKOUT as any });
                  } else {
                    router.push({ pathname: ROUTES.NEW_ROUTINE as any });
                  }
                }}
              >
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.nextButtonText}>
                  {nextRoutine ? "Start" : "Utwórz plan"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Modal konfiguracji planu tygodnia */}
          <Modal
            visible={showPlanModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPlanModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.planModalContainer}>
                <View style={styles.planModalHeader}>
                  <Text style={styles.planModalTitle}>Plan tygodniowy</Text>
                  <Pressable onPress={() => setShowPlanModal(false)}>
                    <Ionicons name="close" size={20} color="#888" />
                  </Pressable>
                </View>

                <Text style={styles.planHint}>
                  Wybierz dni, w które chcesz trenować i ustaw cel tygodniowy.
                </Text>

                <View style={styles.planDaysGrid}>
                  {weeklyPlan.map((day) => (
                    <Pressable
                      key={day.label}
                      style={[styles.planDay, day.done && styles.planDayActive]}
                      onPress={() => togglePlanDay(day.label)}
                    >
                      <Text
                        style={
                          day.done
                            ? styles.planDayLabelActive
                            : styles.planDayLabel
                        }
                      >
                        {day.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.goalRow}>
                  <Text style={styles.goalLabel}>Cel tygodniowy</Text>
                  <View style={styles.goalControls}>
                    <Pressable
                      style={styles.goalButton}
                      onPress={() => adjustWeeklyGoal(-1)}
                    >
                      <Ionicons name="remove" size={18} color="#fff" />
                    </Pressable>
                    <Text style={styles.goalValue}>{weeklyGoal}</Text>
                    <Pressable
                      style={styles.goalButton}
                      onPress={() => adjustWeeklyGoal(1)}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.planSummaryRow}>
                  <Ionicons name="stats-chart" size={18} color="#10b981" />
                  <Text style={styles.planSummaryText}>
                    Wybrane dni: {weeklyDone}/7 · Cel: {weeklyGoal}
                  </Text>
                </View>

                <Pressable
                  style={styles.savePlanButton}
                  onPress={() => setShowPlanModal(false)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.savePlanText}>Zapisz</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Szybki start */}
          <Pressable
            style={styles.quickStartButton}
            onPress={() => {
              router.push({ pathname: ROUTES.WORKOUT as any });
            }}
          >
            <Ionicons name="flash" size={24} color="#fff" />
            <Text style={styles.quickStartText}>Szybki start</Text>
          </Pressable>

          <Pressable
            style={styles.newRoutineButton}
            onPress={() => router.push({ pathname: ROUTES.NEW_ROUTINE as any })}
          >
            <Text style={styles.newRoutineButtonText}>+ New Routine</Text>
          </Pressable>

          {workout && (
            <View style={styles.activeWorkoutBanner}>
              <View style={styles.bannerContent}>
                <Ionicons name="barbell" size={24} color="#10b981" />
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Trening w toku</Text>
                  <Text style={styles.bannerSubtitle}>
                    {workout.exercises.length} ćwiczeń
                  </Text>
                </View>
              </View>
              <View style={styles.bannerButtons}>
                <Pressable
                  style={styles.continueButton}
                  onPress={() =>
                    router.push({ pathname: ROUTES.WORKOUT as any })
                  }
                >
                  <Ionicons name="play" size={16} color="#fff" />
                  <Text style={styles.continueButtonText}>Kontynuuj</Text>
                </Pressable>
                <Pressable
                  style={styles.discardButton}
                  onPress={() => discardWorkout()}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.routinesSection}>
            <Text style={styles.sectionTitle}>
              My Routines ({routines.length})
            </Text>

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
        </Animated.View>
      </ScrollView>
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
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 24,
    color: "#fff",
    letterSpacing: 0.5,
  },
  quoteCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    color: "#aaa",
    fontStyle: "italic",
    lineHeight: 20,
  },
  quickStats: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  quickStatItem: {
    alignItems: "center",
    gap: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#888",
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#2a2a2a",
  },
  progressCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 14,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  progressSubtitle: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  progressPercent: {
    color: "#10b981",
    fontSize: 18,
    fontWeight: "800",
  },
  editPlanButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2f3b52",
  },
  progressBarBg: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#10b981",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekDay: {
    alignItems: "center",
    gap: 4,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dayDotDone: {
    backgroundColor: "#10b981",
  },
  dayDotEmpty: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  dayLabel: {
    color: "#888",
    fontSize: 11,
  },
  nextBox: {
    marginTop: 8,
    backgroundColor: "#0b1220",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e3a8a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  nextLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },
  nextValue: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  planModalContainer: {
    backgroundColor: "#0d0d0d",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 14,
  },
  planModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planModalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  planHint: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
  },
  planDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  planDay: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#0f172a",
  },
  planDayActive: {
    backgroundColor: "#0b3b2d",
    borderColor: "#10b981",
  },
  planDayLabel: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 13,
  },
  planDayLabelActive: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 13,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalLabel: {
    color: "#e5e7eb",
    fontWeight: "700",
    fontSize: 14,
  },
  goalControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  goalValue: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    minWidth: 24,
    textAlign: "center",
  },
  planSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0b1220",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e3a8a",
  },
  planSummaryText: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  savePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  savePlanText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  quickStartButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  quickStartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  newRoutineButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
  activeWorkoutBanner: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#888",
  },
  bannerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  discardButton: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
});
