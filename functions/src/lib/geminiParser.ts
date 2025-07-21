import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI - using environment variables for Firebase Functions v2
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenerativeAI(apiKey);
};

export interface ContactInformation {
    contactInformation: {
        fullName: string;
        email: string[];
        phones: string[];
    };
}

export interface Skills {
    skills: string[];
}

export interface Education {
    education: Array<{
        school: string;
        degree: string;
        startDate: { month: string; year: string };
        endDate: { month: string; year: string };
        grade: string;
    }>;
}

export interface Certifications {
    certifications: Array<{
        certName: string;
        issuer: string;
        issuedDate: { month: string; year: string };
        credentialId: string;
    }>;
}

export interface JobHistory {
    jobHistory: Array<{
        title: string;
        company: string;
        startDate: { month: string; year: string };
        endDate: { month: string; year: string };
        currentlyWorking: boolean;
        jobDescription: string;
        accomplishments: string[];
    }>;
}

export async function parseContactInformation(corpus: string): Promise<ContactInformation> {
    console.log('Using Google AI Gemini parser...');

    try {
        const genAI = getGenAI();
        console.log('API key found, proceeding with Gemini...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI assistant that extracts contact information from resume/biography documents.

Parse the following corpus of documents and extract ONLY contact information. Return a JSON object with the exact structure shown below. Prevent duplicate entries in email and phone arrays.

REQUIRED JSON STRUCTURE:
{
  "contactInformation": {
    "fullName": "<string representing the user's name>",
    "email": ["<unique email addresses only>"],
    "phones": ["<unique phone numbers only>"]
  }
}

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. Remove duplicates from email and phone arrays
3. If no name is found, use empty string for fullName
4. If no emails are found, use empty array []
5. If no phones are found, use empty array []
6. Normalize phone numbers to a consistent format
7. Ensure email addresses are valid format

CORPUS TO PARSE:
${corpus}

JSON OUTPUT:`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('Gemini raw response:', text);

            // Try to parse the JSON response
            try {
                // Clean up the response - remove markdown code blocks if present
                let cleanText = text.trim();
                if (cleanText.startsWith('```json')) {
                    cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanText.startsWith('```')) {
                    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                const parsedData = JSON.parse(cleanText.trim());

                // Validate the structure
                if (!parsedData.contactInformation) {
                    throw new Error('Invalid response structure - missing contactInformation');
                }

                const contact = parsedData.contactInformation;

                // Ensure required fields exist and are correct types
                const result: ContactInformation = {
                    contactInformation: {
                        fullName: typeof contact.fullName === 'string' ? contact.fullName : '',
                        email: Array.isArray(contact.email) ? contact.email : [],
                        phones: Array.isArray(contact.phones) ? contact.phones : []
                    }
                };

                console.log('Gemini parsing complete:', JSON.stringify(result, null, 2));
                return result;

            } catch (parseError) {
                console.error('Failed to parse Gemini JSON response:', text);
                console.warn('Falling back to mock parser due to JSON parse error');
                return mockParseContactInformation(corpus);
            }

        } catch (error) {
            console.error('Gemini API error:', error);
            console.warn('Falling back to mock parser due to API error');
            return mockParseContactInformation(corpus);
        }

    } catch (error) {
        console.error('Gemini API error:', error);
        console.warn('Falling back to mock parser due to API error');
        return mockParseContactInformation(corpus);
    }
}

// Fallback mock implementation
function mockParseContactInformation(corpus: string): ContactInformation {
    console.log('Using mock Gemini parser for testing...');

    // Extract basic contact info using simple text parsing
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;

    const emails = Array.from(new Set(corpus.match(emailRegex) || []));
    const phoneMatches = corpus.match(phoneRegex) || [];
    const phones = Array.from(new Set(phoneMatches));

    // Simple name extraction - look for common resume patterns
    let fullName = '';
    const lines = corpus.split('\n');
    for (const line of lines.slice(0, 50)) { // Check first 50 lines
        const trimmed = line.trim();
        if (trimmed.length > 5 && trimmed.length < 50 &&
            /^[A-Z][a-z]+ [A-Z][a-z]+/.test(trimmed) &&
            !trimmed.includes('@') && !trimmed.includes('DOCUMENT') &&
            !trimmed.includes('EXPERIENCE') && !trimmed.includes('EDUCATION')) {
            fullName = trimmed;
            break;
        }
    }

    const result: ContactInformation = {
        contactInformation: {
            fullName: fullName || '',
            email: emails,
            phones: phones
        }
    };

    console.log('Mock parsing result:', JSON.stringify(result, null, 2));
    return result;
}

