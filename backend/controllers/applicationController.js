import { supabase } from '../utils/supabase.js';
import { uploadToWasabi, getResumeUrl } from '../services/wasabi.js';
import { extractResumeText, calculateAdvancedATSScore, updateATSInSupabase } from '../services/gemini-ats.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (new Date(job.application_deadline) < new Date() || !job.is_active) {
      return res.status(400).json({ error: 'Application deadline has passed' });
    }

    const { data: existingApp } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (existingApp) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    const resumeUrl = await uploadToWasabi(req.file, userId, jobId);

    const resumeText = await extractResumeText(req.file.buffer);

    const atsData = await calculateAdvancedATSScore(job.skills, job.description, resumeText);

    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          user_id: userId,
          job_id: jobId,
          resume_url: resumeUrl,
          ats_score: atsData.score,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      application: data,
      atsDetails: {
        score: atsData.score,
        matchedSkills: atsData.matchedSkills,
        missingSkills: atsData.missingSkills,
        reasoning: atsData.reasoning,
      },
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ applications: data });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { jobId, status, minScore } = req.query;

    let query = supabase
      .from('applications')
      .select(`
        *,
        user:users(id, name, email),
        job:jobs(id, title)
      `);

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (minScore) {
      query = query.gte('ats_score', parseInt(minScore));
    }

    query = query.order('ats_score', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ applications: data });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ application: data });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

export const getTopCandidates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        user:users(id, name, email),
        job:jobs(id, title)
      `)
      .order('ats_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ candidates: data });
  } catch (error) {
    console.error('Get top candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch top candidates' });
  }
};

export const downloadResume = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    if (!key) {
      return res.status(400).json({ error: 'Resume key is required' });
    }

    const { data: application, error } = await supabase
      .from('applications')
      .select('id, user_id, resume_url')
      .eq('resume_url->>key', key)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!application) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (req.user.role !== 'admin' && application.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const signedUrl = getResumeUrl(key);

    if (!signedUrl) {
      return res.status(500).json({ error: 'Failed to generate download link' });
    }

    res.json({ url: signedUrl });
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ error: 'Failed to download resume' });
  }
};
