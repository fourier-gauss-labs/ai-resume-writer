import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions';

// Initialize Google AI - using Firebase Functions config
const config = functions.config();
const apiKey = config.gemini?.api_key || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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

export async function parseContactInformation(corpus: string): Promise<ContactInformation> {
    console.log('Using Google AI Gemini parser...');

    // Check if API key is available
    if (!apiKey) {
        console.warn('Gemini API key not found in Firebase config or environment, falling back to mock parser');
        return mockParseContactInformation(corpus);
    }

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

    // Check if API key is available
    if (!apiKey) {
        console.warn('Gemini API key not found in Firebase config or environment, falling back to mock parser');
        return mockParseSkills(corpus);
    }

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

    // Check if API key is available
    if (!apiKey) {
        console.warn('Gemini API key not found in Firebase config or environment, falling back to mock parser');
        return mockParseEducation(corpus);
    }

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
