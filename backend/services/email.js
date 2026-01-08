import { supabaseAdmin } from '../utils/supabase.js';

export const sendShortlistedEmail = async (userEmail, userName, jobTitle) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.sendEmail({
      email: userEmail,
      subject: 'You are shortlisted',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #10b981;">Congratulations!</h2>
          <p>Hello ${userName},</p>
          <p>Congratulations! You have been shortlisted for <strong>${jobTitle}</strong>.</p>
          <p>Our team will contact you soon.</p>
          <br>
          <p>Best regards,<br>Job Portal Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending shortlisted email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send shortlisted email:', error);
    return { success: false, error };
  }
};

export const sendRejectedEmail = async (userEmail, userName, jobTitle) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.sendEmail({
      email: userEmail,
      subject: 'Application Update',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #6b7280;">Application Update</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for applying for <strong>${jobTitle}</strong>.</p>
          <p>Unfortunately, you were not shortlisted this time.</p>
          <p>We encourage you to apply for other opportunities on our portal.</p>
          <br>
          <p>Best regards,<br>Job Portal Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending rejected email:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send rejected email:', error);
    return { success: false, error };
  }
};

export const sendBulkStatusEmails = async (applications, jobTitle) => {
  const emailPromises = applications.map(async (app) => {
    if (app.status === 'shortlisted') {
      return sendShortlistedEmail(app.user.email, app.user.name, jobTitle);
    } else if (app.status === 'rejected') {
      return sendRejectedEmail(app.user.email, app.user.name, jobTitle);
    }
  });

  try {
    await Promise.all(emailPromises);
    return { success: true };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return { success: false, error };
  }
};
