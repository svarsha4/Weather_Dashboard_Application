export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Locates the JSON file where the user information is stored
const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function POST(req) {
  try {
    // Obtains the city, country, and user's email from the request body
    const { city, country, email } = await req.json();
    const users = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { saved: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.savedLocations) {
      user.savedLocations = [];
    }

    // Checks if the search result is already saved, and either removes it from or adds it to the user's saved search results accordingly
    const existing = user.savedLocations.find(
      (loc) => loc.city === city && loc.country === country
    );

    if (existing) {
      // Remove if already exists
      user.savedLocations = user.savedLocations.filter(
        (loc) => !(loc.city === city && loc.country === country)
      );
    } else {
      // Add search result to "savedLocations"
      user.savedLocations.push({ city, country });
    }

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf8");

    return NextResponse.json({ saved: !existing });
  } catch (error) {
    console.error("Save location error:", error);

    return NextResponse.json(
      { saved: false, error: "Server error" },
      { status: 500 }
    );
  }
}