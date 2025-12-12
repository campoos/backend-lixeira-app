import "dotenv/config";
import fetch from "node-fetch";

class AIService {
  constructor() {
    this.apiKey = process.env.HF_TOKEN;
    this.apiURL = "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224";
  }

  async analyzeImage(imageBuffer) {
    console.log("AIService.analyzeImage: buffer length =", imageBuffer?.length);
    console.log("AIService.analyzeImage: first 32 bytes (hex) =", imageBuffer?.slice(0, 32).toString("hex"));

    const response = await fetch(this.apiURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/octet-stream",
        "x-wait-for-model": "true",
      },
      body: imageBuffer,
    });

    const raw = await response.text();
    console.log("RAW FROM HF:", raw);

    try {
      const json = JSON.parse(raw);
      const best = json[0];
      return {
        label: best.label,
        score: best.score
      };
    } catch (error) {
      throw new Error("Resposta inválida da API do HuggingFace" + error);
    }
  }
}

export default new AIService();
