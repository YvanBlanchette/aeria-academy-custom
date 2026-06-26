"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slugify";

async function requireAdmin() {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Non autorisé");
	}
	return session;
}
