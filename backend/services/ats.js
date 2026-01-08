export const calculateATSScore = (jobSkills, resumeContent = '') => {
  const skills = jobSkills.toLowerCase().split(',').map(s => s.trim());
  const resume = resumeContent.toLowerCase();

  let matchedSkills = 0;

  skills.forEach(skill => {
    if (resume.includes(skill) || resumeContent === '') {
      matchedSkills++;
    }
  });

  const baseScore = Math.round((matchedSkills / skills.length) * 70);
  const randomBonus = Math.floor(Math.random() * 30);

  return Math.min(baseScore + randomBonus, 100);
};
