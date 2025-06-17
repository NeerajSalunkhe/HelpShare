'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { toast, ToastContainer } from 'react-toastify'
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';

export default function Page() {
    const { user, isLoaded } = useUser();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [userGroups, setUserGroups] = useState([]);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/getgroupsbyuserid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkid: user.id }),
            });

            const data = await res.json();
            if (data.success) {
                setUserGroups(data.groups);
            } else {
                console.error('❌ Failed to fetch groups');
            }
        } catch (err) {
            console.error('❌ Error fetching groups:', err);
        }
    };

    useEffect(() => {
        if (user && isLoaded) fetchGroups();
    }, [user, isLoaded]);

    const handleCreateGroup = async () => {
        if (!description.trim() || !amount.trim()) {
            toast.error('Please enter all required fields');
            return;
        }

        const groupid = uuidv4();
        setLoading(true);

        try {
            const res = await fetch('/api/creategroup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupid,
                    creatorid: user.id,
                    description,
                    amount,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('🎉 Group created successfully');
                setDescription('');
                setAmount('');
                fetchGroups(); // refresh groups list
            }
            else {
                toast.error(data.message || 'Failed to create group');
            }
        } catch (err) {
            console.error('Error creating group:', err);
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };
    const router = useRouter();
    const handleclick = (async (e) => {
        nProgress.start();
        await router.push(`/groupsbyid/${e}`);
        nProgress.done();
    })
    if (!user || !isLoaded) {
        return (
            <div className="flex justify-center items-center min-h-screen px-4 text-center">
                <div className="text-lg font-semibold">
                    🚫 You are not signed in. Please sign in to create a group.
                </div>
            </div>
        );
    }
    return (
        <div className="max-w-xl mx-auto mt-10 space-y-10 px-4">
            {/* Group Creation Section */}
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-center">🧾 Create a Group</h1>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        placeholder="Describe the purpose of this group"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                        placeholder="Enter amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <Button className="w-full" onClick={handleCreateGroup} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Group'}
                </Button>
            </div>

            {/* Your Groups Section */}
            {/* Your Groups Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">📋 Your Groups</h2>
                {userGroups.length === 0 ? (
                    <p className="text-center text-muted-foreground">You haven’t joined or created any groups.</p>
                ) : (
                    <div className="space-y-2">
                        {userGroups.map((group) => {
                            const isCreator = user.id === group.creatorid;
                            const currentMember = group.members?.find((m) => m.userid === user.id);
                            const paymentStatus = currentMember?.paymentdone;

                            return (
                                <div
                                    key={group.groupid}
                                    onClick={() => handleclick(group.groupid)}
                                    className="p-4 border rounded-md cursor-pointer bg-muted/30 hover:bg-muted transition"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium">{group.description}</div>
                                        {isCreator && (
                                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                                👑 Admin
                                            </span>
                                        )}
                                    </div>
                                    {
                                        isCreator ? (
                                            <div className="text-sm text-muted-foreground">₹{group.amount}</div>
                                        )
                                            : (
                                                <div className="text-sm text-muted-foreground">₹{Math.ceil(group.amount / (group.members.length))}</div>
                                            )
                                    }
                                    {/* Status Logic */}
                                    < div className="mt-2 text-sm" >
                                        {
                                            isCreator ? (
                                                <div className="text-sm" >
                                                    Collection Status: {' '}
                                                    {group.collectedamount >= group.amount ? (
                                                        <span className="text-green-600">✅ Collection Done</span>
                                                    ) : (
                                                        <span className="text-red-600">❌ Collection Due</span>
                                                    )
                                                    }
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    Your Payment Status:{' '}
                                                    <span className={
                                                        currentMember?.status === 'done'
                                                            ? 'text-green-600'
                                                            : currentMember?.status === 'verifying'
                                                                ? 'text-yellow-600'
                                                                : 'text-red-600'
                                                    }>
                                                        {currentMember?.status || 'unknown'}
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div >
                )}
            </div >

            <ToastContainer
                position="top-right"              // top-left | top-right | top-center | bottom-left | bottom-right | bottom-center
                autoClose={3000}                  // Time in ms before auto dismissing toast
                hideProgressBar={false}          // Set true to hide the progress bar
                newestOnTop={false}              // Newest toast appears on top
                closeOnClick                     // Close toast on click
                rtl={false}                      // For right-to-left languages
                pauseOnFocusLoss                 // Pause toast timer when window loses focus
                draggable                        // Allow dragging to dismiss
                pauseOnHover                     // Pause timer on hover
                theme="light"                    // light | dark | colored
                limit={3}                        // Max number of toasts to show at once
            />
        </div >
    );
}
