import { UserProfile, JobHistory, Education, Certification, ContactInformation } from './profileService';

export interface ResumePersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
}

export interface ResumeExperienceItem {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
}

export interface ResumeEducationItem {
    degree: string;
    school: string;
    duration: string;
}

export interface ResumeCertificationItem {
    name: string;
    issuer: string;
    date: string;
}

export interface ResumeContent {
    personalInfo: ResumePersonalInfo;
    summary: string;
    experience: ResumeExperienceItem[];
    education: ResumeEducationItem[];
    skills: string[];
    certifications: ResumeCertificationItem[];
}

export class ResumeContentGenerator {
    /**
     * Convert user profile data into resume content format
     */
    static generateResumeContent(profile: UserProfile, jobDescription?: string): ResumeContent {
        const personalInfo = this.convertContactInfo(profile.contactInformation);
        const experience = this.convertJobHistory(profile.jobHistory);
        const education = this.convertEducation(profile.education);
        const skills = this.processSkills(profile.skills, jobDescription);
        const certifications = this.convertCertifications(profile.certifications);
        const summary = this.generateSummary(profile);

        return {
            personalInfo,
            summary,
            experience,
            education,
            skills,
            certifications
        };
    }

    /**
     * Convert contact information to resume format
     */
    private static convertContactInfo(contactInfo: ContactInformation): ResumePersonalInfo {
        // Handle email field - it might be a string or array
        let email = 'your.email@example.com';
        if (contactInfo.email) {
            if (Array.isArray(contactInfo.email) && contactInfo.email.length > 0) {
                email = contactInfo.email[0]; // Take the first email if it's an array
            } else if (typeof contactInfo.email === 'string') {
                email = contactInfo.email;
            }
        }

        return {
            name: contactInfo.fullName || 'Your Name',
            email: email,
            phone: contactInfo.phone || '(555) 123-4567',
            location: contactInfo.address || 'Your City, State'
        };
    }

    /**
     * Convert job history to resume experience format
     */
    private static convertJobHistory(jobHistory: JobHistory[]): ResumeExperienceItem[] {
        return jobHistory.map(job => {
            // Create duration string
            let duration = '';
            if (job.startDate && job.endDate) {
                const start = new Date(job.startDate).toLocaleDateString('en-US', {
                    month: 'short', year: 'numeric'
                });
                const end = job.endDate === 'present' ? 'Present' :
                    new Date(job.endDate).toLocaleDateString('en-US', {
                        month: 'short', year: 'numeric'
                    });
                duration = `${start} - ${end}`;
            } else if (job.duration) {
                duration = job.duration;
            } else {
                duration = 'Dates not specified';
            }

            // Create bullet points from various sources
            const bullets: string[] = [];

            if (job.achievements && job.achievements.length > 0) {
                bullets.push(...job.achievements);
            }

            if (job.responsibilities && job.responsibilities.length > 0) {
                bullets.push(...job.responsibilities);
            }

            if (bullets.length === 0 && job.description) {
                // Split description into bullet points if no specific bullets provided
                const descriptionBullets = job.description
                    .split(/[.;]\s+/)
                    .filter(bullet => bullet.trim().length > 10)
                    .map(bullet => bullet.trim().replace(/^[-•]\s*/, ''))
                    .slice(0, 4); // Limit to 4 bullets
                bullets.push(...descriptionBullets);
            }

            // Ensure we have at least one bullet point
            if (bullets.length === 0) {
                bullets.push('Contributed to company objectives and team success');
            }

            return {
                title: job.title || 'Position Title',
                company: job.company || 'Company Name',
                duration,
                bullets: bullets.slice(0, 5) // Limit to 5 bullets for resume brevity
            };
        });
    }

    /**
     * Convert education to resume format
     */
    private static convertEducation(education: Education[]): ResumeEducationItem[] {
        return education.map(edu => {
            let duration = '';
            if (edu.startDate && edu.endDate) {
                const start = new Date(edu.startDate).getFullYear();
                const end = edu.endDate === 'present' ? 'Present' : new Date(edu.endDate).getFullYear();
                duration = `${start} - ${end}`;
            } else if (edu.duration) {
                duration = edu.duration;
            } else {
                duration = 'Year not specified';
            }

            return {
                degree: edu.degree || 'Degree',
                school: edu.school || 'Institution',
                duration
            };
        });
    }

