
export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Netflix",
    jobTitle: "Senior Frontend Engineer",
    imagePath: "/images/resume-1.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 92,
      ATS: {
        score: 95,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 88,
        tips: [],
      },
      structure: {
        score: 94,
        tips: [],
      },
      skills: {
        score: 93,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Spotify",
    jobTitle: "Full Stack Developer",
    imagePath: "/images/resume-2.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 78,
      ATS: {
        score: 85,
        tips: [],
      },
      toneAndStyle: {
        score: 80,
        tips: [],
      },
      content: {
        score: 75,
        tips: [],
      },
      structure: {
        score: 82,
        tips: [],
      },
      skills: {
        score: 84,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Tesla",
    jobTitle: "Software Engineer",
    imagePath: "/images/resume-3.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 88,
        tips: [],
      },
      toneAndStyle: {
        score: 82,
        tips: [],
      },
      content: {
        score: 87,
        tips: [],
      },
      structure: {
        score: 85,
        tips: [],
      },
      skills: {
        score: 89,
        tips: [],
      },
    },
  }, 
  {
    id: "4",
    companyName: "Airbnb",
    jobTitle: "Product Manager",
    imagePath: "/images/resume-1.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 67,
      ATS: {
        score: 72,
        tips: [],
      },
      toneAndStyle: {
        score: 65,
        tips: [],
      },
      content: {
        score: 70,
        tips: [],
      },
      structure: {
        score: 68,
        tips: [],
      },
      skills: {
        score: 71,
        tips: [],
      },
    },
  },
  {
    id: "5",
    companyName: "Uber",
    jobTitle: "Data Scientist",
    imagePath: "/images/resume-2.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 89,
      ATS: {
        score: 92,
        tips: [],
      },
      toneAndStyle: {
        score: 87,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 88,
        tips: [],
      },
      skills: {
        score: 91,
        tips: [],
      },
    },
  },
  {
    id: "6",
    companyName: "Stripe",
    jobTitle: "DevOps Engineer",
    imagePath: "/images/resume-3.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 73,
      ATS: {
        score: 78,
        tips: [],
      },
      toneAndStyle: {
        score: 75,
        tips: [],
      },
      content: {
        score: 72,
        tips: [],
      },
      structure: {
        score: 76,
        tips: [],
      },
      skills: {
        score: 79,
        tips: [],
      },
    },
  },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  AIResponseFormat,
}: {
  jobTitle: string;
  jobDescription: string;
  AIResponseFormat: string;
}) =>
  `You are an expert resume analyst and career coach with deep knowledge of modern hiring practices and ATS (Applicant Tracking System) optimization.

Please provide a comprehensive analysis of this resume, focusing on its effectiveness for the target position. Be thorough and constructive in your feedback.

Key Analysis Areas:
- ATS Compatibility: How well the resume will perform in automated screening systems
- Content Quality: Relevance, impact, and clarity of achievements and experiences
- Structure & Format: Organization, readability, and professional presentation
- Skills Alignment: Match between candidate skills and job requirements
- Tone & Style: Professional voice and appropriate language for the industry

Rating Guidelines:
- 90-100: Exceptional resume that stands out significantly
- 80-89: Strong resume with minor areas for improvement
- 70-79: Good resume with several improvement opportunities
- 60-69: Average resume requiring substantial enhancements
- Below 60: Resume needs significant restructuring and improvement

Target Position: ${jobTitle}
Job Description: ${jobDescription}

Provide detailed, actionable feedback using this format: ${AIResponseFormat}

Return the analysis as a clean JSON object without any additional text or formatting.`;