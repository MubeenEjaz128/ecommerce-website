const nodemailer = require("nodemailer");
const env = require("../config/env");

function createTransporter() {
  if (!env.email.host || !env.email.user || !env.email.pass) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass,
    },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();
  const mailOptions = {
    from: env.email.user || "no-reply@ecommerce.local",
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  if (!env.email.host) {
    console.log(`Email preview for ${to}: ${subject}`);
  }

  return info;
}

function shellTemplate({ title, heading, body, ctaText, ctaUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; background:#f7f7f5; padding:24px; color:#111827;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e5e7eb;">
        <div style="padding:32px;">
          <p style="letter-spacing:.18em; text-transform:uppercase; font-size:12px; color:#6b7280; margin:0 0 16px;">${title}</p>
          <h1 style="margin:0 0 16px; font-size:28px; line-height:1.2;">${heading}</h1>
          <p style="font-size:16px; line-height:1.7; color:#374151;">${body}</p>
          ${
            ctaUrl
              ? `<a href="${ctaUrl}" style="display:inline-block; margin-top:24px; background:#111827; color:#ffffff; text-decoration:none; padding:14px 22px; border-radius:999px; font-weight:700;">${ctaText}</a>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

async function sendVerificationEmail({ email, name, verificationUrl }) {
  return sendEmail({
    to: email,
    subject: "Verify your Fashion Store account",
    text: `Hi ${name}, verify your account using this link: ${verificationUrl}`,
    html: shellTemplate({
      title: "Email Verification",
      heading: `Welcome ${name}, verify your account`,
      body: "Tap the button below to activate your account and finish sign up.",
      ctaText: "Verify account",
      ctaUrl: verificationUrl,
    }),
  });
}

async function sendPasswordResetEmail({ email, name, resetUrl }) {
  return sendEmail({
    to: email,
    subject: "Reset your Fashion Store password",
    text: `Hi ${name}, reset your password using this link: ${resetUrl}`,
    html: shellTemplate({
      title: "Password Reset",
      heading: `Reset password for ${name}`,
      body: "Use the secure link below to create a new password. This link expires shortly.",
      ctaText: "Reset password",
      ctaUrl: resetUrl,
    }),
  });
}

async function sendOrderConfirmationEmail({ email, name, orderNumber, orderUrl }) {
  return sendEmail({
    to: email,
    subject: `Order confirmation #${orderNumber}`,
    text: `Thank you ${name}. Your order #${orderNumber} has been confirmed.`,
    html: shellTemplate({
      title: "Order Confirmed",
      heading: `Thanks ${name}, your order is confirmed`,
      body: `Order number ${orderNumber} is on its way through processing.`,
      ctaText: "View order",
      ctaUrl: orderUrl,
    }),
  });
}

async function sendShippingUpdateEmail({ email, name, orderNumber, trackingUrl, status = "shipped" }) {
  return sendEmail({
    to: email,
    subject: `Your order #${orderNumber} is ${status}`,
    text: `Hi ${name}, your order #${orderNumber} is now ${status}.`,
    html: shellTemplate({
      title: "Shipping Update",
      heading: `Your order is ${status}`,
      body: `Track order #${orderNumber} with the link below.`,
      ctaText: "Track order",
      ctaUrl: trackingUrl,
    }),
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
};