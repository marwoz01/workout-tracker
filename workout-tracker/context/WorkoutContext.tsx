import React, { createContext, useContext, useState } from "react";
import type {
  Set,
  Workout,
  WorkoutExercise,
  Routine,
  Exercise,
} from "@/types/models";

type WorkoutContextType = {
  workout: Workout | null;
  routines: Routine[];
  selectedExercise: Exercise | null;
  startWorkout: () => void;
  addExercise: (exercise: WorkoutExercise) => void;
  addSet: (exerciseId: string, set: Omit<Set, "id">) => void;
  finishWorkout: () => void;
  addRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;
  startWorkoutFromRoutine: (routineId: string) => void;
  selectExercise: (exercise: Exercise) => void;
  clearSelectedExercise: () => void;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const startWorkout = () => {
    setWorkout({
      id: Date.now().toString(),
      exercises: [],
    });
  };

  const addExercise = (exercise: WorkoutExercise) => {
    setWorkout((prev) => {
      if (!prev) return prev;

      const exists = prev.exercises.some(
        (we) => we.exercise.id === exercise.exercise.id
      );
      if (exists) return prev;

      return {
        ...prev,
        exercises: [...prev.exercises, exercise],
      };
    });
  };

  const addSet = (exerciseId: string, setData: Omit<Set, "id">) => {
    setWorkout((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        exercises: prev.exercises.map((we) =>
          we.exercise.id === exerciseId
            ? {
                ...we,
                sets: [
                  ...we.sets,
                  {
                    id: crypto.randomUUID(),
                    ...setData,
                  },
                ],
              }
            : we
        ),
      };
    });
  };

  const finishWorkout = () => {
    console.log("Workout finished:", workout);
    setWorkout(null);
  };

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
  };

  const deleteRoutine = (routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  };

  const startWorkoutFromRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    setWorkout({
      id: Date.now().toString(),
      exercises: routine.exercises.map((re) => ({
        exercise: re.exercise,
        sets: [],
      })),
    });
  };

  const selectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const clearSelectedExercise = () => {
    setSelectedExercise(null);
  };

  return (
    <WorkoutContext.Provider
      value={{
        workout,
        routines,
        selectedExercise,
        startWorkout,
        addExercise,
        addSet,
        finishWorkout,
        addRoutine,
        deleteRoutine,
        startWorkoutFromRoutine,
        selectExercise,
        clearSelectedExercise,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error("useWorkout must be used within WorkoutProvider");
  }
  return ctx;
}
