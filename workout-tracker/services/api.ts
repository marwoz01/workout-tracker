/**
 * API Service - Połączenie z backendem (Spring Boot)
 * Zajmuje się pobieraniem i wysyłaniem danych do serwera
 */

const API_BASE_URL = "http://localhost:8080/api";

// Typ: Ćwiczenie (np. wyciskanie, przysiady)
export type Exercise = {
  id: number;
  name: string;
  muscleGroup: string;
  isCustom: boolean;
};

// Typ: Plan treningowy (zawiera dni i ćwiczenia)
export type WorkoutPlan = {
  id: number;
  name: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationWeeks: number;
  createdByUserId: number;
  days: WorkoutDay[];
};

// Typ: Dzień treningowy (np. "Poniedziałek - klatka")
export type WorkoutDay = {
  id: number;
  name: string;
  orderIndex: number;
  exercises: ExerciseInDay[];
};

// Typ: Ćwiczenie w dniu treningowym
export type ExerciseInDay = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  orderIndex: number;
};

// Typ: Sesja treningowa (aktualny trening w trakcie)
export type WorkoutSession = {
  id: number;
  date: string;
  workoutPlanId: number | null;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  finishedAt: string | null;
};

export type WorkoutSet = {
  date: string;
  exerciseId: number;
  exerciseName: string;
  reps: number;
  weight: number;
  rpe: number;
};

export type AddSetRequest = {
  exerciseId: number;
  reps: number;
  weight: number;
  rpe: number;
};

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  role: "USER" | "TRAINER";
  activePlanId: number | null;
};

// API Client
// Klasa obsługująca wszystkie requesty do API
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Exercises
  // Pobiera listę wszystkich ćwiczeń
  async getExercises(): Promise<Exercise[]> {
    return this.request<Exercise[]>("/exercises");
  }

  async getCustomExercises(userId: number): Promise<Exercise[]> {
    return this.request<Exercise[]>(`/exercises/custom/${userId}`);
  }

  // Workout Plans
  // Pobiera wszystkie dostępne plany treningowe
  async getAllPlans(): Promise<WorkoutPlan[]> {
    return this.request<WorkoutPlan[]>("/plans");
  }

  async assignPlan(planId: number): Promise<void> {
    return this.request<void>(`/plans/${planId}/assign`, {
      method: "POST",
    });
  }

  // Training Sessions
  async startSession(): Promise<{ sessionId: number }> {
    return this.request<{ sessionId: number }>("/training/sessions/start", {
      method: "POST",
    });
  }

  async addSet(sessionId: number, data: AddSetRequest): Promise<void> {
    return this.request<void>(`/training/sessions/${sessionId}/sets`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async finishSession(sessionId: number): Promise<void> {
    return this.request<void>(`/training/sessions/${sessionId}/finish`, {
      method: "POST",
    });
  }

  async getHistory(): Promise<WorkoutSession[]> {
    return this.request<WorkoutSession[]>("/training/history");
  }

  async getProgress(exerciseId: number): Promise<WorkoutSet[]> {
    return this.request<WorkoutSet[]>(`/training/progress/${exerciseId}`);
  }

  // User
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("/user/me");
  }
}

export const api = new ApiClient(API_BASE_URL);
