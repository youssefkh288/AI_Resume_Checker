import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumify" },
    { name: "description", content: "AI-powered resume analysis for your career success" },
  ];
}

export default function Home() {
  const { auth, isLoading,fs,kv } = usePuterStore();
  const navigate = useNavigate();
  const[resumeUrl,setResumeUrl]=useState('');
  const[resumes,setResumes]= useState<Resume[]>([]);
  const [loadingResumes,setLoadingResumes] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))
      console.log("ParsedResumes", parsedResumes)
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes()
  }, []);

    useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])



  return (
    <main className="bg-[url('/images/bg-main-dark.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Transform Your Resume with AI Intelligence</h1>
          {!loadingResumes && resumes?.length ===0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ):(
            <h2>Review your submissions and check AI-Powered feedback.</h2>
          )}
          {loadingResumes&&(
            <div className="flex flex-col items-center justify-center">
              <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
            </div>
          )}

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

        {!loadingResumes &&resumes.length > 0 && (
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
