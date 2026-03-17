import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoInfo({ video }) {

    if (!video) {
        return (
            <div className="h-full bg-[#0A0A0B] flex items-center justify-center p-8">
                <div className="text-center">
                    <BookOpen className="w-24 h-24 text-[#3A3A3C] mx-auto mb-6" />
                    <h3 className="text-5xl font-bold text-white mb-2 tracking-wide karantina-title">בחירת סרטון להצגה</h3>
                    <p className="text-[#8E8E93] text-xl font-normal">פרטים נוספים יוצגו כאן לאחר בחירת סרטון</p>
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
            <motion.div variants={itemVariants} className="flex items-start gap-3">
                <div className={`mt-1.5 p-2 rounded-full bg-gradient-to-tr ${colorClass}`}>
                    {icon}
                </div>
                <div className="flex flex-wrap gap-2">
                    {filteredTags.map((tag, i) => (
                        <Badge key={i} className={`text-lg font-normal border border-white/10 bg-white/5 text-white/80`}>
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
                className="h-full bg-[#0A0A0B] flex flex-col justify-between p-8 overflow-y-auto"
            >
                <div/>
                
                <div className="flex flex-col gap-8 text-center">
                    <motion.h2 variants={itemVariants} className="text-7xl font-bold text-white tracking-wide karantina-title">
                        {video.showTitle}
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-2xl text-[#a1a1aa] font-normal leading-relaxed max-w-2xl mx-auto">
                        {video.description}
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex flex-col gap-6">
                    <TagSection 
                        icon={<AlertTriangle className="w-5 h-5 text-white"/>} 
                        tags={video.tags?.emergency}
                        colorClass="from-red-500/50 to-orange-500/50"
                    />
                    <TagSection 
                        icon={<MapPin className="w-5 h-5 text-white"/>} 
                        tags={video.tags?.location}
                        colorClass="from-blue-500/50 to-cyan-500/50"
                    />
                    <TagSection 
                        icon={<Calendar className="w-5 h-5 text-white"/>} 
                        tags={video.tags?.date}
                        colorClass="from-emerald-500/50 to-green-500/50"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}