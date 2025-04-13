import React, { createContext, useContext, useState } from 'react';

// Define course and lesson types
export interface Lesson {
  id: string;
  text: string;
  language: 'en-US' | 'ar-SA';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  translation?: string; // Optional English translation for Arabic lessons
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

// Sample Arabic courses
const arabicCourses: Course[] = [
  {
    id: 'course-alphabet',
    title: 'Arabic Alphabets',
    description: 'Learn the Arabic alphabet with sample words',
    lessons: [
      {
        id: 'alphabet-1',
        text: 'أ - أسد',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Alif - Lion',
      },
      {
        id: 'alphabet-2',
        text: 'ب - باب',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Ba - Door',
      },
      {
        id: 'alphabet-3',
        text: 'ت - تفاح',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Ta - Apple',
      },
      {
        id: 'alphabet-4',
        text: 'ث - ثعلب',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Tha - Fox',
      },
      {
        id: 'alphabet-5',
        text: 'ج - جمل',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Jim - Camel',
      },
    ],
  },
  {
    id: 'course-phrases',
    title: 'Common Phrases',
    description: 'Learn common Arabic phrases for everyday conversation',
    lessons: [
      {
        id: 'phrase-1',
        text: 'كيف حالك؟',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'How are you?',
      },
      {
        id: 'phrase-2',
        text: 'ما اسمك؟',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'What is your name?',
      },
      {
        id: 'phrase-3',
        text: 'أنا بخير، شكراً',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'I am fine, thank you',
      },
      {
        id: 'phrase-4',
        text: 'مع السلامة',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Goodbye',
      },
      {
        id: 'phrase-5',
        text: 'صباح الخير',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Good morning',
      },
    ],
  },
  {
    id: 'course-words',
    title: 'Common Words',
    description: 'Learn common Arabic words in pairs',
    lessons: [
      {
        id: 'word-1',
        text: 'قطة وكلب',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Cat and dog',
      },
      {
        id: 'word-2',
        text: 'بيت كبير',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Big house',
      },
      {
        id: 'word-3',
        text: 'طاولة صغيرة',
        language: 'ar-SA',
        difficulty: 'beginner',
        translation: 'Small table',
      },
      {
        id: 'word-4',
        text: 'كتاب أزرق',
        language: 'ar-SA',
        difficulty: 'intermediate',
        translation: 'Blue book',
      },
      {
        id: 'word-5',
        text: 'شمس وقمر',
        language: 'ar-SA',
        difficulty: 'intermediate',
        translation: 'Sun and moon',
      },
    ],
  },
];

// Sample Arabic lessons (keeping these for backward compatibility)
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

// Sample English lessons (keeping these for backward compatibility)
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

// Combine all lessons for backward compatibility
const allLessons = [...arabicLessons, ...englishLessons];

// Context type
interface LessonContextType {
  courses: Course[];
  lessons: Lesson[]; // Keep for backward compatibility
  filteredLessons: Lesson[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  displayMode: 'courses' | 'lessons';
  setDisplayMode: (mode: 'courses' | 'lessons') => void;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  filterLessons: (language: string, difficulty?: string) => void;
  getLessonsByCourseId: (courseId: string) => Lesson[];
}

// Create context
const LessonContext = createContext<LessonContextType | undefined>(undefined);

// Provider component
export const LessonProvider = ({ children }: { children: React.ReactNode }) => {
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>(allLessons);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [displayMode, setDisplayMode] = useState<'courses' | 'lessons'>('courses');

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

  // Get lessons by course ID
  const getLessonsByCourseId = (courseId: string): Lesson[] => {
    const course = arabicCourses.find(c => c.id === courseId);
    return course ? course.lessons : [];
  };

  return (
    <LessonContext.Provider
      value={{
        courses: arabicCourses,
        lessons: allLessons, // Keep for backward compatibility
        filteredLessons,
        currentCourse,
        currentLesson,
        displayMode,
        setDisplayMode,
        setCurrentCourse,
        setCurrentLesson,
        filterLessons,
        getLessonsByCourseId,
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
