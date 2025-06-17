'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { useUser,isLoaded } from '@clerk/nextjs';
const Page = () => {
    const router = useRouter();
    const { user,isLoaded } = useUser();
    const handlegrouppay = (async () => {
        nProgress.start();
        try {
            await router.push('/grouppay')
        } catch (error) {

        } finally {
            nProgress.done();
        }
    })
    const handlepersonalpay = (async () => {
        nProgress.start();
        try {
            await router.push('/personalpay')
        } catch (error) {

        } finally {
            nProgress.done();
        }
    })
    const paytohim = (async () => {
        nProgress.start();
        try {
            await router.push('/paytohim')
        } catch (error) {

        } finally {
            nProgress.done();
        }
    })
    if (!user || !isLoaded) {
        return (
            <div className="flex justify-center items-baseline pt-30 min-h-screen px-4 text-center">
                <div className="text-lg font-semibold">
                    🚫 You are not signed in. Please sign to Manage Your Payments.
                </div>
            </div>
        );
    }
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-semibold text-center">💡 Overview</h1>
            <p className="text-center text-sm text-muted-foreground max-w-md mx-auto">
                Use this page to stay on top of your financial activities:
                <br />
                • Track and manage group payments with others
                <br />
                {`• Monitor personal payments you've initiated`}
                <br />
                • View and settle any outstanding dues you owe
            </p>
            <div className="space-y-4 max-w-sm mx-auto">
                <div onClick={handlegrouppay}>
                    <Button className="w-full cursor-pointer" variant="default">
                        Manage Group Payments
                    </Button>
                </div>
                <div onClick={handlepersonalpay}>
                    <Button className="w-full cursor-pointer" variant="default">
                        Manage Receiving Payments
                    </Button>
                </div>
                <div onClick={paytohim}>
                    <Button className="w-full cursor-pointer" variant="default">
                        Manage Your Outgoing Payments
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Page;
