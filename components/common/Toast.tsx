import React, { useEffect } from 'react';
import ErrorIcon from '../icons/ErrorIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const typeClasses = {
    success: {
      icon: <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />,
      title: 'Success'
    },
    error: {
      icon: <ErrorIcon className="h-6 w-6 text-red-500" aria-hidden="true" />,
      title: 'Error'
    },
  };

  return (
    <div className="fixed top-5 right-5 z-[100] max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
        <div className="p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {typeClasses[type].icon}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                        {typeClasses[type].title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {message}
                    </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={onClose}
                        className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Toast;
