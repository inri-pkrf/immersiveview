import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Video } from '@/entities/Video';
import { Search, Play, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

export default function VideoLibrary({ onVideoSelect, selectedVideo }) {
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // תגיות חירום מורשות בלבד - עטוף ב-useMemo למניעת יצירה מחדש בכל רינדור
    const allowedEmergencyTags = useMemo(() => [
        "אתר הרס", "פגיעת טיל", "שברים ורסיסים", "חפ\"ק", "יירוטים", 
        "התמגנות", "מחאה", "אזעקה", "שריפה", "חילוץ"
    ], []);

    const [availableTags, setAvailableTags] = useState({ emergency: [], location: [], date: [] });
    const [selectedTags, setSelectedTags] = useState({ emergency: '', location: '', date: '' });

    // פונקציה לחכות זמן מסוים לפני ניסיון חוזר
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const loadVideos = useCallback(async (retryAttempt = 0) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // אם זה ניסיון חוזר, נחכה זמן מסוים
            if (retryAttempt > 0) {
                const waitTime = Math.min(1000 * Math.pow(2, retryAttempt), 10000); // exponential backoff עד 10 שניות
                await delay(waitTime);
            }

            const videoList = await Video.list('-created_date');
            
            const emergency = new Set();
            const location = new Set();
            const date = new Set();

            videoList.forEach(video => {
                video.tags?.emergency?.forEach(tag => {
                    if (allowedEmergencyTags.includes(tag)) {
                        emergency.add(tag);
                    }
                });
                video.tags?.location?.forEach(tag => {
                    // מסנן תגיות מיקום לא רצויות
                    if (tag && !tag.includes("הארץ") && tag !== "שמי הארץ" && tag !== "צפון") {
                        location.add(tag);
                    }
                });
                video.tags?.date?.forEach(tag => date.add(tag));
            });
            
            setAvailableTags({
                emergency: Array.from(emergency),
                location: Array.from(location),
                date: Array.from(date).sort().reverse(),
            });

            setVideos(videoList);
            setRetryCount(0); // איפוס מספר הניסיונות בהצלחה
            
        } catch (error) {
            console.error('Error loading videos:', error);
            
            // אם זו שגיאת Rate Limit ויש פחות מ-3 ניסיונות
            if (error.message?.includes('429') || error.message?.includes('Rate limit') && retryAttempt < 3) {
                console.log(`Rate limit hit, retrying in ${Math.pow(2, retryAttempt + 1)} seconds... (attempt ${retryAttempt + 1})`);
                setRetryCount(retryAttempt + 1);
                setTimeout(() => {
                    loadVideos(retryAttempt + 1);
                }, 1000 * Math.pow(2, retryAttempt + 1)); // exponential backoff
                return;
            }
            
            setError('שגיאה בטעינת הסרטונים. נסה לרענן את העמוד.');
        }
        setIsLoading(false);
    }, [allowedEmergencyTags]);

    useEffect(() => {
        // טעינה ראשונית עם דיליי קטן למניעת קריאות מרובות
        const timeoutId = setTimeout(() => {
            loadVideos();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [loadVideos]);

    const handleTagSelect = (type, tag) => {
        setSelectedTags(prev => ({
            ...prev,
            [type]: prev[type] === tag ? '' : tag
        }));
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = !searchTerm || 
            video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.showTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesEmergency = !selectedTags.emergency || 
            (video.tags?.emergency?.filter(tag => allowedEmergencyTags.includes(tag)).includes(selectedTags.emergency));
        const matchesLocation = !selectedTags.location || video.tags?.location?.includes(selectedTags.location);
        const matchesDate = !selectedTags.date || video.tags?.date?.includes(selectedTags.date);
        
        return matchesSearch && matchesEmergency && matchesLocation && matchesDate;
    });
    
    const TagFilter = ({ type, title, icon, data }) => (
        <div className="flex-1 min-w-[clamp(120px,12vw,350px)]">
            <div className="flex items-center gap-[clamp(0.375rem,0.52vw,1rem)] mb-[clamp(0.375rem,0.52vw,1rem)]">
                {icon}
                <h4 className="text-[clamp(0.875rem,0.9375vw,2.5rem)] font-normal text-white">{title}:</h4>
            </div>
            <div className="flex flex-wrap gap-[clamp(0.375rem,0.52vw,1rem)]">
                <Badge
                    variant={selectedTags[type] === '' ? "default" : "outline"}
                    className={`cursor-pointer text-[clamp(0.75rem,0.833vw,2rem)] font-normal smooth-transition ${
                        selectedTags[type] === '' 
                            ? 'bg-[#007AFF] text-white' 
                            : `border-[#3A3A3C] text-[#8E8E93] hover:bg-[#1C1C1E] hover:border-[#007AFF]/50`
                    }`}
                    onClick={() => handleTagSelect(type, '')}
                >
                    הכל
                </Badge>
                {data.map(tag => (
                    <Badge
                        key={tag}
                        variant={selectedTags[type] === tag ? "default" : "outline"}
                        className={`cursor-pointer text-[clamp(0.75rem,0.833vw,2rem)] font-normal smooth-transition ${
                            selectedTags[type] === tag 
                                ? 'bg-[#007AFF] text-white' 
                                : `border-[#3A3A3C] text-[#8E8E93] hover:bg-[#1C1C1E] hover:border-[#007AFF]/50`
                        }`}
                        onClick={() => handleTagSelect(type, tag)}
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
    );

    // הצגת שגיאה אם קיימת
    if (error) {
        return (
            <div className="h-screen bg-[#0A0A0B] flex flex-col">
                <div className="p-[clamp(1rem,1.04vw,2.5rem)] border-b border-[#3A3A3C] flex-shrink-0">
                    <h2 className="text-[clamp(1.75rem,1.875vw,5rem)] font-bold text-white mb-[clamp(1rem,1.04vw,2.5rem)] tracking-wide karantina-title">ספריית סרטונים</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-400 text-[clamp(0.875rem,0.9375vw,2.5rem)] mb-[clamp(1rem,1.04vw,2.5rem)]">{error}</div>
                        <button 
                            onClick={() => loadVideos(0)}
                            className="bg-[#007AFF] text-white px-[clamp(1.5rem,1.5625vw,4rem)] py-[clamp(0.75rem,0.78vw,2rem)] rounded-lg hover:bg-[#0056CC] transition-colors text-[clamp(0.875rem,0.9375vw,2.5rem)]"
                        >
                            נסה שוב
                        </button>
                        {retryCount > 0 && (
                            <div className="text-[#8E8E93] mt-[clamp(0.5rem,0.52vw,1.25rem)] text-[clamp(0.625rem,0.625vw,1.5rem)]">
                                מנסה שוב... (ניסיון {retryCount}/3)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0A0A0B] flex flex-col">
            {/* Header */}
            <div className="p-[clamp(1rem,1.04vw,2.5rem)] border-b border-[#3A3A3C] flex-shrink-0">
                <h2 className="text-[clamp(1.75rem,1.875vw,5rem)] font-bold text-white mb-[clamp(1rem,1.04vw,2.5rem)] tracking-wide karantina-title">ספריית סרטונים</h2>
                
                <div className="relative mb-[clamp(0.75rem,1.04vw,2.5rem)]">
                    <Search className="absolute right-[clamp(0.75rem,0.78vw,1.5rem)] top-1/2 transform -translate-y-1/2 w-[clamp(1rem,0.833vw,2rem)] h-[clamp(1rem,0.833vw,2rem)] text-[#8E8E93]" />
                    <Input
                        placeholder="חיפוש סרטונים..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#1C1C1E] border-[#3A3A3C] text-white text-[clamp(0.875rem,0.9375vw,2.5rem)] pr-[clamp(2.5rem,2.6vw,5rem)] placeholder:text-[#8E8E93] h-[clamp(2.5rem,2.5vw,5rem)] font-normal"
                    />
                </div>
                
                <div className="flex flex-row flex-wrap gap-[clamp(0.75rem,1.04vw,2.5rem)]">
                    <TagFilter type="emergency" title="חירום" icon={<AlertTriangle className="w-[clamp(1.25rem,1.042vw,2.5rem)] h-[clamp(1.25rem,1.042vw,2.5rem)] text-red-400" />} data={availableTags.emergency} />
                    <TagFilter type="location" title="מיקום" icon={<MapPin className="w-[clamp(1.25rem,1.042vw,2.5rem)] h-[clamp(1.25rem,1.042vw,2.5rem)] text-blue-400" />} data={availableTags.location} />
                    <TagFilter type="date" title="תאריך" icon={<Calendar className="w-[clamp(1.25rem,1.042vw,2.5rem)] h-[clamp(1.25rem,1.042vw,2.5rem)] text-green-400" />} data={availableTags.date} />
                </div>

                {retryCount > 0 && (
                    <div className="mt-[clamp(1rem,1.04vw,2.5rem)] text-[#8E8E93] text-[clamp(0.625rem,0.625vw,1.5rem)]">
                        טוען נתונים... (ניסיון {retryCount}/3)
                    </div>
                )}
            </div>

            {/* Video Grid */}
            <div className="flex-1 overflow-y-auto p-[clamp(1rem,1.04vw,2.5rem)]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-[clamp(2rem,1.667vw,4rem)] w-[clamp(2rem,1.667vw,4rem)] border-b-2 border-[#007AFF]"></div>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-4 gap-[clamp(0.5rem,0.625vw,1.5rem)]">
                        <AnimatePresence>
                            {filteredVideos.map((video) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    key={video.id}
                                    onClick={() => onVideoSelect(video)}
                                    className={`group cursor-pointer rounded-lg border smooth-transition glow-effect ${
                                        selectedVideo?.id === video.id
                                            ? 'border-[#007AFF] bg-[#007AFF]/10'
                                            : 'border-[#3A3A3C] bg-[#1C1C1E] hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5'
                                    }`}
                                >
                                    <div className="p-[clamp(0.375rem,0.52vw,1rem)]">
                                        <div className="aspect-video bg-[#2C2C2E] rounded-md overflow-hidden mb-[clamp(0.375rem,0.52vw,1rem)] relative">
                                            {video.thumbnail ? (
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.showTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play className="w-[clamp(1.5rem,1.667vw,4rem)] h-[clamp(1.5rem,1.667vw,4rem)] text-[#8E8E93]" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-normal text-white text-[clamp(0.75rem,0.833vw,2rem)] line-clamp-2 group-hover:text-[#007AFF] smooth-transition mb-[clamp(0.25rem,0.26vw,0.625rem)] h-[clamp(2.5rem,2.5vw,6rem)]">
                                            {video.showTitle}
                                        </h3>
                                        
                                        <div className="flex items-center gap-[clamp(0.25rem,0.26vw,0.625rem)] text-[clamp(0.625rem,0.625vw,1.5rem)] text-[#8E8E93]">
                                            <Calendar className="w-[clamp(0.625rem,0.625vw,1.5rem)] h-[clamp(0.625rem,0.625vw,1.5rem)]" />
                                            <span className="font-light">{video.date}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {!isLoading && filteredVideos.length === 0 && (
                             <div className="col-span-3 text-center py-12">
                                <div className="text-[#8E8E93] text-[clamp(0.875rem,0.9375vw,2.5rem)] font-normal mb-2">לא נמצאו סרטונים</div>
                                <div className="text-[#8E8E93] text-[clamp(0.625rem,0.625vw,1.5rem)] font-light">יש לנסות לשנות את מונחי החיפוש או הסינון</div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}