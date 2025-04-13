import React, { useState, useEffect, useRef } from 'react';
import { useLessons, Lesson } from '@/context/LessonContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MicOff, Volume2, BookOpen, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
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
    getLessonsByCourseId,
    displayMode,
    setDisplayMode,
    matchSpeechWithOpenRouter
  } = useLessons();
  
  const [userSpeech, setUserSpeech] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechResult, setSpeechResult] = useState<'correct' | 'incorrect' | null>(null);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const courseLessons = currentCourse ? currentCourse.lessons : [];
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (displayMode === 'lessons' && !currentCourse) {
      filterLessons('ar-SA', difficulty);
    }
    
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [difficulty, displayMode, currentCourse, filterLessons]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        
        try {
          // Use OpenRouter for speech recognition
          const transcription = await matchSpeechWithOpenRouter(audioBlob);
          setUserSpeech(transcription);
          if (currentLesson) {
            checkSpeechMatch(transcription, currentLesson.text);
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
          toast.error('Speech recognition failed. Please try again.');
        } finally {
          setIsProcessing(false);
        }
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      setUserSpeech('');
      setSpeechResult(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const speakLesson = () => {
    if (!currentLesson) {
      toast.error('Please select a lesson first');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentLesson.text);
      utterance.lang = 'ar-SA';
      
      const voices = window.speechSynthesis.getVoices();
      
      const arabicVoice = voices.find(voice => 
        voice.lang.startsWith('ar')
      );
      
      if (arabicVoice) {
        console.log('Found Arabic voice:', arabicVoice.name);
        utterance.voice = arabicVoice;
      } else {
        console.log('No Arabic voice found. Using default voice.');
      }
      
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

  const checkSpeechMatch = (speech: string, lessonText: string) => {
    const normalizedSpeech = speech.trim().toLowerCase();
    const normalizedLesson = lessonText.trim().toLowerCase();
    
    const isMatch = normalizedSpeech === normalizedLesson;
    
    const similarity = calculateStringSimilarity(normalizedSpeech, normalizedLesson);
    const isClose = similarity > 0.7;
    
    if (isMatch || isClose) {
      setSpeechResult('correct');
      toast.success('Excellent! Your pronunciation is correct.');
    } else if (normalizedSpeech.length > normalizedLesson.length / 2) {
      setSpeechResult('incorrect');
    }
  };

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0 || len2 === 0) {
      return 0;
    }
    
    const matrix: number[][] = [];
    
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as 'beginner' | 'intermediate' | 'advanced');
    setUserSpeech('');
    setSpeechResult(null);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setUserSpeech('');
    setSpeechResult(null);
    if (isListening) {
      toggleListening();
    }
  };

  const handleBackToCourses = () => {
    setDisplayMode('courses');
    setCurrentLesson(null);
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Arabic Lessons</CardTitle>
        </CardHeader>
        
        <CardContent>
          {displayMode === 'courses' ? (
            <CourseSelector />
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
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : isListening ? (
                            <MicOff className="h-4 w-4 mr-2" />
                          ) : (
                            <Mic className="h-4 w-4 mr-2" />
                          )}
                          {isProcessing ? 'Processing...' : isListening ? 'Stop' : 'Practice Speaking'}
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
