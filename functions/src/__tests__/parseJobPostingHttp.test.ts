import { parseJobPostingHttp } from '../parseJobPostingHttp';

describe('Job Parsing Integration Tests', () => {
    // Skip these tests by default since they require Firebase setup
    describe.skip('parseJobPostingHttp', () => {
        const testUserId = 'test-user-123';

        it('should parse a basic job posting', async () => {
            const jobText = `
                Software Engineer - Frontend
                Company: TechCorp Inc.
                Location: San Francisco, CA

                We are looking for a skilled Frontend Developer to join our team.

                Requirements:
                - 3+ years React experience
                - TypeScript knowledge
                - Bachelor's degree preferred

                Apply by: December 31, 2024
            `;

            const result = await parseJobPostingHttp({
                method: 'POST',
                body: JSON.stringify({
                    userId: testUserId,
                    jobAdText: jobText
                })
            }, {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            });

            expect(result).toBeDefined();
        });

        it('should handle duplicate job detection', async () => {
            const jobText = `
                Senior Developer
                ABC Company

                Great opportunity for senior developer.
                Apply by January 15, 2025
            `;

            // Add job first time
            await parseJobPostingHttp({
                method: 'POST',
                body: JSON.stringify({
                    userId: testUserId,
                    jobAdText: jobText
                })
            }, {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            });

            // Try to add same job again - should get duplicate error
            const result = await parseJobPostingHttp({
                method: 'POST',
                body: JSON.stringify({
                    userId: testUserId,
                    jobAdText: jobText
                })
            }, {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            });

            expect(result).toContain('already exists');
        });
    });
});
