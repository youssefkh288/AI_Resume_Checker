import type { Route } from "./+types/home";
import Navbar from"~/components/Navbar";
import ResumeCard from"~/components/ResumeCard";
import {resumes} from "../../constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumify" },
    { name: "description", content: "AI-powered resume analysis for your career success" },
  ];
}

export default function Home() {
return <main className="bg-[url('/images/bg-main-dark.svg')] bg-cover">
  <Navbar />
  <section className="main-section">
    <div className="page-heading py-16 ">
      <h1>Transform Your Resume with AI Intelligence</h1>
      <h2>Get instant feedback and optimize your applications for success</h2>
    </div>
 

  {resumes.length >0 && (
  <div className="resumes-section my-20">
  {resumes.map((resume) =>(
 <ResumeCard key = {resume.id} resume = {resume}/>
    ))}
  </div>
  )}
 </section>
</main>
}
