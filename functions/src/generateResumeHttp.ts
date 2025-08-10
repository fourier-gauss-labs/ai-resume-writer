import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

// Types for the resume data structure
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

interface EducationItem {
  degree: string;
  school: string;
  duration: string;
}

interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  certifications: CertificationItem[];
}

interface GenerateResumeRequest {
  templateId: string;
  content: ResumeContent;
  customizations?: {
    colors?: {
      primary?: string;
    };
    fonts?: {
      family?: string;
    };
  };
}

interface LaTeXServiceResponse {
  success: boolean;
  pdfBase64?: string;
  metadata?: {
    compilationTime: string;
    fileSize: number;
    pages: number;
    templateId: string;
    templateVersion: string;
  };
  error?: string;
  details?: string[];
}

/**
 * Cloud Function to generate resume PDFs using the LaTeX service
 */
export const generateResumeHttp = onCall(
  {
    cors: true,
    invoker: 'public',
    timeoutSeconds: 60, // LaTeX compilation can take time
    memory: '1GiB' // Ensure enough memory for processing
  },
  async (request): Promise<LaTeXServiceResponse> => {
    try {
      logger.info('generateResume called', {
        data: request.data ? Object.keys(request.data) : 'no data'
      });

      // Validate request data
      if (!request.data) {
        throw new HttpsError('invalid-argument', 'Request data is required');
      }

      const { templateId, content, customizations }: GenerateResumeRequest = request.data;

      // Validate required fields
      if (!templateId) {
        throw new HttpsError('invalid-argument', 'templateId is required');
      }

      if (!content) {
        throw new HttpsError('invalid-argument', 'content is required');
      }

      // Validate personal info
      if (!content.personalInfo || !content.personalInfo.name || !content.personalInfo.email) {
        throw new HttpsError('invalid-argument', 'personalInfo with name and email is required');
      }

      logger.info('Calling LaTeX service', {
        templateId,
        hasContent: !!content,
        hasCustomizations: !!customizations
      });

      // Prepare request for LaTeX service
      const latexRequest = {
        templateId,
        content,
        ...(customizations && { customizations })
      };

      // Call the LaTeX service
      const latexServiceUrl = process.env.LATEX_SERVICE_URL ||
        'https://latex-resume-service-vx66fnfbua-uc.a.run.app';

      const response = await fetch(`${latexServiceUrl}/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(latexRequest),
      });

      if (!response.ok) {
        logger.error('LaTeX service error', {
          status: response.status,
          statusText: response.statusText
        });
        throw new HttpsError('internal', `LaTeX service error: ${response.statusText}`);
      }

      const result: LaTeXServiceResponse = await response.json();

      if (!result.success) {
        logger.error('LaTeX compilation failed', {
          error: result.error,
          details: result.details
        });
        throw new HttpsError('internal', `Resume generation failed: ${result.error}`);
      }

      logger.info('Resume generated successfully', {
        fileSize: result.metadata?.fileSize,
        pages: result.metadata?.pages,
        compilationTime: result.metadata?.compilationTime
      });

      return result;

    } catch (error) {
      logger.error('Error in generateResume', { error });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', 'An unexpected error occurred while generating the resume');
    }
  }
);
