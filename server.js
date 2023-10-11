import express from "express";
import dotenv from "dotenv";
import { CodeEngine } from "prompt-engine";
import OpenAI from "openai";

const app = express();
app.use(express.json());
dotenv.config();

const port = process.env.PORT;

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

app.get("/suggest", async (req, res) => {
  const data = req.body;
  const list = [
    {
      id: 1,
      name: "devops",
      description: "cloud",
      keywords: ["AWS", "docker", "linux"],
    },
    {
      id: 2,
      name: "Nodejs",
      description: "Backend developer",
      keywords: ["javascript", "nodejs", "sql"],
    },
    {
      id: 3,
      name: "React ",
      description: "Frontend Developer",
      keywords: ["html", "css", "reactjs"],
    },
    {
      id: 4,
      name: "UI/UX",
      description: "designer",
      keywords: ["figma", "design"],
    },
  ];

  const description =
    "You function as a job recommender, tasked with analyzing a list of keywords provided to you along with the job description in the prompt. Your role is to evaluate these keywords in relation to the user's skills, and then return the suitable job's ids back as an javascript array ";
  const examples = [
    {
      input: `here are the list of job's the list contains id of the job, job description, job role, and keywords [{"id":1,"name":"devops","description":"cloud","keywords":["AWS","docker","linux"]},{"id":2,"name":"Nodejs","description":"Backend developer","keywords":["javascript","nodejs","sql"]},{"id":3,"name":"React ","description":"Frontend Developer","keywords":["html","css","reactjs"]},{"id":4,"name":"UI/UX","description":"designer","keywords":["figma","design"]}] and the users skills are HTML,CSS,javascript return the ids of the job which matches keep in mind the expected output should be in a javascript array format example: [1,2]`,
      response: `[1,4]`,
    },
  ];

  const codeEngine = new CodeEngine(description, examples, "", {
    modelConfig: { maxTokens: 500 },
  });

  const query = `Here are the list of jobs, the list contains id of the job, job description, job role, and keywords ${JSON.stringify(
    list
  )} and the user's skills are ${data.toString()} . Return the ids of the job which matches.  keep in mind the expected output should be in a javascript array format `;
  const prompt = codeEngine.buildPrompt(query);
  const messages = [
    {
      role: "user",
      content: query,
    },
  ];
  console.log(messages);

  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo-0613",
    temperature: 0.1,
  });
  res.send(completion.choices[0].message.content);
});

app.listen(port, () => {
  console.log(`Server running  http://localhost:${port}`);
});
