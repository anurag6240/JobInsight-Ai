// This file integrates with Google's Gemini API to provide AI-powered analysis

export type SalaryTrend = {
  role: string;
  salaryInINR: string;
  growth: string;
};

export type SkillRecommendation = {
  title: string;
  type: string;
  provider: string;
  duration: string;
  priority: string;
  url: string;
};

export type SkillMatch = {
  matched: string[];
  missing: string[];
  overallMatchPercentage: number;
};

export type SkillGap = {
  skill: string;
  current: number;
  required: number;
};

export type IndustryDemand = {
  skill: string;
  demandLevel: string;
  growthTrend: string;
};

export type PersonalityFit = {
  trait: string;
  matchScore: number;
  jobRequirement: string;
};

export type CareerPathSuggestion = {
  role: string;
  timeframe: string;
  potentialSalary: string;
  requiredSkills: string[];
};

export type ComprehensiveAnalysis = {
  skillMatch: SkillMatch;
  skillGapData: SkillGap[];
  recommendations: SkillRecommendation[];
  industryDemand: IndustryDemand[];
  personalityFit: PersonalityFit[];
  careerPathSuggestions: CareerPathSuggestion[];
  strengths: string[];
  weaknesses: string[];
  competitiveAdvantage: string;
  matchScoreReasoning?: string;
};

// The Gemini API key should be kept in environment variables or fetched securely
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

if (!GEMINI_API_KEY) {
  console.error("Gemini API key is not set. Please set VITE_GEMINI_API_KEY in your .env file");
}

/**
 * Helper function to make API requests to Gemini
 */
const callGeminiAPI = async (prompt: string) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    console.log("Calling Gemini API with prompt:", prompt.substring(0, 200) + "...");
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error response:", errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error.message || "Failed to get response from Gemini");
    }
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error("Unexpected Gemini API response format:", data);
      throw new Error("Invalid response format from Gemini API");
    }
    
    console.log("Gemini API response received successfully");
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

/**
 * Get salary trends based on current Indian job market from Gemini AI
 */
export const getSalaryTrendsFromGemini = async (): Promise<SalaryTrend[]> => {
  try {
    const prompt = `
      As an AI career advisor specializing in the Indian tech job market, provide current salary trends for top tech roles in India for 2024-2025.
      
      Focus on roles that are in high demand in India's tech hubs (Bangalore, Hyderabad, Pune, Chennai, Mumbai, NCR).
      Consider factors like:
      - Current market demand in Indian IT companies (TCS, Infosys, Wipro, HCL, etc.)
      - Emerging roles in Indian startups and unicorns
      - Remote work impact on Indian salaries
      - Skills shortage in Indian market
      
      Return ONLY a valid JSON array with exactly 3 objects, each containing:
      {
        "role": "specific job role relevant to Indian market",
        "salaryInINR": "salary range in Indian Rupees with ₹ symbol (be realistic for Indian market)",
        "growth": "salary growth trend with arrow symbol (↗ for up, → for stable, ↘ for down) followed by percentage"
      }
      
      Example format:
      [
        {"role": "Full Stack Developer", "salaryInINR": "₹8,00,000 - ₹15,00,000", "growth": "↗ 18%"},
        {"role": "DevOps Engineer", "salaryInINR": "₹12,00,000 - ₹22,00,000", "growth": "↗ 25%"},
        {"role": "Data Scientist", "salaryInINR": "₹10,00,000 - ₹20,00,000", "growth": "↗ 20%"}
      ]
    `;

    const responseText = await callGeminiAPI(prompt);
    
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      console.log("Parsing salary trends JSON:", jsonStr.substring(0, 200) + "...");
      
      const trends = JSON.parse(jsonStr);
      return trends.slice(0, 3);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      throw new Error("Failed to parse salary trends data");
    }
  } catch (error) {
    console.error("Error getting salary trends:", error);
    return [
      { 
        role: "Full Stack Developer", 
        salaryInINR: "₹8,00,000 - ₹15,00,000", 
        growth: "↗ 18%" 
      },
      { 
        role: "DevOps Engineer", 
        salaryInINR: "₹12,00,000 - ₹22,00,000", 
        growth: "↗ 25%" 
      },
      { 
        role: "Data Scientist", 
        salaryInINR: "₹10,00,000 - ₹20,00,000", 
        growth: "↗ 20%" 
      }
    ];
  }
};

