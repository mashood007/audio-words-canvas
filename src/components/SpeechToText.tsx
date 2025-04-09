
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Copy, Check, Globe, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define language options
const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'ar-SA', name: 'Arabic' }
];

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Check if the browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;
      
      recognitionInstance.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
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
  }, [language]);

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        setTranscript('');
        recognition.lang = language;
        recognition.start();
        setIsListening(true);
      }
    }
  };

  const copyToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      toast.success('Text copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleLanguageChange = (value: string) => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    }
    
    // Stop speaking if currently speaking
    if (isSpeaking) {
      stopSpeech();
    }
    
    setLanguage(value);
    setTranscript('');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  const speakText = () => {
    if (!transcript) {
      toast.error('Please enter or record some text first');
      return;
    }

    // Check browser support for speech synthesis
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      stopSpeech();
      
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.lang = language;
      
      // For debugging
      console.log('Speaking text:', transcript);
      console.log('Using language:', language);
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a voice that matches our language
      const voiceForLanguage = voices.find(voice => 
        voice.lang.startsWith(language.split('-')[0])
      );
      
      if (voiceForLanguage) {
        console.log('Found matching voice:', voiceForLanguage.name);
        utterance.voice = voiceForLanguage;
      } else {
        console.log('No matching voice found. Using default voice.');
      }
      
      // Set up utterance events
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Speech ended');
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

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Speech to Text</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center mb-2">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "w-20 h-20 rounded-full transition-all duration-300",
                  isListening ? "bg-red-100 text-red-500 border-red-300 animate-pulse" : "bg-purple-100 text-purple-500 border-purple-300"
                )}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "w-20 h-20 rounded-full transition-all duration-300",
                  isSpeaking ? "bg-green-100 text-green-500 border-green-300 animate-pulse" : "bg-blue-100 text-blue-500 border-blue-300"
                )}
                onClick={isSpeaking ? stopSpeech : speakText}
                disabled={!transcript}
              >
                {isSpeaking ? <VolumeX size={36} /> : <Volume2 size={36} />}
              </Button>
            </div>
            
            <Textarea 
              className={cn(
                "min-h-32 transition-all resize-y",
                language === 'ar-SA' ? "text-right" : "text-left"
              )}
              placeholder={isListening 
                ? "Listening..." 
                : "Type or speak to convert text..."}
              value={transcript}
              onChange={handleTextChange}
              dir={language === 'ar-SA' ? 'rtl' : 'ltr'}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={speakText}
            disabled={!transcript}
            className="flex gap-2"
          >
            <Volume2 size={16} />
            {isSpeaking ? "Stop speaking" : "Speak text"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!transcript}
            className="flex gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy text"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpeechToText;
