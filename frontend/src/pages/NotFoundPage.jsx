import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-9xl font-extrabold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="primary">Go to Dashboard</Button>
      </Link>
    </div>
  );
}
