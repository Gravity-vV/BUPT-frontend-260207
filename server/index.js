const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
let blockHeight = 630760;

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
};

const logFilePath = path.join(__dirname, '..', 'tps.log');

const writeTpsLog = (time, tps) => {
  const logLine = `${time},${tps}\n`;
  fs.appendFile(logFilePath, logLine, (err) => {
    if (err) console.error('Failed to write tps log:', err);
  });
};

let tpsData = [];
let growthData = [];
let currentTps = 20;
let currentGrowth = 126;

const generateInitialData = () => {
  const now = new Date();
  const dataPoints = 36;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3 * 1000);
    const hour = time.getHours().toString().padStart(2, '0');
    const minute = time.getMinutes().toString().padStart(2, '0');
    const second = time.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hour}:${minute}:${second}`;
    
    const tpsChange = (Math.random() - 0.5) * 10;
    currentTps = Math.max(15, Math.min(25, currentTps + tpsChange));
    const tpsValue = parseFloat(currentTps.toFixed(1));
    
    const growthChange = (Math.random() - 0.5) * 2;
    currentGrowth = Math.max(123, Math.min(130, currentGrowth + growthChange));
    const growthValue = parseFloat(currentGrowth.toFixed(1));
    
    tpsData.push({ time: timeStr, value: tpsValue });
    growthData.push({ time: timeStr, value: growthValue });
  }
};

const updateData = () => {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  const timeStr = `${hour}:${minute}:${second}`;
  
  const tpsChange = (Math.random() - 0.5) * 10;
  currentTps = Math.max(15, Math.min(25, currentTps + tpsChange));
  const tpsValue = parseFloat(currentTps.toFixed(1));
  
  const growthChange = (Math.random() - 0.5) * 2;
  currentGrowth = Math.max(123, Math.min(130, currentGrowth + growthChange));
  const growthValue = parseFloat(currentGrowth.toFixed(1));
  
  tpsData.push({ time: timeStr, value: tpsValue });
  growthData.push({ time: timeStr, value: growthValue });
  
  if (tpsData.length > 36) {
    tpsData.shift();
    growthData.shift();
  }
  
  const logTime = `${hour}:${minute}`;
  console.log(`[${logTime}] TPS: ${tpsValue}, Growth: ${growthValue}`);
  writeTpsLog(logTime, tpsValue);
};

generateInitialData();
setInterval(updateData, 3000);

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/api/left-data') {
    blockHeight += 1;
    const payload = {
      ue: 'UEB',
      timestamp: Math.floor(Date.now() / 1000),
      blockHeight,
      status: '证书验证通过'
    };
    sendJson(res, 200, payload);
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/center-data') {
    blockHeight += 1;
    const payload = {
      ueId: '265',
      targetId: '64f070:00000089',
      reason: '无线网络层',
      status: '上下文释放',
      blockHeight,
      risk: '否'
    };
    sendJson(res, 200, payload);
    return;
  }
  if (req.method === 'GET' && url.pathname === '/api/tps-data') {
    const payload = {
      tps: tpsData,
      growth: growthData
    };
    sendJson(res, 200, payload);
    return;
  }

  sendJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
