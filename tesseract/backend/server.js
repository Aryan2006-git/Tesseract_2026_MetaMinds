// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const { exec } = require('child_process');
// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//   },
// });

// // Simulated Infrastructure State
// const TOTAL_NODES = 50;
// let nodes = Array.from({ length: TOTAL_NODES }).map((_, i) => ({
//   id: `node-${i}`,
//   status: 'healthy', // 'healthy', 'anomaly', 'healing'
//   cpu: Math.random() * 40 + 10,
//   memory: Math.random() * 40 + 10,
// }));

// let actionLogs = [];
// let currentTraffic = 100; // Baseline RPS (Requests Per Second)

// // Helper functions for simulation

// function detectAnomalyML(node, callback) {
//   const input = JSON.stringify({
//     cpu: node.cpu,
//     memory: node.memory
//   });

//   exec(`python model.py '${input}'`, (error, stdout, stderr) => {
//     if (error) {
//       console.error("ML Error:", error);
//       return callback(false);
//     }

//     try {
//       const result = JSON.parse(stdout);
//       callback(result.anomaly === 1);
//     } catch (e) {
//       console.error("Parse Error:", e);
//       callback(false);
//     }
//   });
// }


// function getRandomNode() {
//   const healthyNodes = nodes.filter(n => n.status === 'healthy');
//   if (healthyNodes.length === 0) return null;
//   return healthyNodes[Math.floor(Math.random() * healthyNodes.length)];
// }

// function generateAnomaly(node) {
//   node.status = 'anomaly';
//   node.cpu = Math.random() * 40 + 60; // Spike CPU
//   node.memory = Math.random() * 40 + 60; // Spike Memory
  
//   const cause = Math.random() > 0.5 ? 'Memory Leak Detected' : 'CPU Spike (Overload)';
  
//   const logEntry = {
//     id: Date.now(),
//     nodeId: node.id,
//     type: 'anomaly',
//     message: `Warning: ${cause} on ${node.id}.`,
//     timestamp: new Date().toISOString()
//   };
//   actionLogs.unshift(logEntry);
//   if (actionLogs.length > 50) actionLogs.pop();
  
//   io.emit('anomaly_detected', node);
//   io.emit('log_update', logEntry);

//   // Trigger self-healing after 3 seconds
//   setTimeout(() => triggerSelfHealing(node, cause), 3000);
// }

// function triggerSelfHealing(node, cause) {
//   if (node.status !== 'anomaly') return;
  
//   node.status = 'healing';
  
//   const action = cause.includes('Memory') ? 'Restarting Container' : 'Scaling Resources';
//   const explanation = `Autonomous Action Initiated: ${action} on ${node.id} to resolve ${cause}. Expected downtime < 100ms.`;
  
//   const logEntry = {
//     id: Date.now() + 1,
//     nodeId: node.id,
//     type: 'healing',
//     message: explanation,
//     timestamp: new Date().toISOString()
//   };
//   actionLogs.unshift(logEntry);
//   if (actionLogs.length > 50) actionLogs.pop();
  
//   io.emit('healing_started', node);
//   io.emit('log_update', logEntry);
  
//   // Resolve healing after 4 seconds
//   setTimeout(() => resolveNode(node), 4000);
// }

// function resolveNode(node) {
//   if (node.status !== 'healing') return;
  
//   node.status = 'healthy';
//   node.cpu = Math.random() * 40 + 10;
//   node.memory = Math.random() * 40 + 10;
  
//   const logEntry = {
//     id: Date.now() + 2,
//     nodeId: node.id,
//     type: 'resolved',
//     message: `Success: ${node.id} is back to healthy state.`,
//     timestamp: new Date().toISOString()
//   };
//   actionLogs.unshift(logEntry);
//   if (actionLogs.length > 50) actionLogs.pop();
  
//   io.emit('healing_resolved', node);
//   io.emit('log_update', logEntry);
// }

// // Simulation Loop
// setInterval(() => {
//   // Fluctuate traffic slightly
//   if (currentTraffic > 100) {
//     currentTraffic -= 50; // Cool down
//   } else {
//     currentTraffic = 100 + Math.floor(Math.random() * 50); // Baseline jitter
//   }

