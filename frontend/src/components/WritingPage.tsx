//
//  WritingPage.tsx
//  inkprov
//
//  Created by Damien Lavizzo on 3/8/25.
//
// Container page for WritingEditor.tsx
// WritingEditor should not be called directly

import { useParams } from "react-router-dom";
import { WritingEditor } from "./navigation_pages/WritingEditor";

export default function WritingPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-primary-text mb-6">
          Continue the Story
        </h1>

        {projectId ? (
          <WritingEditor projectId={projectId} />
        ) : (
          <p className="text-secondary-text">
            No project selected. Please go back and select a project.
          </p>
        )}
      </div>
    </div>
  );
}
