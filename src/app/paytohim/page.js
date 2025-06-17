'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast, ToastContainer } from 'react-toastify';
import { useUser } from '@clerk/nextjs';
import { v4 as uuid } from 'uuid';
import nProgress from 'nprogress';
import { Loader2Icon } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { sendReminderEmail as sendEmailToUser } from '@/lib/sendReminderEmail';
export default function PayToHimPage() {
  const { user } = useUser();
  const [change, setChange] = useState(false);
  const [newPayment, setNewPayment] = useState({
    sendername: '',
    senderemail: '',
    amount: '',
    reason: ''
  });
  const [payments, setPayments] = useState([]);
  const [loadingStates, setLoadingStates] = useState({}); // key = id + '_action'

  useEffect(() => {
    const fetchPayments = async () => {
      nProgress.start();
      try {
        const res = await fetch('/api/giveallpaytohim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userid: user?.id }),
        });
        const data = await res.json();
        setPayments(data?.paytohim || []);
      } catch {
        toast.error('Failed to fetch payments');
      } finally {
        nProgress.done();
      }
    };

    if (user?.id) fetchPayments();
  }, [user, change]);

  const setLoading = (key, val) => {
    setLoadingStates(prev => ({ ...prev, [key]: val }));
  };

  const handleAdd = async () => {
    const { sendername, senderemail, amount, reason } = newPayment;

    if (!sendername.trim()) return toast.error('Sender name is required');
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast.error('Valid amount is required');
    if (!reason.trim()) return toast.error('Reason is required');

    if (senderemail && !/\S+@\S+\.\S+/.test(senderemail)) {
      return toast.error('Enter a valid email address');
    }

    const paytohimEntry = {
      id: uuid(),
      senderid: '',
      sendername,
      senderemail,
      amount,
      reason,
      paymentdone: false,
      setreminder: false,
    };

    nProgress.start();
    try {
      const res = await fetch('/api/addpersonalpayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: user.id,
          username: `${user.firstName || ''} ${user.lastName || ''}`,
          useremail: user?.primaryEmailAddress?.emailAddress || '',
          paytohim: paytohimEntry,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success('Payment added successfully!');
      setPayments([paytohimEntry, ...payments]);
      setNewPayment({ sendername: '', senderemail: '', amount: '', reason: '' });
    } catch {
      toast.error('Failed to add payment');
    } finally {
      nProgress.done();
    }
  };

  const handleUpdateEmail = async (id, newEmail) => {
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Enter a valid email');
      return;
    }

    setLoading(id + '_email', true);
    try {
      const res = await fetch('/api/updatepaytohimemail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: user?.id, id, senderemail: newEmail }),
      });
      if (!res.ok) throw new Error();
      toast.success('Email updated');
      setPayments(payments.map(p => p.id === id ? { ...p, senderemail: newEmail } : p));
    } catch {
      toast.error('Failed to update email');
    } finally {
      setLoading(id + '_email', false);
      setChange(!change);
    }
  };

  const handleMarkAsDone = async (id) => {
    setLoading(id + '_done', true);

    try {
      const payment = payments.find(p => p.id === id);
      console.log(payment);
      if (payment.senderemail) {
        const payerName = `${user?.firstName || ''} ${user?.lastName || ''}`;
        await sendEmailToUser(
          user?.primaryEmailAddress?.emailAddress,
          payment.senderemail,
          `${payerName} has completed their payment to you`,
          `Hi ${payment.sendername},\n\n${payerName} has completed the payment of ₹${payment.amount} for "${payment.reason}".\n\nYou may now verify or update their payment status in your dashboard.\n\nThank you!`
        );
        toast.success(`email sent to ${payment.sendername} about your payment completion`);
      }
      // Mark as done in the database
      const res = await fetch('/api/paytohimdone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: user?.id, id }),
      });

      if (!res.ok) throw new Error();

      toast.success('Marked as done');
    } catch {
      toast.error('Failed to mark as done');
    } finally {
      setLoading(id + '_done', false);
      setChange(prev => !prev);
    }
  };


  const handleSendReminder = async (payment) => {
    setLoading(payment.id + '_reminder', true);
    try {
      const res = await fetch('/api/paytohimsetreminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: user.id, id: payment.id }),
      });

      if (!res.ok) throw new Error();

      toast.success(
        payment.setreminder
          ? 'Reminder disabled.'
          : 'Reminder enabled. You will be reminded daily.'
      );
      setChange(c => !c);
    } catch {
      toast.error('Failed to toggle reminder');
    } finally {
      setLoading(payment.id + '_reminder', false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4 px-4">
      <h1 className="text-2xl font-bold text-center">📤 Add Outgoing Payment</h1>

      <div className="space-y-3 bg-muted/40 p-4 rounded-xl shadow-md">
        <Input
          placeholder="Sender Name *"
          value={newPayment.sendername}
          onChange={(e) => setNewPayment({ ...newPayment, sendername: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Amount *"
          value={newPayment.amount}
          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
        />
        <Textarea
          placeholder="Reason *"
          value={newPayment.reason}
          onChange={(e) => setNewPayment({ ...newPayment, reason: e.target.value })}
        />
        <Input
          placeholder="Sender Email (optional)"
          value={newPayment.senderemail}
          onChange={(e) => setNewPayment({ ...newPayment, senderemail: e.target.value })}
        />
        <Button onClick={handleAdd} className="w-full cursor-pointer">➕ Add Outgoing Payment</Button>
      </div>

      {payments.length > 0 && (
        <div className="space-y-4">
          {payments.filter(p => !p.paymentdone).map(payment => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onUpdateEmail={handleUpdateEmail}
              onMarkDone={handleMarkAsDone}
              onSendReminder={handleSendReminder}
              loadingStates={loadingStates}
              done={false}
            />
          ))}

          <div className="opacity-80 pt-6 border-t">
            {payments.filter(p => p.paymentdone).map(payment => (
              <PaymentCard key={payment.id} payment={payment} done />
            ))}
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
    </div>
  );
}

function PaymentCard({ payment, onUpdateEmail, onMarkDone, onSendReminder, done, loadingStates }) {
  const [editEmail, setEditEmail] = useState(payment.senderemail || '');

  return (
    <div className="p-4 rounded-xl shadow-xl transition-all duration-300 border hover:scale-[1.01]">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{payment.sendername}</h3>
      </div>
      <p className="text-sm">💰 ₹{payment.amount}</p>
      <p className="text-sm">📄 {payment.reason}</p>

      <div className="flex flex-col sm:flex-row items-center gap-2 mt-3">
        <Input
          className="text-sm"
          value={editEmail}
          placeholder="Add sender Email (for completion email)"
          onChange={(e) => setEditEmail(e.target.value)}
        />

        {!done && (
          <>
            <Button
              size="sm"
              onClick={() => onUpdateEmail(payment.id, editEmail)}
              disabled={loadingStates[payment.id + '_email']}
            >
              {loadingStates[payment.id + '_email'] ? (
                <>
                  <Loader2Icon className="animate-spin mr-2 h-4 w-4" /> Please wait
                </>
              ) : '💾 Save Email'}
            </Button>

            <Button
              size="sm"
              onClick={() => onMarkDone(payment.id)}
              disabled={loadingStates[payment.id + '_done']}
            >
              {loadingStates[payment.id + '_done'] ? (
                <>
                  <Loader2Icon className="animate-spin mr-2 h-4 w-4" /> Please wait
                </>
              ) : '✅ Done'}
            </Button>

            <Button
              size="sm"
              onClick={() => onSendReminder(payment)}
              disabled={loadingStates[payment.id + '_reminder']}
            >
              {loadingStates[payment.id + '_reminder'] ? (
                <>
                  <Loader2Icon className="animate-spin mr-2 h-4 w-4" /> Please wait
                </>
              ) : payment.setreminder ? '❌ Unset Reminder' : '🔔 Set Reminder'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
