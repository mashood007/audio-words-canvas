
import React, { createContext, useContext, useState } from 'react';

// Define lesson types
export interface Lesson {
  id: string;
  text: string;
  language: 'en-US' | 'ar-SA';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Sample Arabic lessons
const arabicLessons: Lesson[] = [
  {
    id: 'ar-1',
    text: 'مرحبا بكم في درس اللغة العربية',
    language: 'ar-SA',
    difficulty: 'beginner',
  },
  {
    id: 'ar-2',
    text: 'اللغة العربية هي إحدى أكثر اللغات انتشارًا في العالم',
    language: 'ar-SA',
    difficulty: 'beginner',
  },
  {
    id: 'ar-3',
    text: 'يتحدث باللغة العربية أكثر من أربعمائة مليون شخص',
    language: 'ar-SA',
    difficulty: 'intermediate',
  },
  {
    id: 'ar-4',
    text: 'العربية هي لغة القرآن الكريم ولها أهمية دينية وثقافية كبيرة',
    language: 'ar-SA',
    difficulty: 'intermediate',
  },
  {
    id: 'ar-5',
    text: 'تتميز اللغة العربية بقواعدها النحوية المعقدة وثراء مفرداتها وتنوع أساليبها البلاغية',
    language: 'ar-SA',
    difficulty: 'advanced',
  },
];

// Sample English lessons for completeness
const englishLessons: Lesson[] = [
  {
    id: 'en-1',
    text: 'Welcome to the Arabic language learning program',
    language: 'en-US',
    difficulty: 'beginner',
  },
  {
    id: 'en-2',
    text: 'Arabic is one of the most widely spoken languages in the world',
    language: 'en-US',
    difficulty: 'beginner',
  },
];

// Combine all lessons
const allLessons = [...arabicLessons, ...englishLessons];

// Context type
interface LessonContextType {
  lessons: Lesson[];
  filteredLessons: Lesson[];
  currentLesson: Lesson | null;
  setCurrentLesson: (lesson: Lesson | null) => void;
  filterLessons: (language: string, difficulty?: string) => void;
}

// Create context
const LessonContext = createContext<LessonContextType | undefined>(undefined);

// Provider component
export const LessonProvider = ({ children }: { children: React.ReactNode }) => {
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>(allLessons);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // Filter lessons by language and difficulty
  const filterLessons = (language: string, difficulty?: string) => {
    const filtered = allLessons.filter(
      (lesson) => 
        lesson.language === language && 
        (!difficulty || lesson.difficulty === difficulty)
    );
    setFilteredLessons(filtered);
    // Reset current lesson when filter changes
    setCurrentLesson(null);
  };

  return (
    <LessonContext.Provider
      value={{
        lessons: allLessons,
        filteredLessons,
        currentLesson,
        setCurrentLesson,
        filterLessons,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
};

// Custom hook to use the lesson context
export const useLessons = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessons must be used within a LessonProvider');
  }
  return context;
};
