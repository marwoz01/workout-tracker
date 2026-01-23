import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import React from "react";

export default function ProfileScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const stats = [
    { label: "Treningi", value: "42", icon: "barbell", color: "#3b82f6" },
    { label: "Łącznie kg", value: "12,450", icon: "fitness", color: "#10b981" },
    { label: "Czas", value: "28h", icon: "time", color: "#f59e0b" },
    { label: "Seria", value: "7 dni", icon: "flame", color: "#ef4444" },
  ];

  const achievements = [
    {
      title: "Pierwszy trening",
      icon: "trophy",
      color: "#f59e0b",
      date: "1 sty 2026",
    },
    {
      title: "Tydzień z rzędu",
      icon: "flame",
      color: "#ef4444",
      date: "15 sty 2026",
    },
    { title: "100 serii", icon: "star", color: "#3b82f6", date: "20 sty 2026" },
  ];

  const personalRecords = [
    { exercise: "Wyciskanie sztangi", weight: "100 kg", date: "22 sty 2026" },
    { exercise: "Przysiad", weight: "120 kg", date: "20 sty 2026" },
    { exercise: "Martwy ciąg", weight: "140 kg", date: "18 sty 2026" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header z awatarem */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
              <Pressable style={styles.editButton}>
                <Ionicons name="create-outline" size={16} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.userName}>Marwo</Text>
            <Text style={styles.userBio}>💪 Lifting enthusiast</Text>
          </View>

          {/* Statystyki */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Twoje statystyki</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: stat.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={stat.icon as any}
                      size={24}
                      color={stat.color}
                    />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Osiągnięcia */}
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Osiągnięcia</Text>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
            </View>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={24}
                    color={achievement.color}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Rekordy osobiste */}
          <View style={styles.recordsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rekordy osobiste</Text>
              <Ionicons name="flash" size={20} color="#10b981" />
            </View>
            {personalRecords.map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordExercise}>{record.exercise}</Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                </View>
                <View style={styles.recordBadge}>
                  <Ionicons name="trophy" size={16} color="#10b981" />
                  <Text style={styles.recordWeight}>{record.weight}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Ustawienia */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Ustawienia</Text>
            <Pressable style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={22} color="#888" />
                <Text style={styles.settingText}>Powiadomienia</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>
            <Pressable style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="stats-chart-outline" size={22} color="#888" />
                <Text style={styles.settingText}>Jednostki</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>
            <Pressable style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={22} color="#888" />
                <Text style={styles.settingText}>Tryb ciemny</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </Pressable>
          </View>
        </Animated.View>
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
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1e40af",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10b981",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: "#888",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  achievementsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: "#888",
  },
  recordsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  recordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  recordInfo: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: "#888",
  },
  recordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98120",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  recordWeight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    color: "#fff",
  },
});
