import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, FileText, TrendingUp, Target, History, ExternalLink, Code, Globe, Blocks, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import AnalysisResults from "@/components/AnalysisResults";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { getSalaryTrendsFromGemini } from "@/services/geminiService";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

// Define recommended skills and roadmap data
const recommendedSkills = [
  { 
    name: "Frontend", 
    skills: ["React/Next.js", "TypeScript", "Tailwind CSS", "React Query"], 
    roadmapLink: "https://roadmap.sh/frontend",
    trend: "↗ High demand",
    difficulty: 75
  },
  { 
    name: "Backend", 
    skills: ["Node.js", "Go", "PostgreSQL", "GraphQL"], 
    roadmapLink: "https://roadmap.sh/backend",
    trend: "↗ Very high demand",
    difficulty: 85
  },
  { 
    name: "DevOps", 
    skills: ["Docker", "Kubernetes", "AWS/Azure/GCP", "CI/CD"], 
    roadmapLink: "https://roadmap.sh/devops",
    trend: "↗ Critical shortage",
    difficulty: 90
  },
  { 
    name: "AI/ML", 
    skills: ["Python", "PyTorch/TensorFlow", "LLM Fine-tuning", "Vector Databases"], 
    roadmapLink: "https://roadmap.sh/ai-data-scientist",
    trend: "↗ Explosive growth",
    difficulty: 95
  },
  { 
    name: "Blockchain", 
    skills: ["Solidity", "Web3.js", "Smart Contracts", "Zero-knowledge proofs"], 
    roadmapLink: "https://roadmap.sh/blockchain",
    trend: "→ Stable demand",
    difficulty: 80
  }
];

// Type definition for analysis history
interface AnalysisHistoryItem {
  id: string;
  date: string;
  matchPercentage: number;
  jobTitle?: string;
  resumeText?: string;
  jobDescription?: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("analyze");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AnalysisHistoryItem | null>(null);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const { data: salaryTrends = [], isLoading: salaryLoading } = useQuery({
    queryKey: ['salaryTrends'],
    queryFn: getSalaryTrendsFromGemini,
  });

