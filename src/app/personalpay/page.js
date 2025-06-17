'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast, ToastContainer } from 'react-toastify';
import { useUser } from '@clerk/nextjs';
import { v4 as uuid } from 'uuid';
import { sendReminderEmail as sendEmailToUser } from '@/lib/sendReminderEmail';
import nProgress from 'nprogress';
import { Loader2 as Loader2Icon } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function PersonalPayPage() {
  const { user } = useUser();
  const [change, setChange] = useState(false);
  const [newPayment, setNewPayment] = useState({
    payername: '',
    amount: '',
    reason: '',
    payeremail: ''
  });
  const [payments, setPayments] = useState([]);
  const [loadingIds, setLoadingIds] = useState({});
  const remindCooldownsRef = useRef({});

  useEffect(() => {
    const fetchPayments = async () => {
      nProgress.start();
      try {
        const res = await fetch('/api/giveallpaytoyou', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userid: user?.id }),
        });
        const data = await res.json();
        setPayments(data?.paytoyou || []);
      } catch {
        toast.error('Failed to fetch payments');
      } finally {
        nProgress.done();
      }
    };

    if (user?.id) {
      fetchPayments();

      const storedCooldowns = JSON.parse(localStorage.getItem('remindCooldowns') || '{}');
      remindCooldownsRef.current = storedCooldowns;
    }
  }, [user, change]);

  const handleAdd = async () => {
    const { payername, amount, reason, payeremail } = newPayment;

    if (!payername.trim()) return toast.error('Payer name is required');
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast.error('Valid amount is required');
    if (!reason.trim()) return toast.error('Reason is required');

    if (payeremail && !/\S+@\S+\.\S+/.test(payeremail)) {
      return toast.error('Enter a valid email address');
    }

    const paytoyouEntry = {
      id: uuid(),
      payername,
      amount,
      reason,
      payeremail,
      paymentdone: false,
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
          paytoyou: paytoyouEntry,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success('Payment added successfully!');
      setPayments([paytoyouEntry, ...payments]);
      setNewPayment({ payername: '', amount: '', reason: '', payeremail: '' });
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

    setLoadingIds((prev) => ({ ...prev, [id + '_email']: true }));
    nProgress.start();
    try {
      const res = await fetch('/api/updatedemail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: user?.id, id, payeremail: newEmail }),
      });
      if (!res.ok) throw new Error();
      toast.success('Email updated');
      setPayments(payments.map(p => p.id === id ? { ...p, payeremail: newEmail } : p));
    } catch {
      toast.error('Failed to update email');
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id + '_email']: false }));
      setChange(!change);
      nProgress.done();
    }
  };

  const handleMarkAsDone = async (id) => {
    setLoadingIds((prev) => ({ ...prev, [id + '_done']: true }));
    nProgress.start();
    try {
      const payment = payments.find(p => p.id === id);
      if (!payment) throw new Error('Payment not found');

      // Send email first if payer email exists
      if (payment.payeremail) {
        const senderEmail = `{${user?.primaryEmailAddress?.emailAddress}||''}`;
        const senderName = `${user?.firstName || ''} ${user?.lastName || ''}`;

        await sendEmailToUser(
          senderEmail,
          payment.payeremail,
          `Payment Recieved by ${senderName}`,
          `Hi ${payment.payername},\n\nYour payment of ₹${payment.amount} for "${payment.reason}" has been marked as received by ${senderName}.\n\nThank you!`
        );
        toast.success(`Reminder sent to ${payment.payername}`);
      }

      // Then update the backend to mark as done
      const res = await fetch('/api/paytoyoudone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: user?.id, id }),
      });

      if (!res.ok) throw new Error();
      toast.success('Marked as done');
    } catch {
      toast.error('Failed to mark as done');
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id + '_done']: false }));
      setChange(!change);
      nProgress.done();
    }
  };


  const handleSendReminder = async (payment) => {
    if (!payment.payeremail) return toast.error('No email to send to');

    const now = Date.now();
    const lastSent = remindCooldownsRef.current[payment.id] || 0;

    if (now - lastSent < 60000) {
      const secondsLeft = Math.ceil((60000 - (now - lastSent)) / 1000);
      return toast.warning(`Please wait ${secondsLeft}s before reminding again`);
    }

    setLoadingIds((prev) => ({ ...prev, [payment.id + '_remind']: true }));

    const senderEmail = user?.emailAddresses?.[0]?.emailAddress;
    const senderName = `${user?.firstName} ${user?.lastName}`;
    nProgress.start();
    try {
      await sendEmailToUser(
        senderEmail,
        payment.payeremail,
        `Your payment to ${senderName} is due`,
        `Hi ${payment.payername},\n\nYour payment of ₹${payment.amount} for "${payment.reason}" is due.\n\nPlease complete it soon.\n\nYou can contact ${senderName} at ${senderEmail}.\n\nThank you!`
      );
      toast.success(`Reminder sent to ${payment.payername}`);
      remindCooldownsRef.current[payment.id] = now;
      localStorage.setItem('remindCooldowns', JSON.stringify(remindCooldownsRef.current));
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setLoadingIds((prev) => ({ ...prev, [payment.id + '_remind']: false }));
      nProgress.done();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-3 space-y-4">
      <ToastContainer position="top-right" autoClose={3000} limit={3} theme="light" />

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold">Add a Payment to You 💸</h1>
        <p className="text-sm text-muted-foreground">Track people who owe you</p>
      </div>

      <div className="bg-muted/40 p-4 rounded-lg border space-y-3">
        <Input
          placeholder="Payer Name *"
          value={newPayment.payername}
          onChange={(e) => setNewPayment({ ...newPayment, payername: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Amount (₹) *"
          value={newPayment.amount}
          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
        />
        <Textarea
          placeholder="Reason *"
          value={newPayment.reason}
          onChange={(e) => setNewPayment({ ...newPayment, reason: e.target.value })}
        />
        <Input
          placeholder="Payer Email (optional)"
          value={newPayment.payeremail}
          onChange={(e) => setNewPayment({ ...newPayment, payeremail: e.target.value })}
        />
        <Button onClick={handleAdd} className="w-full text-sm">
          ➕ Add Recieving Payment
        </Button>
      </div>

      {payments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending Payments</h2>
          {payments.filter(p => !p.paymentdone).map(payment => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onUpdateEmail={handleUpdateEmail}
              onMarkDone={handleMarkAsDone}
              onSendReminder={handleSendReminder}
              loading={loadingIds}
              done={false}
            />
          ))}

          {payments.filter(p => p.paymentdone).length > 0 && (
            <>
              <h2 className="text-lg font-semibold pt-3 border-t">Completed Payments</h2>
              {payments.filter(p => p.paymentdone).map(payment => (
                <PaymentCard key={payment.id} payment={payment} done />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentCard({ payment, onUpdateEmail, onMarkDone, onSendReminder, loading = {}, done }) {
  const [editEmail, setEditEmail] = useState(payment.payeremail || '');
  return (
    <div className="p-4 rounded-md border bg-muted/20 space-y-1">
      <div className="text-base font-medium">{payment.payername}</div>
      <div className="text-sm">₹{payment.amount} — {payment.reason}</div>

      {!done && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2">
          <Input
            className="text-sm"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="Add Payer Email for reminder"
          />
          {loading[payment.id + '_email'] ? (
            <Button size="sm" disabled>
              <Loader2Icon className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button size="sm" onClick={() => onUpdateEmail(payment.id, editEmail)}>
              💾 Save
            </Button>
          )}

          {loading[payment.id + '_done'] ? (
            <Button size="sm" disabled>
              <Loader2Icon className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button size="sm" onClick={() => onMarkDone(payment.id)}>
              ✅ Done
            </Button>
          )}

          {loading[payment.id + '_remind'] ? (
            <Button size="sm" disabled>
              <Loader2Icon className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button size="sm" onClick={() => onSendReminder(payment)}>
              🔔 Remind
            </Button>
          )}
        </div>
      )}
      {done && <div className="text-green-600 text-sm pt-1">✅ Paid</div>}
    </div>
  );
}
