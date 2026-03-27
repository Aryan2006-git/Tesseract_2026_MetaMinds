import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Scene from './Scene';

const socket = io('http://localhost:3001');

function App() {
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ healthy: 0, anomaly: 0, healing: 0 });
  const [traffic, setTraffic] = useState(0);

  useEffect(() => {
    socket.on('state_update', (data) => {
      // Backend now sends { nodes, traffic }
      if (data.nodes) {
        setNodes(data.nodes);
        const h = data.nodes.filter(n => n.status === 'healthy').length;
        const a = data.nodes.filter(n => n.status === 'anomaly').length;
        const heal = data.nodes.filter(n => n.status === 'healing').length;
        setStats({ healthy: h, anomaly: a, healing: heal });
      } else {
        // Fallback for old format just in case
        setNodes(data);
      }
      if (data.traffic !== undefined) {
        setTraffic(data.traffic);
      }
    });

    socket.on('initial_logs', (data) => {
      setLogs(data);
    });

    socket.on('log_update', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 50));
    });

    return () => {
      socket.off('state_update');
      socket.off('initial_logs');
      socket.off('log_update');
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#050505', overflow: 'hidden' }}>
      <Scene nodes={nodes} logs={logs} stats={stats} traffic={traffic} socket={socket} />
    </div>
  );
}

export default App;
