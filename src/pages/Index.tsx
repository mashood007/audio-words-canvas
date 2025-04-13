
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpeechToText from "@/components/SpeechToText";
import ArabicLessons from "@/components/ArabicLessons";
import { LessonProvider } from "@/context/LessonContext";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-purple-900">Multilingual Voice Assistant</h1>
        <p className="text-slate-600 mt-2">Speak in English or Arabic and convert between text and speech</p>
      </header>
      
      <main className="flex-1 flex items-start justify-center pt-4">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="converter" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="converter">Text Converter</TabsTrigger>
              <TabsTrigger value="lessons">Arabic Lessons</TabsTrigger>
            </TabsList>
            
            <TabsContent value="converter">
              <SpeechToText />
            </TabsContent>
            
            <TabsContent value="lessons">
              <LessonProvider>
                <ArabicLessons />
              </LessonProvider>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-slate-500">
        <p>Using your browser's Speech Recognition & Speech Synthesis APIs</p>
      </footer>
    </div>
  );
};

export default Index;
