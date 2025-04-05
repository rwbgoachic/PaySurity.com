import { useEffect } from "react";
import ProjectDependencies from "@/components/project-dependencies";

export default function ProjectDependenciesPage() {
  // SEO Optimization
  useEffect(() => {
    document.title = "Project Dependencies - Paysurity";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <ProjectDependencies />
      </div>
    </div>
  );
}