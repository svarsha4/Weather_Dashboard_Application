import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Locates the JSON file where the user information is stored
const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function GET(req) {
  try {
    // Obtains the user's email from the query parameters of the request URL
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const users = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json([]);
    }

    // Returns the user's saved search results as a JSON response
    return NextResponse.json(user.savedLocations || []);
  } catch (error) {
    console.error("Get saved locations error:", error);
    return NextResponse.json([]);
  }
}