/**
 * Get learning recommendations based on Indian job market demands
 */
export const getLearningRecommendationsFromGemini = async (): Promise<SkillRecommendation[]> => {
  try {
    const prompt = `
      As an AI career advisor specializing in the Indian tech market, provide learning recommendations that are specifically valuable for professionals in India's job market.
      
      Consider:
      - Skills in high demand by Indian IT companies and startups
      - Certifications valued by Indian employers
      - Cost-effective learning options accessible in India
      - Skills that offer good ROI in Indian salary negotiations
      - Remote work skills relevant to Indian professionals working with global teams
      
      Return ONLY a valid JSON array with exactly 3 objects, each containing:
      {
        "title": "specific course/certification name",
        "type": "Course, Certification, or Workshop",
        "provider": "platform or organization (prefer options accessible in India)",
        "duration": "realistic time estimate",
        "priority": "High, Medium, or Low based on Indian market demand",
        "url": "valid, accessible URL"
      }
      
      Focus on skills like: Cloud Computing, AI/ML, Full Stack Development, DevOps, Data Analytics, Cybersecurity.
    `;

    const responseText = await callGeminiAPI(prompt);
    
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      console.log("Parsing learning recommendations JSON:", jsonStr.substring(0, 200) + "...");
      
      const recommendations = JSON.parse(jsonStr);
      return recommendations.slice(0, 3);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      throw new Error("Failed to parse learning recommendations data");
    }
  } catch (error) {
    console.error("Error getting learning recommendations:", error);
    return [
      {
        title: "AWS Solutions Architect Associate",
        type: "Certification",
        provider: "AWS",
        duration: "3-4 weeks",
        priority: "High",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/"
      },
      {
        title: "Full Stack Web Development",
        type: "Course",
        provider: "Coursera",
        duration: "6 months",
        priority: "High",
        url: "https://www.coursera.org/specializations/full-stack-react"
      },
      {
        title: "Python for Data Science",
        type: "Course",
        provider: "edX",
        duration: "8 weeks",
        priority: "Medium",
        url: "https://www.edx.org/course/python-for-data-science"
      }
    ];
  }
};

/**
 * Analyze resume and job description with India-specific metrics and comprehensive AI analysis
 */
