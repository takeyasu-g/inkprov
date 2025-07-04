// src/pages/HomePage/components/HeroSection.tsx
import React from "react";

interface HeroSectionProps {
  username: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ username }) => (
  <section className="mb-8">
    <h1 className="text-2xl font-bold mb-1">Welcome back, {username}!</h1>
    <p className="text-lg text-muted-foreground">
      See what’s new in your writing community
    </p>
  </section>
);

export default HeroSection;
