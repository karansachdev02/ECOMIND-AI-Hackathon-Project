import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log("Gemini key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
console.log("Mongo URI:", process.env.MONGO_URI ? "Loaded" : "Missing");

let isMongoConnected = false;

async function connectMongoDB() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("MongoDB skipped: MONGO_URI missing");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    isMongoConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    isMongoConnected = false;
    console.log("MongoDB error:", error.message);
  }
}

connectMongoDB();

const chatSchema = new mongoose.Schema({
  sender: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const sensorSchema = new mongoose.Schema({
  aqi: Number,
  pm25: Number,
  pm10: Number,
  temperature: Number,
  humidity: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);
const SensorLog = mongoose.model("SensorLog", sensorSchema);

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

function getDemoReply(message = "") {
  const q = message.toLowerCase().trim();

  if (["hi", "hii", "hello", "hey"].includes(q) || q.includes("namaste")) {
    return "Hello! 👋 Main EcoMind AI hoon. Aap AQI, pollution, tree health, smart poles ya carbon reduction ke baare me pooch sakte ho.";
  }

  if (q.includes("kaise ho") || q.includes("how are you")) {
    return "Main ready hoon! 🌱 Aaj city environment ko smarter aur greener banane me help karne ke liye active hoon.";
  }

  if (q.includes("name") || q.includes("naam")) {
    return "Mera naam EcoMind AI hai. Main smart green city aur pollution analytics assistant hoon.";
  }

  if (q.includes("aqi") || q.includes("pollution")) {
    return "AQI air quality ko measure karta hai. Agar AQI high ho, to EcoMind smart poles activate karta hai aur pollution hotspots identify karta hai.";
  }

  if (q.includes("co2") || q.includes("carbon")) {
    return "EcoMind CO₂ levels track karta hai aur high-emission zones me carbon capture improve karne ke suggestions deta hai.";
  }

  if (q.includes("tree") || q.includes("plant")) {
    return "Digital Tree Twin har tree ki health monitor karta hai, jaise moisture, temperature aur risk level.";
  }

  if (q.includes("smart pole") || q.includes("pole")) {
    return "Smart Pole AQI, CO₂ aur temperature data collect karta hai. Future me ye carbon capture system ke saath integrate ho sakta hai.";
  }

  if (q.includes("report") || q.includes("pdf")) {
    return "EcoMind environmental data ke basis par report generate karta hai, jise PDF me download kiya ja sakta hai.";
  }

  return "EcoMind AI pollution monitoring, tree health, smart poles aur green city recommendations ke liye bana hai. Aap mujhse AQI, CO₂, tree health ya smart city solutions ke baare me pooch sakte ho.";
}

async function safeCreate(model, data) {
  try {
    if (!isMongoConnected) return null;
    return await model.create(data);
  } catch (error) {
    console.log("Mongo save skipped:", error.message);
    return null;
  }
}

async function safeFind(model, query = {}, sort = {}, limit = 50) {
  try {
    if (!isMongoConnected) return [];
    return await model.find(query).sort(sort).limit(limit);
  } catch (error) {
    console.log("Mongo find skipped:", error.message);
    return [];
  }
}

app.get("/", (req, res) => {
  res.send("EcoMind backend running");
});

app.get("/health", (req, res) => {
  res.json({
    backend: "running",
    mongo: isMongoConnected ? "connected" : "not connected",
    gemini: process.env.GEMINI_API_KEY ? "loaded" : "missing",
  });
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.json({
      reply: "Please type a message.",
    });
  }

  let reply = getDemoReply(message);

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are EcoMind AI, a smart green city assistant.
Reply in simple Hinglish.
You can answer normal greetings too.
Keep answers short and useful.
Focus on pollution, AQI, CO2, trees, smart poles, carbon reduction, and green city solutions.

User: ${message}
        `,
      });

      if (response.text) {
        reply = response.text;
      }
    } catch (error) {
      console.log("Gemini Error:", error.message);
    }
  }

  await safeCreate(Chat, {
    sender: "user",
    text: message,
  });

  await safeCreate(Chat, {
    sender: "bot",
    text: reply,
  });

  res.json({ reply });
});

app.get("/chat-history", async (req, res) => {
  const chats = await safeFind(Chat, {}, { createdAt: 1 }, 50);
  res.json(chats);
});

app.get("/weather", async (req, res) => {
  try {
    const lat = req.query.lat || "23.2599";
    const lon = req.query.lon || "77.4126";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.current) {
      return res.json({
        temp: 27,
        humidity: 65,
        wind: 8,
        time: new Date().toISOString(),
        demo: true,
      });
    }

    res.json({
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      wind: data.current.wind_speed_10m,
      time: data.current.time,
    });
  } catch (error) {
    console.log("Weather error:", error.message);

    res.json({
      temp: 27,
      humidity: 65,
      wind: 8,
      time: new Date().toISOString(),
      demo: true,
    });
  }
});

app.get("/aqi", async (req, res) => {
  try {
    const lat = req.query.lat || "23.2599";
    const lon = req.query.lon || "77.4126";

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.current) {
      return res.json({
        aqi: 75,
        pm25: 19.8,
        pm10: 26,
        co: 210,
        no2: 12,
        time: new Date().toISOString(),
        demo: true,
      });
    }

    res.json({
      aqi: data.current.us_aqi,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
      co: data.current.carbon_monoxide,
      no2: data.current.nitrogen_dioxide,
      time: data.current.time,
    });
  } catch (error) {
    console.log("AQI error:", error.message);

    res.json({
      aqi: 75,
      pm25: 19.8,
      pm10: 26,
      co: 210,
      no2: 12,
      time: new Date().toISOString(),
      demo: true,
    });
  }
});

app.post("/sensor-log", async (req, res) => {
  const log = await safeCreate(SensorLog, req.body);

  if (!log) {
    return res.json({
      message: "MongoDB not connected, sensor log skipped",
    });
  }

  res.json(log);
});

app.get("/sensor-logs", async (req, res) => {
  const logs = await safeFind(SensorLog, {}, { createdAt: -1 }, 20);
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`EcoMind backend running on port ${PORT}`);
});