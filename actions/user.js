"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { DemandLevel, salaryRanges, industry, recommendedSkills, keyTrends,topSkills, MarketOutlook } from "@prisma/client";
import { err } from "inngest/types";
import { success } from "zod";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const {userId} = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }

    try{
        const result  = await db.$transaction(
            async(tx) =>{
                //Find if the industry already exists
                let industryInsight = await tx.industryInsight.findUnique({
                    where: {
                        industry: data.industry,
                    },
                })
                // If industry does not exist, create it with default values, will update later with ai
                if (!industryInsight) {
                   const insights = await generateAIInsights(data.industry);
                               
                                industryInsight = await db.industryInsight.create({
                                   data : {
                                       industry : data.industry,
                                       ...insights,
                                       nextUpdateDue: new Date(Date.now() + 7*24*60*60*1000)
                                   },
                                   
                               });
                }


                //Update user
                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        industry: data.industry,
                        bio: data.bio,
                        experience: data.experience,
                        skills: data.skills,
                    }
                })
                return { updatedUser, industryInsight};
            },
            {
                timeout:20000, // 20 seconds
            }
        );
        return {success: true,...result};
    }catch(error) {
        console.error("Error in updating user and industry",error.message);
        throw new Error("Failed to update profile."+ error.message);
    }
}

export async function getUserOnboardingStatus() {
    const {userId} = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }

    try{
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            },
        });

        return{
            isOnboarded: !!user?.industry,
        };
    }
    catch(error){
        console.error("Error in checking user onboarding status", error.message);
        throw new Error("Failed to get onboarding status."+ error.message);
    }
}