export async function parseSkills(corpus: string): Promise<Skills> {
    console.log('Using Google AI Gemini parser for skills...');

    try {
        const genAI = getGenAI();
        console.log('API key found, proceeding with Gemini skills parsing...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI assistant that extracts skills from resume/biography documents.

Parse the following corpus of documents and extract skills. Return a JSON object with the exact structure shown below.

REQUIRED JSON STRUCTURE:
{
  "skills": ["<array of unique skills>"]
}

GUIDELINES FOR SKILLS EXTRACTION:
1. Each skill should be a single word or abbreviation (but may be a short phrase)
2. Extract technical skills, programming languages, frameworks, tools, certifications, and professional skills
3. No duplicates
4. Include skills from work experience, education, and explicit skills sections
5. Use standard terminology (e.g., "JavaScript" not "JS", "Python" not "python")
6. Include version numbers if specified (e.g., "React 18", "Node.js 16")
7. Return 10-30 skills maximum, prioritizing the most relevant and prominent ones

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. Remove duplicates from skills array
3. Focus on technical and professional skills

CORPUS:
${corpus}
`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text();

            // Clean up any markdown code blocks
            text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

            console.log('Gemini skills response:', text);

            const parsed = JSON.parse(text);
            return parsed as Skills;
        } catch (error) {
            console.error('Error parsing skills with Gemini:', error);
            console.log('Falling back to mock skills parser');
            return mockParseSkills(corpus);
        }

    } catch (error) {
        console.error('Gemini API error for skills:', error);
        console.warn('Falling back to mock parser due to API error');
        return mockParseSkills(corpus);
    }
}

function mockParseSkills(corpus: string): Skills {
    console.log('Using mock skills parser');

    // Simple mock parser that looks for common patterns
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS',
        'Git', 'Docker', 'AWS', 'Firebase', 'MongoDB', 'PostgreSQL', 'SQL', 'REST API'
    ];

    const foundSkills = commonSkills.filter(skill =>
        corpus.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 10);

    return {
        skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Firebase']
    };
}

export async function parseEducation(corpus: string): Promise<Education> {
    console.log('Using Google AI Gemini parser for education...');

    try {
        const genAI = getGenAI();
        console.log('API key found, proceeding with Gemini education parsing...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI assistant that extracts education information from resume/biography documents.

Parse the following corpus of documents and extract education information. Return a JSON object with the exact structure shown below.

REQUIRED JSON STRUCTURE:
{
  "education": [
    {
      "school": "<name of the school>",
      "degree": "<name of the degree>",
      "startDate": { "month": "<month number 01-12>", "year": "<four digit year>"},
      "endDate": { "month": "<month number 01-12>", "year": "<four digit year>"},
      "grade": "<grade point average>"
    }
  ]
}

GUIDELINES FOR EDUCATION EXTRACTION:
1. Extract ALL education entries found in the document
2. Include undergraduate, graduate, and any other educational institutions
3. Avoid duplicate entries - but different degrees from the same school should be separate entries
4. Parse dates carefully following these rules:
   - If only ONE date is found, it should be the END DATE (graduation date)
   - Convert month names and numbers to two-digit format: January=01, February=02, March=03, April=04, May=05, June=06, July=07, August=08, September=09, October=10, November=11, December=12
   - If there are conflicting months for the same education (e.g., "5/1981" vs "June 1981"), leave the month BLANK but keep the year
   - Common date formats: "12/1989", "December 1989", "June 1981", "05/1981"
5. If any field cannot be parsed properly, leave it as an empty string ""
6. For grade, extract GPA, honors, or similar academic performance indicators (e.g., "3.8 GPA", "Summa Cum Laude", "Dean's List")
7. School should be the full institution name
8. Degree should include the full degree name (e.g., "Bachelor of Science in Computer Science", "Master of Business Administration")
9. Order entries chronologically if possible (most recent first)
10. Pay special attention to education sections, academic history, and any lines containing school names with nearby date ranges

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. If dates are incomplete, use empty strings for missing parts
3. If no education is found, return an empty array []
4. Use two-digit month numbers (01, 02, etc.) not month names or abbreviations
5. SINGLE DATE RULE: If only one date is provided for an education entry, treat it as the END DATE
6. CONFLICT RESOLUTION: If multiple conflicting months are found for the same year, leave month as empty string
7. DATE CONVERSION EXAMPLES:
   - "12/1989" → endDate: {"month": "12", "year": "1989"}
   - "05/1981" → endDate: {"month": "05", "year": "1981"}
   - "June 1981" → endDate: {"month": "06", "year": "1981"}
   - Conflicting "5/1981" and "June 1981" → endDate: {"month": "", "year": "1981"}

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. If dates are incomplete, use empty strings for missing parts
3. If no education is found, return an empty array []
4. Use two-digit month numbers (01, 02, etc.) not month names or abbreviations
5. Look carefully for date patterns near school names - they may be on the same line or adjacent lines
CORPUS:
${corpus}

Pay special attention to sections titled "Education", "Academic Background", "Academic History", or similar. Remember: single dates are END DATES (graduation dates), convert months to two-digit numbers (01-12), and handle conflicts by leaving month blank.
`;

        try {
            const geminiResult = await model.generateContent(prompt);
            const response = geminiResult.response;
            let text = response.text();

            // Clean up any markdown code blocks
            text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

            console.log('Gemini education response:', text);

            const parsed = JSON.parse(text);

            // Validate and clean the response
            const educationArray = parsed.education || [];
            const validatedEducation: Education = {
                education: Array.isArray(educationArray) ? educationArray.map((edu: any) => ({
                    school: typeof edu.school === 'string' ? edu.school : '',
                    degree: typeof edu.degree === 'string' ? edu.degree : '',
                    startDate: {
                        month: (edu.startDate && typeof edu.startDate.month === 'string') ? edu.startDate.month : '',
                        year: (edu.startDate && typeof edu.startDate.year === 'string') ? edu.startDate.year : ''
                    },
                    endDate: {
                        month: (edu.endDate && typeof edu.endDate.month === 'string') ? edu.endDate.month : '',
                        year: (edu.endDate && typeof edu.endDate.year === 'string') ? edu.endDate.year : ''
                    },
                    grade: typeof edu.grade === 'string' ? edu.grade : ''
                })).map((edu: any) => {
                    // Apply single date rule: if start and end years are the same, clear start date
                    if (edu.startDate.year && edu.endDate.year && edu.startDate.year === edu.endDate.year) {
                        edu.startDate = { month: '', year: '' };
                    }
                    return edu;
                }) : []
            };

            return validatedEducation;
        } catch (error) {
            console.error('Error parsing education with Gemini:', error);
            console.log('Falling back to mock education parser');
            return mockParseEducation(corpus);
        }

    } catch (error) {
        console.error('Gemini API error for education:', error);
        console.warn('Falling back to mock parser due to API error');
        return mockParseEducation(corpus);
    }
}

function mockParseEducation(corpus: string): Education {
    console.log('Using mock education parser');

    // Simple mock parser that looks for common education patterns
    const lines = corpus.split('\n');
    const educationEntries: Array<{
        school: string;
        degree: string;
        startDate: { month: string; year: string };
        endDate: { month: string; year: string };
        grade: string;
    }> = [];

    // Look for university/college patterns
    const schoolPatterns = [
        /university/i, /college/i, /institute/i, /school/i
    ];

    const degreePatterns = [
        /bachelor/i, /master/i, /phd/i, /doctorate/i, /associates/i, /b\.?s\.?/i, /m\.?s\.?/i, /m\.?b\.?a\.?/i
    ];

    // Month conversion map - convert to two-digit numbers
    const monthMap: { [key: string]: string } = {
        '01': '01', '02': '02', '03': '03', '04': '04',
        '05': '05', '06': '06', '07': '07', '08': '08',
        '09': '09', '10': '10', '11': '11', '12': '12',
        '1': '01', '2': '02', '3': '03', '4': '04',
        '5': '05', '6': '06', '7': '07', '8': '08',
        '9': '09',
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (schoolPatterns.some(pattern => pattern.test(trimmed))) {
            // Found a potential school
            let school = trimmed;
            let degree = '';
            let startDate = { month: '', year: '' };
            let endDate = { month: '', year: '' };
            let grade = '';

            const foundDates: Array<{ month: string; year: string }> = [];

            // Look for degree and dates in nearby lines (current line and next few lines)
            for (let j = i; j <= Math.min(lines.length - 1, i + 3); j++) {
                const nearbyLine = lines[j].trim();

                // Look for degree
                if (!degree && degreePatterns.some(pattern => pattern.test(nearbyLine))) {
                    degree = nearbyLine;
                }

                // Look for numeric date patterns (MM/YYYY or M/YYYY)
                const numericDate = nearbyLine.match(/(\d{1,2})\/(\d{4})/);
                if (numericDate) {
                    const monthNum = numericDate[1];
                    const year = numericDate[2];
                    const monthName = monthMap[monthNum] || '';
                    foundDates.push({ month: monthName, year: year });
                }

                // Look for month-year patterns
                const monthYear = nearbyLine.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/gi);
                if (monthYear && monthYear.length > 0) {
                    const parts = monthYear[0].split(' ');
                    if (parts.length >= 2) {
                        const monthName = parts[0].toLowerCase();
                        const monthNum = monthMap[monthName] || '';
                        foundDates.push({ month: monthNum, year: parts[1] });
                    }
                }

                // Look for GPA or honors
                if (nearbyLine.match(/gpa|honor|dean|summa|magna|cum laude/i)) {
                    grade = nearbyLine;
                }
            }

            // Process found dates according to rules
            if (foundDates.length === 1) {
                // Single date = end date
                endDate = foundDates[0];
            } else if (foundDates.length > 1) {
                // Check for conflicts in the same year
                const yearGroups: { [year: string]: string[] } = {};
                foundDates.forEach(date => {
                    if (!yearGroups[date.year]) yearGroups[date.year] = [];
                    if (date.month) yearGroups[date.year].push(date.month);
                });

                // Use the most recent year as end date
                const years = Object.keys(yearGroups).sort((a, b) => parseInt(b) - parseInt(a));
                if (years.length > 0) {
                    const recentYear = years[0];
                    const monthsForYear = [...new Set(yearGroups[recentYear])]; // Remove duplicates

                    if (monthsForYear.length === 1) {
                        // No conflict
                        endDate = { month: monthsForYear[0], year: recentYear };
                    } else if (monthsForYear.length > 1) {
                        // Conflict - leave month blank
                        endDate = { month: '', year: recentYear };
                    } else {
                        // No month info
                        endDate = { month: '', year: recentYear };
                    }
                }
            }

            educationEntries.push({
                school: school,
                degree: degree,
                startDate: startDate, // Always empty per new rules
                endDate: endDate,
                grade: grade
            });
        }
    }

    return {
        education: educationEntries.length > 0 ? educationEntries : []
    };
}

