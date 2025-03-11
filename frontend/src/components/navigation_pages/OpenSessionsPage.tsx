import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const OpenSessionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">
            Open Writing Sessions
          </h1>
          <p className="text-secondary-text mt-2">
            Join an existing session or create your own.
          </p>
        </div>
        <Button
          onClick={() => navigate("/sessions/create")}
          className="bg-primary-button hover:bg-primary-button-hover"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Session
        </Button>
      </div>

      {/* More placeholder content - to be replaced with actual session list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-background rounded-lg p-6 shadow-sm border border-primary-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-primary-text">
              Creative Writing Workshop
            </h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Open
            </span>
          </div>
          <p className="text-secondary-text mb-4">
            Join our weekly creative writing workshop. All skill levels welcome!
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-text">
              2/5 participants
            </span>
            <Button
              className="bg-primary-button hover:bg-primary-button-hover"
              onClick={() => navigate("/sessions/1")}
            >
              Join Session
            </Button>
          </div>
        </div>

        <div className="bg-background rounded-lg p-6 shadow-sm border border-primary-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-primary-text">
              Poetry Collaboration
            </h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Open
            </span>
          </div>
          <p className="text-secondary-text mb-4">
            Collaborative poetry writing session. Share and create together.
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-text">
              3/5 participants
            </span>
            <Button
              className="bg-primary-button hover:bg-primary-button-hover"
              onClick={() => navigate("/sessions/2")}
            >
              Join Session
            </Button>
          </div>
        </div>

        <div className="bg-background rounded-lg p-6 shadow-sm border border-primary-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-primary-text">
              Story Development
            </h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Starting Soon
            </span>
          </div>
          <p className="text-secondary-text mb-4">
            Work on character development and plot structure together.
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-text">
              1/5 participants
            </span>
            <Button
              className="bg-primary-button hover:bg-primary-button-hover"
              onClick={() => navigate("/sessions/3")}
            >
              Join Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenSessionsPage;
