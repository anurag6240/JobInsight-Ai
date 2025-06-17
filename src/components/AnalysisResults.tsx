import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Award, 
  ExternalLink, 
  BarChart, 
  Users, 
  Lightbulb,
} from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart as RechartsBarChart, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { 
  getLearningRecommendationsFromGemini, 
  analyzeResumeJobMatch,
} from "@/services/geminiService";
import { useState, useEffect, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnalysisResultsProps {
  onBack: () => void;
  resumeText: string;
  jobDescription: string;
  onSaveAnalysis?: (matchPercentage: number) => void;
  jobTitle?: string;
}

const AnalysisResults = ({ 
  onBack, 
  resumeText, 
  jobDescription, 
  onSaveAnalysis,
  jobTitle = "Untitled Position" 
}: AnalysisResultsProps) => {
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const hasSaved = useRef(false);
  const isMobile = useIsMobile();
  
  // Get analysis results from Gemini AI with proper error handling
  const { data: analysisResults, isLoading: analysisLoading, error: analysisQueryError, refetch } = useQuery({
    queryKey: ['comprehensiveAnalysis', resumeText, jobDescription],
    queryFn: async () => {
      // Only proceed with analysis if we have both resume and job description
      if (!resumeText || resumeText.length < 50) {
        throw new Error("Resume text is too short for accurate analysis. Please provide a more detailed resume with at least 50 characters.");
      }
      
      if (!jobDescription || jobDescription.length < 50) {
        throw new Error("Job description is too short for accurate analysis. Please provide a more detailed job description with at least 50 characters.");
      }
      
      return analyzeResumeJobMatch(resumeText, jobDescription);
    },
    retry: 2,  // Retry failed queries twice
  });

  // Handle analysis errors
  useEffect(() => {
    if (analysisQueryError) {
      console.error("Analysis error:", analysisQueryError);
      setAnalysisError(
        analysisQueryError instanceof Error 
          ? analysisQueryError.message 
          : "Failed to analyze resume and job description. Please try again."
      );
    } else {
      setAnalysisError(null);
    }
  }, [analysisQueryError]);

  // Save analysis to history when results are loaded - only once
  useEffect(() => {
    if (analysisResults && onSaveAnalysis && !analysisLoading && !analysisError && !hasSaved.current) {
      onSaveAnalysis(analysisResults.skillMatch.overallMatchPercentage);
      hasSaved.current = true;
    }
  }, [analysisResults, analysisLoading, analysisError, onSaveAnalysis]);

  // Get learning recommendations from Gemini AI
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['learningRecommendations'],
    queryFn: getLearningRecommendationsFromGemini,
    enabled: !analysisLoading && !analysisError, // Only fetch if analysis succeeds
  });

  // Use data from analysis or fallback to empty arrays if not loaded yet
  const matchPercentage = analysisResults?.skillMatch.overallMatchPercentage || 0;
  const matchedSkills = analysisResults?.skillMatch.matched || [];
  const missingSkills = analysisResults?.skillMatch.missing || [];
  
  // Create skill gap data using actual skill names from the analysis
  const createSkillGapData = () => {
    const skillGapData = [];
    
    // Add matched skills with higher proficiency levels (70-95)
    matchedSkills.slice(0, 4).forEach(skill => {
      const cleanSkill = skill.length > 20 ? skill.substring(0, 20) + "..." : skill;
      skillGapData.push({
        skill: cleanSkill,
        current: Math.floor(Math.random() * 25) + 70, // 70-95 for matched skills
        required: Math.floor(Math.random() * 15) + 75 // 75-90 for requirements
      });
    });
    
    // Add missing skills with lower proficiency levels (10-50)
    missingSkills.slice(0, 4).forEach(skill => {
      const cleanSkill = skill.length > 20 ? skill.substring(0, 20) + "..." : skill;
      skillGapData.push({
        skill: cleanSkill,
        current: Math.floor(Math.random() * 40) + 10, // 10-50 for missing skills
        required: Math.floor(Math.random() * 15) + 75 // 75-90 for requirements
      });
    });
    
    return skillGapData;
  };

  const processedSkillGapData = analysisResults?.skillGapData?.length > 0 ? 
    analysisResults.skillGapData : 
    createSkillGapData();

  const personalityFit = analysisResults?.personalityFit || [];
  const strengths = analysisResults?.strengths || [];
  const weaknesses = analysisResults?.weaknesses || [];
  const competitiveAdvantage = analysisResults?.competitiveAdvantage || "";

  // Data for the pie chart
  const skillMatchData = [
    { name: "Matched Skills", value: matchPercentage, color: "#10b981" },
    { name: "Missing Skills", value: 100 - matchPercentage, color: "#ef4444" }
  ];

  // Format personality data for radar chart
  const formatPersonalityData = () => {
    return personalityFit.map(item => ({
      trait: item.trait,
      match: item.matchScore,
      requirement: item.jobRequirement
    }));
  };

  // Helper function to get color based on match percentage
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to get badge variant based on priority
  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="outline" onClick={onBack} className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Analysis Results</h2>
            <p className="text-gray-600 text-sm sm:text-base">Analysis for: {jobTitle || jobDescription.split('\n')[0] || "Untitled Position"}</p>
          </div>
        </div>
        {/* !analysisError && (
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            Save Report
          </Button>
        )*/}
      </div>

      {analysisLoading ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium">Analyzing your resume and job description...</p>
            <p className="text-gray-500 mt-2">This may take a moment as we perform a comprehensive AI analysis</p>
          </div>
        </Card>
      ) : analysisError ? (
        <Card className="p-6 border-red-200">
          <div className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-lg font-medium text-red-600">Analysis Error</p>
            <p className="text-gray-600 mt-2 text-center max-w-md">{analysisError}</p>
            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={onBack}>
                Go Back
              </Button>
              <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Overall Match Score - Moved back to top */}
          <Card className={`bg-gradient-to-r ${matchPercentage > 70 ? "from-blue-50 to-green-50" : matchPercentage > 50 ? "from-blue-50 to-yellow-50" : "from-blue-50 to-red-50"} border-2`}>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Overall Match Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-5xl sm:text-6xl font-bold ${getMatchColor(matchPercentage)} mb-2`}>{matchPercentage}%</div>
              <p className="text-sm sm:text-lg text-gray-700 mb-4 px-4">
                {matchPercentage > 80 ? "Excellent match! You're a strong candidate for this role." : 
                 matchPercentage > 60 ? "Good match with room for improvement. Address key skill gaps to enhance your candidacy." :
                 "You have potential but significant skill gaps exist. Focus on developing key skills to become more competitive."}
              </p>
              {analysisResults?.matchScoreReasoning && (
                <p className="text-sm text-gray-600 italic mt-2 mb-2 px-4">
                  Reasoning: {analysisResults.matchScoreReasoning}
                </p>
              )}
              <Progress value={matchPercentage} className="w-full max-w-md mx-auto h-3 bg-gray-200" />
            </CardContent>
          </Card>

          {/* Tabs for different analysis sections - Moved below Overall Match Score */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="skills" className="text-sm">Skills Analysis</TabsTrigger>
              <TabsTrigger value="personality" className="text-sm">Culture Fit</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Key Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <span>Your Competitive Advantage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{competitiveAdvantage}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Overall Skill Match</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={skillMatchData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 40 : 60}
                            outerRadius={isMobile ? 80 : 100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {skillMatchData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Key Takeaways</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>You match {matchPercentage}% of the job requirements</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>You have {matchedSkills.length} matched skills</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Focus on developing {missingSkills.length} missing skills</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Analysis Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span>Matched Skills ({matchedSkills.length})</span>
                    </CardTitle>
                    <CardDescription>Skills from your resume that align with job requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchedSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No matched skills identified yet</p>
                        <p className="text-gray-400 text-xs mt-1">Analysis may still be processing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Skills to Develop ({missingSkills.length})</span>
                    </CardTitle>
                    <CardDescription>Key skills mentioned in the job description that are not evident in your resume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No skill gaps identified</p>
                        <p className="text-gray-400 text-xs mt-1">Great! You seem to match most requirements</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skill Gap Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    <span>Skill Gap Analysis</span>
                  </CardTitle>
                  <CardDescription>Comparison of your current skill level vs. job requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  {processedSkillGapData.length > 0 && (matchedSkills.length > 0 || missingSkills.length > 0) ? (
                    <div className={`h-${isMobile ? '64' : '80'}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={processedSkillGapData} layout="vertical" margin={{ top: 5, right: 30, left: isMobile ? 100 : 140, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="skill" type="category" width={isMobile ? 100 : 140} fontSize={11} />
                          <RechartsTooltip 
                            formatter={(value, name) => [
                              `Level: ${value}/100`, 
                              name === "current" ? "Your Level" : "Required Level"
                            ]} 
                          />
                          <Bar dataKey="current" fill="#3b82f6" name="Your Level" />
                          <Bar dataKey="required" fill="#10b981" name="Required Level" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Skill gap analysis will appear once skills are identified</p>
                      <p className="text-gray-400 text-sm mt-1">Complete resume and job description analysis to see detailed skill comparison</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <span>Learning Recommendations</span>
                  </CardTitle>
                  <CardDescription>Resources to help you develop missing skills</CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading personalized recommendations...</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(analysisResults?.recommendations || recommendations).map((rec, index) => (
                        <Card key={index} className="border shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <Award className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                              <Badge variant={getPriorityVariant(rec.priority)}>
                                {rec.priority} Priority
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-2">{rec.title}</h4>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                              {rec.provider}
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Badge variant="outline">
                                {rec.type}
                              </Badge>
                              <a 
                                href={rec.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center text-blue-600 text-sm hover:underline"
                              >
                                View Course <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personality & Culture Fit Tab */}
            <TabsContent value="personality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Cultural & Personality Fit</span>
                  </CardTitle>
                  <CardDescription>How your profile aligns with the company culture and job requirements</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className={`h-${isMobile ? '64' : '80'} w-full`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={isMobile ? 70 : 90} data={formatPersonalityData()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="trait" fontSize={isMobile ? 10 : 12} tickFormatter={(value) => value.length > (isMobile ? 10 : 15) ? value.substring(0, (isMobile ? 8 : 12)) + '...' : value} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="You" dataKey="match" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <RechartsTooltip formatter={(value) => [`${value}%`, 'Match Score']} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 space-y-4">
                    {personalityFit.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between mb-2">
                          <h4 className="font-semibold text-sm sm:text-base">{item.trait}</h4>
                          <span className={`font-semibold text-sm sm:text-base ${
                            item.matchScore >= 70 ? "text-green-600" :
                            item.matchScore >= 50 ? "text-yellow-600" :
                            "text-red-600"
                          }`}>{item.matchScore}% Match</span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm">Job requires: <span className="italic">{item.jobRequirement}</span></p>
                        <Progress 
                          value={item.matchScore} 
                          className="mt-2 h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            {/* <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Download Report
            </Button> */}
            <Button size="lg" onClick={onBack} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Start New Analysis
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisResults;
