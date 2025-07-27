async function testCloudFunction() {
    const baseUrl = 'https://us-central1-ai-resume-writer-46403.cloudfunctions.net/parseResumeToStructuredHistoryHttp';

    console.log('Testing Cloud Function URL accessibility...');

    try {
        const response = await fetch(baseUrl, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });

        console.log('OPTIONS Response Status:', response.status);
        console.log('OPTIONS Response Headers:', Object.fromEntries(response.headers.entries()));

        const text = await response.text();
        console.log('OPTIONS Response Body:', text);

    } catch (error) {
        console.error('Error testing function URL:', error);
    }
}

testCloudFunction();
