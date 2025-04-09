
import SpeechToText from "@/components/SpeechToText";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-purple-900">Multilingual Voice to Text</h1>
        <p className="text-slate-600 mt-2">Speak in English or Arabic and watch your words appear</p>
      </header>
      
      <main className="flex-1 flex items-start justify-center pt-8">
        <SpeechToText />
      </main>
      
      <footer className="py-6 text-center text-sm text-slate-500">
        <p>Using your browser's Speech Recognition API</p>
      </footer>
    </div>
  );
};

export default Index;
