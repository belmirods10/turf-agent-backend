const express = require('express');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/call-turf', async (req, res) => {
  const { turfName, turfPhone, bookingDetails } = req.body;
  const { date, time, duration, players } = bookingDetails;

  try {
    const call = await twilioClient.calls.create({
      to: turfPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: `<Response>
        <Say voice="Polly.Aditi" language="en-IN">
          Hello, I am calling to check availability at ${turfName}.
          We would like to book a turf for ${players} players
          on ${date} at ${time} for ${duration}.
          Please call us back to confirm the booking. Thank you!
        </Say>
      </Response>`
    });

    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/call-status/:callSid', async (req, res) => {
  try {
    const call = await twilioClient.calls(req.params.callSid).fetch();
    res.json({ status: call.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Turf Agent backend is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));