import React, { useState, useEffect } from 'react';
import { Video } from '@/entities/Video';
import { Search, Filter, Tag, Calendar, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function SearchPage() {
    const [videos, setVideos] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadVideos();
    }, []);

    useEffect(() => {
        performSearch();
    }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, videos]);

    const loadVideos = async () => {
        setIsLoading(true);
        try {
            const videoList = await Video.list('-created_date');
            setVideos(videoList);
        } catch (error) {
            console.error('Error loading videos:', error);
        }
        setIsLoading(false);
    };

    const performSearch = () => {
        let results = videos.filter(video => {
            const matchesSearch = !searchTerm || 
                video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                video.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
            const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty_level === selectedDifficulty;
            
            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        // Sort results
        results.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_date) - new Date(a.created_date);
                case 'oldest':
                    return new Date(a.created_date) - new Date(b.created_date);
                case 'most_viewed':
                    return (b.view_count || 0) - (a.view_count || 0);
                case 'alphabetical':
                    return a.title.localeCompare(b.title, 'he');
                case 'relevance':
                default:
                    // Simple relevance: exact matches first, then partial matches
                    const aScore = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 1;
                    const bScore = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 1;
                    return bScore - aScore;
            }
        });

        setSearchResults(results);
    };

    const categoryColors = {
        'היסטוריה': 'bg-amber-900/30 text-amber-300 border-amber-600',
        'גיאוגרפיה': 'bg-green-900/30 text-green-300 border-green-600',
        'מדע': 'bg-blue-900/30 text-blue-300 border-blue-600',
        'טבע': 'bg-emerald-900/30 text-emerald-300 border-emerald-600',
        'תרבות': 'bg-purple-900/30 text-purple-300 border-purple-600',
        'אמנות': 'bg-pink-900/30 text-pink-300 border-pink-600',
        'ספורט': 'bg-orange-900/30 text-orange-300 border-orange-600',
        'אחר': 'bg-gray-900/30 text-gray-300 border-gray-600'
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">חיפוש סרטונים</h1>
                    <p className="text-[#8E8E93]">מצא את הסרטון המושלם לשיעור שלך</p>
                </div>

                {/* Search Controls */}
                <div className="bg-[#1C1C1E] rounded-xl p-6 mb-8 border border-[#3A3A3C]">
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                            <Input
                                placeholder="חפש סרטונים, תגיות או תיאור..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#2C2C2E] border-[#3A3A3C] text-white pr-12 placeholder:text-[#8E8E93] h-12 text-lg"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 flex-wrap">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-[#2C2C2E] border-[#3A3A3C] text-white w-48">
                                    <SelectValue placeholder="קטגוריה" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1E] border-[#3A3A3C]">
                                    <SelectItem value="all">כל הקטגוריות</SelectItem>
                                    <SelectItem value="היסטוריה">היסטוריה</SelectItem>
                                    <SelectItem value="גיאוגרפיה">גיאוגרפיה</SelectItem>
                                    <SelectItem value="מדע">מדע</SelectItem>
                                    <SelectItem value="טבע">טבע</SelectItem>
                                    <SelectItem value="תרבות">תרבות</SelectItem>
                                    <SelectItem value="אמנות">אמנות</SelectItem>
                                    <SelectItem value="ספורט">ספורט</SelectItem>
                                    <SelectItem value="אחר">אחר</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger className="bg-[#2C2C2E] border-[#3A3A3C] text-white w-48">
                                    <SelectValue placeholder="רמת קושי" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1E] border-[#3A3A3C]">
                                    <SelectItem value="all">כל הרמות</SelectItem>
                                    <SelectItem value="קל">קל</SelectItem>
                                    <SelectItem value="בינוני">בינוני</SelectItem>
                                    <SelectItem value="מתקדם">מתקדם</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="bg-[#2C2C2E] border-[#3A3A3C] text-white w-48">
                                    <SelectValue placeholder="מיון" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1E] border-[#3A3A3C]">
                                    <SelectItem value="relevance">רלוונטיות</SelectItem>
                                    <SelectItem value="newest">החדשים ביותר</SelectItem>
                                    <SelectItem value="oldest">הישנים ביותר</SelectItem>
                                    <SelectItem value="most_viewed">הנצפים ביותר</SelectItem>
                                    <SelectItem value="alphabetical">לפי אלף-בית</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">
                            תוצאות חיפוש ({searchResults.length})
                        </h2>
                        {searchTerm && (
                            <div className="text-[#8E8E93]">
                                חיפוש עבור: "<span className="text-white">{searchTerm}</span>"
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((video) => (
                                <div
                                    key={video.id}
                                    className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl overflow-hidden hover:border-[#007AFF]/50 smooth-transition cursor-pointer group"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-[#2C2C2E] relative overflow-hidden">
                                        {video.thumbnail_url ? (
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Search className="w-12 h-12 text-[#8E8E93]" />
                                            </div>
                                        )}
                                        {video.duration && (
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {video.duration}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#007AFF] smooth-transition">
                                            {video.title}
                                        </h3>
                                        
                                        {video.description && (
                                            <p className="text-sm text-[#8E8E93] mb-3 line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            {video.category && (
                                                <Badge className={`text-xs ${categoryColors[video.category]}`}>
                                                    {video.category}
                                                </Badge>
                                            )}
                                            {video.difficulty_level && (
                                                <Badge variant="outline" className="text-xs border-[#3A3A3C] text-[#8E8E93]">
                                                    {video.difficulty_level}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                <span>{video.view_count || 0} צפיות</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{format(new Date(video.created_date), 'dd/MM/yy', { locale: he })}</span>
                                            </div>
                                        </div>

                                        {video.tags && video.tags.length > 0 && (
                                            <div className="flex items-center gap-1 mt-3 flex-wrap">
                                                <Tag className="w-3 h-3 text-[#8E8E93]" />
                                                {video.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="text-xs text-[#8E8E93]">
                                                        #{tag}
                                                        {index < Math.min(video.tags.length, 3) - 1 && ', '}
                                                    </span>
                                                ))}
                                                {video.tags.length > 3 && (
                                                    <span className="text-xs text-[#8E8E93]">
                                                        +{video.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && searchResults.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-[#1C1C1E] rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Search className="w-12 h-12 text-[#8E8E93]" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">לא נמצאו תוצאות</h3>
                            <p className="text-[#8E8E93] mb-4">נסה לשנות את מונחי החיפוש או הפילטרים</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}