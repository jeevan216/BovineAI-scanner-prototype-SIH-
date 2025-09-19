import { useState, useRef, useCallback } from 'react';
import { Upload, Scan, Eye, BookOpen, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  height: number;
  length: number;
  score: number;
  breed: string;
  confidence: number;
}

type ScanStage = 'upload' | 'analyzing' | 'results';

const breeds = [
  { value: 'sahiwal', label: 'Sahiwal Cattle', icon: '🐄' },
  { value: 'murrah', label: 'Murrah Buffalo', icon: '🐃' },
  { value: 'gir', label: 'Gir Cattle', icon: '🐄' },
  { value: 'holstein', label: 'Holstein Friesian', icon: '🐄' },
];

// Sample results based on breed
const sampleResults: Record<string, AnalysisResult> = {
  sahiwal: { height: 142, length: 155, score: 87, breed: 'Sahiwal', confidence: 94 },
  murrah: { height: 135, length: 148, score: 92, breed: 'Murrah Buffalo', confidence: 96 },
  gir: { height: 138, length: 150, score: 85, breed: 'Gir', confidence: 89 },
  holstein: { height: 145, length: 160, score: 90, breed: 'Holstein Friesian', confidence: 92 },
};

export default function BovineScanner() {
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [scanStage, setScanStage] = useState<ScanStage>('upload');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast({
      title: "Image Uploaded",
      description: "Ready for analysis",
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const startAnalysis = async () => {
    if (!selectedFile || !selectedBreed) return;

    setScanStage('analyzing');
    
    // Simulate analysis with loading time
    setTimeout(() => {
      const result = sampleResults[selectedBreed] || sampleResults.sahiwal;
      
      // Add slight random variation for realism
      const variation = () => Math.round((Math.random() - 0.5) * 10);
      const finalResult = {
        ...result,
        height: Math.max(120, result.height + variation()),
        length: Math.max(140, result.length + variation()),
        score: Math.max(70, Math.min(100, result.score + variation())),
      };
      
      setAnalysisResult(finalResult);
      setScanStage('results');
      
      toast({
        title: "Analysis Complete",
        description: `${finalResult.breed} analysis finished with ${finalResult.confidence}% confidence`,
      });
    }, 3000);
  };

  const resetScanner = () => {
    setScanStage('upload');
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setSelectedBreed('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const saveResults = () => {
    if (!analysisResult) return;
    
    // Simulate saving to BPA system
    toast({
      title: "Results Saved",
      description: `Analysis saved to Bovine Performance Analytics system`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-primary';
    if (score >= 70) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center fade-in">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-primary-glow px-6 py-3 text-primary-foreground shadow-lg">
            <Eye className="h-6 w-6" />
            <h1 className="text-2xl font-bold">BovineAI Scanner</h1>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Prototype v1.0
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Advanced Animal Type Classification & Body Measurement Analysis
          </p>
        </div>

        {scanStage === 'upload' && (
          <div className="fade-in space-y-6">
            {/* Breed Selection */}
            <Card className="scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Select Animal Breed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose the breed for analysis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {breeds.map((breed) => (
                      <SelectItem key={breed.value} value={breed.value}>
                        <div className="flex items-center gap-2">
                          <span>{breed.icon}</span>
                          <span>{breed.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Upload Zone */}
            <Card className="scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Animal Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`upload-zone ${isDragging ? 'dragover' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="mx-auto max-h-64 rounded-lg object-cover shadow-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change image or drag & drop a new one
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">
                          Or click to browse • JPG, PNG, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                <Button
                  className="btn-primary mt-6 w-full"
                  onClick={startAnalysis}
                  disabled={!selectedFile || !selectedBreed}
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Start AI Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {scanStage === 'analyzing' && (
          <div className="fade-in space-y-6">
            <Card className="scale-in">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-lg">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Analyzing" 
                        className="h-full w-full object-cover scanning pulse-glow"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">AI Analysis in Progress</h3>
                    <p className="text-muted-foreground">
                      Analyzing {breeds.find(b => b.value === selectedBreed)?.label} features and measurements...
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {scanStage === 'results' && analysisResult && (
          <div className="fade-in space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={resetScanner}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Scan
              </Button>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">Analysis Complete</span>
                <Badge variant="outline" className="text-success border-success">
                  {analysisResult.confidence}% Confidence
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Image Results */}
              <Card className="scale-in">
                <CardHeader>
                  <CardTitle>Analyzed Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Analysis Result" 
                      className="w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg"></div>
                    <Badge className="absolute top-2 right-2 bg-success">
                      {analysisResult.breed} Detected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Measurements */}
              <div className="space-y-4">
                <Card className="scale-in measurement-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Body Measurements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Height at Withers</span>
                      <span className="text-xl font-semibold">{analysisResult.height} cm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Body Length</span>
                      <span className="text-xl font-semibold">{analysisResult.length} cm</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="scale-in">
                  <CardHeader>
                    <CardTitle className="text-lg">ATC Performance Score</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`score-display ${getScoreColor(analysisResult.score)}`}>
                      {analysisResult.score}
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">
                      {getScoreLabel(analysisResult.score)} Performance
                    </p>
                  </CardContent>
                </Card>

                <Button 
                  className="btn-success w-full"
                  onClick={saveResults}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save to BPA System
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}