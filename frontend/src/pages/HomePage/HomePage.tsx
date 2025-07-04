import React from "react";
import ContributedSessionsCarousel from "./components/ContributedSessionsCarousel";
import StoryCarousel from "./components/StoryCarousel";
import JoinSessionCarousel from "./components/JoinSessionCarousel";
import HeroSection from "./components/HeroSection";

const HomePage: React.FC = () => {
  return (
    <>
      <main className="min-h-screen p-4 md:p-6 lg:p-8 space-y-12">
        {/* Hero Section into to Home page */}
        <section>
          <HeroSection username="James"></HeroSection>
        </section>

        {/* Sessions You Contributed To */}
        <section>
          <h2 className="text-xl font-bold mb-2">Your Active Sessions</h2>
          <ContributedSessionsCarousel
            contributedSessions={contributedSessions}
          />
        </section>

        {/* Stories to Read */}
        <section>
          <h2 className="text-xl font-bold mb-2">Stories to Read</h2>
          <StoryCarousel stories={stories} />
        </section>

        {/* Looking for a Session to Join */}
        <section>
          <h2 className="text-xl font-bold mb-2">
            Looking for a Session to Join?
          </h2>
          <JoinSessionCarousel sessions={sessions} />
        </section>
      </main>
    </>
  );
};

export default HomePage;
