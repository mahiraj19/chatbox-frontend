import React, { useState } from 'react';
import axios from 'axios';

function SignUpOTP() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const requestOtp = async () => {
        try {
            await axios.post('/api/send-otp', { phone });
            setIsOtpSent(true);
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };

    const verifyOtp = async () => {
        try {
            const response = await axios.post('/api/verify-otp', { phone, otp });
            if (response.data.success) {
                console.log("OTP Verified!");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
        }
    };

    return (
        <div>
            {!isOtpSent ? (
                <div>
                    <h2>Sign In</h2>
                    <input
                        type="text"
                        placeholder="Enter mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button onClick={requestOtp}>Send OTP</button>
                </div>
            ) : (
                <div>
                    <h2>Enter OTP</h2>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={verifyOtp}>Verify OTP</button>
                </div>
            )}
        </div>
    );
}

export default SignUpOTP;
