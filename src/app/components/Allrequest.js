'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import { Skeleton } from "@/components/ui/skeleton";
import nProgress from 'nprogress';
import { useRouter } from 'next/navigation';
import BounceInBottom from './BounceInBottom';

export default function AllRequests() {
    const [needs, setNeeds] = useState([]);
    const { user, isLoaded } = useUser(); // use isLoaded to avoid undefined on first render
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchNeeds = async () => {
            nProgress.start();
            setLoading(true);
            try {
                const res = await fetch(`/api/getallneeds`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const contentType = res.headers.get("content-type");
                if (!res.ok || !contentType?.includes("application/json")) {
                    const text = await res.text();
                    console.error("Unexpected response:", text);
                    return;
                }

                const data = await res.json();
                if (data.success && Array.isArray(data.needs)) {
                    let othersNeeds = data.needs;
                    if (isLoaded && user?.id) {
                        othersNeeds = othersNeeds.filter((need) => need.userid !== user.id);
                    }
                    setNeeds(othersNeeds);
                }
            } catch (err) {
                console.error("Error fetching needs:", err);
            } finally {
                nProgress.done();
                setLoading(false);
            }
        };

        fetchNeeds();
    }, [isLoaded, user?.id]);

    const handlePush = async (id) => {
        nProgress.start();
        await router.push(`/request/${id}`);
        nProgress.done();
    };

    return (
        <BounceInBottom>
            <section className="mt-10 px-4 md:px-10">
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
                    <div className="flex justify-center">
                        <Image src="/empty.svg" alt="No Requests" width={300} height={300} />
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {needs.map((need) => {
                            const requiredAmount = need.requiredAmount || 1;
                            const progressRatio = Math.min((need.collectedAmount / requiredAmount) * 100, 100);

                            return (
                                <div
                                    key={need.needid}
                                    onClick={() => handlePush(need.needid)}
                                    className="cursor-pointer group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-border hover:scale-[1.015]"
                                >
                                    <div className="absolute top-2 left-2 z-10 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Click on card for help and see details
                                    </div>
                                    {/* Image Section */}
                                    <div className="relative w-full h-48 overflow-hidden">
                                        <Image
                                            src={need.proofImage1}
                                            alt="Proof 1"
                                            width={500}
                                            height={200}
                                            className="w-full h-full object-cover transition-opacity duration-700 ease-in-out rounded-t-2xl"
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

                                    {/* Content */}
                                    <div className="p-4 flex flex-col justify-between h-[200px]">
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold truncate">{need.fullName}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{need.mainReason}</p>
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            <div className="relative group">
                                                <Progress value={progressRatio} className="h-2 rounded-full" />
                                                <div className="absolute left-1/2 -top-6 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {progressRatio.toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>₹{need.collectedAmount}</span>
                                                <span>₹{need.requiredAmount}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="cursor-pointer w-full mt-4 transition-all duration-300 rounded-full font-medium text-sm py-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePush(need.needid);
                                            }}
                                        >
                                            Help Now
                                        </Button>
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
