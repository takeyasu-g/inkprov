// src/pages/HomePage/components/HeroSection.tsx
import React from "react";

interface HeroSectionProps {
  username: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ username }) => {
  // Extract username from email if it contains @ symbol
  const displayName = username.includes('@') 
    ? username.split('@')[0] // Get part before @
    : username || "User"; // Use provided username or fallback to "User"

  return (
    <section className="mb-8">
      <h1 className="text-2xl font-bold mb-1">Welcome back, {displayName}!</h1>
      <p className="text-lg text-muted-foreground">
        See what's new in your writing community
      </p>
    </section>
  );
};

export default HeroSection;
