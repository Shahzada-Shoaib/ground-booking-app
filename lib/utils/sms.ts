/**
 * SMS Service - Extensible structure for SMS notifications
 * Currently a placeholder - can be integrated with Twilio, etc.
 */

export interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private static isConfigured(): boolean {
    // Check if SMS service is configured
    return !!process.env.SMS_SERVICE_API_KEY;
  }

  static async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📱 SMS service not configured. Would send:', options);
      // In development, just log the SMS
      return true;
    }

    try {
      // TODO: Implement actual SMS sending
      // Example with Twilio:
      // const client = require('twilio')(
      //   process.env.TWILIO_ACCOUNT_SID,
      //   process.env.TWILIO_AUTH_TOKEN
      // );
      // await client.messages.create({
      //   body: options.message,
      //   to: options.to,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      // });

      console.log('📱 SMS sent:', options.to, options.message);
      return true;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  static async sendBookingConfirmation(
    phone: string,
    bookingDetails: {
      groundName: string;
      date: string;
      time: string;
    }
  ): Promise<boolean> {
    const message = `Booking Confirmed! ${bookingDetails.groundName} on ${bookingDetails.date} at ${bookingDetails.time}. Thank you!`;

    return this.sendSMS({
      to: phone,
      message,
    });
  }

  static async sendBookingReminder(
    phone: string,
    bookingDetails: {
      groundName: string;
      date: string;
      time: string;
    }
  ): Promise<boolean> {
    const message = `Reminder: Your booking at ${bookingDetails.groundName} is tomorrow (${bookingDetails.date}) at ${bookingDetails.time}. See you soon!`;

    return this.sendSMS({
      to: phone,
      message,
    });
  }
}

