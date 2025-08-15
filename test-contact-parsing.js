// Test the mock contact parser directly with your text
const corpus = `
	CONTACT INFORMATION

	William McCann

	phone numbers
	732-812-0367
	732-890-7780

	email addresses
	bill.mccann@gmail.com
	billfmccann@hotmail.com
	fouriergauss@outlook.com
	wfm8@njit.edu
bmccann@vbrato.io
`;

console.log('🧪 Testing Contact Information Parsing');
console.log('=====================================');
console.log();
console.log('📝 Input Text:');
console.log(corpus);
console.log();

// Simulate the mock parser logic
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;

const emails = Array.from(new Set(corpus.match(emailRegex) || []));
const phoneMatches = corpus.match(phoneRegex) || [];
const phones = Array.from(new Set(phoneMatches));

// Simple name extraction
let fullName = '';
const lines = corpus.split('\n');
for (const line of lines.slice(0, 50)) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 50 &&
        /^[A-Z][a-z]+ [A-Z][a-z]+/.test(trimmed) &&
        !trimmed.includes('@') && !trimmed.includes('DOCUMENT') &&
        !trimmed.includes('EXPERIENCE') && !trimmed.includes('EDUCATION')) {
        fullName = trimmed;
        break;
    }
}

console.log('🔍 Parsing Results:');
console.log('Full Name:', fullName);
console.log('Emails found:', emails);
console.log('Phones found:', phones);

const mockResult = {
    contactInformation: {
        contactInformation: {
            fullName,
            email: emails,
            phone: phones,
            address: '',
            linkedinUrl: '',
            portfolioUrl: '',
            githubUrl: ''
        }
    }
};

console.log();
console.log('📦 Expected Mock Result:');
console.log(JSON.stringify(mockResult, null, 2));

console.log();
console.log('✅ This should extract:');
console.log('- Name: William McCann');
console.log('- Emails: 5 email addresses');
console.log('- Phones: 2 phone numbers');
