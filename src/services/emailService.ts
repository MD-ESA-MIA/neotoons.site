interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

class EmailService {
  private apiKey: string | null = null;
  private appEmail: string = 'neotoons.site.help@gmail.com';

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    this.apiKey = process.env.RESEND_API_KEY || null;
    this.appEmail = process.env.APP_EMAIL || 'neotoons.site.help@gmail.com';

    if (!this.apiKey) {
      console.warn(
        '⚠️ Resend API key not configured. Email sending will be disabled. Set RESEND_API_KEY environment variable.'
      );
      return;
    }

    console.log('✅ Email service initialized successfully with Resend');
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Email service not configured. Please check RESEND_API_KEY environment variable.',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `NeoToons AI <${this.appEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Email sent: ${data.id}`);
      return { success: true, messageId: data.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to send email:', errorMessage);
      return {
        success: false,
        error: `Failed to send email: ${errorMessage}`,
      };
    }
  }

  async sendContactFormEmail(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const adminEmail = process.env.ADMIN_EMAIL || 'neotoons.site.help@gmail.com';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
          
          <p style="margin: 15px 0;">
            <strong style="color: #667eea;">Name:</strong><br/>
            ${this.escapeHtml(contactData.name)}
          </p>
          
          <p style="margin: 15px 0;">
            <strong style="color: #667eea;">Email:</strong><br/>
            <a href="mailto:${this.escapeHtml(contactData.email)}">${this.escapeHtml(contactData.email)}</a>
          </p>
          
          <p style="margin: 15px 0;">
            <strong style="color: #667eea;">Subject:</strong><br/>
            ${this.escapeHtml(contactData.subject)}
          </p>
          
          <p style="margin: 15px 0;">
            <strong style="color: #667eea;">Message:</strong><br/>
            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin-top: 10px;">
              ${contactData.message.split('\n').join('<br/>')}
            </div>
          </p>
        </div>
        
        <div style="padding: 15px; background: #f0f0f0; text-align: center; font-size: 12px; color: #666; border: 1px solid #ddd; border-top: none;">
          <p style="margin: 0;">This email was sent from your NeoToons AI contact form.</p>
        </div>
      </div>
    `;

    const textContent = `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `[NeoToons AI Contact] ${contactData.subject}`,
      html: htmlContent,
      text: textContent,
      replyTo: contactData.email,
    });
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

export const emailService = new EmailService();
