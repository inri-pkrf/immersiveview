import React, { useState } from 'react';
import VideoLibrary from '../components/VideoLibrary';
import VideoPlayer from '../components/VideoPlayer';
import VideoInfo from '../components/VideoInfo';

export default function VideoLibraryPage() {
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleVideoSelect = (video) => {
        setSelectedVideo(video);
    };

    return (
        <div className="immersive-grid">
            {/* Left Screen - Video Info */}
            <div className="screen-section">
                <VideoInfo 
                    video={selectedVideo}
                />
            </div>

            {/* Center Screen - Video Player */}
            <div className="screen-section">
                <VideoPlayer 
                    video={selectedVideo}
                />
            </div>

            {/* Right Screen - Video Library */}
            <div className="screen-section">
                <VideoLibrary 
                    onVideoSelect={handleVideoSelect}
                    selectedVideo={selectedVideo}
                />
            </div>
        </div>
    );
}