export async function parseCertifications(corpus: string): Promise<Certifications> {
    console.log('Using Google AI Gemini parser for certifications...');

    try {
        const genAI = getGenAI();
        console.log('API key found, proceeding with Gemini certifications parsing...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI assistant that extracts certifications and licenses from resume/biography documents.

Parse the following corpus of documents and extract certifications and licenses information. Return a JSON object with the exact structure shown below.

REQUIRED JSON STRUCTURE:
{
  "certifications": [
    {
      "certName": "<name of the certificate/license>",
      "issuer": "<name of the issuing organization>",
      "issuedDate": { "month": "<month number 01-12>", "year": "<four digit year>"},
      "credentialId": "<credential or license ID>"
    }
  ]
}

GUIDELINES FOR CERTIFICATIONS EXTRACTION:
1. Extract ALL certifications, licenses, and professional credentials found in the document
2. Include professional licenses (e.g., CPA, PE), industry certifications (e.g., AWS, Microsoft, Cisco), and educational certifications
3. Avoid duplicate entries
4. Parse issued dates carefully following these rules:
   - Look for "issued", "earned", "obtained", "awarded", "completed" dates
   - Convert month names and numbers to two-digit format: January=01, February=02, March=03, April=04, May=05, June=06, July=07, August=08, September=09, October=10, November=11, December=12
   - If there are conflicting dates for the same certification, use the most recent one
   - Common date formats: "12/2019", "December 2019", "June 2021", "05/2020"
5. If any field cannot be parsed properly, leave it as an empty string ""
6. For credentialId, look for certification numbers, license numbers, or credential IDs
7. Issuer should be the full organization name (e.g., "Amazon Web Services", "Microsoft", "Project Management Institute")
8. CertName should include the full certification name (e.g., "AWS Certified Solutions Architect", "Certified Public Accountant")
9. Order entries chronologically if possible (most recent first)
10. Pay special attention to certification sections, professional licenses, and any lines containing certification names with nearby date ranges

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. If dates are incomplete, use empty strings for missing parts
3. If no certifications are found, return an empty array []
4. Use two-digit month numbers (01, 02, etc.) not month names or abbreviations
5. Look carefully for date patterns near certification names - they may be on the same line or adjacent lines

CORPUS:
${corpus}

Pay special attention to sections titled "Certifications", "Licenses", "Professional Credentials", "Certificates", or similar. Remember: convert months to two-digit numbers (01-12).
`;

        try {
            const geminiResult = await model.generateContent(prompt);
            const response = geminiResult.response;
            let text = response.text();

            // Clean up any markdown code blocks
            text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

            console.log('Gemini certifications response:', text);

            const parsed = JSON.parse(text);

            // Validate and clean the response
            const certificationsArray = parsed.certifications || [];
            const validatedCertifications: Certifications = {
                certifications: Array.isArray(certificationsArray) ? certificationsArray.map((cert: any) => ({
                    certName: typeof cert.certName === 'string' ? cert.certName : '',
                    issuer: typeof cert.issuer === 'string' ? cert.issuer : '',
                    issuedDate: {
                        month: (cert.issuedDate && typeof cert.issuedDate.month === 'string') ? cert.issuedDate.month : '',
                        year: (cert.issuedDate && typeof cert.issuedDate.year === 'string') ? cert.issuedDate.year : ''
                    },
                    credentialId: typeof cert.credentialId === 'string' ? cert.credentialId : ''
                })) : []
            };

            return validatedCertifications;
        } catch (error) {
            console.error('Error parsing certifications with Gemini:', error);
            console.log('Falling back to mock certifications parser');
            return mockParseCertifications(corpus);
        }

    } catch (error) {
        console.error('Gemini API error for certifications:', error);
        console.warn('Falling back to mock parser due to API error');
        return mockParseCertifications(corpus);
    }
}

function mockParseCertifications(corpus: string): Certifications {
    console.log('Using mock certifications parser');

    // Simple mock parser that looks for common certification patterns
    const lines = corpus.split('\n');
    const certificationsEntries: Array<{
        certName: string;
        issuer: string;
        issuedDate: { month: string; year: string };
        credentialId: string;
    }> = [];

    // Look for certification/license patterns - but be more selective
    const certPatterns = [
        /certified.*architect/i,
        /certified.*developer/i,
        /certified.*professional/i,
        /project management professional/i,
        /cissp/i,
        /oracle certified/i,
        /aws certified/i,
        /microsoft certified/i,
        /\b[a-z]+ certified\b/i
    ];

    // Month conversion map - convert to two-digit numbers
    const monthMap: { [key: string]: string } = {
        '01': '01', '02': '02', '03': '03', '04': '04',
        '05': '05', '06': '06', '07': '07', '08': '08',
        '09': '09', '10': '10', '11': '11', '12': '12',
        '1': '01', '2': '02', '3': '03', '4': '04',
        '5': '05', '6': '06', '7': '07', '8': '08',
        '9': '09',
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };

    // Track processed certifications to avoid duplicates
    const processedCerts = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip headers, skills sections, and obvious non-certifications
        if (trimmed.includes('SKILLS') ||
            trimmed.includes('EDUCATION') ||
            trimmed.includes('EXPERIENCE') ||
            trimmed.includes('CERTIFICATIONS & LICENSES') ||
            trimmed.includes('Credential ID:') ||
            trimmed.includes('Certificate Number:') ||
            trimmed.includes('License ID:') ||
            trimmed.length < 10 ||
            /^[A-Z\s&]+$/.test(trimmed)) {
            continue;
        }

        if (certPatterns.some(pattern => pattern.test(trimmed))) {
            // Found a potential certification
            let certName = trimmed;
            let issuer = '';
            let issuedDate = { month: '', year: '' };
            let credentialId = '';

            // Skip if we've already processed this certification
            if (processedCerts.has(certName.toLowerCase())) {
                continue;
            }

            // Look for dates and additional info in nearby lines (current line and next few lines)
            for (let j = i; j <= Math.min(lines.length - 1, i + 4); j++) {
                const nearbyLine = lines[j].trim();

                // Look for issuer organizations - only if it's a clean company name
                const issuers = ['amazon web services', 'microsoft corporation', 'oracle corporation', 'project management institute'];
                if (!issuer && issuers.some(org => nearbyLine.toLowerCase().includes(org))) {
                    issuer = nearbyLine;
                }

                // Look for numeric date patterns (MM/YYYY or M/YYYY)
                const numericDate = nearbyLine.match(/(\d{1,2})\/(\d{4})/);
                if (numericDate && !issuedDate.year) {
                    const monthNum = numericDate[1];
                    const year = numericDate[2];
                    const monthName = monthMap[monthNum] || '';
                    issuedDate = { month: monthName, year: year };
                }

                // Look for month-year patterns
                const monthYear = nearbyLine.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/gi);
                if (monthYear && monthYear.length > 0 && !issuedDate.year) {
                    const parts = monthYear[0].split(' ');
                    if (parts.length >= 2) {
                        const monthName = parts[0].toLowerCase();
                        const monthNum = monthMap[monthName] || '';
                        issuedDate = { month: monthNum, year: parts[1] };
                    }
                }

                // Look for credential IDs - be more specific
                const credPattern = nearbyLine.match(/(?:credential id|certificate number|license id)[\s:]*([a-z0-9\-]+)/i);
                if (credPattern && !credentialId) {
                    credentialId = credPattern[1];
                }
            }

            processedCerts.add(certName.toLowerCase());
            certificationsEntries.push({
                certName: certName,
                issuer: issuer,
                issuedDate: issuedDate,
                credentialId: credentialId
            });
        }
    }

    return {
        certifications: certificationsEntries.length > 0 ? certificationsEntries : []
    };
}

export async function parseJobHistory(corpus: string): Promise<JobHistory> {
    console.log('Using Google AI Gemini parser for job history...');

    try {
        const genAI = getGenAI();
        console.log('API key found, proceeding with Gemini job history parsing...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI assistant that extracts job history and work experience from resume/biography documents.

Parse the following corpus of documents and extract job history information. Return a JSON object with the exact structure shown below.

REQUIRED JSON STRUCTURE:
{
  "jobHistory": [
    {
      "title": "<job title>",
      "company": "<name of employer>",
      "startDate": { "month": "<month number 01-12>", "year": "<four digit year>"},
      "endDate": { "month": "<month number 01-12>", "year": "<four digit year>"},
      "currentlyWorking": <boolean indicator that they are still employed there>,
      "jobDescription": "<text description of the job responsibilities>",
      "accomplishments": ["<sentence describing an accomplishment 1>", "<sentence describing an accomplishment 2>", ...]
    }
  ]
}

GUIDELINES FOR JOB HISTORY EXTRACTION:
1. Extract ALL job positions found in the document, including current and past positions
2. Include multiple positions at the same company as separate entries if they have different titles or date ranges
3. Avoid duplicate entries for identical positions
4. Parse dates carefully following these rules:
   - Convert month names and numbers to two-digit format: January=01, February=02, March=03, April=04, May=05, June=06, July=07, August=08, September=09, October=10, November=11, December=12
   - If there are conflicting dates for the same position, use the most consistent set
   - Common date formats: "01/2020", "January 2020", "Jan 2020", "2020-01", "2020"
   - For current positions, look for keywords like "Present", "Current", "Now", or missing end dates
5. Set currentlyWorking to true ONLY if:
   - The end date is explicitly "Present", "Current", "Now", or similar
   - There is no end date but clear indicators this is their current job
   - The end date is very recent (within last few months) and context suggests ongoing employment
6. For jobDescription, extract the main responsibilities and duties for each position
7. For accomplishments, extract specific achievements, quantifiable results, or notable contributions
   - Look for bullet points, achievements sections, or accomplishment-oriented language
   - Each accomplishment should be a complete sentence
   - Focus on measurable results, awards, promotions, successful projects, etc.
8. If any field cannot be parsed properly, leave it as an empty string "" or empty array []
9. Company should be the full organization name
10. Title should include the full job title (e.g., "Senior Software Engineer", "Vice President of Operations")
11. Order entries chronologically if possible (most recent first)
12. Pay special attention to experience sections, work history, and any lines containing company names with nearby date ranges

IMPORTANT RULES:
1. Return ONLY valid JSON - no additional text or explanations
2. If dates are incomplete, use empty strings for missing parts
3. If no job history is found, return an empty array []
4. Use two-digit month numbers (01, 02, etc.) not month names or abbreviations
5. Look carefully for date patterns near company/job title names - they may be on the same line or adjacent lines
6. Be conservative with currentlyWorking - only set to true if clearly indicated
7. DATE CONVERSION EXAMPLES:
   - "01/2020 - 03/2023" → startDate: {"month": "01", "year": "2020"}, endDate: {"month": "03", "year": "2023"}
   - "January 2020 - Present" → startDate: {"month": "01", "year": "2020"}, endDate: {"month": "", "year": ""}, currentlyWorking: true
   - "2019 - 2021" → startDate: {"month": "", "year": "2019"}, endDate: {"month": "", "year": "2021"}

CORPUS:
${corpus}

Pay special attention to sections titled "Experience", "Work History", "Professional Experience", "Employment", or similar. Remember: convert months to two-digit numbers (01-12), be conservative with currentlyWorking, and extract specific accomplishments.
`;

        try {
            const geminiResult = await model.generateContent(prompt);
            const response = geminiResult.response;
            let text = response.text();

            // Clean up any markdown code blocks
            text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

            console.log('Gemini job history response:', text);

            const parsed = JSON.parse(text);

            // Validate and clean the response
            const jobHistoryArray = parsed.jobHistory || [];
            const validatedJobHistory: JobHistory = {
                jobHistory: Array.isArray(jobHistoryArray) ? jobHistoryArray.map((job: any) => ({
                    title: typeof job.title === 'string' ? job.title : '',
                    company: typeof job.company === 'string' ? job.company : '',
                    startDate: {
                        month: (job.startDate && typeof job.startDate.month === 'string') ? job.startDate.month : '',
                        year: (job.startDate && typeof job.startDate.year === 'string') ? job.startDate.year : ''
                    },
                    endDate: {
                        month: (job.endDate && typeof job.endDate.month === 'string') ? job.endDate.month : '',
                        year: (job.endDate && typeof job.endDate.year === 'string') ? job.endDate.year : ''
                    },
                    currentlyWorking: typeof job.currentlyWorking === 'boolean' ? job.currentlyWorking : false,
                    jobDescription: typeof job.jobDescription === 'string' ? job.jobDescription : '',
                    accomplishments: Array.isArray(job.accomplishments) ?
                        job.accomplishments.filter((acc: any) => typeof acc === 'string') : []
                })) : []
            };

            return validatedJobHistory;
        } catch (error) {
            console.error('Error parsing job history with Gemini:', error);
            console.log('Falling back to mock job history parser');
            return mockParseJobHistory(corpus);
        }

    } catch (error) {
        console.error('Gemini API error for job history:', error);
        console.warn('Falling back to mock parser due to API error');
        return mockParseJobHistory(corpus);
    }
}

function mockParseJobHistory(corpus: string): JobHistory {
    console.log('Using mock job history parser');

    // Simple mock parser that looks for common job/company patterns
    const lines = corpus.split('\n');
    const jobHistoryEntries: Array<{
        title: string;
        company: string;
        startDate: { month: string; year: string };
        endDate: { month: string; year: string };
        currentlyWorking: boolean;
        jobDescription: string;
        accomplishments: string[];
    }> = [];

    // Look for job/company patterns
    const jobTitlePatterns = [
        /senior|lead|principal|director|manager|engineer|developer|analyst|consultant|specialist|coordinator|supervisor|vice president|president|ceo|cto|cfo/i
    ];

    const companyIndicators = [
        /corp|corporation|inc|llc|ltd|company|consulting|systems|solutions|technologies|services|group|associates|enterprises|tech/i
    ];

    // Month conversion map - convert to two-digit numbers
    const monthMap: { [key: string]: string } = {
        '01': '01', '02': '02', '03': '03', '04': '04',
        '05': '05', '06': '06', '07': '07', '08': '08',
        '09': '09', '10': '10', '11': '11', '12': '12',
        '1': '01', '2': '02', '3': '03', '4': '04',
        '5': '05', '6': '06', '7': '07', '8': '08',
        '9': '09',
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12',
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    // Track processed jobs to avoid duplicates
    const processedJobs = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip obvious non-job lines and bullet points
        if (trimmed.includes('EDUCATION') ||
            trimmed.includes('SKILLS') ||
            trimmed.includes('CERTIFICATIONS') ||
            trimmed.includes('EXPERIENCE') ||
            trimmed.includes('PROFESSIONAL EXPERIENCE') ||
            trimmed.startsWith('•') ||
            trimmed.startsWith('-') ||
            trimmed.startsWith('*') ||
            trimmed.length < 5 ||
            /^[A-Z\s&]+$/.test(trimmed)) {
            continue;
        }

        // Look for lines that might contain job titles and companies
        const hasJobTitle = jobTitlePatterns.some(pattern => pattern.test(trimmed));
        const hasCompanyIndicator = companyIndicators.some(pattern => pattern.test(trimmed));
        const hasDatePattern = /\d{4}/.test(trimmed);
        const hasAtPattern = /\s+at\s+/i.test(trimmed);

        if ((hasJobTitle || hasCompanyIndicator || hasAtPattern) && (hasDatePattern || i < lines.length - 3)) {
            // Found a potential job entry
            let title = '';
            let company = '';
            let startDate = { month: '', year: '' };
            let endDate = { month: '', year: '' };
            let currentlyWorking = false;
            let jobDescription = '';
            let accomplishments: string[] = [];

            // Try to parse the job title and company from the current line
            const parts = trimmed.split(/\s+at\s+|\s+-\s+|\s+\|\s+/i);
            if (parts.length >= 2) {
                title = parts[0].trim();
                company = parts[1].trim();
                // Clean up date info from company name if present
                company = company.replace(/\s*\d{1,2}\/\d{4}.*$/, '').replace(/\s*\w+\s+\d{4}.*$/, '').trim();
            } else if (hasJobTitle) {
                title = trimmed.replace(/\s*\d{1,2}\/\d{4}.*$/, '').replace(/\s*\w+\s+\d{4}.*$/, '').trim();
            } else {
                company = trimmed.replace(/\s*\d{1,2}\/\d{4}.*$/, '').replace(/\s*\w+\s+\d{4}.*$/, '').trim();
            }

            // Skip if we've already processed this job
            const jobKey = `${title}-${company}`.toLowerCase();
            if (processedJobs.has(jobKey)) {
                continue;
            }

            // Look for dates and additional info in nearby lines
            for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 5); j++) {
                const nearbyLine = lines[j].trim();

                // Look for date ranges
                const dateRange = nearbyLine.match(/(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4}|present|current)/gi);
                if (dateRange && dateRange.length > 0) {
                    const range = dateRange[0];
                    const [start, end] = range.split(/\s*[-–—]\s*/);

                    // Parse start date
                    const startMatch = start.match(/(\d{1,2})\/(\d{4})|(\w+)\s+(\d{4})|(\d{4})/);
                    if (startMatch) {
                        if (startMatch[1] && startMatch[2]) {
                            // MM/YYYY format
                            startDate = { month: monthMap[startMatch[1]] || '', year: startMatch[2] };
                        } else if (startMatch[3] && startMatch[4]) {
                            // Month YYYY format
                            startDate = { month: monthMap[startMatch[3].toLowerCase()] || '', year: startMatch[4] };
                        } else if (startMatch[5]) {
                            // YYYY format
                            startDate = { month: '', year: startMatch[5] };
                        }
                    }

                    // Parse end date
                    if (end.toLowerCase().includes('present') || end.toLowerCase().includes('current')) {
                        currentlyWorking = true;
                        endDate = { month: '', year: '' };
                    } else {
                        const endMatch = end.match(/(\d{1,2})\/(\d{4})|(\w+)\s+(\d{4})|(\d{4})/);
                        if (endMatch) {
                            if (endMatch[1] && endMatch[2]) {
                                // MM/YYYY format
                                endDate = { month: monthMap[endMatch[1]] || '', year: endMatch[2] };
                            } else if (endMatch[3] && endMatch[4]) {
                                // Month YYYY format
                                endDate = { month: monthMap[endMatch[3].toLowerCase()] || '', year: endMatch[4] };
                            } else if (endMatch[5]) {
                                // YYYY format
                                endDate = { month: '', year: endMatch[5] };
                            }
                        }
                    }
                }

                // Look for job descriptions (lines starting with bullets or descriptive text)
                if (nearbyLine.startsWith('•') || nearbyLine.startsWith('-') || nearbyLine.startsWith('*')) {
                    if (!jobDescription) {
                        jobDescription = nearbyLine.replace(/^[•\-*]\s*/, '');
                    } else {
                        accomplishments.push(nearbyLine.replace(/^[•\-*]\s*/, ''));
                    }
                }
            }

            // Only add if we have meaningful data
            if (title || company) {
                processedJobs.add(jobKey);
                jobHistoryEntries.push({
                    title: title,
                    company: company,
                    startDate: startDate,
                    endDate: endDate,
                    currentlyWorking: currentlyWorking,
                    jobDescription: jobDescription,
                    accomplishments: accomplishments
                });
            }
        }
    }

    return {
        jobHistory: jobHistoryEntries.length > 0 ? jobHistoryEntries : []
    };
}
