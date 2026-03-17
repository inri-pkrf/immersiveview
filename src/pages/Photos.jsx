import React from 'react';
import { Image } from 'lucide-react';

export default function PhotosPage() {

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8">
            <div className="text-center">
                <Image className="w-24 h-24 text-[#3A3A3C] mx-auto mb-6" />
                <h3 className="text-5xl font-bold text-white mb-2 tracking-wide">ספריית תמונות</h3>
                <p className="text-[#8E8E93] text-xl font-light max-w-2xl mx-auto">
                    כדי להפעיל את ספריית התמונות, יש לספק רשימה של קישורים לתמונות,
                    בדומה לרשימת הסרטונים. לאחר קבלת הנתונים, אבנה כאן גלריה מתקדמת.
                </p>
            </div>
        </div>
    );
}