import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { HomeIcon } from '@heroicons/react/24/outline';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h2>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button className="inline-flex items-center">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};