//   if (Math.random() < 0.1 && currentTraffic <= 150) {
//     // 10% chance every 2 seconds to generate a random anomaly
//     const node = getRandomNode();
//     if (node) generateAnomaly(node);
//   }
  
//   // Also send heartbeat state for all nodes
//   io.emit('state_update', { nodes, traffic: currentTraffic });
// }, 2000);

// // Client Connection
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
//   // Send initial state
//   socket.emit('state_update', { nodes, traffic: currentTraffic });
//   socket.emit('initial_logs', actionLogs);
  
//   // Manual trigger for Massive Traffic Spike Simulation
//   socket.on('simulate_traffic', () => {
//     console.log('User triggered massive traffic simulation!');
//     currentTraffic = 5000 + Math.floor(Math.random() * 2000); // Massive spike
    
//     // Broadcast huge spike immediately
//     io.emit('state_update', { nodes, traffic: currentTraffic });
    
//     // Create anomalies on 5 random nodes due to traffic load
//     for(let i=0; i<5; i++) {
//         setTimeout(() => {
//             const node = getRandomNode();
//             if(node) {
//                 node.status = 'anomaly';
//                 node.cpu = 99;
//                 node.memory = 95;
//                 const cause = 'DDoS / Massive Traffic Spike';
//                 const logEntry = {
//                     id: Date.now() + Math.random(),
//                     nodeId: node.id,
//                     type: 'anomaly',
//                     message: `Critical: ${cause} overloading ${node.id}.`,
//                     timestamp: new Date().toISOString()
//                 };
//                 actionLogs.unshift(logEntry);
//                 if (actionLogs.length > 50) actionLogs.pop();
//                 io.emit('anomaly_detected', node);
//                 io.emit('log_update', logEntry);
                
//                 // Trigger auto-scaling healing
//                 setTimeout(() => triggerSelfHealing(node, cause), 3000 + (i * 500));
//             }
//         }, i * 200);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = 3001;
// server.listen(PORT, () => {
//   console.log(`Autonomous IT Backend Engine running on port ${PORT}`);
// });

// ==========================================================================================
// =============================================================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// ================== SYSTEM STATE ==================
const TOTAL_NODES = 20; // 🔥 reduced for performance

let nodes = Array.from({ length: TOTAL_NODES }).map((_, i) => ({
  id: `node-${i}`,
  status: 'healthy',
  cpu: Math.random() * 40 + 10,
  memory: Math.random() * 40 + 10,
}));

let actionLogs = [];
let currentTraffic = 100;
let lastMLRun = 0;

// ================== ML MODEL ==================
function detectAnomalyML(node, callback) {
  const input = JSON.stringify({
    cpu: node.cpu,
    memory: node.memory,
  });

  const modelPath = path.join(__dirname, 'model.py');

  execFile(
    'C:\\Python313\\python.exe',
    [modelPath, input],
    { cwd: __dirname },
    (error, stdout, stderr) => {
      if (error) {
        console.log("⚠️ ML failed → using fallback");

        // 🔥 fallback logic (VERY IMPORTANT)
        if (node.cpu > 85 || node.memory > 85) {
          return callback(true);
        }
        return callback(false);
      }

      try {
        const result = JSON.parse(stdout.trim());
        callback(result.anomaly === 1);
      } catch {
        callback(false);
      }
    }
  );
}

// ================== HELPERS ==================
function getRandomNode() {
  const healthyNodes = nodes.filter(n => n.status === 'healthy');
  if (healthyNodes.length === 0) return null;
  return healthyNodes[Math.floor(Math.random() * healthyNodes.length)];
}

function calculateHealthScore() {
  const healthy = nodes.filter(n => n.status === 'healthy').length;
  return Math.round((healthy / TOTAL_NODES) * 100);
}

