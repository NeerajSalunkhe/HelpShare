'use server'
import Razorpay from 'razorpay';
import dbConnect from '@/lib/DbConnect';
import Need from '@/models/need';

export const initiate = async (user, form, needid) => {
  await dbConnect();

  // Ensure payment credentials exist
  if (!user.razorpay_key_id || !user.razorpay_secret) {
    throw new Error('Razorpay credentials are missing.');
  }

  const instance = new Razorpay({
    key_id: user.razorpay_key_id,
    key_secret: user.razorpay_secret,
  });

  const amountInPaise = Number(form.amount) * 100;

  const order = await instance.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      donor: form.name,
      requestId: needid,
    },
  });

  // Fetch the need post
  const existingNeed = await Need.findOne({ needid });
  if (!existingNeed) {
    throw new Error('Donation request not found.');
  }

  // Update helps array and collectedAmount
  existingNeed.helps.push({
    orderid: order.id,
    name: form.name,
    givenAmount: Number(form.amount),
  });

  existingNeed.collectedAmount += Number(form.amount);
  await existingNeed.save();

  return order;
};
