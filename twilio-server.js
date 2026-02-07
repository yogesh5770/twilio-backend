const express = require('express');
const twilio = require('twilio');
const app = express();
app.use(express.json());

// Load environment variables if .env file exists (for local dev)
require('dotenv').config();

// ----------------------------------------------------
// 🔑 CREDENTIALS (Loaded from Environment Variables)
// ----------------------------------------------------
const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN;    
const twilioNumber = process.env.TWILIO_PHONE_NUMBER; 

if (!accountSid || !authToken || !twilioNumber) {
    console.error("❌ Error: Missing Twilio Credentials in Environment Variables.");
    process.exit(1);
}

const client = twilio(accountSid, authToken);

// ----------------------------------------------------
// 📞 API: Bridge Call
// ----------------------------------------------------
app.post('/bridge-call', async (req, res) => {
    const { user_phone, delivery_boy_phone } = req.body;

    console.log(`Bridging call: ${user_phone} <--> ${delivery_boy_phone}`);

    try {
        // Step 1: Call the User (This is the first leg)
        // When user answers, Twilio executes the TwiML to call the Delivery Boy
        const call = await client.calls.create({
            // TwiML: Instructions for what to do when User answers
            // 1. Say Welcome
            // 2. Dial the delivery boy
            twiml: `<Response>
                        <Say>Welcome to Jayabharathi Store. Please wait while we connect your call.</Say>
                        <Dial>${delivery_boy_phone}</Dial>
                    </Response>`, 
            to: user_phone,
            from: twilioNumber
        });

        res.json({ success: true, message: "Call initiated", sid: call.sid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
