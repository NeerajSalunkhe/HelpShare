'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useCreateUserOnLogin() {
    const { user } = useUser();
    useEffect(() => {
        const createUser = async () => {
            if (!user) return;
            try {
                const res = await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userid: user.id,
                        username: `${user.firstName} ${user.lastName}`,
                        phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
                        email: user?.primaryEmailAddress?.emailAddress || '',
                    }),
                });

                if (!res.ok) {
                    const errorText = await res.text(); // prevent .json() crash
                    console.error('❌ Failed to create user:', errorText);
                    return;
                }

                const data = await res.json(); // Now safe
                // console.log('✅ User created or found:', data);
            } catch (error) {
                console.error('❌ Error in createUser:', error);
            }
        };
        createUser();
    }, [user]);

}
