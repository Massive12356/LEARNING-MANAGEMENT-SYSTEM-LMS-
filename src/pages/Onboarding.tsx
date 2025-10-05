import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export const Onboarding: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    birthday: user?.birthday || '',
    country: user?.country || '',
    gender: user?.gender || '',
    levelOfEducation: user?.levelOfEducation || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Tell us about yourself' },
    { id: 2, title: 'Welcome!', description: 'You\'re all set to start learning' }
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Japan', 'Brazil', 'India', 'Other'
  ];

  const educationLevels = [
    'high-school', 'associate', 'bachelor', 'master', 'phd', 'other'
  ];

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.birthday) newErrors.birthday = 'Birthday is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.levelOfEducation) newErrors.levelOfEducation = 'Education level is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;

      try {
        await updateUser(formData);
        setCurrentStep(2);
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    } else {
      const redirectPath = user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard';
      navigate(redirectPath);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center justify-center space-x-5">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {step.title}
                </span>
                {step.id < steps.length && (
                  <div className="ml-4 w-8 border-t border-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <Card>
          <CardContent className="p-8">
            {currentStep === 1 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Complete Your Profile
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Help us personalize your learning experience
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    name="birthday"
                    type="date"
                    label="Birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    error={errors.birthday}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.country ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select your country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.gender ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Level of Education
                    </label>
                    <select
                      name="levelOfEducation"
                      value={formData.levelOfEducation}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.levelOfEducation ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select education level</option>
                      {educationLevels.map((level) => (
                        <option key={level} value={level}>
                          {level.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    {errors.levelOfEducation && (
                      <p className="text-sm text-red-600">{errors.levelOfEducation}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome to LMS Platform!
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Your profile is complete. Start exploring courses and begin your learning journey.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button onClick={handleNext} className="w-full">
                {currentStep === 1 ? 'Continue' : 'Go to Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};