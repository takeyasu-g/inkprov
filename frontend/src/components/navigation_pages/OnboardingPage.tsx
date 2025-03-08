// src/components/navigation_pages/OnboardingPage.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OnboardingPageProps {
  userName?: string;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({
  userName = "Writer",
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary-text mb-6">
        Welcome to Inkprov, {userName}!
      </h1>

      <div className="bg-background border border-primary-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-text mb-4">
          Your Collaborative Writing Journey Starts Here
        </h2>
        <p className="text-primary-text mb-4">
          Inkprov is a platform for writers to collaborate on stories, one
          snippet at a time. Each writer contributes 100 words to continue the
          narrative, creating unique and unexpected storylines through
          collective imagination.
        </p>
        <p className="text-primary-text mb-4">Here's how to get started:</p>
        <ul className="list-disc pl-6 mb-6 text-primary-text">
          <li className="mb-2">
            Browse existing projects in the <strong>Projects</strong> tab
          </li>
          <li className="mb-2">
            Join a writing session in the <strong>Sessions</strong> tab
          </li>
          <li className="mb-2">
            Or create your own project with the <strong>Create</strong> button
          </li>
        </ul>

        <div className="flex gap-4 mt-6">
          <Button
            className="bg-primary-button hover:bg-primary-button-hover"
            onClick={() => navigate("/projects")}
          >
            Browse Projects
          </Button>
          <Button
            className="bg-primary-button hover:bg-primary-button-hover"
            onClick={() => navigate("/create")}
          >
            Create a Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-primary-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-primary-text mb-2">
            Collaborative Writing
          </h3>
          <p className="text-secondary-text">
            Take turns adding to stories with other writers from around the
            world.
          </p>
        </div>
        <div className="border border-primary-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-primary-text mb-2">
            Creative Freedom
          </h3>
          <p className="text-secondary-text">
            Each writer has complete freedom for their contribution within the
            word limit.
          </p>
        </div>
        <div className="border border-primary-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-primary-text mb-2">
            Unexpected Stories
          </h3>
          <p className="text-secondary-text">
            Watch as narratives evolve in surprising directions through
            collective creativity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
