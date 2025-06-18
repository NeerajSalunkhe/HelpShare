'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import BounceInBottom from './BounceInBottom';

export default function YourRequests() {
  const [needs, setNeeds] = useState([]);
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchNeeds = async () => {
      nProgress.start();
      setLoading(true);
      try {
        const res = await fetch(`/api/getyourneeds/${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType?.includes('application/json')) {
          const text = await res.text();
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.needs)) {
          setNeeds(data.needs);
        }
      } catch (err) {
        console.error('Error fetching needs:', err);
      } finally {
        nProgress.done();
        setLoading(false);
      }
    };

    fetchNeeds();
  }, [user?.id]);
  if (!user) {
    return (
      <div className="flex justify-center items-baseline mt-20 min-h-screen text-center px-4">
        <div className="text-lg font-semibold">
          🚫 You are not signed in. Please sign in to access your Help Requests.
        </div>
      </div>
    );
  }

  const handleClick = async () => {
    nProgress.start();
    await router.push('/addneed');
    nProgress.done();
  };

  const handlepush = async (needid) => {
    if (!user?.id) return;
    nProgress.start();
    await router.push(`/request/${needid}`);
    nProgress.done();
  };

  return (
    <BounceInBottom>
      <section className="mt-5 px-4 md:px-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4">
          <h2 className="text-2xl md:text-2xl font-bold text-center sm:text-left text-gray-400">Your Requests</h2>
          <Button
            onClick={handleClick}
            className="cursor-pointer px-6 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
          >
            + Add New Request
          </Button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : needs.length === 0 ? (
          <BounceInBottom>
            <div className="flex flex-col items-center justify-center py-10">
              <Image src="/empty.svg" alt="No Requests" width={300} height={300} />
              <p className="mt-4 text-muted-foreground text-center text-sm">
                You haven&#39;t created any requests yet.
              </p>
            </div>
          </BounceInBottom>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {needs.map((need) => {
              const progressRatio = (need.collectedAmount / need.requiredAmount) * 100;

              return (
                <div
                  key={need.needid}
                  onClick={() => handlepush(need.needid)}
                  className="cursor-pointer group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:scale-[1.015]"
                >
                  {/* Tooltip */}
                  <div className="absolute top-2 left-2 z-10 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Click on card to see details
                  </div>


                  {/* Image */}
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={need.proofImage1}
                      alt="Proof 1"
                      width={500}
                      height={200}
                      className="w-full h-full object-cover transition-opacity duration-500 ease-in-out rounded-t-2xl"
                    />
                    {need.proofImage2?.startsWith('data:image') && (
                      <Image
                        src={need.proofImage2}
                        alt="Proof 2"
                        width={500}
                        height={200}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out rounded-t-2xl"
                      />
                    )}
                  </div>

                  {/* Text & Progress */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold truncate">{need.fullName}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{need.mainReason}</p>
                    </div>

                    <div>
                      <div className="relative">
                        <Progress value={progressRatio} className="h-2 rounded-full" />
                        <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          {progressRatio.toFixed(0)}%
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>₹{need.collectedAmount}</span>
                        <span>₹{need.requiredAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </BounceInBottom>
  );
}
