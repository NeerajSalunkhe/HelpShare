// ...imports remain same
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Loader2Icon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '@clerk/nextjs';
import { v4 as uuid } from 'uuid';
import { useState, useEffect } from 'react';
import nProgress from 'nprogress';
import BounceInTop from '../components/BounceInTop';
// import { useUser } from '@clerk/nextjs';
// Zod schema stays same
const formSchema = z.object({
  mainReason: z.string().min(5, 'Title should be at least 5 characters'),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Enter a valid amount in ₹',
  }),
  proof1: z.any().refine((file) => file?.length === 1, 'Proof image 1 is required'),
  proof2: z.any().refine((file) => file?.length === 1, 'Proof image 2 is required'),
});

export default function NeedHelpForm() {
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [RAZORPAY_KEY_ID, setKeyId] = useState('');
  const [RAZORPAY_SECRET, setSecret] = useState('');
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    nProgress.start();
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/user/${user.id}`);
        const data = await res.json();
        if (data.success && data.user) {
          setKeyId(data.user.razorpay_key_id || '');
          setSecret(data.user.razorpay_secret || '');
        }
      } catch (err) {
        console.error('Failed to load Razorpay credentials:', err);
      } finally {
        setLoadingUserData(false);
        nProgress.done();
      }
    };
    fetchUserData();
  }, [user?.id]);

  useEffect(() => {
    if (user && (RAZORPAY_KEY_ID === '' || RAZORPAY_SECRET === '')) {
      toast('Please set up your Razorpay credentials in the dashboard first ⚙️');
    }
  }, [loadingUserData, RAZORPAY_KEY_ID, RAZORPAY_SECRET]);

  const onSubmit = async (data) => {
    if (!user?.id) {
      toast.error('User not authenticated ❌');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('userid', user.id);
    formData.append('needid', uuid());
    formData.append('fullName', user.fullName);
    formData.append('mainReason', data.mainReason);
    formData.append('description', data.description);
    formData.append('requiredAmount', data.amount);
    formData.append('proofImage1', data.proof1[0]);
    formData.append('proofImage2', data.proof2[0]);

    nProgress.start();
    try {
      const res = await fetch('/api/needadd', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        toast.success('Request submitted successfully ✅');
        console.log('Submitted:', result.need);
      } else {
        toast.error(`Submission failed ❌: ${result.message}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong while submitting ❌');
    } finally {
      nProgress.done();
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fill in all required fields correctly ❌');
      return;
    }
    handleSubmit(onSubmit)(e);
  };
  if (loadingUserData) return <p className="text-center py-10">Loading Razorpay credentials...</p>;
  return (
    <>
      <BounceInTop>
        <Card className="max-w-3xl mx-auto shadow-lg border-0 rounded-2xl p-6 sm:p-10">
          <CardContent>
            <h2 className="text-3xl font-bold text-center mb-6">🆘 Request Financial Help</h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={user?.fullName || ''}
                  disabled
                  readOnly
                  className="opacity-70 cursor-not-allowed"
                />
              </div>

              {/* Title and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="mainReason">Title / Main Reason</Label>
                  <Input id="mainReason" placeholder="e.g. Medical Emergency" {...register('mainReason')} />
                  {errors.mainReason && <p className="text-sm">{errors.mainReason.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="amount">Required Amount (₹)</Label>
                  <Input id="amount" placeholder="e.g. 5000" {...register('amount')} />
                  {errors.amount && <p className="text-sm">{errors.amount.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={5} placeholder="Explain your need..." {...register('description')} />
                {errors.description && <p className="text-sm">{errors.description.message}</p>}
              </div>

              {/* Upload Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="proof1">Proof Image 1</Label>
                  <Input id="proof1" type="file" accept="image/*" {...register('proof1')} />
                  {errors.proof1 && <p className="text-sm">{errors.proof1.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="proof2">Proof Image 2</Label>
                  <Input id="proof2" type="file" accept="image/*" {...register('proof2')} />
                  {errors.proof2 && <p className="text-sm">{errors.proof2.message}</p>}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                {RAZORPAY_KEY_ID && RAZORPAY_SECRET ? (
                  <Button
                    disabled={submitting}
                    type="submit"
                    className="w-full text-lg py-6 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2Icon className="animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                ) : (
                  <Button
                    disabled
                    type="button"
                    className="w-full text-lg py-6 flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <UploadCloud className="h-5 w-5" />
                    First fill credentials
                  </Button>
                )}
              </div>
            </form>
          </CardContent>

        </Card>
      </BounceInTop>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </>
  );
}
