import fs from 'fs';
import path from 'path';

// Locates the JSON file where the user information is stored
const filePath = path.join(process.cwd(), 'src/data/users.json');

export async function POST(request) {
  try {
    // Retrieves the user's information from the JSON file
    const { name, email, password } = await request.json();
    const data = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(data);

    // If the user's information already exists in the JSON file,
    // then prevent the user from signing up
    const emailExists = users.some(user => user.email === email);
    
    if (emailExists) {
      return Response.json(
        { errorType: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    // Otherwise, add the new user's information to the JSON file
    const newUser = { name, email, password };
    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return Response.json({ message: 'User created successfully' });

  } catch (error) {
    return Response.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}