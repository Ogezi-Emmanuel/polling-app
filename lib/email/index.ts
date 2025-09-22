import sgMail from '@sendgrid/mail';
import { EmailError } from '@/lib/errors';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface SendEmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    await sgMail.send(options);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new EmailError('Failed to send email');
  }
}

export { EmailError };