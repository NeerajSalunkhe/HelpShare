'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import YourRequests from './Yourrequests';
import AllRequests from './Allrequest';

export default function Requestfilter() {
  const { user } = useUser();
  const [filter, setFilter] = useState('your');
  // if (!user) return null;
  return (
    <div className="px-4 md:px-10 mt-6 space-y-6">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <Button
          className={'cursor-pointer'}
          variant={filter === 'your' ? 'default' : 'outline'}
          onClick={() => setFilter('your')}
        >
          Show Your Requests
        </Button>
        <Button
          className={'cursor-pointer'}
          variant={filter === 'others' ? 'default' : 'outline'}
          onClick={() => setFilter('others')}
        >
          Show Others Requests
        </Button>
      </div>

      {/* Conditional Rendering */}
      {filter === 'your' ? <YourRequests /> : <AllRequests />}
    </div>
  );
}
