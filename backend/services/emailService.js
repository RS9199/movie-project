const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `http://localhost:3001/api/auth/verify-email/${token}`;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'MovisionAI', email: process.env.EMAIL_USER },
                to: [{ email: email, name: name }],
                subject: 'Verify your MovisionAI account',
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #7c3aed; text-align: center;">Welcome to MovisionAI!</h1>
                        <p>Hi ${name},</p>
                        <p>Thanks for creating an account! Please verify your email address by clicking the button below:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background: linear-gradient(135deg, #e040fb, #536dfe); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 25px; 
                                      font-weight: bold;
                                      font-size: 16px;">
                                Verify My Email
                            </a>
                        </div>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="color: #536dfe; word-break: break-all;">${verificationUrl}</p>
                        <p>This link expires in 24 hours.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            If you didn't create an account, you can safely ignore this email.
                        </p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Email API error:', data);
            return false;
        }

        console.log('Verification email sent to:', email, 'Response:', data);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};


const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'MovisionAI', email: process.env.EMAIL_USER },
                to: [{ email: email, name: name }],
                subject: 'Reset your MovisionAI password',
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #7c3aed; text-align: center;">Password Reset</h1>
                        <p>Hi ${name},</p>
                        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #e040fb, #536dfe); 
                                      color: white; 
                                      padding: 12px 30px; 
                                      text-decoration: none; 
                                      border-radius: 25px; 
                                      font-weight: bold;
                                      font-size: 16px;">
                                Reset My Password
                            </a>
                        </div>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="color: #536dfe; word-break: break-all;">${resetUrl}</p>
                        <p>This link expires in 1 hour.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">
                            If you didn't request a password reset, you can safely ignore this email.
                        </p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Email API error:', data);
            return false;
        }

        console.log('Password reset email sent to:', email);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
