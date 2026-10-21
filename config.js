// Backend URL. Change PROD_API after deploying the API on Render (no trailing slash).
const PROD_API = 'https://takeoff-api-2tac.onrender.com';
const API_URL = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://localhost:3000' : PROD_API;
const WS_URL = API_URL.replace(/^http/, 'ws');
