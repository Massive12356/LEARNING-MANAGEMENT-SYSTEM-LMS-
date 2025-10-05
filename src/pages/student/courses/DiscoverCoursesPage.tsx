import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { RichTextDisplay } from '../../../components/ui/RichTextEditor';
import { mockApi } from '../../../services/mockApi';
import { enrollmentService } from '../../../services/enrollmentService';
import { Course, Module } from '../../../types';
import { 
  MagnifyingGlassIcon, 
  StarIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  ClockIcon,
  XMarkIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  FunnelIcon,
  ChevronDownIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const DiscoverCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadAvailableCourses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const courses = await enrollmentService.getAvailableCourses(user.id);
      setAvailableCourses(courses);
      setFilteredCourses(courses);
    } catch (error) {
      console.error('Failed to load available courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableCourses();
  }, [user]);

  // Filter and sort courses
  useEffect(() => {
    let result = [...availableCourses];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term) ||
        course.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(course => 
        course.tags.includes(selectedCategory)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'popular':
        // In a real implementation, this would be based on enrollment numbers
        // For now, we'll sort by title
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredCourses(result);
  }, [searchTerm, selectedCategory, sortBy, availableCourses]);

  // Get unique categories from all courses
  const categories = Array.from(
    new Set(availableCourses.flatMap(course => course.tags))
  ).sort();

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollmentService.enrollUser(user!.id, courseId);
      toast.success('Successfully enrolled in course!');
      // Reload data to update the available courses list
      loadAvailableCourses();
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const getSortLabel = (value: string) => {
    switch (value) {
      case 'popular': return 'Most Popular';
      case 'newest': return 'Newest';
      case 'title': return 'Title (A-Z)';
      default: return 'Most Popular';
    }
  };

  const openCourseDetails = async (course: Course) => {
    setSelectedCourse(course);
    setDetailsLoading(true);
    
    try {
      // Load full course details including modules and lessons
      const fullCourseDetails = await mockApi.getCourseById(course.id);
      setCourseDetails(fullCourseDetails);
    } catch (error) {
      console.error('Failed to load course details:', error);
      toast.error('Failed to load course details');
      setCourseDetails(course); // Fallback to basic course info
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeCourseDetails = () => {
    setSelectedCourse(null);
    setCourseDetails(null);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayIcon;
      case 'text': return DocumentTextIcon;
      case 'quiz': return QuestionMarkCircleIcon;
      default: return BookOpenIcon;
    }
  };

  const getTotalLessons = (modules: Module[]) => {
    return modules.reduce((total, module) => total + module.lessons.length, 0);
  };

  const getTotalDuration = (modules: Module[]) => {
    let totalMinutes = 0;
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.duration) {
          totalMinutes += lesson.duration;
        }
      });
    });
    return totalMinutes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Discover Courses
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse and enroll in courses from your organization
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                <div className="flex items-center">
                  <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isCategoryOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div 
                    className="px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsCategoryOpen(false);
                    }}
                  >
                    All Categories
                  </div>
                  {categories.map(category => (
                    <div 
                      key={category}
                      className="px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsCategoryOpen(false);
                      }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By */}
            <div className="md:col-span-3 relative">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsSortOpen(!isSortOpen)}>
                <div className="flex items-center">
                  <FireIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    {getSortLabel(sortBy)}
                  </span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isSortOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  <div 
                    className="px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSortBy('popular');
                      setIsSortOpen(false);
                    }}
                  >
                    Most Popular
                  </div>
                  <div 
                    className="px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSortBy('newest');
                      setIsSortOpen(false);
                    }}
                  >
                    Newest
                  </div>
                  <div 
                    className="px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSortBy('title');
                      setIsSortOpen(false);
                    }}
                  >
                    Title (A-Z)
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Courses */}
      {filteredCourses.length > 0 && (
        <div>
          <div className="flex items-center mb-4">
            <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recommended For You
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.slice(0, 6).map((course) => (
              <Card key={course.id} hover className="overflow-hidden">
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={course.coverImage || 'https://picsum.photos/400/225'}
                      alt={course.title}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => openCourseDetails(course)}
                    />
                  </div>
                  {course.tags.includes('popular') && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
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
                      className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => openCourseDetails(course)}
                    >
                      {course.title}
                    </h3>
                    <div 
                      className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                      onClick={() => openCourseDetails(course)}
                    >
                      <RichTextDisplay content={course.description} />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="mt-4 flex items-center">
                    <div className="flex">
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
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
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
        </div>
      )}

      {/* All Courses */}
      {filteredCourses.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            All Courses
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} hover className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={course.coverImage || 'https://picsum.photos/400/225'}
                    alt={course.title}
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => openCourseDetails(course)}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 
                    className="text-md font-semibold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => openCourseDetails(course)}
                  >
                    {course.title}
                  </h3>
                  <p 
                    className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                    onClick={() => openCourseDetails(course)}
                  >
                    <RichTextDisplay content={course.description} />
                  </p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.requiresCertificate ? 'Free' : 'Premium'}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No courses found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
            <div className="mt-6">
              <Button 
                variant="primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('popular');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : courseDetails ? (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {courseDetails.title}
                  </h2>
                  <button
                    onClick={closeCourseDetails}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img
                        src={courseDetails.coverImage || 'https://picsum.photos/400/250'}
                        alt={courseDetails.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <BookOpenIcon className="h-5 w-5 mr-2" />
                          <span>{courseDetails.modules.length} Modules</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <AcademicCapIcon className="h-5 w-5 mr-2" />
                          <span>{getTotalLessons(courseDetails.modules)} Lessons</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <ClockIcon className="h-5 w-5 mr-2" />
                          <span>{getTotalDuration(courseDetails.modules)} Minutes</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={() => handleEnroll(courseDetails.id)}
                        >
                          Enroll in Course
                        </Button>
                      </div>
                    </div>

                    <div className="md:w-2/3">
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="text-gray-700 dark:text-gray-300">
                          <RichTextDisplay content={courseDetails.description} />
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Course Modules
                        </h3>
                        
                        <div className="space-y-4">
                          {courseDetails.modules.map((module, index) => (
                            <Card key={module.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {module.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {module.description}
                                    </p>
                                    
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {module.lessons.length} lessons
                                      </span>
                                    </div>
                                    
                                    {module.lessons.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                        {module.lessons.map((lesson) => {
                                          const Icon = getLessonIcon(lesson.type);
                                          return (
                                            <div 
                                              key={lesson.id} 
                                              className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                                            >
                                              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                                              <span className="truncate">{lesson.title}</span>
                                              {lesson.duration && (
                                                <span className="ml-2 text-xs">
                                                  ({lesson.duration} min)
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Course details not available
                </h3>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={closeCourseDetails}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};