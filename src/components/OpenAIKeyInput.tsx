
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

const OpenAIKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if there's a saved API key
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an OpenAI API key');
      return;
    }

    localStorage.setItem('openai_api_key', apiKey.trim());
    setIsSaved(true);
    toast.success('API key saved successfully');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Key className="h-5 w-5 mr-2 text-orange-500" />
          OpenAI API Key
        </CardTitle>
        <CardDescription>
          Required for better Arabic speech recognition
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="flex-1"
          />
          <Button onClick={handleSaveKey} variant="outline">
            {isSaved ? (
              <>
                <Check className="h-4 w-4 mr-1 text-green-500" /> Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" /> Save Key
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 pt-0">
        Your API key is stored locally in your browser and is not sent to our servers.
      </CardFooter>
    </Card>
  );
};

export default OpenAIKeyInput;
