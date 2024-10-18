export const forgotPasswordTemplate = (appURL: string, token: string) => {
  return `
    <h1 style="font-size: 2rem;text-align:center;">Hello there</h1>
    <div style="background-color:#1c293b; color:#fff; text-align:center; padding: 2rem;">
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the <a href="${appURL}/reset-password?token=${token}">following link</a>, or paste this ${appURL}/reset-password?token=${token} into your browser to complete the process. If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;
};
