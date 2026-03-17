// Client-side match scoring utilities

/**
 * Calculates a simple match score between user skills and required skills
 * Real scoring happens server-side via Huawei ModelArts
 */
export function scoreSkillMatch(userSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return 100;
  const userSet = new Set(userSkills.map(s => (s.skill_name || s).toLowerCase()));
  const matched = requiredSkills.filter(s => userSet.has(s.toLowerCase())).length;
  return Math.round((matched / requiredSkills.length) * 100);
}

/**
 * Calculate salary match score
 */
export function scoreSalaryMatch(userMin, userMax, jobMin, jobMax) {
  if (!jobMin || !userMin) return 70; // neutral
  const overlap = Math.min(userMax || jobMax, jobMax) - Math.max(userMin, jobMin);
  const range = Math.max(userMax || jobMax, jobMax) - Math.min(userMin, jobMin);
  if (range === 0) return 100;
  return Math.max(0, Math.round((overlap / range) * 100));
}

/**
 * Province match
 */
export function scoreLocationMatch(userProvince, jobProvince, isRemote = false) {
  if (isRemote) return 100;
  if (!userProvince || !jobProvince) return 60;
  return userProvince === jobProvince ? 100 : 40;
}

/**
 * Combined job match score (client-side estimate)
 */
export function estimateJobMatch(user, job) {
  const skillScore    = scoreSkillMatch(user.skills, job.required_skills) * 0.5;
  const salaryScore   = scoreSalaryMatch(user.salary_min, user.salary_max, job.salary_min, job.salary_max) * 0.3;
  const locationScore = scoreLocationMatch(user.province, job.province, job.work_style === "remote") * 0.2;
  return Math.round(skillScore + salaryScore + locationScore);
}

/**
 * Grant eligibility estimate (client-side rules check)
 */
export function estimateGrantEligibility(user, grant) {
  let score = 0;
  const reasons = [];
  const fails = [];

  // Age check
  if (grant.min_age && user.age) {
    if (user.age >= grant.min_age && (!grant.max_age || user.age <= grant.max_age)) {
      score += 30; reasons.push(`Age meets requirement (${grant.min_age}${grant.max_age ? `–${grant.max_age}` : "+"})`);
    } else {
      fails.push("Age does not meet requirement");
    }
  } else { score += 20; }

  // Gender check
  if (grant.gender && grant.gender !== "all") {
    if (user.gender?.toLowerCase() === grant.gender?.toLowerCase()) {
      score += 25; reasons.push(`${grant.gender} applicant preferred`);
    } else if (grant.gender === "female" && user.gender !== "female") {
      fails.push("Women-only grant");
    }
  } else { score += 15; }

  // ECS bonus
  if (user.ecs_score >= 500) { score += 20; reasons.push("Strong ECS score"); }
  else if (user.ecs_score >= 300) { score += 10; }

  // Province
  if (!grant.province || grant.province === user.province) { score += 15; }
  else { fails.push(`Gauteng province required`); }

  // CIPC
  if (grant.requires_cipc && !user.has_cipc) { fails.push("CIPC registration required"); }
  else if (grant.requires_cipc) { score += 10; reasons.push("CIPC registered"); }

  return {
    score: Math.min(100, score),
    is_eligible: fails.length === 0 && score >= 50,
    reasons,
    disqualifiers: fails,
  };
}