// ================== ANOMALY ==================
function generateAnomaly(node) {
  node.status = 'anomaly';

  node.cpu = Math.min(100, node.cpu + Math.random() * 30);
  node.memory = Math.min(100, node.memory + Math.random() * 30);

  let cause = node.cpu > node.memory
    ? 'ML Detected CPU Anomaly'
    : 'ML Detected Memory Anomaly';

  const logEntry = {
    id: Date.now(),
    nodeId: node.id,
    type: 'anomaly',
    message: `🚨 ${cause} on ${node.id}`,
    timestamp: new Date().toISOString(),
  };

  actionLogs.unshift(logEntry);
  if (actionLogs.length > 50) actionLogs.pop();

  io.emit('anomaly_detected', node);
  io.emit('log_update', logEntry);

  setTimeout(() => triggerSelfHealing(node, cause), 3000);
}

// ================== HEALING ==================
function triggerSelfHealing(node, cause) {
  if (node.status !== 'anomaly') return;

  node.status = 'healing';

  let action = '';
  if (cause.includes('Memory')) {
    action = 'Restarting Container';
  } else if (cause.includes('CPU')) {
    action = 'Scaling Resources';
  } else {
    action = 'System Optimization';
  }

  const logEntry = {
    id: Date.now() + 1,
    nodeId: node.id,
    type: 'healing',
    message: `⚙️ ${action} on ${node.id}`,
    timestamp: new Date().toISOString(),
  };

  actionLogs.unshift(logEntry);
  if (actionLogs.length > 50) actionLogs.pop();

  io.emit('healing_started', node);
  io.emit('log_update', logEntry);

  setTimeout(() => resolveNode(node), 4000);
}

// ================== RESOLVE ==================
function resolveNode(node) {
  if (node.status !== 'healing') return;

  node.status = 'healthy';
  node.cpu = Math.random() * 40 + 10;
  node.memory = Math.random() * 40 + 10;

  const logEntry = {
    id: Date.now() + 2,
    nodeId: node.id,
    type: 'resolved',
    message: `✅ ${node.id} recovered`,
    timestamp: new Date().toISOString(),
  };

  actionLogs.unshift(logEntry);
  if (actionLogs.length > 50) actionLogs.pop();

  io.emit('healing_resolved', node);
  io.emit('log_update', logEntry);
}

// ================== MAIN LOOP ==================
setInterval(() => {
  // Traffic simulation
  if (currentTraffic > 2000) {
    currentTraffic -= 500;
  } else if (currentTraffic > 100) {
    currentTraffic -= 50;
  } else {
    currentTraffic = 100 + Math.floor(Math.random() * 50);
  }

  // 🔥 Prediction logs
  nodes.forEach(node => {
    if (node.status === 'healthy' && (node.cpu > 70 || node.memory > 70)) {
      const logEntry = {
        id: Date.now() + Math.random(),
        nodeId: node.id,
        type: 'prediction',
        message: `⚠️ ${node.id} may become unstable`,
        timestamp: new Date().toISOString(),
      };

      actionLogs.unshift(logEntry);
      if (actionLogs.length > 50) actionLogs.pop();

      io.emit('log_update', logEntry);
    }
  });

  // 🔥 LIMITED ML CALLS (NO LAG)
  if (Date.now() - lastMLRun > 3000) {
    lastMLRun = Date.now();

    for (let i = 0; i < 2; i++) { // 🔥 only 2 nodes
      const node = getRandomNode();
      if (node && node.status === 'healthy') {
        detectAnomalyML(node, (isAnomaly) => {
          if (isAnomaly) {
            generateAnomaly(node);
          }
        });
      }
    }
  }

  // Send state
  io.emit('state_update', {
    nodes,
    traffic: currentTraffic,
    healthScore: calculateHealthScore(),
  });

}, 4000); // 🔥 slower interval

// ================== SOCKET ==================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('state_update', {
    nodes,
    traffic: currentTraffic,
    healthScore: calculateHealthScore(),
  });

  socket.emit('initial_logs', actionLogs);

  socket.on('simulate_traffic', () => {
    console.log('🔥 Traffic Spike Triggered');

    currentTraffic = 5000 + Math.floor(Math.random() * 2000);

    io.emit('state_update', {
      nodes,
      traffic: currentTraffic,
      healthScore: calculateHealthScore(),
    });

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const node = getRandomNode();
        if (node) {
          node.cpu = 99;
          node.memory = 95;
          generateAnomaly(node);
        }
      }, i * 400);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ================== START ==================
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Optimized AI Backend running on port ${PORT}`);
});