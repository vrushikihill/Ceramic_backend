import { APP_NAME } from 'src/constants/constants';

export const setPasswordTemplate = (
  appURL: string,
  token: string,
  adminName: string,
) => {
  return `
    <h1 style="font-size: 2rem;text-align:center;">Hello there, ${adminName} added you to ${APP_NAME}</h1>
    <div style="background-color:#1c293b; color:#fff; text-align:center; padding: 2rem;">
    <p>You can join ${APP_NAME} by setting up the password for your account. Please click on the <a href="${appURL}/set-password?token=${token}">following link</a>, or paste this ${appURL}/set-password?token=${token} into your browser to complete the process.</p>
    </div>
  `;
};
