'use client';

import { use, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import nProgress from 'nprogress';
import Script from 'next/script';
import { initiate } from '../../../../actions/useractions';
import { Loader2Icon, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import ChatBox from '@/app/components/ChatBox';
import BounceInTop from '@/app/components/BounceInTop';

export default function RequestDetails() {
  const { id } = useParams();
  const { user, isLoaded } = useUser();
  const [need, setNeed] = useState(null);
  const [owner, setOwner] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '' });
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(false);
  const [showProof2, setShowProof2] = useState(false);
  const [fullImage, setFullImage] = useState(null);
  const [done, setDone] = useState(false)
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchNeed = async () => {
      nProgress.start();
      try {
        const res = await fetch(`/api/getneedbyid/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setNeed(data.needs[0]);
        }
      } catch (error) {
        console.error('Failed to fetch need', error);
      } finally {
        setLoading(false);
        nProgress.done();
      }
    };
    fetchNeed();
  }, [id]);
  useEffect(() => {
    if (!need) return;
    // console.log(need.collectedAmount);
    // console.log(need.requiredAmount);
    if (need.collectedAmount >= need.requiredAmount) {
      setDone(true);
      // console.log(done);
    }
  }, [need, id])

  useEffect(() => {
    const fetchOwner = async () => {
      if (!need?.userid) return;
      try {
        const res = await fetch(`/api/user/${need.userid}`);
        const data = await res.json();
        if (data.success) setOwner(data.user);
      } catch (error) {
        console.error('Failed to fetch owner details', error);
      }
    };
    fetchOwner();
  }, [need?.userid]);

  const isOwner = isLoaded && user?.id === need?.userid;

  const handleDonate = async () => {
    if (!owner?.razorpay_key_id || !owner?.razorpay_secret) {
      toast.error('⚠️ Payment credentials are missing or invalid.');
      return;
    }

    if (user) {
      form.name = user.fullName;
    }
    if (!form.name || !form.amount) {
      toast.error('Please fill out your name and amount.');
      return;
    }


    nProgress.start();
    setPayload(true);

    try {
      const res = await fetch('/api/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, form, id }),
      });

      const data = await res.json();
      console.log(data);
      if (!data.success || !data.order?.id) {
        throw new Error('Failed to create order');
      }

      const order = data.order;

      if (!order?.id || !order?.amount) throw new Error('Invalid Razorpay order.');

      const options = {
        key: owner.razorpay_key_id,
        amount: order.amount,
        currency: 'INR',
        name: 'Donation to Needy Person',
        description: 'Charity Payment',
        image: 'https://example.com/logo.png',
        order_id: order.id,
        prefill: {
          name: form.name,
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          contact: owner?.phone || '',
        },
        notes: {
          requestId: id,
          donor: form.name,
        },
        theme: { color: '#EF4444' },
        handler: async function () {
          toast.success('Payment successful. Thank you!');
          nProgress.start();
          try {
            const res = await fetch(`/api/getneedbyid/${id}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
              setNeed(data.needs[0]);
            }
          } catch (error) {
            console.error('Failed to fetch need', error);
          } finally {
            setLoading(false);
            nProgress.done();
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('❌ Payment was cancelled.');
          },
        },
      };

      if (typeof window.Razorpay !== 'function') {
        toast.error('Razorpay SDK failed to load.');
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('❌ Payment initiation failed!');
      console.error(error);
    } finally {
      nProgress.done();
      setPayload(false);
      // toast.success('✅ Payment successful. Thank you!');
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="p-10 space-y-6">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-48" />
        <Skeleton className="w-full h-10" />
      </div>
    );
  }

  if (!need) {
    return <div className="text-center text-muted-foreground mt-10">Request not found.</div>;
  }

  const progressRatio = Math.min((need.collectedAmount / need.requiredAmount) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <BounceInTop>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

        {fullImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <Image src={fullImage} alt="Full Proof" width={800} height={800} className="rounded-lg" />
            <Button
              onClick={() => setFullImage(null)}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-md p-6 md:p-10 space-y-8">

          {/* Image with switch */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden group cursor-pointer">
            <Image
              src={showProof2 ? need.proofImage2 : need.proofImage1}
              alt="Proof"
              fill
              className="object-cover transition-all duration-700"
              onClick={() => setFullImage(showProof2 ? need.proofImage2 : need.proofImage1)}
            />
            <div className="absolute top-3 right-3 z-10 space-x-2">
              <Button onClick={() => setShowProof2(false)}>Proof 1</Button>
              <Button onClick={() => setShowProof2(true)}>Proof 2</Button>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4 text-base leading-relaxed text-zinc-800 dark:text-zinc-100">
            <p><strong>Name:</strong> {owner?.username}</p>
            <div className='flex justify-between items-center'>
              <p><strong>Contact Me:</strong> {owner?.phone}</p>
              <Button
                variant="outline"
                className="ml-auto cursor-pointer"
                onClick={() => setShowChat(true)}
              >
                💬 Open Chat
              </Button>
              {showChat && (
                <ChatBox
                  requestId={id}
                  ownerId={need.userid}
                  onClose={() => setShowChat(false)}
                />
              )}
            </div>
            <p><strong>Title:</strong> {need.mainReason}</p>
            <p><strong>Description:</strong> {need.description}</p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progressRatio} className="h-2 rounded-full" />
            <p className="text-sm text-muted-foreground">
              ₹{need.collectedAmount} raised of ₹{need.requiredAmount}
            </p>
          </div>

          {/* Donate Form */}
          {!isOwner ? (
            !done ? (
              <form
                className="bg-muted/20 p-6 rounded-lg space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDonate();
                }}
              >
                <h3 className="text-lg font-semibold mb-2">Help This Person 💖</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!user?.fullName && (
                    <div>
                      <Label className="p-1">Your Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div>
                    <Label className="p-1">Amount (₹)</Label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>


                {payload ? (
                  <Button disabled className="w-full">
                    <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                    Please wait
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="cursor-pointer w-full bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  >
                    Donate Now
                  </Button>
                )}
              </form>
            ) : (
              <div className="bg-muted/20 p-6 rounded-lg text-center text-green-600 font-semibold">
                🎉 Collection complete! Thank you for your generous support. 🙏
              </div>
            )
          ) : (
            done && (
              <div className="bg-muted/20 p-6 rounded-lg text-center text-green-600 font-semibold">
                🎉 Collection completed
              </div>
            )
          )}


          {/* Supporters */}
          {need?.helps?.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-md mb-2">Supporters</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                {need.helps.map((h, idx) => (
                  <li key={idx}>{h.name} donated ₹{h.givenAmount}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </BounceInTop>
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
        theme="colored"                 // light | dark | colored
        limit={3}                        // Max number of toasts to show at once
      />
    </div>
  );
}
