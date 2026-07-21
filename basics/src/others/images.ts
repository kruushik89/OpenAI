import { writeFileSync } from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function generateFreeImage() {
  const response = await openai.images.generate({
    prompt: "A beautiful city at night",
    model: "gpt-image-1",
    n: 1,
    size: "1024x1024",
  });

  const rawImage = response.data?.[0]?.b64_json;

  if (rawImage) {
    const filename = "city.png";
    writeFileSync(filename, Buffer.from(rawImage, "base64"));
    console.log(`Image saved to ${filename}`);
  }
}

generateFreeImage();