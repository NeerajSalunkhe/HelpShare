import mongoose from 'mongoose';


const personalSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    username: String,
    useremail: String,
    paytoyou: [
        {
            id: {
                type: String,
                required: true,
            },
            payername: {
                type: String,
                required: true,
            },
            payeremail: String,
            amount: {
                type: Number,
                required: true,
            },
            reason: {
                type: String,
                required: true,
            },
            paymentdone: {
                type: Boolean,
                default: false,
            },
            remidetsenttime: {
                type: Date,
                default: null,
            },
        },
    ],

    paytohim: [
        {
            id: {
                type: String,
                required: true,
            },
            senderid:{
                type: String,
            },
            sendername: String,
            senderemail: String,
            amount: {
                type: Number,
                required: true,
            },
            reason: {
                type: String,
                required: true,
            },
            paymentdone: {
                type: Boolean,
                default: false,
            },
            setreminder:{
                type: Boolean,
                default: false,
            },
        },
    ],
});

export default mongoose.models.Personal || mongoose.model('Personal', personalSchema);
