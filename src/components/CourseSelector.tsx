
import React from 'react';
import { useLessons, Course } from '@/context/LessonContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const CourseSelector = () => {
  const { courses, currentCourse, setCurrentCourse, setCurrentLesson } = useLessons();

  const handleSelectCourse = (course: Course) => {
    setCurrentCourse(course);
    setCurrentLesson(null); // Reset current lesson when changing course
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Card 
          key={course.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            currentCourse?.id === course.id ? 'border-purple-500 border-2' : ''
          }`}
          onClick={() => handleSelectCourse(course)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              {course.title}
            </CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{course.lessons.length} lessons</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-slate-500">Click to start learning</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CourseSelector;
