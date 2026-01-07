// src/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-6">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center">
                <p className="text-center sm:text-left text-sm sm:text-base">
                    &copy; {year} VoiceFlow Pro. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
