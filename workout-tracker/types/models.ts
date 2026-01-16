export type Exercise = {
  id: string;
  name: string;
};

export type Set = {
  id: string;
  weight: number;
  reps: number;
  rest: number;
};

export type WorkoutExercise = {
  exercise: Exercise;
  sets: Set[];
};

export type Workout = {
  id: string;
  exercises: WorkoutExercise[];
};

export type RoutineSet = {
  id: string;
  weight: number;
  reps: number;
};

export type RoutineExercise = {
  id: string;
  exercise: Exercise;
  sets: RoutineSet[];
};

export type Routine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
};
