import OpenAI from "openai";

const openai = new OpenAI();

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: "system", content: "You are a helpful assistant." },
];

async function createChatCompletion() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: context,
  });

  const responseMessage = response.choices[0].message;
  context.push(responseMessage);
  console.log(`${responseMessage.role}: ${responseMessage.content}`);
}

process.stdin.addListener("data", async (data) => {
  const userInput = data.toString().trim();
  context.push({ role: "user", content: userInput });
  await createChatCompletion();
});
