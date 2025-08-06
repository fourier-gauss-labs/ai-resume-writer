# Project Requirements Document: Job Application Workflow (Phase 3)

## Legend: Requirement ID Convention

| Prefix  | Meaning                                           |
|---------|---------------------------------------------------|
| `JM`    | Job Management Features                           |
| `KB`    | Kanban Board & Pipeline                          |
| `AI`    | AI-Powered Application Materials                  |
| `ST`    | Stretch Goals                                     |

Each ID is followed by a three-digit number, incrementing within each category.

---

## Overall System Description

### User Experience Overview

The Job Application Workflow transforms the app from a profile management tool into a comprehensive job search platform. Users capture job opportunities they've discovered (via URL or manual entry), track them through a visual pipeline, and generate AI-tailored application materials.

**Primary User Journey:**
1. User finds interesting job on LinkedIn/Indeed/company site
2. Copies job URL or description into our platform
3. AI parses job requirements and shows profile fit analysis
4. User moves job through pipeline: Interested → Applied → Interview → Completed
5. AI generates tailored resume and cover letter for each application
6. User tracks outcomes and learns from rejection patterns

### Technical Architecture

#### Data Schema
```javascript
// Job Opportunity Collection
{
  id: string,
  userId: string,
  jobTitle: string,
  company: string,
  jobUrl?: string,
  jobDescription: string,
  location?: string,
  salaryRange?: string,
  applicationDeadline?: Date,
  status: "interested" | "applied" | "interview" | "completed",

  // Completion details (only for completed status)
  completionType?: "offer_accepted" | "offer_declined" | "rejected" | "ghosted" | "withdrawn",
  completionDate?: Date,
  completionNotes?: string,
  offerDetails?: {
    salary?: number,
    startDate?: Date,
    benefits?: string
  },

  // AI-extracted data
  extractedRequirements: string[],
  extractedSkills: string[],
  companyInfo?: string,
  profileFitScore?: number,
  skillsGap?: string[],

  // User management
  personalNotes: string,
  tags: string[],
  priority: "low" | "medium" | "high",

  // Tracking
  createdAt: Date,
  updatedAt: Date,
  lastStatusChange: Date,

  // Generated materials
  tailoredResumeId?: string,
  coverLetterId?: string,
  interviewPrepId?: string
}

// Application Materials Collection
{
  id: string,
  jobId: string,
  userId: string,
  type: "resume" | "cover_letter" | "interview_prep",
  content: string,
  version: number,
  generatedAt: Date,
  used: boolean
}
```

#### URL Processing Strategy
- Attempt simple HTTP fetch for publicly available content
- Extract text content using basic HTML parsing
- Pass raw text to AI for job detail extraction
- Graceful fallback to manual entry if URL fails
- No complex scraping or authentication bypass

### UI Components

#### Kanban Board Layout
```
Interested (3) → Applied (5) → Interview (2) → Completed (68)
```

#### Job Card Design
- Company logo/favicon (if available)
- Job title and company name
- Application deadline or days since last activity
- Priority indicator and status tags
- Quick action buttons (View, Apply, Archive)
- Profile fit score visualization

#### Navigation Structure
- Main nav: Profile | Jobs | Analytics | Settings
- Jobs section: Pipeline Board | Add Job | Job List | Archived

---

## Functional Requirements

### Job Management Features

#### Job Capture System

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| JM001          | Add job via URL input                      | As a user, I want to add a job by pasting its URL so I don't have to copy all the details manually. | URL input field attempts to fetch and parse page content, pre-fills job form with extracted data. |
| JM002          | Add job via manual entry                   | As a user, I want to manually enter job details when URL parsing fails or for offline postings. | Manual form with fields for title, company, description, deadline, etc. |
| JM003          | AI-powered job description parsing         | As a user, I want the system to automatically extract key information from job descriptions. | AI extracts job title, company, requirements, skills, salary range, location from text. |
| JM004          | URL content extraction with fallback      | As a user, I want the system to try extracting job details from URLs but allow manual entry if it fails. | System attempts HTTP fetch, shows extracted content for review, falls back to manual entry gracefully. |
| JM005          | Duplicate job detection                    | As a user, I want to avoid accidentally adding the same job twice. | System checks for similar job title + company combinations and warns before adding duplicates. |

