import OpenAI from "openai";
import * as readline from "readline/promises";

const openai = new OpenAI();

interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  available: boolean;
}

const flights: Flight[] = [
  {
    flightNumber: "AA101",
    origin: "JFK",
    destination: "LAX",
    departure: "08:00",
    arrival: "11:30",
    available: true,
  },
  {
    flightNumber: "UA205",
    origin: "JFK",
    destination: "LAX",
    departure: "14:00",
    arrival: "17:30",
    available: true,
  },
  {
    flightNumber: "DL310",
    origin: "JFK",
    destination: "SFO",
    departure: "09:30",
    arrival: "12:45",
    available: true,
  },
  {
    flightNumber: "SW420",
    origin: "ORD",
    destination: "MIA",
    departure: "10:00",
    arrival: "14:00",
    available: false,
  },
];

function findFlights(origin: string, destination: string): string {
  const matches = flights.filter(
    (flight) =>
      flight.origin.toUpperCase() === origin.toUpperCase() &&
      flight.destination.toUpperCase() === destination.toUpperCase() &&
      flight.available,
  );

  if (matches.length === 0) {
    return JSON.stringify({
      flights: [],
      message: "No available flights found between the specified airports.",
    });
  }

  return JSON.stringify({ flights: matches });
}

function reserveFlight(flightNumber: string): string {
  const flight = flights.find(
    (item) => item.flightNumber.toUpperCase() === flightNumber.toUpperCase(),
  );

  if (!flight) {
    return JSON.stringify({
      success: false,
      message: "Flight not found. Cannot make a reservation.",
    });
  }

  if (!flight.available) {
    return JSON.stringify({
      success: false,
      message: "This flight is no longer available for reservation.",
    });
  }

  const reservationNumber = `RES-${Date.now().toString(36).toUpperCase()}`;
  flight.available = false;

  return JSON.stringify({
    success: true,
    reservationNumber,
    flightNumber: flight.flightNumber,
    origin: flight.origin,
    destination: flight.destination,
  });
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "findFlights",
      description: "Find available flights between two airports",
      parameters: {
        type: "object",
        properties: {
          origin: {
            type: "string",
            description: "The origin airport code (3 or 4 letters)",
          },
          destination: {
            type: "string",
            description: "The destination airport code (3 or 4 letters)",
          },
        },
        required: ["origin", "destination"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reserveFlight",
      description: "Reserve a flight and return a reservation number",
      parameters: {
        type: "object",
        properties: {
          flightNumber: {
            type: "string",
            description: "The flight number to reserve",
          },
        },
        required: ["flightNumber"],
      },
    },
  },
];

const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful flight assistant. You help users find flights between airports and make reservations. Airport codes are 3 or 4 letters. When listing flights, include the flight number, departure and arrival times. When a reservation succeeds, clearly share the reservation number.",
  },
];

function handleToolCall(
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
): string | null {
  if (toolCall.type !== "function") return null;

  const toolName = toolCall.function.name;

  if (toolName === "findFlights") {
    const { origin, destination } = JSON.parse(toolCall.function.arguments);
    return findFlights(origin, destination);
  }

  if (toolName === "reserveFlight") {
    const { flightNumber } = JSON.parse(toolCall.function.arguments);
    return reserveFlight(flightNumber);
  }

  return null;
}

async function createChatCompletion() {
  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: context,
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    const willInvokeFunction =
      response.choices[0].finish_reason === "tool_calls";

    if (willInvokeFunction && message.tool_calls) {
      context.push(message);

      for (const toolCall of message.tool_calls) {
        const toolResponse = handleToolCall(toolCall);

        if (toolResponse === null) continue;

        context.push({
          role: "tool",
          content: toolResponse,
          tool_call_id: toolCall.id,
        });
      }

      continue;
    }

    context.push(message);
    console.log(`assistant: ${message.content}`);
    break;
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Flight assistant ready. Type your message (Ctrl+C to exit).");
  console.log("Example: Find flights from JFK to LAX");

  while (true) {
    let userInput: string;

    try {
      userInput = (await rl.question("user: ")).trim();
    } catch {
      break;
    }

    if (!userInput) continue;

    context.push({
      role: "user",
      content: userInput,
    });

    await createChatCompletion();
  }

  rl.close();
}

main();
