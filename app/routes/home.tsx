import type { Route } from "./+types/home";
import Navbar from"~/components/Navbar";
import ResumeCard from"~/components/ResumeCard";
import {resumes} from "../../constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeChecker" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
return <main className="bg-[url('/images/bg-main.svg')]> bg-cover">
  <Navbar />
  <section className="main-section">
    <div className="page-heading py-16 ">
      <h1>Track your applications & Resume Ratings</h1>
      <h2>Review your submissions and check AI-Powered feedback</h2>
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
