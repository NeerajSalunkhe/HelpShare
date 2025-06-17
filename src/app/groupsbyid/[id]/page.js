'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import nProgress from 'nprogress';
import { sendReminderEmail as sendEmailToUser } from '@/lib/sendReminderEmail';


const Page = () => {
    const { id: groupid } = useParams();
    const { user, isLoaded } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [matchedUsers, setMatchedUsers] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [creatorName, setCreatorName] = useState('');
    const [creatorid, setCreatorid] = useState('');
    const [creatoremail, setCreatoremail] = useState('');
    const [disablereminder, setDisablereminder] = useState(false);
    const timerRef = useRef(null);
    useEffect(() => {
        // On component mount, check localStorage for last sent time
        const lastSent = localStorage.getItem('lastReminderSent');
        if (lastSent) {
            const diff = Date.now() - parseInt(lastSent, 10);
            if (diff < 60 * 1000) {
                setDisablereminder(true);
                const remaining = 60 * 1000 - diff;
                timerRef.current = setTimeout(() => {
                    setDisablereminder(false);
                    localStorage.removeItem('lastReminderSent');
                }, remaining);
            }
        }
        return () => clearTimeout(timerRef.current);
    }, []);
    const sendReminderEmail = async () => {
        setDisablereminder(true);
        setDisablereminder(true);
        localStorage.setItem('lastReminderSent', Date.now().toString());
        nProgress.start();
        for (const member of groupData.members) {
            if (member.status === 'notdone') {
                try {
                    await sendEmailToUser(
                        creatoremail,
                        member.email,
                        `Your payment to ${creatorName} is due`,
                        `Hi ${member.username || 'there'},\n\nYour payment of ₹${groupData.amount / groupData.members.length} for "${groupData.description}" to ${creatorName} is due.\n\nPlease complete it soon.\n\nYou can contact ${creatorName} at ${creatoremail}.\n\nThank you!`
                    );
                    toast(`Reminder sent to ${member.email}`);
                } catch (err) {
                    console.error(`Failed to send reminder to ${member.email}:`, err.message);
                }
            }
        }
        toast.success('Reminder is sent to everyone who not done Payment Yet')
        nProgress.done();
        timerRef.current = setTimeout(() => {
            setDisablereminder(false);
            localStorage.removeItem('lastReminderSent');
        }, 60 * 1000);
    };


    const fetchGroupData = async () => {
        try {
            const res = await fetch('/api/getgroupbygroupid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupid }),
            });
            const data = await res.json();
            if (data.success) {
                setGroupData(data.group);
                fetchCreatorName(data.group.creatorid);
            } else {
                toast.error('Failed to fetch group');
            }
        } catch (error) {
            console.error('Error fetching group:', error);
        }
    };

    const fetchCreatorName = async (creatorid) => {
        try {
            const res = await fetch(`/api/user/${creatorid}`);
            const data = await res.json();
            if (data.success) {
                setCreatorName(data.user.username);
                setCreatoremail(data.user.email);
                setCreatorid(data.userid);
            } else {
                setCreatorName(creatorid);
            }
        } catch (error) {
            setCreatorName(creatorid);
        }
    };

    const searchUsers = async () => {
        try {
            const res = await fetch('/api/getallusers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: user.id }),
            });
            const data = await res.json();
            if (data.success) {
                const term = searchTerm.toLowerCase();
                const filtered = data.users.filter(
                    (u) =>
                        u.username?.toLowerCase().includes(term) ||
                        u.phone?.toLowerCase().includes(term) ||
                        u.primaryEmailAddress?.toLowerCase().includes(term)
                );
                setMatchedUsers(filtered);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleAddMember = async (userid) => {
        try {
            const res = await fetch('/api/addmembers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupid, userid }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Member added');
                fetchGroupData(); // refresh groupData
            } else {
                toast.error(data.message || 'Failed to add member');
            }
        } catch (error) {
            toast.error('Error adding member');
        }
    };

    useEffect(() => {
        if (user && isLoaded) fetchGroupData();
    }, [user, isLoaded]);

    useEffect(() => {
        if (searchTerm.trim()) searchUsers();
        else setMatchedUsers([]);
    }, [searchTerm]);

    if (!groupData) return <div className="p-4 text-center text-muted-foreground">Loading group...</div>;

    const isAdmin = user.id === groupData.creatorid;
    const currentUser = groupData.members.find((m) => m.userid === user.id);
    const otherMembers = groupData.members.filter((m) => m.userid !== groupData.creatorid && m.userid !== user.id);
    const renderStatus = (status) => {
        if (status === 'done') return '✅ Paid';
        if (status === 'verifying') return '⏳ Verifying';
        return '❌ Not Paid';
    };
    const handlemarkdone = async () => {
        nProgress.start();
        try {
            const res = await fetch('/api/handleedit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupid,
                    userid: user?.id,
                    status: 'verifying',
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('✅ Marked as verifying');
                fetchGroupData(); // refresh UI if needed
            } else {
                toast.error(data.message || '❌ Failed to update status');
            }
        } catch (error) {
            console.error('Error marking as verifying:', error);
            toast.error('Something went wrong!');
        }
        finally {
            nProgress.done();
        }
    };

    const handleStatusChange = async (memberId, newStatus) => {
        try {
            const res = await fetch('/api/handleedit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupid: groupData.groupid,
                    userid: memberId,
                    status: newStatus,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Member marked as ${newStatus}`);
                fetchGroupData(); // refresh state
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (err) {
            console.error('Status update error:', err);
            toast.error('Something went wrong');
        }
    };




    return (
        <div className="max-w-3xl mx-auto p-6 space-y-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{groupData.description}</h1>
                {isAdmin && <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">👑 Admin</span>}
            </div>
            {/* Group Collection Progress */}
            <div className="bg-muted/30 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Group Collection Status</h2>
                <div className="text-sm mb-1">
                    ₹{groupData.collectedamount} collected of ₹{groupData.amount}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(100, (groupData.collectedamount / groupData.amount) * 100)}%`,
                        }}
                    />
                </div>
                {groupData.collectedamount >= groupData.amount && (
                    <div className="mt-2 text-green-600 font-medium text-sm text-center gap-1">
                        🎉 All contributions received!
                    </div>
                )}
            </div>

            {/* Add Members */}
            {isAdmin && (
                <div className="space-y-4 border rounded-lg p-5 bg-muted/30">
                    <h2 className="text-xl font-semibold">Add Members</h2>
                    <Input
                        placeholder="Search users by phone, email, or username"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {matchedUsers.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {matchedUsers.map((u) => (
                                <div
                                    key={u.userid}
                                    className="flex justify-between items-center border p-3 rounded-lg hover:bg-muted transition"
                                >
                                    <div>
                                        <div className="font-medium">{u.username}</div>
                                        <div className="text-sm text-muted-foreground">{u.email}</div>
                                    </div>
                                    <Button size="sm" onClick={() => handleAddMember(u.userid)}>
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button
                        className="mt-3 w-full cursor-pointer"
                        variant="secondary"
                        onClick={sendReminderEmail}
                        disabled={disablereminder}
                    >
                        🔔 {disablereminder ? 'Wait until 1 min ...' : 'Remind All who not paid Yet'}
                    </Button>
                </div>
            )}
            {/* Members Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Members</h2>
                <div className="text-sm text-muted-foreground mb-4">
                    💰 Amount to pay per member: ₹{Math.ceil(groupData.amount / (groupData.members.length))}
                </div>
                {/* Creator */}
                <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 shadow-sm flex justify-between items-center">
                    <div>
                        <div className="font-medium">
                            {creatorName}
                            <p className='text-gray-500 text-xs'>{creatoremail}</p>
                        </div>
                        <div className="text-sm text-blue-600">👑 Group Creator</div>
                        <div>
                            Status: ✅ Paid
                        </div>
                    </div>
                </div>

                {/* Current User */}
                {currentUser && currentUser.userid !== groupData.creatorid && (
                    <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-gray-900 shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-medium">You</div>
                            <div className="text-sm text-muted-foreground mb-1">
                                Amount to pay: ₹{Math.ceil(groupData.amount / (groupData.members.length))}
                            </div>
                            <div className="text-sm">
                                Status: {renderStatus(currentUser.status)}
                            </div>
                            {currentUser.status === 'notdone' && (
                                <Button onClick={handlemarkdone} size="sm" variant="outline" className="mt-1">Mark as Done</Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Other Members */}
                {otherMembers.map((member) => (
                    <div
                        key={member.userid}
                        className="p-4 border rounded-lg bg-white dark:bg-gray-900 shadow-sm flex justify-between items-center"
                    >
                        <div>
                            <div className="font-medium">{member.name || member.userid}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                            <div className="text-sm text-muted-foreground">
                                Amount to pay: ₹{Math.ceil(groupData.amount / groupData.members.length || 1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Status: {renderStatus(member.status)}
                            </div>

                            {/* Admin actions for verifying members */}
                            {user?.id === groupData.creatorid && (
                                <>
                                    {member.status === 'verifying' && (
                                        <div className="mt-2 flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleStatusChange(member.userid, 'done')}
                                                className="bg-gray-600 cursor-pointer"
                                            >
                                                ✅ Mark as Done
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleStatusChange(member.userid, 'notdone')}
                                                className="cursor-pointer"
                                            >
                                                ❌ Mark as Not Done
                                            </Button>
                                        </div>
                                    )}

                                    {member.status === 'notdone' && (
                                        <div className="mt-2 flex gap-2 items-center">
                                            <span className="text-sm font-medium text-red-500">Status: Not Done</span>
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleStatusChange(member.userid, 'done')}
                                                className="bg-gray-600 cursor-pointer"
                                            >
                                                ✅ Mark as Done
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    </div>
                ))}
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
        </div>
    );

};

export default Page;
