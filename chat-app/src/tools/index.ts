import OpenAI from "openai";

const openAI = new OpenAI();

function getTimeOfDay(): string {
  return new Date().toLocaleTimeString();
}

function getOrderStatus(orderId: string): string {
  console.log(`Getting order status for order ${orderId}`);
  const orderAsNumber = parseInt(orderId);

  if (orderAsNumber % 2 === 0) {
    return "IN_PROGRESS";
  } 
  return "COMPLETED";
}

async function callOpenAIWithTools() {
  const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that gives information about the time of the day and the status of an order.",
    },
    {
      role: "user",
      content: "What is the time of the day? And what is the status of the order 123?",
    },
  ];
  const response = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTimeOfDay",
          description: "Get the current time of the day",
        }
      },
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Get the status of an order",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The ID of the order to get the status of",
              },
            },
            required: ["orderId"],
          }
        }
      },
    ],
    tool_choice: "auto",
  });

  const willInvokeFunction = response.choices[0].finish_reason === "tool_calls";
  const toolCalls = response.choices[0].message.tool_calls ?? [];

  if (willInvokeFunction) {
    context.push(response.choices[0].message);

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") continue;

      const toolName = toolCall.function.name;
      let toolResponse: string;

      if (toolName === "getTimeOfDay") {
        toolResponse = getTimeOfDay();
      } else if (toolName === "getOrderStatus") {
        const parsedArguments = JSON.parse(toolCall.function.arguments);
        toolResponse = getOrderStatus(parsedArguments.orderId);
      } else {
        continue;
      }

      context.push({
        role: "tool",
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
  }

  const secondResponse = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: context,
  });

  console.log(secondResponse.choices[0].message.content);
}

callOpenAIWithTools();
