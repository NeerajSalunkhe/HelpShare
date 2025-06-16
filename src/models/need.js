import mongoose from 'mongoose';

const needSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
    },
    needid: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    proofImage1: {
      type: String,
      required: true,
    },
    proofImage2: {
      type: String,
      required: true,
    },
    requiredAmount: {
      type: Number,
      required: true,
    },
    collectedAmount: {
      type: Number,
      default: 0,
    },
    mainReason: {
      type: String,
      required: true,
    },
    helps: [
      {
        orderid: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        givenAmount: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Prevent model overwrite during development
const Need = mongoose.models?.Need || mongoose.model('Need', needSchema);

export default Need;
