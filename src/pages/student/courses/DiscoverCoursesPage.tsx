import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { RichTextDisplay } from '../../../components/ui/RichTextEditor';
import { mockApi } from '../../../services/mockApi';
import { Course, CourseItem } from '../../../types';
import { 
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { courseService } from '../../../services/courseService';
import { useAuthStore } from '../../../stores/authStore';

// Define popular tags for filtering
const popularTags = [
  'Node.js',
  'Express',
  'REST API',
  'Backend',
  'MongoDB',
  'JavaScript',
  'Python',
  'React',
  'TypeScript',
  'SQL'
];

export function DiscoverCoursesPage() {

  const {user} = useAuthStore();
  const navigate = useNavigate();
  // State variables for managing courses, loading, filtering, and pagination
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);
  // Removed category filtering - using tags for display only
  const [showFilters, setShowFilters] = useState(false);
  
  // Define popular tags for display purposes only (not for filtering)
  const popularTags = [
    'Node.js',
    'Express',
    'REST API',
    'Backend',
    'MongoDB',
    'JavaScript',
    'Python',
    'React',
    'TypeScript',
    'SQL'
  ];
  
  // Pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);


  // Load courses from the API when component mounts or when pagination parameters change
  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.organizationId){
        toast.error('User organization not found');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch courses with pagination parameters
        const response = await courseService.loadFullCourses(user.organizationId, currentPage, itemsPerPage);

        
        
        // Extract data and pagination info from the response
        const courseData = response.data || response; // Handle different response structures
        const paginationInfo = response.pagination;
        
        setCourseId(courseData?.id || null);
        setCourses(courseData);
        setFilteredCourses(courseData);
        
        // Update pagination state if pagination info is available
        if (paginationInfo) {
          setTotalPages(paginationInfo.totalPages || 1);
          setTotalItems(paginationInfo.totalItems || courseData.length);
          setItemsPerPage(paginationInfo.itemsPerPage || 10);
          setHasNextPage(paginationInfo.hasNextPage || false);
          setHasPrevPage(paginationInfo.hasPrevPage || false);
        } else {
          // Fallback if no pagination info is provided
          setTotalPages(1);
          setTotalItems(courseData.length);
          setHasNextPage(false);
          setHasPrevPage(false);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user, currentPage, itemsPerPage]);

  const userId = Number(user?.id);

  const coursesWithEnrollment = filteredCourses.map(course => {
    const isEnrolled = course.enrolledStudents?.some(student => student.id === userId);

    return {
      ...course,
      isEnrolled,
    };
  });



  // Filter courses based on search term only
  useEffect(() => {
    let result = courses;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(course => 
        course.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCourses(result);
  }, [searchTerm, courses]);


  // Handle course enrollment
  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      // Call the enroll function from courseService
      const response = await courseService.enrollInCourse(courseId);
      toast.success( response?.message || 'Enrolled successfully');      
      // Wait a moment to allow the user to see the success message before navigating
      setTimeout(() => {
        navigate(`/student/course/${courseId}`);
      }, 1500); // Wait 1.5 seconds before navigating
    } catch (error: any) {
      toast.error( error.message || 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };
  
  // Handle pagination - go to next page
  const goToNextPage = () => {
    if (hasNextPage && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handle pagination - go to previous page
  const goToPreviousPage = () => {
    if (hasPrevPage && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Handle direct page navigation
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Discover Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Explore our catalog of courses and advance your skills
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses, topics, or skills..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            {/* Tags display - for visual purposes only */}
            <div className="hidden md:flex items-center space-x-2">
              {popularTags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tags information */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Popular Topics</h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
          Showing {filteredCourses.length} of {totalItems} courses
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Course Grid */}
      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => {
            const isEnrolled = course.enrolledStudents?.some(
              student => student.id === Number(user?.id)
            );

            return (
              <Card
                key={course.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl"
              >
                <div className="relative">
                  <img
                    src={course.course?.images || 'https://picsum.photos/400/225'}
                    alt={course.course?.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <CardContent className="p-6">
                  <h3
                    className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
                    onClick={() => navigate(`/student/course/${course.id}/details`)}
                  >
                    {course.course?.title ?? 'N/A'}
                  </h3>

                  {/* 👇 DESCRIPTION CLAMPED TO 4 LINES */}
                  <div
                    className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed
               overflow-hidden line-clamp-4"
                  >
                    <RichTextDisplay content={course.course?.description ?? 'N/A'} />
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {(course?.modules || [])?.length ?? 0} modules
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEnroll(course.id)}
                        loading={enrollingCourseId === course.id}
                        disabled={isEnrolled || enrollingCourseId === course.id}
                      >
                        {isEnrolled
                          ? 'Enrolled'
                          : enrollingCourseId === course.id
                            ? 'Enrolling...'
                            : 'Enroll Now'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
              <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={!hasPrevPage}
              className={`px-4 py-2 rounded-lg ${
                hasPrevPage
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>

            {/* Page numbers */}
            {getPageNumbers().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-lg ${
                hasNextPage
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages} • Total courses: {totalItems}
          </div>
        </div>
      )}
    </div>
  );
}
