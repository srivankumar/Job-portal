import { supabase } from '../utils/supabase.js';
import { sendBulkStatusEmails } from '../services/email.js';

export const getActiveJobs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .gte('application_deadline', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ jobs: data });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const jobsWithStatus = data.map(job => ({
      ...job,
      isExpired: new Date(job.application_deadline) < new Date() || !job.is_active,
    }));

    res.json({ jobs: jobsWithStatus });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job: data });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, description, skills, experience, application_deadline } = req.body;

    if (!title || !description || !skills || !experience || !application_deadline) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title,
          description,
          skills,
          experience,
          application_deadline,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ job: data });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, skills, experience, application_deadline } = req.body;

    const { data, error } = await supabase
      .from('jobs')
      .update({
        title,
        description,
        skills,
        experience,
        application_deadline,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ job: data });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const endApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        user:users(id, name, email)
      `)
      .eq('job_id', id);

    if (appError) {
      return res.status(400).json({ error: appError.message });
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
      .eq('id', id);

    await sendBulkStatusEmails(applications, job.title);

    res.json({
      message: 'Application ended and emails sent',
      shortlisted: shortlistCount,
      rejected: applications.length - shortlistCount,
    });
  } catch (error) {
    console.error('End application error:', error);
    res.status(500).json({ error: 'Failed to end application' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
