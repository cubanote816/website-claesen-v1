import https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = 'https://backend.claesen-verlichting.be/v1/website/projects?per_page=10&filter[featured]=1';

const options = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

https.get(API_URL, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Raw structure keys:', Object.keys(json));
            if (json.data) {
                console.log('json.data keys:', Object.keys(json.data));
                if (Array.isArray(json.data)) {
                    console.log('json.data is Array. Length:', json.data.length);
                } else if (json.data.data) {
                    console.log('json.data.data is Array. Length:', json.data.data.length);
                }
            }
            console.log('First Item:', JSON.stringify(json.data?.data?.[0] || json.data?.[0], null, 2));
        } catch (e) {
            console.error('Parse error:', e);
            console.log('Raw data:', data);
        }
    });
}).on('error', (e) => {
    console.error('Request error:', e);
});
