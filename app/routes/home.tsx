import type { Route } from "./+types/home";
import react,{useEffect,useState} from 'react';
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "../../constants";
import { usePuterStore } from '../lib/puter';
import { useNavigate } from 'react-router';
import { Link } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumify" },
    { name: "description", content: "AI-powered resume analysis for your career success" },
  ];
}

export default function Home() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  
    useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  return (
    <main className="bg-[url('/images/bg-main-dark.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Transform Your Resume with AI Intelligence</h1>
          <h2>Get instant feedback and optimize your applications for success</h2>
           <Link
  to="/upload"
className="w-fit px-6 py-3 rounded-xl 
           bg-gradient-to-r from-indigo-600 to-indigo-700 
           text-white font-semibold shadow-md 
           hover:from-indigo-700 hover:to-purple-600 
           hover:scale-105 hover:shadow-xl 
           transition-all duration-300 ease-out 
           text-sm sm:text-base md:text-lg"
             
>
  Upload Resume
</Link>
        </div>

        {resumes.length > 0 && (
          <div className="resumes-section my-20">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
