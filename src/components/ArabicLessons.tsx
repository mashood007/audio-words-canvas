
import React, { useState, useEffect } from 'react';
import { useLessons, Lesson } from '@/context/LessonContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MicOff, Volume2, BookOpen, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CourseSelector from './CourseSelector';

const ArabicLessons = () => {
  const { 
    filteredLessons, 
    currentLesson, 
    setCurrentLesson, 
    filterLessons, 
    currentCourse, 
    setCurrentCourse,
    getLessonsByCourseId
  } = useLessons();
  
  const [userSpeech, setUserSpeech] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechResult, setSpeechResult] = useState<'correct' | 'incorrect' | null>(null);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [displayMode, setDisplayMode] = useState<'courses' | 'lessons'>('courses');
  
  // Current lessons based on selected course
  const courseLessons = currentCourse ? currentCourse.lessons : [];

  // Initialize speech recognition
  useEffect(() => {
    if (displayMode === 'lessons' && !currentCourse) {
      // If in lessons mode but no course selected, filter by difficulty (legacy behavior)
      filterLessons('ar-SA', difficulty);
    }

    // Check if the browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ar-SA';
      
      recognitionInstance.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setUserSpeech(currentTranscript);
        
        // Auto-check if the speech matches the lesson text
        if (currentLesson && currentTranscript.trim().length > 0) {
          checkSpeechMatch(currentTranscript, currentLesson.text);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };
      
      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      toast.error('Speech recognition is not supported in your browser');
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [difficulty, displayMode, currentCourse]);

  // Toggle listening state
  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        // Clear previous speech before starting new recording
        setUserSpeech('');
        setSpeechResult(null);
        recognition.lang = 'ar-SA';
        recognition.start();
        setIsListening(true);
      }
    }
  };

  // Speak the lesson text
  const speakLesson = () => {
    if (!currentLesson) {
      toast.error('Please select a lesson first');
      return;
    }

    // Check browser support for speech synthesis
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentLesson.text);
      utterance.lang = 'ar-SA';
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a voice that matches Arabic
      const arabicVoice = voices.find(voice => 
        voice.lang.startsWith('ar')
      );
      
      if (arabicVoice) {
        console.log('Found Arabic voice:', arabicVoice.name);
        utterance.voice = arabicVoice;
      } else {
        console.log('No Arabic voice found. Using default voice.');
      }
      
      // Set up utterance events
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        toast.error('Speech synthesis failed. Please try again.');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Speech synthesis is not supported in your browser');
    }
  };

  // Check if the user's speech matches the lesson text
  const checkSpeechMatch = (speech: string, lessonText: string) => {
    // Normalize both strings (remove diacritics, standardize whitespace, etc.)
    const normalizedSpeech = speech.trim().toLowerCase();
    const normalizedLesson = lessonText.trim().toLowerCase();
    
    // Simple exact match check
    const isMatch = normalizedSpeech === normalizedLesson;
    
    // Alternative: calculate similarity for a more forgiving match
    const similarity = calculateStringSimilarity(normalizedSpeech, normalizedLesson);
    const isClose = similarity > 0.7; // 70% similarity threshold
    
    if (isMatch || isClose) {
      setSpeechResult('correct');
      toast.success('Excellent! Your pronunciation is correct.');
    } else if (normalizedSpeech.length > normalizedLesson.length / 2) {
      // Only set as incorrect if they've spoken enough to make a reasonable comparison
      setSpeechResult('incorrect');
    }
  };

  // Calculate string similarity (Levenshtein distance based)
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // If either string is empty, similarity is 0
    if (len1 === 0 || len2 === 0) {
      return 0;
    }
    
    // Create matrix to store distances
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Calculate Levenshtein distance
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    // Calculate similarity ratio
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
  };

  // Handle difficulty change
  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as 'beginner' | 'intermediate' | 'advanced');
    // Reset speech results
    setUserSpeech('');
    setSpeechResult(null);
  };

  // Select a lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setUserSpeech('');
    setSpeechResult(null);
    if (isListening) {
      toggleListening(); // Stop listening when selecting a new lesson
    }
  };

  // Back to courses view
  const handleBackToCourses = () => {
    setDisplayMode('courses');
    setCurrentLesson(null);
  };

  // Handle course selection
  const handleViewCourseLessons = () => {
    if (currentCourse) {
      setDisplayMode('lessons');
    } else {
      toast.error('Please select a course first');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Arabic Lessons</CardTitle>
        </CardHeader>
        
        <CardContent>
          {displayMode === 'courses' ? (
            <>
              <CourseSelector />
              <div className="flex justify-center mt-6">
                <Button onClick={handleViewCourseLessons}>
                  View Course Lessons
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <Button variant="outline" size="sm" onClick={handleBackToCourses} className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
                </Button>
                {currentCourse && (
                  <h3 className="text-lg font-medium">{currentCourse.title}</h3>
                )}
              </div>
              
              {!currentCourse && (
                <Tabs value={difficulty} onValueChange={handleDifficultyChange} className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {(currentCourse ? courseLessons : filteredLessons).map((lesson) => (
                    <Button
                      key={lesson.id}
                      variant={currentLesson?.id === lesson.id ? "default" : "outline"}
                      className={cn(
                        "justify-start text-right px-4 py-6 h-auto",
                        currentLesson?.id === lesson.id ? "bg-purple-600" : ""
                      )}
                      onClick={() => handleSelectLesson(lesson)}
                    >
                      <div className="flex items-center w-full">
                        <BookOpen className="mr-2 h-5 w-5" />
                        <span className="flex-1 text-right">{lesson.text}</span>
                        {lesson.translation && (
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                            {lesson.translation}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
                
                {(currentCourse ? courseLessons.length === 0 : filteredLessons.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available for the selected difficulty.
                  </div>
                )}
                
                {currentLesson && (
                  <div className="mt-6">
                    <Card className="bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md font-medium">Current Lesson</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg text-right leading-relaxed" dir="rtl">{currentLesson.text}</p>
                        {currentLesson.translation && (
                          <p className="text-sm text-gray-600 mt-2">{currentLesson.translation}</p>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "transition-all",
                            isSpeaking ? "bg-green-100 text-green-700" : ""
                          )}
                          onClick={speakLesson}
                        >
                          <Volume2 className="mr-2 h-4 w-4" />
                          {isSpeaking ? 'Speaking...' : 'Listen'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "transition-all",
                            isListening ? "bg-red-100 text-red-700 animate-pulse" : ""
                          )}
                          onClick={toggleListening}
                        >
                          {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                          {isListening ? 'Stop' : 'Practice Speaking'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
                
                {userSpeech && (
                  <div className="mt-4">
                    <Card className={cn(
                      "bg-slate-50",
                      speechResult === 'correct' ? "border-green-300" : 
                      speechResult === 'incorrect' ? "border-red-300" : ""
                    )}>
                      <CardHeader className="pb-2 flex flex-row justify-between items-center">
                        <CardTitle className="text-md font-medium">Your Speech</CardTitle>
                        {speechResult === 'correct' && (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        )}
                        {speechResult === 'incorrect' && (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg text-right leading-relaxed" dir="rtl">{userSpeech}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArabicLessons;