#### Profile-Job Analysis

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| JM006          | Calculate profile fit score               | As a user, I want to see how well my profile matches each job so I can prioritize applications. | AI compares job requirements against user profile, generates percentage fit score with breakdown. |
| JM007          | Identify skills gap                       | As a user, I want to know what skills I'm missing for each job so I can address gaps. | System highlights required skills not present in user profile, suggests learning resources. |
| JM008          | Extract key requirements                  | As a user, I want to see the most important requirements for each job clearly highlighted. | AI identifies must-have vs. nice-to-have requirements, presents them in organized format. |
| JM009          | Company culture analysis                  | As a user, I want to understand company culture from job postings to tailor my application. | AI extracts culture indicators, values, work style preferences from job description. |

#### Job List Management

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| JM010          | Display job cards with key information    | As a user, I want to quickly scan my saved jobs to see what needs attention. | Cards show title, company, deadline, status, fit score, and days since last update. |
| JM011          | Filter jobs by status                     | As a user, I want to focus on jobs in specific pipeline stages. | Filter dropdown allows viewing only interested/applied/interview/completed jobs. |
| JM012          | Search jobs by company or title           | As a user, I want to quickly find specific jobs in my list. | Search input filters jobs by company name, job title, or keyword in description. |
| JM013          | Sort jobs by various criteria             | As a user, I want to organize my jobs by deadline, fit score, or date added. | Sort dropdown with options: deadline, fit score, date added, company, priority. |
| JM014          | Bulk actions for job management           | As a user, I want to efficiently update multiple jobs at once. | Multi-select with bulk actions: change status, add tags, delete, archive. |

---

### Kanban Board & Pipeline

#### Board Layout and Navigation

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| KB001          | Four-column kanban board                  | As a user, I want to visualize my job search progress through clear stages. | Board with columns: Interested, Applied, Interview, Completed with job counts. |
| KB002          | Drag-and-drop status updates             | As a user, I want to quickly move jobs between stages by dragging cards. | Cards can be dragged between columns to update job status with confirmation. |
| KB003          | Collapsible completed column             | As a user, I want to hide completed jobs to focus on active opportunities. | Completed column can be collapsed, showing only count with expand option. |
| KB004          | Status change confirmation               | As a user, I want to confirm important status changes and add notes. | Modal appears for status changes to Interview/Completed asking for details/notes. |

#### Card Interactions

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| KB005          | Quick action buttons on cards            | As a user, I want to perform common actions without opening full job details. | Hover/tap reveals buttons: View Details, Generate Resume, Mark Complete, Archive. |
| KB006          | Visual priority indicators               | As a user, I want to see which jobs are most important at a glance. | Color-coded borders or badges for high/medium/low priority jobs. |
| KB007          | Deadline warnings                        | As a user, I want to be alerted when application deadlines are approaching. | Cards with deadlines within 3 days show warning colors and countdown. |
| KB008          | Status change history                    | As a user, I want to track when I moved jobs through the pipeline. | Timeline showing status changes with dates in job detail view. |

#### Completed Jobs Management

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| KB009          | Completion type selection                | As a user, I want to specify why a job is completed (offer, rejection, etc.). | Modal with options: Offer Accepted, Offer Declined, Rejected, Ghosted, Withdrawn. |
| KB010          | Offer details capture                    | As a user, I want to record offer details for accepted positions. | Form for salary, start date, benefits, notes when marking as "Offer Accepted". |
| KB011          | Rejection reason tracking                | As a user, I want to understand why applications were rejected to improve future ones. | Text field for rejection reason/feedback when marking as "Rejected". |
| KB012          | Auto-complete suggestions                | As a user, I want the system to suggest when jobs should be marked complete. | Automated suggestions: "No response for 3+ weeks - mark as ghosted?" |

---

### AI-Powered Application Materials

#### Resume Generation

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| AI001          | Generate job-tailored resume             | As a user, I want a customized resume that highlights relevant experience for each job. | AI creates resume emphasizing skills/experience that match job requirements. |
| AI002          | Multiple resume formats                   | As a user, I want different resume formats for different types of jobs. | Generate chronological, functional, or hybrid formats based on job type and user experience. |
| AI003          | ATS optimization                         | As a user, I want my resume to pass applicant tracking systems. | AI formats resume with proper keywords, sections, and ATS-friendly structure. |
| AI004          | Resume version control                   | As a user, I want to track which resume version I used for each application. | System saves generated resumes with version numbers linked to specific jobs. |

