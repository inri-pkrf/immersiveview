import React, { useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function VideoPlayer({ video }) {
    const convertDriveUrl = (url) => {
        if (!url) return '';
        if (url.includes('drive.google.com/file/d/')) {
            const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return url;
    };

    if (!video) {
        return (
            <div className="h-full bg-black flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-24 h-24 bg-[#1C1C1E] rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-[#3A3A3C]">
                        <Play className="w-12 h-12 text-[#8E8E93]" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-wide karantina-title">בחירת סרטון להצגה</h3>
                    <p className="text-[#8E8E93] font-normal text-lg">יש לבחור סרטון מהספרייה כדי להתחיל</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-black">
            <iframe
                key={video.id} // Re-renders the iframe when the video changes
                src={convertDriveUrl(video.url)}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen"
                title={video.showTitle}
                style={{ 
                    border: 'none',
                    outline: 'none'
                }}
            />
        </div>
    );
}