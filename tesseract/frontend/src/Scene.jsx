import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, Stars, Line, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, AlertTriangle, CheckCircle, Server, RefreshCw, Database, Brain, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// --- 3D Elements ---

function ServerNode({ position, status, id }) {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.002;
      meshRef.current.rotation.y += delta * 0.5;
      if (status === 'anomaly') {
         meshRef.current.position.x += (Math.random() - 0.5) * 0.05;
      }
    }
  });

  let color = '#00b09b';
  let emissive = '#00f2fe';
  let emissiveIntensity = 0.5;

  if (status === 'anomaly') {
    color = '#ff4b2b';
    emissive = '#ff4b2b';
    emissiveIntensity = 2;
  } else if (status === 'healing') {
    color = '#f6d365';
    emissive = '#fda085';
    emissiveIntensity = 1.5;
  }

  return (
    <mesh position={position} ref={meshRef}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial 
        color={color} 
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        wireframe={status === 'anomaly'}
      />
    </mesh>
  );
}

function Connections({ nodesPositions }) {
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodesPositions.length; i++) {
      for (let j = i + 1; j < nodesPositions.length; j++) {
        const p1 = new THREE.Vector3(...nodesPositions[i]);
        const p2 = new THREE.Vector3(...nodesPositions[j]);
        if (p1.distanceTo(p2) < 4) {
          arr.push([p1, p2]);
        }
      }
    }
    return arr.slice(0, 150);
  }, [nodesPositions]);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line 
          key={i}
          points={pts}
          color="rgba(255, 255, 255, 0.1)"
          lineWidth={1}
          transparent
        />
      ))}
    </group>
  );
}

