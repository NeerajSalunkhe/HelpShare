import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    groupid: {
      type: String,
      required: true,
      unique: true, // Ensures each group ID is unique
    },
    creatorid: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    collectedamount: {
      type: Number,
    },
    members: [
      {
        userid: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        paymentdone: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          enum: ['notdone', 'verifying', 'done'],
          default: 'notdone',
        },
      },
    ],
  },
  { timestamps: true }
);

const Group = mongoose.models?.Group || mongoose.model('Group', groupSchema);
export default Group;
