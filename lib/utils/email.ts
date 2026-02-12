/**
 * Email Service - Extensible structure for email notifications
 * Currently a placeholder - can be integrated with Nodemailer, SendGrid, Resend, etc.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    // Check if email service is configured
    return !!process.env.EMAIL_SERVICE_API_KEY;
  }

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📧 Email service not configured. Would send:', options);
      // In development, just log the email
      return true;
    }

    try {
      // TODO: Implement actual email sending
      // Example with Nodemailer:
      // const transporter = nodemailer.createTransport({
      //   service: 'gmail',
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASSWORD,
      //   },
      // });
      // await transporter.sendMail(options);

      console.log('📧 Email sent:', options.to, options.subject);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  static async sendBookingConfirmation(
    email: string,
    bookingDetails: {
      customerName: string;
      groundName: string;
      date: string;
      time: string;
      totalPrice: number;
    }
  ): Promise<boolean> {
    const html = `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${bookingDetails.customerName},</p>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Ground:</strong> ${bookingDetails.groundName}</li>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
        <li><strong>Amount:</strong> Rs. ${bookingDetails.totalPrice}</li>
      </ul>
      <p>Thank you for your booking!</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed - ${bookingDetails.groundName}`,
      html,
    });
  }

  static async sendBookingCancellation(
    email: string,
    bookingDetails: {
      customerName: string;
      groundName: string;
      date: string;
      time: string;
    }
  ): Promise<boolean> {
    const html = `
      <h2>Booking Cancelled</h2>
      <p>Dear ${bookingDetails.customerName},</p>
      <p>Your booking has been cancelled:</p>
      <ul>
        <li><strong>Ground:</strong> ${bookingDetails.groundName}</li>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
      </ul>
      <p>If you have any questions, please contact us.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Booking Cancelled - ${bookingDetails.groundName}`,
      html,
    });
  }

  static async sendBookingReminder(
    email: string,
    bookingDetails: {
      customerName: string;
      groundName: string;
      date: string;
      time: string;
    }
  ): Promise<boolean> {
    const html = `
      <h2>Booking Reminder</h2>
      <p>Dear ${bookingDetails.customerName},</p>
      <p>This is a reminder for your upcoming booking:</p>
      <ul>
        <li><strong>Ground:</strong> ${bookingDetails.groundName}</li>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Booking Reminder - ${bookingDetails.groundName}`,
      html,
    });
  }
}

