import cron from 'node-cron';
import { supabase } from '../utils/supabase.js';
import { sendBulkStatusEmails } from './email.js';

export const startJobExpiryScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily job expiry check...');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: expiredJobs, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .lt('application_deadline', today);

      if (jobError) {
        console.error('Error fetching expired jobs:', jobError);
        return;
      }

      if (!expiredJobs || expiredJobs.length === 0) {
        console.log('No expired jobs found');
        return;
      }

      for (const job of expiredJobs) {
        const { data: applications, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            user:users(id, name, email)
          `)
          .eq('job_id', job.id);

        if (appError) {
          console.error(`Error fetching applications for job ${job.id}:`, appError);
          continue;
        }

        applications.sort((a, b) => b.ats_score - a.ats_score);

        const shortlistCount = Math.ceil(applications.length * 0.3);

        for (let i = 0; i < applications.length; i++) {
          const newStatus = i < shortlistCount ? 'shortlisted' : 'rejected';

          await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', applications[i].id);

          applications[i].status = newStatus;
        }

        await supabase
          .from('jobs')
          .update({ is_active: false })
          .eq('id', job.id);

        await sendBulkStatusEmails(applications, job.title);

        console.log(`Processed expired job: ${job.title} (${job.id})`);
      }

      console.log(`Processed ${expiredJobs.length} expired jobs`);
    } catch (error) {
      console.error('Error in job expiry scheduler:', error);
    }
  });

  console.log('Job expiry scheduler started (runs daily at midnight)');
};
