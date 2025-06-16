import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    razorpay_key_id: {
      type: String,
    },
    razorpay_secret: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
