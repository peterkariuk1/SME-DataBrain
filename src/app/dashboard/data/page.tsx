"use client";

import { useState } from 'react';
import { UploadCloud, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { dataTransformationFromDocument } from '@/ai/flows/data-transformation-from-document';


const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};


export default function DataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transformedData, setTransformedData] = useState<object | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setTransformedData(null);
    }
  };

  const handleTransform = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document or image to transform.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setTransformedData(null);

    try {
      const documentDataUri = await readFileAsDataURL(file);
      const result = await dataTransformationFromDocument({ documentDataUri });
      setTransformedData(JSON.parse(result.structuredData));
      toast({
        title: "Transformation Complete",
        description: `${fileName} has been processed successfully.`,
      });
    } catch (error) {
      console.error("Transformation failed:", error);
      toast({
        title: "Transformation Failed",
        description: "Could not extract data from the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Data Transformation</CardTitle>
          <CardDescription>Upload documents (PDF, JPG, PNG) to convert them into structured JSON data using AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-accent/50 hover:border-accent bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-accent" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-accent">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 10MB)</p>
            </div>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" disabled={isProcessing} />
          </label>
          {fileName && <p className="text-center text-sm text-foreground">Selected file: <span className="font-medium text-accent">{fileName}</span></p>}
          <Button onClick={handleTransform} disabled={isProcessing || !fileName} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Transform Data'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structured Output</CardTitle>
          <CardDescription>AI-extracted data in JSON format.</CardDescription>
        </CardHeader>
        <CardContent className="h-[28rem] overflow-y-auto bg-muted/50 rounded-lg p-4">
          {transformedData ? (
            <pre className="text-sm whitespace-pre-wrap">
              <code>{JSON.stringify(transformedData, null, 2)}</code>
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                    <p>Extracting data...</p>
                  </>
              ) : (
                <>
                  <FileJson className="w-12 h-12 mb-4" />
                  <p>Your transformed JSON data will appear here.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
