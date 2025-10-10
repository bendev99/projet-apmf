import mongoose from "mongoose";

const donnerCapteurSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("DonnerCapteur", donnerCapteurSchema);
