# AI Resume Analyzer

A modern web application that leverages AI to analyze resumes and provide feedback for job seekers. The application is built using React and utilizes various libraries for routing, state management, and file handling.

## Features

- **AI-Powered Resume Analysis**: Get instant feedback on your resume's effectiveness for specific job applications
- **ATS Compatibility Scoring**: Understand how well your resume performs in Applicant Tracking Systems
- **User-Friendly Interface**: Intuitive design for easy navigation and resume uploads
- **Real-Time Feedback**: Receive immediate suggestions for improving your resume

## Tech Stack

### Frontend

- **React** (v19.1.0) - JavaScript library for building user interfaces
- **React Router** (v7.5.3) - Routing and navigation
- **TypeScript** (v5.8.3) - Typed JavaScript
- **Tailwind CSS** (v4.1.4) - Utility-first CSS framework
- **Vite** (v6.3.3) - Build tool and dev server

### Libraries

- **pdfjs-dist** (v5.3.93) - PDF handling
- **zustand** (v5.0.6) - State management
- **react-dropzone** (v14.3.8) - File upload handling
- **clsx & tailwind-merge** - CSS utility functions

### Backend Integration

- **Puter.com** - Cloud storage and AI services
- **AI Feedback System** - Resume analysis using AI models

## Project Structure

```
ai_resume_app/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ATS.tsx         # ATS score display
│   │   ├── FileUploader.tsx # File upload component
│   │   ├── ResumeCard.tsx   # Resume display card
│   │   └── ...
│   ├── routes/             # Route components
│   │   ├── home.tsx        # Home page
│   │   ├── upload.tsx      # Upload page
│   │   ├── resume.tsx      # Resume analysis page
│   │   └── auth.tsx        # Authentication page
│   ├── lib/               # Utility functions
│   │   ├── puter.ts       # Puter.com integration
│   │   ├── pdf2img.ts     # PDF to image conversion
│   │   └── utils.ts       # Helper functions
│   └── root.tsx            # Root component
├── constants/              # Configuration constants
├── public/                # Static assets
├── types/                 # TypeScript type definitions
└── ...
```

## Installation

1. Clone the repository:

```bash
git clone <https://github.com/youssefkh288/AI_Resume_Checker>
cd ai_resume_app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

## Docker Deployment

Build and run with Docker:

```bash
docker build -t ai-resume-analyzer .
docker run -p 3000:3000 ai-resume-analyzer
```

## Usage

1. **Upload Resume**: Navigate to the upload page and submit your resume along with job details
2. **Receive Feedback**: After analysis, view your resume's ATS score and improvement suggestions
3. **Optimize**: Use the feedback to enhance your resume for better job applications

## Key Components

- **FileUploader**: Handles PDF resume uploads with drag-and-drop support
- **ATS**: Displays ATS compatibility scores and suggestions
- **ResumeCard**: Shows resume details and analysis results
- **ScoreGauge**: Visual representation of resume scores

