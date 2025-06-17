'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2Icon, Copy, CopyCheck, Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import nProgress from 'nprogress';
export default function DashboardPage() {
    const { user } = useUser();
    const [showSecret, setShowSecret] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [RAZORPAY_KEY_ID, setKeyId] = useState('');
    const [RAZORPAY_SECRET, setSecret] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loadingUserData, setLoadingUserData] = useState(true);





    // 👇 Fetch data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            nProgress.start();
            try {
                const res = await fetch(`/api/user/${user.id}`);
                const data = await res.json();

                if (data.success && data.user) {
                    setKeyId(data.user.razorpay_key_id || '');
                    setSecret(data.user.razorpay_secret || '');
                }
            } catch (err) {
                console.error("Failed to load Razorpay credentials:", err);
            } finally {
                setLoadingUserData(false);
                nProgress.done();
            }
        };

        fetchUserData();
    }, [user?.id]);

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        nProgress.start();
        try {
            const payload = {
                userid: user?.id,
                username: user?.fullName,
                phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
            };

            if (RAZORPAY_KEY_ID.trim()) {
                payload.razorpay_key_id = RAZORPAY_KEY_ID;
            }

            if (RAZORPAY_SECRET.trim()) {
                payload.razorpay_secret = RAZORPAY_SECRET;
            }

            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Saved successfully!');
            } else {
                toast.error(data.message || 'Failed to save!');
            }
        } catch (error) {
            console.error("❌ Error in handleSave:", error);
            toast.error('An error occurred!');
        } finally {
            setIsSaving(false);
            nProgress.done();
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-baseline mt-30 min-h-screen text-center px-4">
                <div className="text-lg font-semibold">
                    🚫 You are not signed in. Please sign in to access your dashboard.
                </div>
            </div>
        );
    }
    return (
        <>
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                </div>
                <div>
                    <Card className={'bg-gray-8=600'}>
                        <CardHeader>
                            <CardTitle>Your Razorpay Credentials</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Razorpay Key ID */}
                            <div className="space-y-1">
                                <Label>Razorpay Key ID</Label>
                                <div className="relative">
                                    <Input
                                        value={RAZORPAY_KEY_ID}
                                        onChange={(e) => setKeyId(e.target.value)}
                                        className="bg-muted pr-12"
                                    />
                                    <div className="absolute inset-y-0 right-2 flex items-center">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCopy(RAZORPAY_KEY_ID, 'Key ID')}
                                        >
                                            {copiedField === 'Key ID' ? (
                                                <CopyCheck className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Razorpay Secret */}
                            <div className="space-y-1">
                                <Label>Razorpay Secret</Label>
                                <div className="relative">
                                    <Input
                                        type={showSecret ? 'text' : 'password'}
                                        value={RAZORPAY_SECRET}
                                        onChange={(e) => setSecret(e.target.value)}
                                        className="bg-muted pr-24"
                                    />
                                    <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCopy(RAZORPAY_SECRET, 'Secret')}
                                        >
                                            {copiedField === 'Secret' ? (
                                                <CopyCheck className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setShowSecret(!showSecret)}
                                        >
                                            {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        Please wait
                                    </div>
                                ) : (
                                    'Save Credentials'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
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
        </>
    );
}
