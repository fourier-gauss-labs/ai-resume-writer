// Test parsing with a known user who has uploaded files
import { parseResumeToStructuredHistoryHttp, storeStructuredHistoryHttp } from './src/utils/firebaseFunctions';

async function testParsing() {
    try {
        console.log('Testing parsing...');

        // Use the actual user ID from the Firestore screenshot
        const userId = 'hgJKZCk8TVekCJYXa8GKRhPOnp1';

        console.log('Calling parseResumeToStructuredHistoryHttp...');
        const parsedData = await parseResumeToStructuredHistoryHttp(userId);

        console.log('Parsed data structure:', JSON.stringify(parsedData, null, 2));

        console.log('Calling storeStructuredHistoryHttp...');
        await storeStructuredHistoryHttp(userId, parsedData);

        console.log('Data stored successfully');

    } catch (error) {
        console.error('Test error:', error);
    }
}

// Run the test
testParsing();
