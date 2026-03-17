
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Library, Image as ImageIcon } from "lucide-react";

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white" dir="rtl">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Karantina:wght@700&display=swap');
                    
                    :root {
                        --primary-bg: #0A0A0B;
                        --secondary-bg: #1C1C1E;
                        --tertiary-bg: #2C2C2E;
                        --primary-text: #FFFFFF;
                        --secondary-text: #8E8E93;
                        --accent-blue: #007AFF;
                        --accent-blue-hover: #0056CC;
                        --border-color: #3A3A3C;
                    }
                    
                    body {
                        background: radial-gradient(ellipse at top, #1C1C1E 10%, #0A0A0B 70%);
                        background-attachment: fixed;
                    }

                    * {
                        font-family: 'Assistant', -apple-system, BlinkMacSystemFont, sans-serif;
                        scrollbar-width: thin;
                        scrollbar-color: var(--border-color) transparent;
                    }
                    
                    .karantina-title {
                        font-family: 'Karantina', 'Assistant', sans-serif;
                    }

                    *::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    
                    *::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    
                    *::-webkit-scrollbar-thumb {
                        background: var(--border-color);
                        border-radius: 4px;
                    }
                    
                    *::-webkit-scrollbar-thumb:hover {
                        background: #4A4A4C;
                    }
                    
                    .immersive-grid {
                        display: grid;
                        grid-template-columns: 33.33% 33.33% 33.33%;
                        height: 100vh;
                        gap: 1px;
                        background: var(--border-color);
                    }
                    
                    .screen-section {
                        background: var(--primary-bg);
                        overflow: hidden;
                    }
                    
                    .glass-effect {
                        background: rgba(28, 28, 30, 0.8);
                        backdrop-filter: blur(20px);
                        border: 1px solid var(--border-color);
                    }
                    
                    .smooth-transition {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    
                    .glow-effect:hover {
                        box-shadow: 0 0 25px rgba(0, 122, 255, 0.5), 0 0 10px rgba(0, 122, 255, 0.3);
                        transform: scale(1.03);
                    }
                `}
            </style>
            
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-20 glass-effect border-b border-[#3A3A3C]">
                <div className="flex items-center justify-between h-full px-8">
                    <div className="w-1/2 flex justify-end pr-8">
                         <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6885e59152c422c76c31b210/fbe8b0113_.png" alt="Logo" className="w-full h-auto object-contain max-h-16" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            to={createPageUrl("VideoLibrary")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg smooth-transition ${
                                location.pathname === createPageUrl("VideoLibrary") 
                                    ? 'bg-[#007AFF] text-white' 
                                    : 'text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E]'
                            }`}
                        >
                            <Library className="w-4 h-4" />
                            <span className="font-normal">ספריית סרטונים</span>
                        </Link>
                        
                        <Link 
                            to={createPageUrl("Photos")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg smooth-transition ${
                                location.pathname === createPageUrl("Photos") 
                                    ? 'bg-[#007AFF] text-white' 
                                    : 'text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E]'
                            }`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span className="font-normal">ספריית תמונות</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-20">
                {children}
            </div>
        </div>
    );
}

