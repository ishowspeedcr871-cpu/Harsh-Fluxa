"use server";

import { authenticateMasterDeveloper } from "@/services/developer/master-auth";
import { redirect } from "next/navigation";

export async function developerLoginAction(formData: FormData) {
  const masterId = formData.get("masterId") as string;
  const password = formData.get("password") as string;

  if (!masterId || !password) {
    return { error: "Both Master ID and Password are required." };
  }

  const success = await authenticateMasterDeveloper({ masterId, password });

  if (success) {
    redirect("/developer");
  } else {
    return { error: "Invalid Master ID or Password" };
  }
}
