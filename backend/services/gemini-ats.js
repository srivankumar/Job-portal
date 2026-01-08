import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const extractResumeText = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
};

export const calculateAdvancedATSScore = async (jobSkills, jobDescription, resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an expert ATS (Applicant Tracking System) evaluator. Analyze the following resume against the job requirements and provide a score.

JOB REQUIREMENTS:
Skills: ${jobSkills}
Description: ${jobDescription}

RESUME TEXT:
${resumeText}

TASK:
1. Extract key skills from the resume
2. Match them with required skills
3. Check for experience level alignment
4. Evaluate education and qualifications
5. Provide an overall ATS score from 0-100

RESPONSE FORMAT (JSON only, no other text):
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "experienceMatch": 85,
  "educationMatch": 80,
  "overallScore": 82,
  "reasoning": "Brief explanation of the score"
}

Base your scoring on:
- Skill matching (40%)
- Experience level (30%)
- Education relevance (20%)
- Overall fit (10%)
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return fallbackATSScore(jobSkills, resumeText);
    }

    const atsData = JSON.parse(jsonMatch[0]);

    return {
      score: Math.min(100, Math.max(0, atsData.overallScore || 0)),
      matchedSkills: atsData.matchedSkills || [],
      missingSkills: atsData.missingSkills || [],
      reasoning: atsData.reasoning || 'ATS evaluation completed',
      details: {
        experienceMatch: atsData.experienceMatch || 0,
        educationMatch: atsData.educationMatch || 0,
      },
    };
  } catch (error) {
    console.error('Gemini ATS error:', error);
    return fallbackATSScore(jobSkills, resumeText);
  }
};

const fallbackATSScore = (jobSkills, resumeText) => {
  const skills = jobSkills.toLowerCase().split(',').map((s) => s.trim());
  const resumeLower = resumeText.toLowerCase();

  let matchedSkills = [];
  let matchCount = 0;

  skills.forEach((skill) => {
    if (resumeLower.includes(skill)) {
      matchedSkills.push(skill);
      matchCount++;
    }
  });

  const baseScore = Math.round((matchCount / skills.length) * 70);
  const bonus = Math.floor(Math.random() * 20);
  const finalScore = Math.min(100, baseScore + bonus);

  return {
    score: finalScore,
    matchedSkills: matchedSkills,
    missingSkills: skills.filter((s) => !matchedSkills.includes(s)),
    reasoning: `Matched ${matchCount} out of ${skills.length} required skills`,
    details: {
      experienceMatch: Math.round(finalScore * 0.85),
      educationMatch: Math.round(finalScore * 0.8),
    },
  };
};

export const updateATSInSupabase = async (supabase, applicationId, atsData) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({
        ats_score: atsData.score,
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating ATS score in Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Update ATS Supabase error:', error);
    return null;
  }
};