export const analyzeResumeJobMatch = async (resumeText: string, jobDescription: string): Promise<ComprehensiveAnalysis> => {
  try {
    // Validate input lengths
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error("Resume text is too short for accurate analysis. Please provide a more detailed resume.");
    }
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error("Job description is too short for accurate analysis. Please provide a more detailed job description.");
    }

    console.log("Analyzing resume and job description with Indian market context");
    console.log("Resume excerpt:", resumeText.substring(0, 100) + "...");
    console.log("Job description excerpt:", jobDescription.substring(0, 100) + "...");
    
    const resumeContent = resumeText.trim();
    const jobDescContent = jobDescription.trim();
    
    const prompt = `
      As an AI career advisor and talent acquisition expert specializing in the Indian job market, perform a comprehensive analysis of the following resume and job description.
      
      IMPORTANT: Base your analysis on Indian job market standards, salary expectations, skill demands, and career progression patterns common in India's tech industry.
      
      RESUME:
      ${resumeContent}
      
      JOB DESCRIPTION:
      ${jobDescContent}
      
      Analyze this with the following Indian market context:
      - Indian IT industry standards and expectations
      - Skills valued by Indian employers (TCS, Infosys, Wipro, Accenture, startups, unicorns)
      - Indian salary ranges and career progression
      - Remote work trends in India
      - Skills shortage in Indian market
      - Indian educational background recognition
      - Communication skills for Indian work environment
      
      Return ONLY a valid JSON object with these exact properties:
      
      {
        "skillMatch": {
          "matched": ["skill1", "skill2", "skill3"],
          "missing": ["missing_skill1", "missing_skill2"],
          "overallMatchPercentage": 75,
          "explanation": "Brief explanation for the match percentage"
        },
        "skillGapData": [
          {"skill": "React.js", "current": 70, "required": 85},
          {"skill": "Node.js", "current": 60, "required": 80},
          {"skill": "AWS", "current": 40, "required": 75},
          {"skill": "MongoDB", "current": 65, "required": 70},
          {"skill": "Docker", "current": 30, "required": 70}
        ],
        "recommendations": [
          {
            "title": "AWS Solutions Architect",
            "type": "Certification",
            "provider": "AWS",
            "duration": "4 weeks",
            "priority": "High",
            "url": "https://aws.amazon.com/certification/"
          }
        ],
        "industryDemand": [
          {"skill": "React.js", "demandLevel": "Very High", "growthTrend": "Rapidly Growing"},
          {"skill": "Python", "demandLevel": "High", "growthTrend": "Growing"},
          {"skill": "DevOps", "demandLevel": "Very High", "growthTrend": "Rapidly Growing"},
          {"skill": "AI/ML", "demandLevel": "High", "growthTrend": "Rapidly Growing"}
        ],
        "personalityFit": [
          {"trait": "Technical Communication", "matchScore": 80, "jobRequirement": "Excellent written and verbal communication"},
          {"trait": "Team Collaboration", "matchScore": 75, "jobRequirement": "Strong teamwork in agile environment"},
          {"trait": "Problem Solving", "matchScore": 85, "jobRequirement": "Analytical thinking and debugging skills"}
        ],
        "careerPathSuggestions": [
          {
            "role": "Senior Software Engineer",
            "timeframe": "2-3 years",
            "potentialSalary": "₹15,00,000 - ₹25,00,000",
            "requiredSkills": ["Advanced React", "System Design", "Leadership"]
          },
          {
            "role": "Tech Lead",
            "timeframe": "4-5 years",
            "potentialSalary": "₹25,00,000 - ₹40,00,000",
            "requiredSkills": ["Architecture", "Team Management", "Product Strategy"]
          }
        ],
        "strengths": [
          "Strong technical foundation in modern web technologies",
          "Good understanding of full-stack development",
          "Experience with industry-standard tools and frameworks"
        ],
        "weaknesses": [
          "Limited experience with cloud technologies",
          "Lacks advanced system design knowledge"
        ],
        "competitiveAdvantage": "Strong combination of frontend and backend skills with good learning trajectory for Indian tech market",
        "matchScoreReasoning": "Provide a brief and precise explanation (1-2 sentences) for the overall match percentage, focusing on the most significant matching strengths and missing skills."
      }
      
      Be specific and realistic with skill names, use actual technologies mentioned in the resume/job description.
      Ensure skill gap data uses real skill names from the analysis.
      Make salary ranges realistic for Indian market.
      Focus on skills actually relevant to Indian job market.
    `;

    const responseText = await callGeminiAPI(prompt);
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      console.log("Parsing resume analysis JSON:", jsonStr.substring(0, 300) + "...");
      
      const analysis = JSON.parse(jsonStr);
      
      // Ensure skill gap data has proper skill names
      if (analysis.skillGapData && analysis.skillGapData.length > 0) {
        analysis.skillGapData = analysis.skillGapData.map((item: any) => ({
          ...item,
          skill: item.skill || "Unknown Skill"
        }));
      }
      
      return analysis;
    } catch (parseError) {
      console.error("Error parsing Gemini analysis response:", parseError, responseText);
      throw new Error("Failed to parse resume analysis data");
    }
  } catch (error) {
    console.error("Error analyzing resume and job description:", error);
    
    // Return a more informative error response
    if (error instanceof Error && error.message.includes("too short")) {
      throw error; // Re-throw the validation error to be handled by the UI
    }
    
    // Enhanced fallback data with Indian market context
    return {
      skillMatch: {
        matched: [
          "Problem-solving abilities", 
          "Basic programming knowledge", 
          "Communication skills",
          "Team collaboration",
          "Technical aptitude"
        ],
        missing: [
          "Advanced JavaScript frameworks", 
          "Cloud computing experience", 
          "System design knowledge",
          "DevOps practices",
          "Database optimization"
        ],
        overallMatchPercentage: 65
      },
      skillGapData: [
        { skill: "JavaScript/React", current: 60, required: 85 },
        { skill: "Node.js/Backend", current: 45, required: 80 },
        { skill: "AWS/Cloud", current: 25, required: 75 },
        { skill: "Database Management", current: 55, required: 70 },
        { skill: "DevOps/CI-CD", current: 20, required: 65 },
        { skill: "System Design", current: 30, required: 75 },
        { skill: "API Development", current: 50, required: 80 }
      ],
      recommendations: [
        {
          title: "React.js Complete Guide",
          type: "Course",
          provider: "Udemy",
          duration: "40 hours",
          priority: "High",
          url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"
        },
        {
          title: "AWS Certified Developer",
          type: "Certification",
          provider: "AWS",
          duration: "8 weeks",
          priority: "High",
          url: "https://aws.amazon.com/certification/certified-developer-associate/"
        },
        {
          title: "System Design Interview",
          type: "Course",
          provider: "Educative",
          duration: "6 weeks",
          priority: "Medium",
          url: "https://www.educative.io/courses/grokking-the-system-design-interview"
        }
      ],
      industryDemand: [
        { skill: "React.js", demandLevel: "Very High", growthTrend: "Rapidly Growing" },
        { skill: "Node.js", demandLevel: "High", growthTrend: "Growing" },
        { skill: "AWS", demandLevel: "Very High", growthTrend: "Rapidly Growing" },
        { skill: "Python", demandLevel: "High", growthTrend: "Growing" },
        { skill: "DevOps", demandLevel: "Very High", growthTrend: "Rapidly Growing" }
      ],
      personalityFit: [
        { trait: "Technical Communication", matchScore: 70, jobRequirement: "Clear technical documentation and code reviews" },
        { trait: "Team Collaboration", matchScore: 75, jobRequirement: "Agile development and cross-functional teamwork" },
        { trait: "Continuous Learning", matchScore: 80, jobRequirement: "Staying updated with latest technologies and best practices" }
      ],
      careerPathSuggestions: [
        {
          role: "Senior Full Stack Developer",
          timeframe: "2-3 years",
          potentialSalary: "₹12,00,000 - ₹20,00,000",
          requiredSkills: ["Advanced React", "System Architecture", "Team Leadership", "Performance Optimization"]
        },
        {
          role: "Technical Lead",
          timeframe: "4-5 years",
          potentialSalary: "₹20,00,000 - ₹35,00,000",
          requiredSkills: ["System Design", "Team Management", "Product Strategy", "Mentoring"]
        }
      ],
      strengths: [
        "Solid foundation in core programming concepts and problem-solving",
        "Good communication skills suitable for Indian corporate environment",
        "Adaptability and willingness to learn new technologies"
      ],
      weaknesses: [
        "Limited experience with modern JavaScript frameworks and cloud technologies",
        "Needs improvement in system design and scalability concepts"
      ],
      competitiveAdvantage: "Strong fundamentals with good learning potential for the rapidly growing Indian tech market",
      matchScoreReasoning: "Provide a brief and precise explanation (1-2 sentences) for the overall match percentage, focusing on the most significant matching strengths and missing skills."
    };
  }
};
