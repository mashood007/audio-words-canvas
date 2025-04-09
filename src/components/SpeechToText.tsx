
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { cn } from '@/lib/utils';

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if the browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
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
  }, []);

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        setTranscript('');
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

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Speech to Text</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center mb-6">
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
          </div>
          
          <div className={cn(
            "bg-slate-50 p-4 rounded-md min-h-32 transition-all",
            transcript ? "border border-slate-200" : "border border-transparent"
          )}>
            {transcript ? (
              <p className="break-words">{transcript}</p>
            ) : (
              <p className="text-slate-400 text-center">
                {isListening ? "Listening..." : "Press the microphone button and start speaking"}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
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
