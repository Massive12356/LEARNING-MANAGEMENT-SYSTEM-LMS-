// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { RichTextDisplay } from '../../../components/ui/RichTextEditor';
import { mockApi } from '../../../services/mockApi';
import { Course } from '../../../types';
import { 
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  SearchIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function DiscoverCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseData = await mockApi.getCourses();
        setCourses(courseData);
        setFilteredCourses(courseData);
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    let result = courses;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(course => course.tags.includes(selectedCategory));
    }
    
    setFilteredCourses(result);
  }, [searchTerm, selectedCategory, courses]);

  const handleEnroll = async (courseId: string) => {
    try {
      // Mock enrollment
      toast.success('Successfully enrolled in course!');
      navigate(`/student/course/${courseId}`);
    } catch (error) {
      toast.error('Failed to enroll in course');
    }
  };

  // Get all unique tags for filter options
  const allTags = Array.from(new Set(courses.flatMap(course => course.tags)));
  
  // Get popular tags (most frequently used)
  const tagCounts = courses.flatMap(course => course.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Discover Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Explore our catalog of courses and advance your skills
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses, topics, or skills..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Courses
              </button>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedCategory(tag)}
                  className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                    selectedCategory === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl"
            >
              <div className="relative">
                <img
                  src={course.coverImage || 'https://picsum.photos/400/225'}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {course.tags.includes('popular') && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    POPULAR
                  </div>
                )}
                {course.tags.includes('trending') && (
                  <div className="absolute top-3 left-3 bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    TRENDING
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div>
                  <h3 
                    className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
                    onClick={() => navigate(`/student/course/${course.id}/details`)}
                  >
                    {course.title}
                  </h3>
                  <div 
                    className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors text-base leading-relaxed"
                    onClick={() => navigate(`/student/course/${course.id}/details`)}
                  >
                    <RichTextDisplay content={course.description} />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 mr-1" />
                    {course.modules.length} modules
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    4 weeks
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Self-paced
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-4 w-4 ${
                          star <= 4
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    4.2 (128 reviews)
                  </span>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {course.requiresCertificate ? 'Free' : 'Premium'}
                  </span>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleEnroll(course.id)}
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No courses found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <div className="mt-6">
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
