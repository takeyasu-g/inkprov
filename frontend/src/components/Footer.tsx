import React from "react";

const Footer: React.FC = function Footer() {
  return (
    <footer
      className="relative w-full left-0 right-0 bg-[#fef3c7] z-50 py-2 shadow-md"
      style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
    >
      <div className="flex justify-end max-w-screen-xl mx-auto">
        <div className="flex gap-4 items-center text-primary-text mr-6">
          <a href="/about" className="text-md hover:text-hover-text">
            About
          </a>
          <a href="/privacy" className="text-md hover:text-hover-text">
            Privacy
          </a>
          <a href="/terms" className="text-md hover:text-hover-text">
            Terms
          </a>
          <a href="/contact" className="text-md hover:text-hover-text">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
