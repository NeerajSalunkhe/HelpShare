// src/app/api/remindercron/route.js
import DbConnect from '@/lib/DbConnect';
import Personal from '@/models/personal';
import { sendReminderEmail as sendEmailToUser } from '@/lib/sendReminderEmail';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await DbConnect();

        const users = await Personal.find({});

        for (const user of users) {
            // console.log(user);
            const { paytohim = [] } = user;
            for (const payment of paytohim){
                if (payment.setreminder && !payment.paymentdone) {
                    const subject = `Reminder: Your payment to ${payment.sendername} is due`;
                    const body = `Hi ${user.username},\n\nYou have not paid ₹${payment.amount} to ${payment.sendername} for "${payment.reason}".\n\nThis is your daily reminder to complete the payment.\n\nThanks!`;
                    await sendEmailToUser(
                        'no-reply@yourdomain.com',
                        user.useremail,            
                        subject,
                        body
                    );
                }
            }
        }

        return new Response(JSON.stringify({ message: 'Reminders sent' }), { status: 200 });
    } catch (err) {
        console.error('Reminder Cron Error:', err);
        return new Response(JSON.stringify({ error: 'Cron failed' }), { status: 500 });
    }
}
