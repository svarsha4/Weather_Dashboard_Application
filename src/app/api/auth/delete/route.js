import fs from 'fs';
import path from 'path';

// Locates the JSON file where the user information is stored
const filePath = path.join(process.cwd(), 'src/data/users.json');

export async function DELETE(request) {
  try {
    const { email, password } = await request.json();
    const data = fs.readFileSync(filePath, 'utf-8');
    let users = JSON.parse(data);

    // Ensure that a new user with the same email as an existing user should NOT be
    // able to sign up
    const userIndex = users.findIndex(
      user => user.email === email && user.password === password
    );

    if (userIndex === -1) {
      return Response.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    users.splice(userIndex, 1);
    
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return Response.json({ message: 'User deleted' });

  } catch (error) {
    return Response.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}