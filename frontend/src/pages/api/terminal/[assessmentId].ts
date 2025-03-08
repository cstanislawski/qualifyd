import { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

// Create a proxy server for each request to avoid issues with event listeners
const createProxyServer = () => {
  const target = process.env.NEXT_PUBLIC_API_URL || 'http://backend.qualifyd-dev.svc.cluster.local:8080';
  console.log(`Creating proxy to target: ${target}`);

  return httpProxy.createProxyServer({
    target,
    ws: true,
    changeOrigin: true,
    xfwd: true,
  });
};

// Disable body parsing, we just want to proxy the request as-is
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return 404 if not a WebSocket request
  if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== 'websocket') {
    console.log('Not a WebSocket request, returning 404');
    res.status(404).end();
    return;
  }

  console.log('Proxying WebSocket connection to backend');
  console.log('Original URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Let http-proxy handle the WebSocket upgrade
  return new Promise((resolve, reject) => {
    try {
      // Create a new proxy for this request
      const proxy = createProxyServer();

      // Remove the /api prefix when forwarding to backend
      const modifiedUrl = req.url?.replace('/api', '');
      req.url = modifiedUrl;

      console.log('Modified URL:', modifiedUrl);

      // Set up error handling before making the ws call
      proxy.on('error', (err) => {
        console.error('Proxy error event:', err);
        reject(err);
      });

      proxy.on('proxyReq', () => {
        console.log('Proxy request created');
      });

      proxy.on('proxyReqWs', () => {
        console.log('WebSocket proxy request created');
      });

      proxy.on('proxyRes', () => {
        console.log('Received proxy response');
      });

      proxy.on('open', () => {
        console.log('WebSocket connection opened');
      });

      proxy.on('close', () => {
        console.log('WebSocket connection closed');
        resolve(undefined);
      });

      console.log('Calling proxy.ws()');

      proxy.ws(req, req.socket, {
        headers: {
          ...req.headers,
          host: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://backend.qualifyd-dev.svc.cluster.local:8080').host,
        },
      }, (err) => {
        if (err) {
          console.error('Proxy callback error:', err);
          reject(err);
        } else {
          console.log('Proxy.ws callback executed without error');
        }
      });
    } catch (err) {
      console.error('Handler error:', err);
      reject(err);
    }
  });
}
