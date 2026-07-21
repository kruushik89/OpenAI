import OpenAI from "openai";
import { writeFileSync, createReadStream } from "fs"; 

const openai = new OpenAI()

async function createTranscription() {
    const response = await openai.audio.transcriptions.create({
        file: createReadStream("audio.mp3"),
        model: "whisper-1",
    });
    console.log(response.text);
}
 
async function textToSpeech() {

    const text = "Привіт! Це тест синтезу мовлення українською мовою. Якщо ви чуєте цей текст чітко та природно, значить система працює правильно. Сьогодні 21 липня 2026 року. Поточний час — 11 година 30 хвилин. Температура повітря становить плюс 24 градуси Цельсія. Вартість замовлення складає 1 249 гривень 99 копійок. Будь ласка, перевірте вимову чисел, дат, розділових знаків і спеціальних символів. Також зверніть увагу на інтонацію в питальних реченнях. Чи звучить голос природно? Чи правильно розставлені паузи? Наприкінці перевірте швидкість мовлення та чіткість вимови. Дякуємо за тестування системи синтезу мовлення. Бажаємо гарного дня!";

    const response = await openai.audio.speech.create({
        model: "tts-1",
        input: text,
        voice: "alloy",
        response_format: "mp3",
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync("speech.mp3", buffer);
}

textToSpeech();