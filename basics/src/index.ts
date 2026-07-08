import {OpenAI} from "openai";
import { encoding_for_model } from "tiktoken";

 const openai = new OpenAI();

 async function main() {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{role: "user", content: "How many countries are in the world?"}],
    });

    console.log(response.choices[0].message.content);
    console.log("message", response.choices[0].message);
    console.log("response", response);
 }

 function encodePrompt() {
    const prompt = "How many countries are in the world?";
    const encoder = encoding_for_model("gpt-4o-mini");
    const words = encoder.encode(prompt);
    console.log("words", words);
 }

 encodePrompt();
//  main();