#### Cover Letter Generation

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| AI005          | Personalized cover letters               | As a user, I want cover letters that reference specific company and job details. | AI generates letters mentioning company mission, job requirements, and relevant experience. |
| AI006          | Tone adaptation                          | As a user, I want my cover letter tone to match the company culture. | AI adjusts writing style based on company culture indicators (startup vs. enterprise). |
| AI007          | Connection references                    | As a user, I want to mention mutual connections when I have them. | System prompts for connection details and incorporates them into cover letter. |
| AI008          | Company research integration             | As a user, I want my cover letter to show I've researched the company. | AI incorporates recent company news, values, or initiatives into letter content. |

#### Supporting Materials

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| AI009          | Portfolio/work sample suggestions        | As a user, I want to know which projects to highlight for each job. | AI analyzes job requirements and suggests relevant portfolio pieces from user profile. |
| AI010          | Interview preparation briefs             | As a user, I want help preparing for interviews with specific companies. | Generate company research summary, potential questions, and talking points. |
| AI011          | LinkedIn outreach templates              | As a user, I want help crafting messages to hiring managers or employees. | Generate templates for reaching out to recruiters, hiring managers, or current employees. |
| AI012          | Follow-up message templates              | As a user, I want help with follow-up communications after applying or interviewing. | AI generates thank-you notes, status inquiry emails, and follow-up messages. |

---

### Stretch Goals

#### Advanced Analytics

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| ST001          | Application success metrics              | As a user, I want to track my job search effectiveness over time. | Dashboard showing application-to-interview rate, response times, success patterns. |
| ST002          | Skills gap trend analysis               | As a user, I want to see which skills I should prioritize learning. | Analytics showing most frequently requested skills I'm missing across applications. |
| ST003          | Company response pattern tracking       | As a user, I want to understand which companies and industries respond best. | Charts showing response rates by company size, industry, job level. |
| ST004          | Time-to-hire predictions                | As a user, I want to estimate how long my job search might take. | AI predictions based on application volume, profile strength, and market data. |

#### Workflow Automation

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| ST005          | Smart deadline reminders                | As a user, I want automated reminders for application deadlines and follow-ups. | Email/browser notifications for upcoming deadlines and suggested follow-up times. |
| ST006          | Auto-archive old jobs                   | As a user, I want old completed jobs to be automatically organized. | System auto-archives completed jobs after 6 months with user notification. |
| ST007          | Application calendar integration        | As a user, I want my job search deadlines and interviews in my calendar. | Two-way sync with Google Calendar, Outlook for deadlines and interview scheduling. |
| ST008          | Status change notifications             | As a user, I want to be notified when I should update job statuses. | Smart suggestions: "Haven't heard back in 2 weeks - follow up or mark as ghosted?" |

#### Advanced Job Capture

| Requirement ID | Description                                | User Story | Expected Behavior/Outcome |
|----------------|--------------------------------------------|------------|----------------------------|
| ST009          | Browser extension for one-click save    | As a user, I want to save jobs directly from any website without copying/pasting. | Browser extension adds "Save to Pipeline" button on job posting pages. |
| ST010          | Email job forwarding                    | As a user, I want to forward job postings via email to add them to my pipeline. | Unique email address that parses forwarded job emails and adds them automatically. |
| ST011          | Mobile app with camera job capture     | As a user, I want to photograph printed job postings and have them parsed. | Mobile camera feature with OCR to extract job details from photos. |
| ST012          | Salary benchmarking integration         | As a user, I want to see market salary data for jobs I'm considering. | Integration with salary APIs to show compensation ranges and market data. |

---

## Technical Implementation Notes

### Phase 1 Priority (Weeks 1-4)
- Job capture system (URL + manual entry)
- Basic kanban board with drag-and-drop
- Simple AI job parsing
- Profile fit scoring

### Phase 2 Priority (Weeks 5-8)
- AI resume generation
- Cover letter creation
- Completion type tracking
- Basic analytics

### Phase 3 Priority (Weeks 9-12)
- Advanced AI features
- Workflow automation
- Performance optimization
- Mobile responsiveness

### Database Considerations
- Index on userId + status for fast pipeline queries
- Search indexes on jobTitle, company for filtering
- Archive strategy for old completed jobs
- Document versioning for generated materials

### API Design
- RESTful endpoints for CRUD operations
- Real-time updates for status changes
- Batch operations for bulk actions
- Webhook support for external integrations
