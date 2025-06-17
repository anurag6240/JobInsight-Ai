import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkIcon, FileText, Loader2, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface JobDescriptionInputProps {
  onJobDescriptionChange: (description: string) => void;
}

const JobDescriptionInput = ({ onJobDescriptionChange }: JobDescriptionInputProps) => {
  const [activeTab, setActiveTab] = useState("paste");
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handleExtractFromUrl = async () => {
    if (!jobUrl) return;
    
    setIsExtracting(true);
    setExtractionError(null);
    
    try {
      // Using a CORS proxy to handle cross-origin requests
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(jobUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 403) {
          throw new Error("Access denied: The website is blocking automated access. Please use the 'Paste Text' option instead.");
        } else if (response.status === 404) {
          throw new Error("Job posting not found. Please check the URL and try again.");
        } else {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
      }
      
      const html = await response.text();
      
      // Simple extraction of text content from HTML
      const tempElement = document.createElement('div');
      tempElement.innerHTML = html;
      
      // Remove script and style elements to clean up the text
      const scriptTags = tempElement.querySelectorAll('script, style');
      scriptTags.forEach(tag => tag.remove());
      
      // Extract text from main content areas (prioritizing job description areas)
      const mainContent = tempElement.querySelector('main') || 
                          tempElement.querySelector('article') || 
                          tempElement.querySelector('.job-description') ||
                          tempElement.querySelector('#job-description') ||
                          tempElement;
      
      // Clean up the extracted text
      let extractedText = mainContent.textContent || '';
      extractedText = extractedText.replace(/\s+/g, ' ').trim(); // Remove excess whitespace
      
      // Attempt to identify and extract just the job description section
      // This is a simple approach; more sophisticated parsing would be needed for production
      const jobDescriptionMatches = extractedText.match(/job description|requirements|responsibilities/i);
      
      if (jobDescriptionMatches && jobDescriptionMatches.index) {
        // Extract from the matched section to the end, or limit to a reasonable size
        extractedText = extractedText.substring(jobDescriptionMatches.index, jobDescriptionMatches.index + 4000);
      } else if (extractedText.length > 5000) {
        // If no job description section found but text is long, limit the size
        extractedText = extractedText.substring(0, 5000) + '...';
      }
      
      setJobText(extractedText);
      onJobDescriptionChange(extractedText);
      toast.success("Job description extracted successfully");
    } catch (error) {
      console.error("Error extracting job description:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract job description from URL";
      setExtractionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTextChange = (value: string) => {
    setJobText(value);
    onJobDescriptionChange(value);
  };

  const handleCopyUrlToClipboard = () => {
    navigator.clipboard.writeText(jobUrl)
      .then(() => toast.success("URL copied to clipboard"))
      .catch(() => toast.error("Failed to copy URL"));
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
          <TabsTrigger value="url" className="flex items-center space-x-2 text-sm">
            <LinkIcon className="h-4 w-4" />
            <span>From URL</span>
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4" />
            <span>Paste Text</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Job Posting URL
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder="https://company.com/jobs/software-engineer"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleExtractFromUrl}
                disabled={!jobUrl || isExtracting}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {isExtracting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                Extract
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              We'll attempt to automatically extract the job description from the URL
            </p>
          </div>

          {extractionError && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Extraction failed</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>{extractionError}</p>
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("paste")}
                    className="w-full sm:w-auto"
                  >
                    Switch to manual paste
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyUrlToClipboard} 
                    className="flex items-center w-full sm:w-auto"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {jobText && !extractionError && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Extracted Job Description
              </label>
              <Textarea
                value={jobText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={8}
                className="resize-none text-sm"
                placeholder="Extracted job description will appear here..."
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Job Description
            </label>
            <Textarea
              placeholder="Paste the job description here... Include requirements, responsibilities, and any specific skills mentioned."
              value={jobText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="resize-none text-sm"
            />
            <p className="text-xs sm:text-sm text-gray-500">
              Copy and paste the complete job description for the most accurate analysis
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDescriptionInput;
