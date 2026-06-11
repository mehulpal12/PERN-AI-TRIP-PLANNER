export const forgotPasswordTemplate = (resetUrl: string, name: string) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset for your AI Trip Planner account.</p>
      <a href="${resetUrl}" style="display:inline-block; padding:12px 20px; background:#000; color:#fff; text-decoration:none; border-radius:6px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};

export const emailVerificationTemplate = (verificationUrl: string, name: string) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Please verify your email address to activate your AI Trip Planner account.</p>
      <a href="${verificationUrl}" style="display:inline-block; padding:12px 20px; background:#000; color:#fff; text-decoration:none; border-radius:6px;">Verify Email</a>
      <p>If you did not create this account, please ignore this email.</p>
    </div>
  `;
};
