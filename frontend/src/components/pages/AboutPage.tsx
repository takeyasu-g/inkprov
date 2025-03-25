import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl tracking-tight font-extrabold text-primary-text sm:text-5xl md:text-5xl">
            About Inkprov
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-secondary-text sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Collaborative storytelling for creative minds
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-secondary-text">
              <p>
                Inkprov is a platform designed to bring writers together in a
                unique collaborative environment. We believe that the best
                stories are often told through multiple perspectives, and our
                platform makes it possible for writers to create together in
                real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-secondary-text">
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    1
                  </span>
                  Create a writing session and set your parameters
                </p>
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    2
                  </span>
                  Write your initial contribution (50-100 words)
                </p>
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    3
                  </span>
                  Share your session with other writers
                </p>
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    4
                  </span>
                  Watch as your story grows with each contribution
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-secondary-text">
                We strive to maintain a respectful and creative environment. All
                contributors are expected to:
              </p>
              <ul className="space-y-3 text-secondary-text">
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  Respect other writers' creative choices
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  Mark mature content appropriately
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  Provide constructive feedback
                </li>
                <li className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-tertiary-background text-primary-text">
                    ✓
                  </span>
                  Follow the word count guidelines
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary-text">
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-text">
                Have questions or suggestions? We'd love to hear from you. Reach
                out to our team at{" "}
                <a
                  href="mailto:support@inkprov.net"
                  className="text-hover-text hover:text-amber-500 underline"
                >
                  support@inkprov.net
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