function NetworkSphere({ nodes }) {
  const scroll = useScroll();
  const groupRef = useRef();

  const nodesPositions = useMemo(() => {
    const total = Math.max(50, nodes.length);
    const positions = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      positions.push([x * 6, y * 6, z * 6]);
    }
    return positions;
  }, [nodes.length]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate the entire sphere slowly
      groupRef.current.rotation.y += delta * 0.1;
      
      // Animate scale & position based on scroll offset (0 to 1 over 6 pages)
      const offset = scroll.offset; 
      
      if (offset < 0.16) {
        // Page 1: Hero
        groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      } else if (offset >= 0.16 && offset < 0.33) {
        // Page 2: Problem (zoomed out on left)
        groupRef.current.position.lerp(new THREE.Vector3(-3, 0, -5), 0.1);
        groupRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else if (offset >= 0.33 && offset < 0.5) {
        // Page 3: Solution (Zoomed in on left)
        groupRef.current.position.lerp(new THREE.Vector3(4, 0, -2), 0.1);
      } else if (offset >= 0.5 && offset < 0.66) {
        // Page 4: Process Flow (Far right and dark)
        groupRef.current.position.lerp(new THREE.Vector3(-4, -2, -6), 0.1);
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      } else if (offset >= 0.66 && offset < 0.83) {
        // Page 5: Adaptive Learning (Centered, slightly lower)
        groupRef.current.position.lerp(new THREE.Vector3(0, -3, -4), 0.1);
        groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      } else {
        // Page 6: Dashboard Prototype (Background)
        groupRef.current.position.lerp(new THREE.Vector3(0, -2, -10), 0.1);
        groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Connections nodesPositions={nodesPositions} />
      {nodes.map((node, index) => {
        const pos = nodesPositions[index] || [0,0,0];
        return (
          <ServerNode key={node.id} id={node.id} position={pos} status={node.status} />
        );
      })}
    </group>
  );
}

// --- Cinematic ML Simulation Overlay ---

function SimulationOverlay({ traffic }) {
  const [terminalLines, setTerminalLines] = useState([]);
  const [health, setHealth] = useState(100);

  React.useEffect(() => {
    // A highly choreographed, cinematic sequence of what the AI is doing
    const sequence = [
      { time: 0, text: "> WARNING: Massive traffic anomaly detected.", health: 90 },
      { time: 500, text: "> Analyzing payload signatures... DDoS identified.", health: 70 },
      { time: 1000, text: "> CRITICAL: 5 Server Nodes overloaded. CPU at 99%.", health: 30 },
      { time: 2000, text: "> Initiating AI Self-Healing Orchestrator...", health: 25 },
      { time: 2500, text: "> AI DECISION: Provisioning 5 backup containers...", health: 40 },
      { time: 3500, text: "> Rerouting excess traffic to load balancers...", health: 65 },
      { time: 4500, text: "> Restoring failed nodes...", health: 85 },
      { time: 5500, text: "> SUCCESS: Network stabilized. Zero touch required.", health: 100 }
    ];

    sequence.forEach((step) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, step.text]);
        setHealth(step.health);
      }, step.time);
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}
    >
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }} 
        transition={{ repeat: Infinity, duration: 1 }}
        style={{ color: '#ff4b2b', fontSize: '4rem', fontWeight: 900, marginBottom: '20px', textShadow: '0 0 30px #ff4b2b' }}
      >
        CRITICAL LOAD DETECTED
      </motion.div>
      
      <div style={{ fontSize: '2rem', marginBottom: '40px', color: '#00f2fe' }}>
        Incoming Traffic: {traffic} Req/s
      </div>

      {/* System Health Bar */}
      <div style={{ width: '80%', maxWidth: '800px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.2rem' }}>
          <span>System Health</span>
          <span style={{ color: health < 50 ? '#ff4b2b' : (health < 80 ? '#f6d365' : '#00b09b'), fontWeight: 'bold' }}>{health}%</span>
        </div>
        <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div 
            animate={{ width: `${health}%`, backgroundColor: health < 50 ? '#ff4b2b' : (health < 80 ? '#f6d365' : '#00b09b') }}
            transition={{ duration: 0.5 }}
            style={{ height: '100%' }} 
          />
        </div>
      </div>

      {/* AI Terminal Output */}
      <div style={{ 
        width: '80%', maxWidth: '800px', height: '300px', 
        background: 'rgba(0,20,0,0.7)', border: '1px solid #00ff00', 
        borderRadius: '8px', padding: '20px', fontFamily: 'monospace',
        overflowY: 'auto', boxShadow: '0 0 20px rgba(0,255,0,0.2)'
      }}>
        <div style={{ color: '#00ff00', fontSize: '1.2rem', marginBottom: '10px' }}>--- AI ORCHESTRATOR TERMINAL ---</div>
        {terminalLines.map((line, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            style={{ color: line.includes('CRITICAL') || line.includes('WARNING') ? '#ff4b2b' : line.includes('SUCCESS') ? '#00f2fe' : '#00ff00', marginBottom: '10px', fontSize: '1.2rem' }}
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- HTML Story Overlay ---

function HtmlStory({ logs, stats, nodes, traffic, socket }) {
  const scroll = useScroll();
  const [page, setPage] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0=idle, 1=data, 2=detect, 3=decide, 4=act

  useFrame(() => {
    // 6 pages total
    const current = Math.floor(scroll.offset * 6);
    if (current !== page) setPage(current);
  });

  const handleSimulate = () => {
    if (socket) {
      socket.emit('simulate_traffic');
      setIsSimulating(true);
      setTimeout(() => setIsSimulating(false), 6500); // 6.5s cinematic effect
    }
  };

  const runPipelineDemo = () => {
    if (pipelineStep > 0) return;
    setPipelineStep(1); // Data Collection
    setTimeout(() => setPipelineStep(2), 1500); // Anomaly Detection
    setTimeout(() => setPipelineStep(3), 3000); // Decision Engine
    setTimeout(() => setPipelineStep(4), 4500); // Autonomous Action
    setTimeout(() => setPipelineStep(0), 7000); // Reset
  };

  return (
    <div style={{ width: '100vw', color: 'white' }}>
      
      {isSimulating && <SimulationOverlay traffic={traffic} />}

      {/* Page 1: Hero */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-gradient"
          style={{ fontSize: '4rem', fontWeight: 800, margin: 0, lineHeight: 1.1, maxWidth: '800px' }}
        >
          Autonomous IT
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ fontSize: '2rem', fontWeight: 300, color: 'rgba(255,255,255,0.7)', marginTop: '20px', maxWidth: '600px' }}
        >
          Rethinking the Future of Self-Managing Systems.
        </motion.h2>
        <p style={{ marginTop: 'auto', marginBottom: '40px', fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Scroll to explore <span style={{ animation: 'bounce 2s infinite' }}>↓</span>
        </p>
        <div style={{ position: 'absolute', top: '40px', right: '40px', textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Live Global Traffic</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: traffic > 1000 ? '#ff4b2b' : '#00f2fe' }}>
            {traffic} Req/s
          </div>
          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            style={{ 
              marginTop: '12px',
              padding: '12px 24px', 
              background: isSimulating ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: isSimulating ? 'none' : '0 4px 15px rgba(255, 75, 43, 0.4)'
            }}
          >
            {isSimulating ? 'Simulating Spike...' : 'Simulate Traffic Spike'}
          </button>
        </div>
      </section>

      {/* Page 2: The Problem */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '10vw', textAlign: 'right' }}>
        <div style={{ maxWidth: '500px' }}>
          <motion.h2 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-accent-red"
            style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}
          >
            The Problem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', marginTop: '20px' }}
          >
            Servers crash. Networks fail. Reactive IT requires manual intervention, leading to high downtime and lost revenue.
          </motion.p>
        </div>
      </section>

      {/* Page 3: The Solution */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
         <div style={{ maxWidth: '500px' }}>
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-accent-green"
            style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}
          >
            Our Solution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', marginTop: '20px' }}
          >
            An AI-driven self-healing system. It detects issues instantly, explains decisions using Explainable AI, and executes fixes with zero-touch operations.
          </motion.p>
        </div>
      </section>

      {/* Page 4: How It Works */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '10vw', textAlign: 'right' }}>
         <div style={{ maxWidth: '600px' }}>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-gradient"
            style={{ fontSize: '3rem', fontWeight: 700, margin: 0 }}
          >
            How Does It Work?
          </motion.h2>
          
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '20px' }}>
            Watch the AI process simulated data in real-time.
          </p>
          <button 
            onClick={runPipelineDemo}
            disabled={pipelineStep > 0}
            style={{ 
              marginBottom: '20px',
              padding: '10px 20px', 
              background: pipelineStep > 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 176, 155, 0.2)', 
              color: pipelineStep > 0 ? 'rgba(255,255,255,0.5)' : '#00b09b', 
              border: pipelineStep > 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid #00b09b', 
              borderRadius: '8px', 
              cursor: pipelineStep > 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            {pipelineStep === 0 ? '▶ Run Pipeline Demo' : 'Pipeline Running...'}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { id: 1, icon: <Database />, title: 'Data Collection', text: 'Gathers logs, metrics, & system data.', activeColor: '#00f2fe' },
              { id: 2, icon: <Activity />, title: 'AI Anomaly Detection', text: 'ML model identifies infrastructure anomalies.', activeColor: '#ff4b2b' },
              { id: 3, icon: <Brain />, title: 'Decision Engine', text: 'AI + Rule-based selection engine runs root cause analysis.', activeColor: '#f6d365' },
              { id: 4, icon: <Zap />, title: 'Autonomous Action', text: 'Orchestrator instantly heals the servers.', activeColor: '#00b09b' }
            ].map((step, idx) => {
              const isActive = pipelineStep === step.id;
              const isPast = pipelineStep > step.id;
              
              let bgColor = 'rgba(255,255,255,0.05)';
              let iconColor = '#4facfe'; // default
              
              if (isActive) {
                bgColor = step.activeColor + '40'; // 40 hex opacity
                iconColor = step.activeColor;
              } else if (isPast) {
                iconColor = 'rgba(255,255,255,0.3)';
              }

              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end', 
                    gap: '16px',
                    opacity: pipelineStep === 0 ? 1 : (isActive || isPast ? 1 : 0.3),
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.4s ease'
                  }}
                >
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: isActive ? step.activeColor : '#fff' }}>{step.title}</div>
                    <div style={{ fontSize: '0.9rem', color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                      {isActive ? `>> Processing ${step.title}...` : step.text}
                    </div>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    background: bgColor, 
                    borderRadius: '50%', 
                    color: iconColor,
                    boxShadow: isActive ? `0 0 15px ${step.activeColor}` : 'none',
                    transition: 'all 0.4s ease'
                  }}>
                    {step.icon}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Page 5: Adaptive Learning Loop */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
         <div style={{ maxWidth: '500px' }}>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-accent-yellow"
            style={{ fontSize: '3rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <TrendingUp size={40} /> Adaptive Learning
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', marginTop: '20px' }}
          >
            Our system utilizes a continuous feedback loop. Every anomaly resolved by the Autonomous Action Orchestrator is fed back into the training dataset. Over time, the ML model becomes incredibly precise.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-panel panel" 
            style={{ marginTop: '30px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Model Confidence Level</span>
              <span className="text-accent-green" style={{ fontWeight: 'bold' }}>98.2%</span>
            </div>
            {/* Fake progress bar charting */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: '30%' }}
                whileInView={{ width: '98%' }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #00b09b, #96c93d)' }} 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Page 6: Interactive Dashboard */}
      <section style={{ height: '100vh', position: 'relative' }}>
        <div className="dashboard-overlay" style={{ opacity: 1, transition: 'opacity 1s', pointerEvents: 'auto' }}>
          <header className="dashboard-header">
            <div className="glass-panel panel">
              <h1 className="text-gradient" style={{ margin: '0 0 4px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={24} className="text-accent-blue" />
                Live Prototype
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                Simulating Self-Healing Infrastructure
              </p>
            </div>

            <div className="glass-panel panel" style={{ display: 'flex', gap: '24px', textAlign: 'center' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>System Health</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#00b09b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <CheckCircle size={20} /> {(stats.healthy / Math.max(1, nodes.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Open Issues</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ff4b2b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <AlertTriangle size={20} /> {stats.anomaly}
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>AI Resurrections</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f6d365', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <RefreshCw size={20} className={stats.healing > 0 ? "animate-pulse" : ""} /> {stats.healing}
                </div>
              </div>

              <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Live Global Traffic</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: traffic > 1000 ? '#ff4b2b' : '#00f2fe' }}>
                  {traffic} Req/s
                </div>
                <button 
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  style={{ 
                    marginTop: '8px',
                    padding: '8px 16px', 
                    background: isSimulating ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: isSimulating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    boxShadow: isSimulating ? 'none' : '0 4px 15px rgba(255, 75, 43, 0.4)'
                  }}
                >
                  {isSimulating ? 'Simulating Spike...' : 'Simulate Traffic Spike'}
                </button>
              </div>
            </div>
          </header>

          <footer className="dashboard-footer">
            <div className="glass-panel panel" style={{ flex: 1, maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} className="text-accent-blue" /> Explainable AI Decision Engine
              </h2>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
                {logs.length === 0 ? (
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                    Monitoring system state... No recent events.
                  </div>
                ) : (
                  logs.map(log => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={log.id} 
                      className={`log-entry ${log.type}`}
                    >
                      <div className="timestamp">{new Date(log.timestamp).toLocaleTimeString()} - {log.nodeId}</div>
                      <div style={{ fontWeight: 500 }}>{log.message}</div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </footer>
        </div>
      </section>

    </div>
  );
}

// --- Main Scene ---

export default function Scene({ nodes, logs, stats, traffic, socket }) {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }} style={{ background: '#020205' }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#4facfe" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff4b2b" />
      
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <ScrollControls pages={6} damping={0.25}>
        <Scroll>
          <NetworkSphere nodes={nodes} />
        </Scroll>
        
        <Scroll html style={{ width: '100%' }}>
          <HtmlStory logs={logs} stats={stats} nodes={nodes} traffic={traffic} socket={socket} />
        </Scroll>
      </ScrollControls>

    </Canvas>
  );
}
