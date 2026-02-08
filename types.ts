
export enum Mood {
  GREAT = 'Great',
  GOOD = 'Good',
  OKAY = 'Okay',
  SAD = 'Sad',
  AWFUL = 'Awful'
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: Mood;
  content: string;
  isImportant: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: 'Work' | 'Personal' | 'Study' | 'Health';
  priority: 'Low' | 'Medium' | 'High';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // ISO Strings (YYYY-MM-DD)
  streak: number;
  targetPerWeek: number;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Career' | 'Personal' | 'Health' | 'Finance';
  progress: number; // 0-100
  targetDate: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export type AppState = {
  diary: DiaryEntry[];
  tasks: Task[];
  transactions: Transaction[];
  habits: Habit[];
  goals: Goal[];
  notes: Note[];
  memories: Memory[];
}
