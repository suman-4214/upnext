"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateCoverLetter(data) {
  // 1. Log incoming data from the form
  console.log("Step 1: Received data from client:", data);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");
  
  // 2. Log the user object fetched from the database
  console.log("Step 2: Fetched user data:", user);

  const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${
    data.companyName
  }.
    
    About the candidate:
    - Industry: ${user.industry || "Not specified"}
    - Years of Experience: ${user.experience ?? "Not specified"}
    - Skills: ${user.skills?.join(", ") || "Not specified"}
    - Professional Background: ${user.bio || "Not specified"}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    // ... (rest of your prompt)
  `;

  // 3. Log the final prompt before sending to the API
  console.log("Step 3: Generated prompt for Gemini:", prompt);

  let content;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    content = response.text().trim();
    
    // 4. Log the content received from the API
    console.log("Step 4: Successfully received content from Gemini API.");
    // console.log("Content:", content); // Uncomment to see the full content
    
  } catch (apiError) {
    console.error("CRITICAL: Error calling Gemini API:", apiError);
    throw new Error("Failed to generate content from AI service.");
  }

  try {
    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    // 5. Log success after writing to the database
    console.log("Step 5: Successfully saved cover letter to database.");
    return coverLetter;
    
  } catch (dbError) {
    console.error("CRITICAL: Error writing to database:", dbError);
    throw new Error("Failed to save cover letter to the database.");
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}