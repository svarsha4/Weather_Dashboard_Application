import fs from 'fs';
import path from 'path';

// Locates the JSON file where the user information is stored
const filePath = path.join(process.cwd(), 'src/data/users.json');

export async function POST(request) {
  try {
    // Retrieves the user's information from the JSON file
    const { email, password } = await request.json();
    const data = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(data);

    // A user gets located in the JSON file based on their email (i.e. the primary key)
    const existingUser = users.find(user => user.email === email);

    // If the user enters an invalid email, then prevent the user from logging in
    if (!existingUser) {
      return Response.json(
        { errorType: 'EMAIL_NOT_FOUND' },
        { status: 401 }
      );
    }

    // If the user enters an invalid password, then prevent the user from logging in
    if (existingUser.password !== password) {
      return Response.json(
        { errorType: 'INVALID_PASSWORD' },
        { status: 401 }
      );
    }
    
    // If both the user's email and password are valid, then allow the user to login successfully
    return Response.json({ message: 'Login successful' });
  } catch (error) {
    return Response.json(
      { errorType: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}