const nodemailer = require("nodemailer");

// Setup your email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Verification Email
exports.sendVerificationEmail = async (email, token) => {
  const verificationLink = `https://draycore-med-tau.vercel.app/2FA/${token}`; //verification link

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account Verification",
    html: `<p>Click on the link below to verify your account:</p><a href="${verificationLink}">Verify Account ${verificationLink}</a>`,
  });
};

// Send Password Reset Email
exports.sendPasswordResetEmail = async (email, token) => {
  const resetLink = `https://draycore-med-tau.vercel.app/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password ${resetLink}</a>`,
  });
};
