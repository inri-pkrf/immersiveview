import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoInfo({ video }) {

    if (!video) {
        return (
            <div className="h-full bg-[#0A0A0B] flex items-center justify-center p-[clamp(1.5rem,2vw,5rem)]">
                <div className="text-center">
                    <BookOpen className="w-[clamp(4rem,5vw,12rem)] h-[clamp(4rem,5vw,12rem)] text-[#3A3A3C] mx-auto mb-[clamp(1rem,1.5625vw,3.5rem)]" />
                    <h3 className="text-[clamp(2rem,2.6vw,7rem)] font-bold text-white mb-2 tracking-wide karantina-title">בחירת סרטון להצגה</h3>
                    <p className="text-[#8E8E93] text-[clamp(0.875rem,1.042vw,2.5rem)] font-normal">פרטים נוספים יוצגו כאן לאחר בחירת סרטון</p>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    // תגיות חירום מורשות בלבד
    const allowedEmergencyTags = [
        "אתר הרס", "פגיעת טיל", "שברים ורסיסים", "חפ\"ק", "יירוטים", 
        "התמגנות", "מחאה", "אזעקה", "שריפה", "חילוץ"
    ];

    const TagSection = ({ icon, tags, colorClass, shadowClass }) => {
        let filteredTags = tags;
        if (icon.type === AlertTriangle) {
            filteredTags = tags?.filter(tag => allowedEmergencyTags.includes(tag));
        }
        if (!filteredTags || filteredTags.length === 0) return null;
        
        return (
            <motion.div variants={itemVariants} className="flex items-start gap-[clamp(0.75rem,0.78vw,1.5rem)]">
                <div className={`mt-[clamp(0.375rem,0.39vw,0.75rem)] p-[clamp(0.5rem,0.52vw,1.25rem)] rounded-full bg-gradient-to-tr ${colorClass}`}>
                    {icon}
                </div>
                <div className="flex flex-wrap gap-[clamp(0.5rem,0.52vw,1.25rem)]">
                    {filteredTags.map((tag, i) => (
                        <Badge key={i} className={`text-[clamp(0.875rem,0.9375vw,2.5rem)] font-normal border border-white/10 bg-white/5 text-white/80`}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={video.id}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="h-full bg-[#0A0A0B] flex flex-col justify-between p-[clamp(1.5rem,2vw,5rem)] overflow-y-auto"
            >
                <div/>
                
                <div className="flex flex-col gap-[clamp(1.5rem,2vw,5rem)] text-center">
                    <motion.h2 variants={itemVariants} className="text-[clamp(2.5rem,3.75vw,10rem)] font-bold text-white tracking-wide karantina-title">
                        {video.showTitle}
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-[clamp(1rem,1.25vw,3.5rem)] text-[#a1a1aa] font-normal leading-relaxed max-w-2xl mx-auto">
                        {video.description}
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex flex-col gap-[clamp(1rem,1.5625vw,4rem)]">
                    <TagSection 
                        icon={<AlertTriangle className="w-[clamp(1.25rem,1.042vw,2.5rem)] h-[clamp(1.25rem,1.042vw,2.5rem)] text-white"/>} 
                        tags={video.tags?.emergency}
                        colorClass="from-red-500/50 to-orange-500/50"
                    />
                    <TagSection 
                        icon={<MapPin className="w-[clamp(1.25rem,1.042vw,2.5rem)] h-[clamp(1.25rem,1.042vw,2.5rem)] text-white"/>} 
                        tags={video.tags?.location}
                        colorClass="from-blue-500/50 to-cyan-500/50"
                    />
                    <TagSection 
                        icon={<Calendar className="w-[clamp(1.25rem,1.042vw,2.5rem)] h-[clamp(1.25rem,1.042vw,2.5rem)] text-white"/>} 
                        tags={video.tags?.date}
                        colorClass="from-emerald-500/50 to-green-500/50"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}