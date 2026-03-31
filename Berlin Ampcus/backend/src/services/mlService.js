import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const http = axios.create({
  baseURL: env.mlServiceUrl,
  timeout: env.mlRequestTimeoutMs
});

export async function moderateText(text) {
  if (!text?.trim()) {
    return {
      is_flagged: false,
      confidence_score: 0,
      flag_reasons: [],
      score_breakdown: {
        toxicity: 0,
        misinformation: 0
      },
      notes: []
    };
  }

  const response = await http.post("/moderate/text", { text });
  return response.data;
}

export async function moderateImage(imageUrl) {
  if (!imageUrl) {
    return {
      is_flagged: false,
      confidence_score: 0,
      flag_reasons: [],
      score_breakdown: {
        nsfw: 0
      },
      notes: []
    };
  }

  if (imageUrl.startsWith("/")) {
    const filePath = path.resolve(process.cwd(), `.${imageUrl}`);
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    const response = await http.post("/moderate/image", formData, {
      headers: formData.getHeaders()
    });
    return response.data;
  }

  const response = await http.post("/moderate/image-url", { image_url: imageUrl });
  return response.data;
}