  // Load analysis history from localStorage when component mounts
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`analysisHistory_${user.email}`);
      if (savedHistory) {
        setAnalysisHistory(JSON.parse(savedHistory));
      }
    }
  }, [user]);

  const handleAnalyze = () => {
    if (!user) {
      toast.error("Please sign in to analyze your resume");
      setAuthModalOpen(true);
      return;
    }
    
    if (!resumeUploaded || !resumeText) {
      toast.error("Please upload your resume first");
      return;
    }
    
    if (!jobDescription) {
      toast.error("Please enter a job description");
      return;
    }
    
    // Validate inputs have minimum content for analysis
    if (resumeText.length < 50) {
      toast.error("Resume content is too short for meaningful analysis");
      return;
    }
    
    if (jobDescription.length < 50) {
      toast.error("Job description is too short for meaningful analysis");
      return;
    }
    
    console.log("Starting analysis with:");
    console.log("- Resume length:", resumeText.length);
    console.log("- Job description length:", jobDescription.length);
    
    setHasBeenSaved(false); // Reset the save flag for new analysis
    setShowResults(true);
  };

  // Handle resume upload with text extraction
  const handleResumeUpload = (uploaded: boolean, extractedText: string = "") => {
    setResumeUploaded(uploaded);
    
    if (extractedText) {
      console.log("Resume text extracted, length:", extractedText.length);
      setResumeText(extractedText);
    } else if (!uploaded) {
      // Reset resume text when resume is removed
      setResumeText("");
    }
  };

  // Handle job description changes
  const handleJobDescriptionChange = (jd: string) => {
    console.log("Job description updated, length:", jd.length);
    setJobDescription(jd);
  };

  // Save analysis to history - modified to prevent duplicates
  const saveToHistory = (matchPercentage: number) => {
    if (!user || hasBeenSaved) return;

    const newHistoryItem: AnalysisHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      matchPercentage,
      jobTitle: jobDescription.split('\n')[0] || "Untitled Position",
      resumeText: resumeText,
      jobDescription: jobDescription
    };

    const updatedHistory = [newHistoryItem, ...analysisHistory];
    setAnalysisHistory(updatedHistory);
    setHasBeenSaved(true);

    // Save to localStorage
    localStorage.setItem(`analysisHistory_${user.email}`, JSON.stringify(updatedHistory));
    
    toast.success("Analysis saved to history");
  };

  const handleViewHistory = (item: AnalysisHistoryItem) => {
    // Set the selected history item
    setSelectedHistoryItem(item);
    
    // Load the resume text and job description from the history item
    if (item.resumeText && item.jobDescription) {
      setResumeText(item.resumeText);
      setJobDescription(item.jobDescription);
      setResumeUploaded(true);
      setShowResults(true);
    } else {
      toast.error("Unable to load analysis history. Resume or job description data is missing.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900">JobInsight+</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <span className="hidden sm:block text-sm text-gray-600">{user.email}</span>
                  <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => signOut()}>Sign Out</Button>
                </>
              ) : (
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setAuthModalOpen(true)}>Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Career Analysis Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Upload your resume and analyze job opportunities with AI-powered insights</p>
        </div>

        {!user ? (
          <Card className="mb-6 sm:mb-8 border-2 border-blue-200">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <Brain className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">Sign In to Access Analysis Tools</h2>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-6 max-w-md px-4">
                You need to sign in to use the resume analysis features and save your results.
              </p>
              <Button 
                size={isMobile ? "default" : "lg"} 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In to Get Started
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-1 p-1 bg-muted rounded-lg`}>
              <TabsTrigger value="analyze" className="flex items-center space-x-2 text-sm">
                <Brain className="h-4 w-4" />
                <span>Analyze</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2 text-sm">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
              {!isMobile && (
                <TabsTrigger value="trends" className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trends</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="analyze" className="space-y-6 sm:space-y-8">
              {!showResults ? (
                <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                  {/* Resume Upload Section */}
                  <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <span>Upload Your Resume</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <ResumeUpload onUpload={handleResumeUpload} />
                    </CardContent>
                  </Card>

                  {/* Job Description Section */}
                  <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span>Job Description</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <JobDescriptionInput onJobDescriptionChange={handleJobDescriptionChange} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <AnalysisResults 
                  onBack={() => {
                    setShowResults(false);
                    setHasBeenSaved(false);
                    setSelectedHistoryItem(null);
                    if (!selectedHistoryItem) {
                      setResumeText("");
                      setJobDescription("");
                      setResumeUploaded(false);
                    }
                  }} 
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                  onSaveAnalysis={saveToHistory}
                  jobTitle={selectedHistoryItem?.jobTitle}
                />
              )}

              {!showResults && (
                <div className="flex justify-center pt-4 sm:pt-8">
                  <Button 
                    size={isMobile ? "default" : "lg"} 
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-6 sm:px-12"
                    onClick={handleAnalyze}
                    disabled={!resumeUploaded || !jobDescription}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Analyze with AI
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <History className="h-5 w-5" />
                    <span>Analysis History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {analysisHistory.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {analysisHistory.map((item) => (
                        <Card key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                              <div>
                                <h4 className="font-medium text-sm sm:text-base">{item.jobTitle || "Untitled Position"}</h4>
                                <p className="text-xs sm:text-sm text-gray-600">{item.date}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`font-semibold text-sm sm:text-base ${
                                  item.matchPercentage >= 80 ? "text-green-600" :
                                  item.matchPercentage >= 60 ? "text-yellow-600" :
                                  "text-red-600"
                                }`}>
                                  {item.matchPercentage}% Match
                                </span>
                                <Button 
                                  variant="outline" 
                                  size={isMobile ? "sm" : "default"}
                                  onClick={() => handleViewHistory(item)}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <History className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6">Your previous analyses will appear here once you complete your first job analysis.</p>
                      <Button 
                        size={isMobile ? "default" : "lg"}
                        onClick={() => setActiveTab("analyze")}
                      >
                        Start Your First Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Career Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardHeader>
                        <CardTitle className="text-blue-800">Trending Technologies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>React/Next.js</span>
                            <span className="text-blue-600 font-semibold">↗ 85%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Python/AI</span>
                            <span className="text-blue-600 font-semibold">↗ 92%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cloud (AWS/Azure)</span>
                            <span className="text-blue-600 font-semibold">↗ 78%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                      <CardHeader>
                        <CardTitle className="text-green-800">Hot Job Roles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>AI/ML Engineer</span>
                            <span className="text-green-600 font-semibold">🔥 Hot</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Full Stack Developer</span>
                            <span className="text-green-600 font-semibold">📈 Rising</span>
                          </div>
                          <div className="flex justify-between">
                            <span>DevOps Engineer</span>
                            <span className="text-green-600 font-semibold">⚡ High Demand</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                      <CardHeader>
                        <CardTitle className="text-purple-800">Salary Trends (INR)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {salaryLoading ? (
                            <p>Loading salary data...</p>
                          ) : (
                            salaryTrends.map((trend, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{trend.role}</span>
                                <span className="text-purple-600 font-semibold">{trend.salaryInINR}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommended Skill Paths */}
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Recommended Skill Paths</h3>
                    <div className="space-y-6">
                      {recommendedSkills.map((skillPath, idx) => (
                        <Card key={idx} className="bg-gradient-to-r from-gray-50 to-indigo-50 overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                              <div>
                                <h4 className="text-lg font-bold flex items-center">
                                  {skillPath.name === "Frontend" && <Code className="h-5 w-5 mr-2 text-blue-500" />}
                                  {skillPath.name === "Backend" && <Blocks className="h-5 w-5 mr-2 text-indigo-500" />}
                                  {skillPath.name === "DevOps" && <Globe className="h-5 w-5 mr-2 text-green-500" />}
                                  {skillPath.name === "AI/ML" && <Brain className="h-5 w-5 mr-2 text-purple-500" />}
                                  {skillPath.name === "Blockchain" && <Blocks className="h-5 w-5 mr-2 text-amber-500" />}
                                  {skillPath.name} Development
                                </h4>
                                <p className="text-sm text-blue-600 font-medium">{skillPath.trend}</p>
                              </div>
                              <a 
                                href={skillPath.roadmapLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-2 sm:mt-0 flex items-center text-blue-700 hover:text-blue-900 font-medium text-sm"
                              >
                                View Learning Roadmap <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </a>
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Learning Difficulty</span>
                                <span className="font-medium">{skillPath.difficulty}%</span>
                              </div>
                              <Progress 
                                value={skillPath.difficulty} 
                                className="h-2" 
                              />
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {skillPath.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="bg-white border border-blue-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Learning Resources Section */}
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Essential Learning Resources</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <a 
                        href="https://roadmap.sh" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col h-full group"
                      >
                        <Card className="h-full group-hover:border-blue-300 transition-all">
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="mb-3">
                              <Globe className="h-8 w-8 text-blue-600 mb-2" />
                              <h4 className="font-bold text-lg">Roadmap.sh</h4>
                              <p className="text-gray-600 text-sm">Step-by-step guides for various tech careers</p>
                            </div>
                            <div className="mt-auto flex items-center text-blue-600 pt-2 group-hover:text-blue-800">
                              Visit Website <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                      <a 
                        href="https://freecodecamp.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col h-full group"
                      >
                        <Card className="h-full group-hover:border-blue-300 transition-all">
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="mb-3">
                              <Code className="h-8 w-8 text-blue-600 mb-2" />
                              <h4 className="font-bold text-lg">freeCodeCamp</h4>
                              <p className="text-gray-600 text-sm">Free coding bootcamp with certifications</p>
                            </div>
                            <div className="mt-auto flex items-center text-blue-600 pt-2 group-hover:text-blue-800">
                              Start Learning <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                      <a 
                        href="https://github.com/kamranahmedse/developer-roadmap" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col h-full group"
                      >
                        <Card className="h-full group-hover:border-blue-300 transition-all">
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="mb-3">
                              <Brain className="h-8 w-8 text-blue-600 mb-2" />
                              <h4 className="font-bold text-lg">Developer Roadmap</h4>
                              <p className="text-gray-600 text-sm">GitHub repository with interactive guides</p>
                            </div>
                            <div className="mt-auto flex items-center text-blue-600 pt-2 group-hover:text-blue-800">
                              Open Repository <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