    /**
     * Process and filter skills for relevance
     */
    private static processSkills(skills: string[], jobDescription?: string): string[] {
        if (!skills || skills.length === 0) {
            return ['Communication', 'Problem Solving', 'Teamwork'];
        }

        // If no job description, return all skills (limited)
        if (!jobDescription) {
            return skills.slice(0, 12); // Limit to 12 skills
        }

        // TODO: In Phase 2, implement AI-powered skill matching based on job description
        // For now, just return the skills (prioritizing technical skills)
        const technicalKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'git'];

        const sortedSkills = [...skills].sort((a, b) => {
            const aIsTechnical = technicalKeywords.some(keyword =>
                a.toLowerCase().includes(keyword)
            );
            const bIsTechnical = technicalKeywords.some(keyword =>
                b.toLowerCase().includes(keyword)
            );

            if (aIsTechnical && !bIsTechnical) return -1;
            if (!aIsTechnical && bIsTechnical) return 1;
            return 0;
        });

        return sortedSkills.slice(0, 12);
    }

    /**
     * Convert certifications to resume format
     */
    private static convertCertifications(certifications: Certification[]): ResumeCertificationItem[] {
        return certifications.map(cert => ({
            name: cert.name || 'Certification Name',
            issuer: cert.issuer || 'Issuing Organization',
            date: cert.date || 'Year not specified'
        }));
    }

    /**
     * Generate a professional summary
     */
    private static generateSummary(profile: UserProfile): string {
        const { jobHistory, skills, education, certifications } = profile;

        // Calculate years of experience
        const currentYear = new Date().getFullYear();
        let yearsOfExperience = 0;

        if (jobHistory.length > 0) {
            const oldestJob = jobHistory.reduce((oldest, job) => {
                if (!job.startDate) return oldest;
                const startYear = new Date(job.startDate).getFullYear();
                return !oldest || startYear < oldest ? startYear : oldest;
            }, null as number | null);

            if (oldestJob) {
                yearsOfExperience = currentYear - oldestJob;
            }
        }

        // Build summary components
        const summaryParts: string[] = [];

        // Experience intro
        if (yearsOfExperience > 0) {
            summaryParts.push(`${yearsOfExperience}+ years of professional experience`);
        } else if (jobHistory.length > 0) {
            summaryParts.push('Professional with demonstrated experience');
        }

        // Latest position
        if (jobHistory.length > 0) {
            const latestJob = jobHistory[0]; // Assuming sorted by date
            if (latestJob.title) {
                summaryParts.push(`in ${latestJob.title.toLowerCase()}`);
            }
        }

        // Key skills (top 3-4)
        if (skills.length > 0) {
            const topSkills = skills.slice(0, 4).join(', ');
            summaryParts.push(`with expertise in ${topSkills}`);
        }

        // Education highlight
        if (education.length > 0) {
            const highestDegree = education[0]; // Assuming sorted by level
            if (highestDegree.degree) {
                summaryParts.push(`Holds ${highestDegree.degree}`);
                if (highestDegree.school) {
                    summaryParts.push(`from ${highestDegree.school}`);
                }
            }
        }

        // Certifications
        if (certifications.length > 0) {
            const certCount = certifications.length;
            summaryParts.push(`with ${certCount} professional certification${certCount > 1 ? 's' : ''}`);
        }

        // Combine into professional summary
        if (summaryParts.length === 0) {
            return 'Motivated professional seeking new opportunities to contribute skills and expertise to a dynamic organization.';
        }

        // Create a flowing narrative
        let summary = summaryParts[0];

        for (let i = 1; i < summaryParts.length; i++) {
            if (i === summaryParts.length - 1) {
                summary += `. ${summaryParts[i]}`;
            } else if (summaryParts[i].startsWith('in ') || summaryParts[i].startsWith('with ')) {
                summary += ` ${summaryParts[i]}`;
            } else {
                summary += `. ${summaryParts[i]}`;
            }
        }

        summary += '. Proven track record of delivering results and contributing to team success.';

        return summary;
    }
}
