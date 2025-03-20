import React from "react";
import { Button } from "@/components/ui/button";
import { Feather, BookOpen, Users } from "lucide-react";
import groupWritingImg from "../../assets/group-writing.png";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartWriting = () => {
    if (isAuthenticated) {
      navigate("/sessions");
    } else {
      navigate("/login");
    }
  };

  return (
    <main className="flex flex-col justify-center items-center pb-10">
      {/* Hero Section */}
      <section className="flex flex-col">
        <header className="text-center flex flex-col items-center ">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-8 text-primary-text">
            Write Together
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-primary-text ">
            Create Together
          </h1>
          <p className=" md:text-lg mb-8 text-secondary-text w-[60%]">
            Join a community of writers and collaborate on stories, poems, and
            more in real-time.
          </p>
        </header>
        <section className="flex gap-4 mb-8 justify-center">
          <Button
            className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
            variant="default"
            onClick={handleStartWriting}
          >
            Start Writing
          </Button>
          <Button
            className="bg-secondary-button text-secondary-text hover:bg-secondary-button-hover border border-primary-border cursor-pointer"
            variant="default"
            onClick={() => navigate("/stories")}
          >
            Explore Stories
          </Button>
        </section>
      </section>
      <section
        className="relative flex flex-col items-center bg-accent text-primary-text
  before:absolute before:bottom-0 before:left- before:-translate-x-1/2 before:w-screen before:h-px before:bg-accent 
  after:absolute after:inset-y-0 after:left-1/2 after:-translate-x-1/2 after:w-screen after:-z-10 after:bg-accent"
      >
        <h2 className="text-3xl font-bold mt-9 mb-9">How Inkprov Works</h2>
        <section className="w-full flex flex-col md:flex-row md:justify-around md:max-w-screen-xl mb-8">
          {/* Join a Session */}
          <article className="flex flex-col items-center gap-4 mb-8 ">
            <div className="rounded-full bg-tertiary-background p-4">
              <Users />
            </div>
            <p className="text-lg font-bold">Join a Session</p>
            <p className="text-md text-center w-[80%]">
              Find an open writing session that matches your interests or create
              your own.
            </p>
          </article>
          <article className="flex flex-col items-center gap-4 mb-8">
            <div className="rounded-full bg-tertiary-background p-4">
              <Feather />
            </div>
            <p className="text-lg font-bold">Write Together</p>
            <p className="text-md text-center w-[80%]">
              Collaborate in real-time with other writers to create something
              beautiful.
            </p>
          </article>
          <article className="flex flex-col items-center gap-4 mb-8">
            <div className="rounded-full bg-tertiary-background p-4">
              <BookOpen />
            </div>
            <p className="text-lg font-bold">Share & Discover</p>
            <p className="text-md text-center w-[80%]">
              Publish your collaborative works and explore creations from other
              writers.
            </p>
          </article>
        </section>
      </section>
      {/* Bottom Hero Section */}
      <section className="flex flex-col items-center lg:flex-row justify-around w-[90%] text-left mb-20">
        {/* Feature Description */}
        <article className="w-[80%] md:w-[70%] lg:w-[30vw] text-center">
          <h2 className="text-3xl font-bold mt-9 mb-9 text-primary-text">
            A Cozy Space for Creative Minds
          </h2>
          <p className="text-lg mb-8 text-secondary-text ">
            Inkprov provides a warm, inviting environment that feels like
            writing in your favorite reading nook. Our platform is designed to
            inspire creativity and foster collaboration.
          </p>
          <ul className="list-disc list-inside marker:text-amber-500">
            <li className="text-secondary-text">
              Real-time collaborative writing
            </li>
            <li className="text-secondary-text">
              Idea prompts for when you need inspiration
            </li>
            <li className="text-secondary-text">
              Genre-based sessions and filtering
            </li>
            <li className="text-secondary-text">
              Community feedback and reactions
            </li>
          </ul>
        </article>
        {/* Image */}
        <div className="relative w-[80%] md:w-[60%] lg:w-120 mt-20 ">
          {/* Styled Borders */}
          <div className="absolute -inset-4 rounded-lg bg-tertiary-background rotate-2"></div>
          <div className="relative w-full h-64 md:h-84 lg:h-84 rounded-lg border-8 border-white bg-white shadow-lg overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${groupWritingImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
