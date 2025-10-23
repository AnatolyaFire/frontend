import axios from "axios";
import Message from "./GptMessageInterface";

interface GptResponseData {
  content: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

const GptResponse = async (
  messages: Array<Message>,
  robot: string = "0000.01.AnalyticsReports", 
  model: string = "gpt-4o-mini", 
  schema: object = {}, 
  temperature: number = 0 
): Promise<GptResponseData> => {
  try {
    const token = "0f3442c6-ed1e-4e4f-9865-78de0f5ee5c2"; 
    const response = await axios.post(
      "https://robot.borishof.ru/gpt_api/text",
      {
        messages,
        robot,   
        model,    
        schema,   
        temperature, 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          accept: "application/json", 
          "Content-Type": "application/json", 
        },
      }
    );
    return response.data; 
  } catch (error) {
    console.error("Error in GPT Request:", error);
    throw error;
  }
};

export default GptResponse;