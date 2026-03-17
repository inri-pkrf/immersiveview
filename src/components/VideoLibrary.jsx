
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
        <div className="flex-1 min-w-[150px]">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <h4 className="text-lg font-normal text-white">{title}:</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
                <Badge
                    variant={selectedTags[type] === '' ? "default" : "outline"}
                    className={`cursor-pointer text-base font-normal smooth-transition ${
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
                        className={`cursor-pointer text-base font-normal smooth-transition ${
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
                <div className="p-4 border-b border-[#3A3A3C] flex-shrink-0">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-wide karantina-title">ספריית סרטונים</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-400 text-lg mb-4">{error}</div>
                        <button 
                            onClick={() => loadVideos(0)}
                            className="bg-[#007AFF] text-white px-6 py-3 rounded-lg hover:bg-[#0056CC] transition-colors"
                        >
                            נסה שוב
                        </button>
                        {retryCount > 0 && (
                            <div className="text-[#8E8E93] mt-2 text-sm">
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
            <div className="p-4 border-b border-[#3A3A3C] flex-shrink-0">
                <h2 className="text-4xl font-bold text-white mb-4 tracking-wide karantina-title">ספריית סרטונים</h2>
                
                <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                    <Input
                        placeholder="חיפוש סרטונים..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#1C1C1E] border-[#3A3A3C] text-white text-lg pr-10 placeholder:text-[#8E8E93] h-12 font-normal"
                    />
                </div>
                
                <div className="flex flex-row flex-wrap gap-4">
                    <TagFilter type="emergency" title="חירום" icon={<AlertTriangle className="w-5 h-5 text-red-400" />} data={availableTags.emergency} />
                    <TagFilter type="location" title="מיקום" icon={<MapPin className="w-5 h-5 text-blue-400" />} data={availableTags.location} />
                    <TagFilter type="date" title="תאריך" icon={<Calendar className="w-5 h-5 text-green-400" />} data={availableTags.date} />
                </div>

                {retryCount > 0 && (
                    <div className="mt-4 text-[#8E8E93] text-sm">
                        טוען נתונים... (ניסיון {retryCount}/3)
                    </div>
                )}
            </div>

            {/* Video Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-3 gap-3">
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
                                    <div className="p-2">
                                        <div className="aspect-video bg-[#2C2C2E] rounded-md overflow-hidden mb-2 relative">
                                            {video.thumbnail ? (
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.showTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play className="w-8 h-8 text-[#8E8E93]" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-normal text-white text-lg line-clamp-2 group-hover:text-[#007AFF] smooth-transition mb-1 h-12">
                                            {video.showTitle}
                                        </h3>
                                        
                                        <div className="flex items-center gap-1.5 text-sm text-[#8E8E93]">
                                            <Calendar className="w-3 h-3" />
                                            <span className="font-light">{video.date}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {!isLoading && filteredVideos.length === 0 && (
                             <div className="col-span-3 text-center py-12">
                                <div className="text-[#8E8E93] text-lg font-normal mb-2">לא נמצאו סרטונים</div>
                                <div className="text-[#8E8E93] text-sm font-light">יש לנסות לשנות את מונחי החיפוש או הסינון</div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
