import React from "react";

const Footer: React.FC = function Footer() {
  return (
    <footer className="flex justify-end bottom-0 left-0 w-full bg-white z-50 p-4 shadow-md md:mt-10 border-t border-t-gray-300">
      {/* Side Links */}
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
    </footer>
  );
};

export default Footer;
