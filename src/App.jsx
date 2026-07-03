import jsPDF from "jspdf";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import CursorGlow from "./components/CursorGlow";
import Tilt from "react-parallax-tilt";
import ParticlesBg from "./components/ParticlesBg";
import { OrbitControls, Stars } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import {
  Leaf,
  Bot,
  BarChart3,
  Wind,
  Thermometer,
  Cloud,
  Zap,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./index.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const data = [
  { time: "10AM", aqi: 120 },
  { time: "11AM", aqi: 135 },
  { time: "12PM", aqi: 150 },
  { time: "1PM", aqi: 128 },
  { time: "2PM", aqi: 110 },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [transition, setTransition] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [impactScore, setImpactScore] = useState(72);
  const [aiReport, setAiReport] = useState("");
  const [realWeather, setRealWeather] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [realAQI, setRealAQI] = useState(null);
  const [sensorLogs, setSensorLogs] = useState([]);
  const [demoStep, setDemoStep] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [treeHealth, setTreeHealth] = useState(87);
  const [smartPolesActive, setSmartPolesActive] = useState(92);
  const [demoAlert, setDemoAlert] = useState("System Normal");
  const [sensorData, setSensorData] = useState({
    aqi: 128,
    co2: 420,
    temp: 31,
    carbon: 18.5,
  });
  const mainRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchRealData() {
      try {
        const weatherRes = await fetch(`${API_BASE_URL}/weather?lat=23.2599&lon=77.4126`);
        const weatherData = await weatherRes.json();

        const aqiRes = await fetch(`${API_BASE_URL}/aqi?lat=23.2599&lon=77.4126`);
        const aqiData = await aqiRes.json();

        setRealWeather(weatherData);
        setRealAQI(aqiData);

        await fetch(`${API_BASE_URL}/sensor-log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aqi: aqiData.aqi,
            pm25: aqiData.pm25,
            pm10: aqiData.pm10,
            temperature: weatherData.temp,
            humidity: weatherData.humidity,
          }),
        });
      } catch (error) {
        console.log("Real API error:", error);
      }
    }

    fetchRealData();

    const interval = setInterval(fetchRealData, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".reveal").forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 120, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
        }
      );
    });
  }, []);

  function handlePageTransition() {
    setTransition(true);

    setTimeout(() => {
      document.getElementById("dashboard")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 500);

    setTimeout(() => {
      setTransition(false);
    }, 1200);
  }



  function downloadReport() {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("EcoMind AI - Environmental Impact Report", 15, 20);

    doc.setFontSize(12);
    doc.text("Smart Green City Intelligence System", 15, 32);

    doc.line(15, 38, 195, 38);

    doc.setFontSize(14);
    doc.text("Live Environmental Data:", 15, 52);

    doc.setFontSize(12);
    doc.text("AQI Level: 128 - Moderate", 15, 65);
    doc.text("CO2 Level: 420 ppm - High", 15, 75);
    doc.text("Temperature: 31°C - Normal", 15, 85);
    doc.text("Carbon Captured Today: 18.5 kg", 15, 95);

    doc.setFontSize(14);
    doc.text("AI Suggestions:", 15, 115);

    doc.setFontSize(12);
    doc.text("1. Increase smart pole speed near Traffic Zone A.", 15, 128);
    doc.text("2. Water trees in Sector B within 24 hours.", 15, 138);
    doc.text("3. Plant 120 trees near high CO2 hotspot.", 15, 148);
    doc.text("4. Shift public transport route to reduce emissions.", 15, 158);

    doc.setFontSize(14);
    doc.text("Impact Summary:", 15, 178);

    doc.setFontSize(12);
    doc.text("Trees Monitored: 15,420", 15, 191);
    doc.text("CO2 Reduced: 2,890 kg", 15, 201);
    doc.text("Smart Poles Active: 92", 15, 211);
    doc.text("Pollution Hotspots Detected: 38", 15, 221);

    doc.setFontSize(11);
    doc.text("Generated by EcoMind AI Hackathon Prototype", 15, 275);

    doc.save("EcoMind_AI_Report.pdf");
  }

  const cardClass = darkMode
    ? "bg-white/5 border-white/10"
    : "bg-white/80 border-green-200 shadow-xl";

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData({
        aqi: Math.floor(100 + Math.random() * 80),
        co2: Math.floor(380 + Math.random() * 90),
        temp: Math.floor(26 + Math.random() * 10),
        carbon: (15 + Math.random() * 8).toFixed(1),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function handleAdminLogin() {
    if (adminPassword === "admin123") {

      setIsAdminLoggedIn(true);

      setAdminPassword("");

      loadSensorLogs();

    } else {

      alert("Wrong password");

    }
  }


  function handleAdminLogout() {
    setIsAdminLoggedIn(false);
  }

  async function loadSensorLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/sensor-logs`);

      const data = await res.json();

      setSensorLogs(data);
    } catch (error) {
      console.log("Sensor logs error:", error);
    }
  }

  function generateAIReport() {
    const report = `
EcoMind AI Environmental Report

Current AQI: ${realAQI ? realAQI.aqi : sensorData.aqi}
PM2.5 Level: ${realAQI ? realAQI.pm25 : "N/A"}
PM10 Level: ${realAQI ? realAQI.pm10 : "N/A"}
Temperature: ${realWeather ? realWeather.temp : sensorData.temp}°C
Humidity: ${realWeather ? realWeather.humidity : "N/A"}%

AI Analysis:
EcoMind AI detects moderate air pollution levels. The city should increase smart pole activity near traffic-heavy zones, monitor PM2.5 levels, and improve tree plantation around pollution hotspots.

Suggested Actions:
1. Activate smart poles in Zone A.
2. Increase tree monitoring in Sector B.
3. Reduce traffic emissions near busy roads.
4. Generate weekly pollution reports.
`;

    setAiReport(report);
  }

  function downloadAIReport() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("EcoMind AI Environmental Report", 15, 20);

    const lines = doc.splitTextToSize(aiReport || "Please generate report first.", 180);

    doc.setFontSize(11);
    doc.text(lines, 15, 35);

    doc.save("EcoMind_AI_Environmental_Report.pdf");
  }

  function startDemoSimulation() {
    playDemoSound();
    setShowSuccess(false);
    setImpactScore(72);
    setDemoMode(true);
    setDemoStep(1);
    setDemoAlert("Step 1: High pollution detected near Zone A");

    setSensorData({
      aqi: 178,
      co2: 490,
      temp: 35,
      carbon: 18.5,
    });

    setTreeHealth(58);

    setTimeout(() => {
      setDemoStep(2);
      setDemoAlert("Step 2: Smart Poles activated for carbon capture");
      setSmartPolesActive(120);
      setSensorData((prev) => ({
        ...prev,
        carbon: 26.8,
      }));
    }, 2500);

    setTimeout(() => {
      setDemoStep(3);
      setDemoAlert("Step 3: AI recommends trees near traffic hotspots");
      setTreeHealth(72);
      setImpactScore(91);
      setShowSuccess(true);
    }, 5000);
  }

  function resetDemoSimulation() {
    setDemoMode(false);
    setDemoStep(0);
    setDemoAlert("System Normal");
    setShowSuccess(false);
    setImpactScore(72);

    setSensorData({
      aqi: 128,
      co2: 420,
      temp: 31,
      carbon: 18.5,
    });

    setTreeHealth(87);
    setSmartPolesActive(92);
  }

  function playDemoSound() {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    audio.play();
  }

  return (
    <>
      {loading && <Loader />}
      {transition && <PageTransition />}
      <div
        ref={mainRef}
        className={`min-h-screen overflow-x-hidden relative transition-all duration-500 ${darkMode
          ? "bg-slate-950 text-white"
          : "bg-emerald-50 text-slate-950"
          }`}
      >
        <AnimatedCursor />
        {/* <CursorGlow /> */}
        {/* <ParticlesBg /> */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),transparent_55%)]"></div>

        <div className="particles">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i}></span>
          ))}
        </div>

        <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-[9000] w-[92%] max-w-6xl">
          <div
            className={`flex justify-between items-center px-6 py-4 rounded-full border backdrop-blur-xl shadow-2xl transition-all duration-500 ${darkMode
              ? "bg-slate-900/70 border-white/10"
              : "bg-white/75 border-green-200"
              }`}
          >
            <h1 className="text-2xl font-bold text-green-400">EcoMind AI</h1>

            <div className="hidden md:flex gap-6 text-sm font-medium">
              <a href="#home" className="hover:text-green-400 transition">
                Home
              </a>
              <a href="#dashboard" className="hover:text-green-400 transition">
                Dashboard
              </a>
              <a href="#smartpole" className="hover:text-green-400 transition">
                Smart Pole
              </a>
              <a href="#tree" className="hover:text-green-400 transition">
                Tree Twin
              </a>
              <a href="#map" className="hover:text-green-400 transition">
                Hotspots
              </a>
              <a href="#ai" className="hover:text-green-400 transition">
                AI
              </a>
              <a href="#impact" className="hover:text-green-400 transition">
                Impact
              </a>
              <a href="#future" className="hover:text-green-400 transition">
                Future
              </a>
              <a href="#admin" className="hover:text-green-400 transition">
                Admin
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition ${darkMode
                  ? "bg-white/10 text-yellow-300"
                  : "bg-green-100 text-green-700"
                  }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* <button
                onClick={handlePageTransition}
                className="hidden sm:block px-5 py-2 rounded-full bg-green-500 text-black font-bold hover:bg-green-400 transition"
              >
                Start Demo
              </button> */}

              <button
                onClick={startDemoSimulation}
                className="hidden sm:block px-5 py-2 rounded-full bg-red-500 text-white font-bold hover:bg-red-400 transition"
              >
                🚀 Demo Simulation
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-11 h-11 rounded-full bg-green-500 text-black flex items-center justify-center"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>


            </div>
            {menuOpen && (
              <div
                className={`absolute top-20 left-0 w-full rounded-3xl p-6 md:hidden border backdrop-blur-xl ${darkMode
                  ? "bg-slate-900/95 border-white/10"
                  : "bg-white/95 border-green-200"
                  }`}
              >
                <div className="flex flex-col gap-5 font-semibold">
                  <a onClick={() => setMenuOpen(false)} href="#home">Home</a>
                  <a onClick={() => setMenuOpen(false)} href="#dashboard">Dashboard</a>
                  <a onClick={() => setMenuOpen(false)} href="#smartpole">Smart Pole</a>
                  <a onClick={() => setMenuOpen(false)} href="#tree">Tree Twin</a>
                  <a onClick={() => setMenuOpen(false)} href="#map">Hotspots</a>
                  <a onClick={() => setMenuOpen(false)} href="#ai">AI</a>
                  <a onClick={() => setMenuOpen(false)} href="#impact">Impact</a>
                  <a onClick={() => setMenuOpen(false)} href="#future">Future</a>
                  <a onClick={() => setMenuOpen(false)} href="#admin">Admin</a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {showSuccess && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="success-popup">
              <h2>✅ City Optimized</h2>
              <p>AI action plan generated successfully</p>
            </div>
          </div>
        )}

        <section
          id="home"
          className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28"
        >

          <div className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[430px] md:h-[430px] mb-6">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.8} />
              <pointLight position={[5, 5, 5]} intensity={2} />
              <Stars radius={90} depth={45} count={1800} factor={3} />
              <Earth />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2.5} />
            </Canvas>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-5 py-2 rounded-full border border-green-400/40 bg-green-400/10 text-green-300"
          >
            GreenTech Hackathon Project
          </motion.div>



          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold max-w-5xl"
          >
            Smart Green City{" "}
            <span className="text-green-400">Intelligence System</span>
          </motion.h2>

          <p className="mt-6 max-w-2xl text-slate-300 text-lg">
            EcoMind AI monitors pollution, predicts tree health, tracks carbon
            capture and gives AI-powered actions for cleaner cities.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={handlePageTransition}
              className="px-8 py-4 bg-green-500 text-black rounded-full font-bold hover:bg-green-400 transition"
            >
              Launch Dashboard
            </button>
            <button className="px-8 py-4 border border-green-400 rounded-full text-green-300 hover:bg-green-400/10 transition">
              View Solution
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
            <FeatureCard icon={<Leaf />} title="Tree Twin" text="AI tree health monitoring" />
            <FeatureCard icon={<BarChart3 />} title="Live AQI" text="Real-time pollution dashboard" />
            <FeatureCard icon={<Bot />} title="AI Suggestions" text="Smart carbon reduction actions" />
          </div>
        </section>

        <section id="dashboard" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            Live <span className="text-green-400">Eco Dashboard</span>
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={startDemoSimulation}
              className="px-6 py-3 rounded-full bg-red-500 text-white font-bold hover:bg-red-400 transition"
            >
              Start City Emergency Demo
            </button>

            <button
              onClick={resetDemoSimulation}
              className="px-6 py-3 rounded-full border border-green-400 text-green-300 font-bold hover:bg-green-400/10 transition"
            >
              Reset Demo
            </button>
          </div>

          {demoMode && (
            <div className="mt-8 max-w-3xl mx-auto p-5 rounded-2xl bg-red-500/10 border border-red-400/30 text-center">
              <p className="text-red-300 font-bold">
                🚨 {demoAlert}
              </p>
            </div>
          )}

          {demoMode && (
            <div className="mt-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-5 rounded-2xl border ${demoStep >= 1
                  ? "bg-red-500/10 border-red-400/40 text-red-300"
                  : "bg-white/5 border-white/10 text-slate-400"
                  }`}
              >
                <h3 className="font-bold">1. Detect</h3>
                <p className="mt-2 text-sm">High AQI and CO₂ detected.</p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${demoStep >= 2
                  ? "bg-yellow-500/10 border-yellow-400/40 text-yellow-300"
                  : "bg-white/5 border-white/10 text-slate-400"
                  }`}
              >
                <h3 className="font-bold">2. Activate</h3>
                <p className="mt-2 text-sm">Smart poles increase carbon capture.</p>
              </div>

              <div
                className={`p-5 rounded-2xl border ${demoStep >= 3
                  ? "bg-green-500/10 border-green-400/40 text-green-300"
                  : "bg-white/5 border-white/10 text-slate-400"
                  }`}
              >
                <h3 className="font-bold">3. Recommend</h3>
                <p className="mt-2 text-sm">AI suggests plantation action.</p>
              </div>
            </div>
          )}

          {demoMode && (
            <div className="mt-8 max-w-3xl mx-auto p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
              <h3 className="text-xl font-bold text-green-400">
                Eco Impact Score
              </h3>

              <p className="mt-4 text-6xl font-extrabold text-green-400">
                {impactScore}/100
              </p>

              <p className="mt-3 text-slate-400">
                AI-based city sustainability improvement score
              </p>
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={<Wind />}
              title="AQI Level"
              value={demoMode ? sensorData.aqi : realAQI ? realAQI.aqi : sensorData.aqi}
              status={demoMode ? "Critical Demo" : "Live"}
            />

            <StatCard
              icon={<Cloud />}
              title="CO₂ Level"
              value={`${sensorData.co2} ppm`}
              status={demoMode ? "Rising" : "Live"}
            />

            <StatCard
              icon={<Thermometer />}
              title="Temperature"
              value={`${demoMode ? sensorData.temp : realWeather ? realWeather.temp : sensorData.temp}°C`}
              status={demoMode ? "Heat Alert" : "Live"}
            />

            <StatCard
              icon={<Leaf />}
              title="Carbon Captured"
              value={`${sensorData.carbon} kg`}
              status={demoMode ? "Capture Boosted" : "Today"}
            />
          </div>

          <div className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-2xl font-bold mb-6">AQI Trend</h3>

            <div className="h-[300px] min-h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke="#22c55e"
                    strokeWidth={4}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
        <section id="smartpole" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            AI Carbon Capture <span className="text-green-400">Smart Pole</span>
          </h2>

          <p className="mt-4 text-center text-slate-400 max-w-2xl mx-auto">
            Smart poles placed near traffic signals detect pollution, absorb CO₂ through algae chambers,
            and send real-time data to EcoMind AI.
          </p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[520px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center"
            >
              <div className="co2 co2-1">CO₂</div>
              <div className="co2 co2-2">CO₂</div>
              <div className="co2 co2-3">CO₂</div>

              <div className="pole">
                <div className="solar-panel"></div>
                <div className="sensor-head">
                  <Zap size={28} />
                </div>
                <div className="algae-chamber">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="pole-body"></div>
                <div className="pole-base"></div>
              </div>

              <div className="clean-air clean-1">O₂</div>
              <div className="clean-air clean-2">Clean Air</div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard icon={<Wind />} title="Air Intake" value="Active" status="Traffic Zone A" />
              <StatCard icon={<Cloud />} title="CO₂ Absorbed" value="7.8 kg" status="Today" />
              <StatCard icon={<Leaf />} title="Algae Health" value="92%" status="Healthy" />
              <StatCard icon={<Zap />} title="AI Status" value="Online" status="Auto Optimizing" />
            </div>
          </div>
        </section>
        <section id="tree" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            AI Digital <span className="text-green-400">Tree Twin</span>
          </h2>

          <p className="mt-4 text-center text-slate-400 max-w-2xl mx-auto">
            Every tree gets a digital profile with moisture, temperature, growth and health score.
            EcoMind AI predicts which trees need care before they die.
          </p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                icon={<Leaf />}
                title="Tree Health"
                value={`${treeHealth}%`}
                status={treeHealth < 60 ? "Critical" : "Healthy"}
              />
              <StatCard icon={<Thermometer />} title="Soil Temp" value="27°C" status="Normal" />
              <StatCard icon={<Cloud />} title="Moisture" value="64%" status="Good" />
              <StatCard icon={<Bot />} title="AI Prediction" value="Low Risk" status="Next 7 Days" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[520px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center"
            >
              <div className="tree-scanner"></div>

              <div className="tree">
                <div className="tree-leaves leaf-one"></div>
                <div className="tree-leaves leaf-two"></div>
                <div className="tree-leaves leaf-three"></div>
                <div className="tree-trunk"></div>
                <div className="tree-ground"></div>
              </div>

              <div className="health-badge">
                <span>Health Score</span>
                <strong>{treeHealth}%</strong>
                <small>{treeHealth < 60 ? "Critical" : "Healthy"}</small>
              </div>
            </motion.div>
          </div>
        </section>
        <section id="map" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            Pollution <span className="text-green-400">Hotspot Map</span>
          </h2>

          <p className="mt-4 text-center text-slate-400 max-w-2xl mx-auto">
            EcoMind AI detects high pollution zones and suggests where smart poles and trees are needed most.
          </p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <HotspotMapReal />

            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-400/30">
                <h3 className="text-xl font-bold text-red-300">Zone A: Critical</h3>
                <p className="text-slate-300 mt-2">
                  High traffic pollution. Install 4 smart poles and increase carbon capture speed.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-400/30">
                <h3 className="text-xl font-bold text-yellow-300">Zone B: Moderate</h3>
                <p className="text-slate-300 mt-2">
                  Tree moisture is low. Schedule watering and monitor soil health.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-green-500/10 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-300">Zone C: Safe</h3>
                <p className="text-slate-300 mt-2">
                  AQI is stable. Continue normal monitoring.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="ai" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            EcoMind <span className="text-green-400">AI Assistant</span>
          </h2>

          <p className="mt-4 text-center text-slate-400 max-w-2xl mx-auto">
            AI analyzes pollution, tree health and carbon data to suggest smart city actions.
          </p>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <AISuggestions />
            <ChatBot />
          </div>
        </section>


        <section
          id="impact"
          className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-center">
            Environmental <span className="text-green-400">Impact</span>
          </h2>

          <p className="text-center text-slate-400 mt-4">
            Real-time environmental impact generated by EcoMind AI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-14">
            <CounterCard number={15420} title="Trees Monitored" />
            <CounterCard number={2890} title="CO₂ Reduced (kg)" />
            <CounterCard number={92} title="Smart Poles" />
            <CounterCard number={38} title="Pollution Hotspots" />
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <button
              onClick={generateAIReport}
              className="px-8 py-4 rounded-full bg-green-500 text-black font-bold hover:bg-green-400 transition"
            >
              Generate AI Report
            </button>

            <button
              onClick={downloadAIReport}
              className="px-8 py-4 rounded-full border border-green-400 text-green-300 font-bold hover:bg-green-400/10 transition"
            >
              Download AI Report PDF
            </button>
          </div>
          {aiReport && (
            <div className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/10 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-green-400 mb-4">
                AI Generated Report
              </h3>

              <pre className="whitespace-pre-wrap text-slate-300">
                {aiReport}
              </pre>
            </div>
          )}
        </section>

        <section id="future" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            Future <span className="text-green-400">Scope</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-green-400">IoT Integration</h3>
              <p className="mt-3 text-slate-400">
                Real sensors can be connected for live city-level AQI and CO₂ tracking.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-green-400">Govt Dashboard</h3>
              <p className="mt-3 text-slate-400">
                City authorities can monitor pollution hotspots and tree health in real time.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold text-green-400">Mobile App</h3>
              <p className="mt-3 text-slate-400">
                Citizens can report pollution, damaged trees, and receive eco alerts.
              </p>
            </div>
          </div>
        </section>



        <section id="admin" className="reveal relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center">
            Admin <span className="text-green-400">Control Panel</span>
          </h2>

          {!isAdminLoggedIn ? (
            <div className="mt-12 max-w-md mx-auto p-8 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-2xl font-bold text-green-400 text-center">
                Admin Login
              </h3>

              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-6 w-full px-5 py-3 rounded-full bg-slate-900 border border-white/10 outline-none text-white"
              />

              <button
                onClick={handleAdminLogin}
                className="mt-5 w-full py-3 rounded-full bg-green-500 text-black font-bold hover:bg-green-400 transition"
              >
                Login
              </button>

              <p className="mt-4 text-center text-slate-400 text-sm">
                Demo Password: admin123
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleAdminLogout}
                  className="px-6 py-3 rounded-full bg-red-500 text-white font-bold"
                >
                  Logout
                </button>
              </div>

              <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold text-green-400">Live Sensors</h3>
                  <p className="mt-4 text-slate-300">AQI: {realAQI ? realAQI.aqi : sensorData.aqi}</p>
                  <p className="text-slate-300">PM2.5: {realAQI ? realAQI.pm25 : "Loading..."}</p>
                  <p className="text-slate-300">Temp: {realWeather ? realWeather.temp : sensorData.temp}°C</p>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold text-green-400">
                    System Status
                  </h3>

                  <p className="mt-4 text-slate-300">
                    Smart Poles: {smartPolesActive} Active
                  </p>

                  <p className="text-slate-300">
                    Tree Twin AI: Active
                  </p>

                  <p className="text-slate-300">
                    Report Engine: Ready
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold text-green-400">
                    AI Alerts
                  </h3>

                  <p className="mt-4 text-red-300">
                    Alert: {demoAlert}
                  </p>

                  <p className="text-yellow-300">
                    Tree moisture low in Sector B
                  </p>

                  <p className="text-green-300">
                    Zone C stable
                  </p>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/10 overflow-x-auto">
                <h3 className="text-xl font-bold text-green-400 mb-5">
                  Recent Sensor Logs
                </h3>

                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-3">AQI</th>
                      <th>PM2.5</th>
                      <th>PM10</th>
                      <th>Temp</th>
                      <th>Humidity</th>
                      <th>Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sensorLogs.map((log) => (
                      <tr key={log._id} className="border-t border-white/10">
                        <td className="py-3 text-green-300">{log.aqi}</td>
                        <td>{log.pm25}</td>
                        <td>{log.pm10}</td>
                        <td>{log.temperature}°C</td>
                        <td>{log.humidity}%</td>
                        <td className="text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <footer className="relative z-10 px-6 py-12 border-t border-white/10 text-center">
          <h2 className="text-3xl font-bold text-green-400">EcoMind AI</h2>

          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Smart Urban Tree Intelligence & Pollution Analytics Platform
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span>React</span>
            <span>Tailwind</span>
            <span>Framer Motion</span>
            <span>Three.js</span>
            <span>Node.js</span>
            <span>Gemini AI</span>
          </div>

          <p className="mt-8 text-slate-500 text-sm">
            Built for GreenTech Hackathon 2026
          </p>
        </footer>


      </div>
    </>
  );
}

function AnimatedCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <motion.div
        className="cursor-dot"
        animate={{ x: pos.x - 6, y: pos.y - 6 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      />
      <motion.div
        className="cursor-ring"
        animate={{ x: pos.x - 22, y: pos.y - 22 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
      />
    </>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
    >
      <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-400/20 text-green-400">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-slate-400">{text}</p>
    </motion.div>
  );
}

function StatCard({ icon, title, value, status, cardClass = "bg-white/5 border-white/10" }) {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      glareEnable={true}
      glareMaxOpacity={0.15}
      scale={1.03}
      transitionSpeed={2000}
    >
      <motion.div
        whileHover={{ y: -8 }}
        className={`p-6 rounded-3xl border backdrop-blur-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-300 ${cardClass}`}
      >
        <div className="text-green-400 mb-4">
          {icon}
        </div>

        <p className="text-slate-400">
          {title}
        </p>

        <h3 className="text-3xl font-bold mt-2">
          {value}
        </h3>

        <p className="mt-3 text-green-400">
          {status}
        </p>
      </motion.div>
    </Tilt>
  );
}

function CounterCard({ number, title }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const interval = setInterval(() => {
      start += Math.ceil(number / 80);

      if (start >= number) {
        start = number;
        clearInterval(interval);
      }

      setCount(start);
    }, 20);

    return () => clearInterval(interval);
  }, [number]);

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center"
    >
      <h3 className="text-4xl font-bold text-green-400">
        {count.toLocaleString()}
      </h3>

      <p className="mt-3 text-slate-400">
        {title}
      </p>
    </motion.div>
  );
}

function AISuggestions() {
  const suggestions = [
    "Increase smart pole speed near Traffic Zone A.",
    "Water trees in Sector B within 24 hours.",
    "Plant 120 trees near high CO₂ hotspot.",
    "Shift public transport route to reduce emissions.",
  ];

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
      <h3 className="text-2xl font-bold mb-6 text-green-400">
        AI Smart Suggestions
      </h3>

      <div className="space-y-4">
        {suggestions.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="p-4 rounded-2xl bg-slate-900/80 border border-green-400/20"
          >
            <p className="text-slate-200">🤖 {item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am EcoMind AI. Ask me about AQI, CO₂, trees, smart poles or carbon reduction.",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);


  const chatContainerRef = useRef(null);

  useEffect(() => {
    async function loadChatHistory() {
      try {
        const res = await fetch(`${API_BASE_URL}/chat-history`);
        const data = await res.json();

        if (data.length > 0) {
          setMessages(
            data.map((chat) => ({
              sender: chat.sender,
              text: chat.text,
            }))
          );
        }
      } catch (error) {
        console.log("Chat history load error:", error);
      }
    }

    loadChatHistory();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, typing]);


  function speakText(text) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setInput(voiceText);
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userQuestion = input;

    const userMsg = {
      sender: "user",
      text: userQuestion,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userQuestion }),
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.reply || "Sorry, I could not generate a reply.",
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(botMsg.text);
    } catch (error) {
      const errorMsg = {
        sender: "bot",
        text: "Backend not connected. Please start the server.",
      };

      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.text);
    }

    setTyping(false);
  }


  function clearChat() {
    setMessages([
      {
        sender: "bot",
        text: "Chat cleared. Ask me about AQI, CO₂, trees, smart poles or carbon reduction.",
      },
    ]);
  }

  function exportChatPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("EcoMind AI Chat Report", 15, 20);

    let y = 35;

    messages.forEach((msg, index) => {
      const sender = msg.sender === "user" ? "User" : "EcoMind AI";
      const text = `${sender}: ${msg.text}`;

      const lines = doc.splitTextToSize(text, 180);

      doc.setFontSize(11);
      doc.text(lines, 15, y);

      y += lines.length * 7 + 5;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("EcoMind_Chat_Report.pdf");
  }


  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-4 mb-6">
        <div className="ai-avatar">🤖</div>
        <div>
          <h3 className="text-2xl font-bold text-green-400">Ask EcoMind</h3>
          <p className="text-sm text-slate-400">
            Voice-enabled AI green city assistant
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={clearChat}
            className="px-4 py-2 rounded-full bg-red-500/10 text-red-300 border border-red-400/20 text-sm"
          >
            Clear Chat
          </button>

          <button
            onClick={exportChatPDF}
            className="px-4 py-2 rounded-full bg-green-500/10 text-green-300 border border-green-400/20 text-sm"
          >
            Export Chat PDF
          </button>

          <span className="px-4 py-2 rounded-full bg-white/10 text-slate-300 text-sm">
            Messages: {messages.length}
          </span>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="h-[320px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-transparent"
      >
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === "user"
              ? "ml-auto bg-green-500 text-black"
              : "bg-slate-900 text-slate-200 border border-white/10"
              }`}
          >
            {msg.text}
          </motion.div>
        ))}

        {typing && (
          <div className="p-4 rounded-2xl bg-slate-900 text-green-400 border border-white/10 max-w-[50%]">
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}


      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          "AQI status",
          "CO₂ reduction",
          "Tree health",
          "Smart pole",
          "Impact summary",
          "Best green action",
        ].map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            className="px-3 py-2 text-sm rounded-xl bg-green-400/10 text-green-300 border border-green-400/20 hover:bg-green-400/20 transition"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about AQI, CO₂, tree health..."
          className="flex-1 px-4 py-3 rounded-full bg-slate-900 border border-white/10 outline-none text-white"
        />

        <button
          onClick={startVoiceInput}
          className={`px-5 py-3 rounded-full font-bold transition ${listening ? "bg-red-500 text-white" : "bg-white/10 text-green-400"
            }`}
        >
          {listening ? "Listening..." : "🎤"}
        </button>

        <button
          onClick={sendMessage}
          className="px-6 py-3 rounded-full bg-green-500 text-black font-bold hover:bg-green-400 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function Loader() {
  const loadingTexts = [
    "Initializing Smart City...",
    "Loading Sensors...",
    "Connecting AI...",
    "Preparing Dashboard...",
  ];

  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center">
      <div className="loader-orbit">
        <div></div>
      </div>

      <h1 className="mt-8 text-4xl font-extrabold text-green-400">
        EcoMind AI
      </h1>

      <p className="mt-3 text-slate-400 animate-pulse">
        {loadingTexts[textIndex]}
      </p>
    </div>
  );
}

function PageTransition() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="slide-panel left-panel"></div>
      <div className="slide-panel right-panel"></div>
      <h2 className="transition-text">Launching Dashboard</h2>
    </div>
  );
}

function Earth() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.35, 64, 64]} />
        <meshStandardMaterial
          color="#16a34a"
          emissive="#052e16"
          roughness={0.25}
          metalness={0.35}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.42, 64, 64]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.12}
        />
      </mesh>

      <mesh rotation={[1.2, 0.4, 0.2]}>
        <torusGeometry args={[1.7, 0.012, 16, 120]} />
        <meshBasicMaterial color="#86efac" />
      </mesh>

      <mesh rotation={[0.4, 1.1, 0.5]}>
        <torusGeometry args={[1.85, 0.008, 16, 120]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      <CityDot position={[0.4, 1.15, 0.55]} />
      <CityDot position={[-0.8, 0.75, 0.7]} />
      <CityDot position={[0.9, -0.2, 0.85]} />
      <CityDot position={[-0.3, -0.9, 0.95]} />
      <CityDot position={[1.1, 0.45, -0.35]} />
    </group>
  );
}

function CityDot({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshBasicMaterial color="#bbf7d0" />
    </mesh>
  );
}

function HotspotMapReal() {
  const center = [23.2599, 77.4126]; // Bhopal

  return (
    <div className="h-[460px] rounded-3xl overflow-hidden border border-white/10">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CircleMarker center={[23.2599, 77.4126]} radius={30} color="red" fillOpacity={0.35}>
          <Popup>Zone A: High Pollution</Popup>
        </CircleMarker>

        <CircleMarker center={[23.2333, 77.4344]} radius={24} color="orange" fillOpacity={0.35}>
          <Popup>Zone B: Moderate Pollution</Popup>
        </CircleMarker>

        <Marker position={[23.2599, 77.4126]}>
          <Popup>Smart Pole Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;