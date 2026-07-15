const express = require('express');
const app = express();
const PORT = 3000;

// JSON request body parse karne ke liye middleware (The Neurotransmitter)
app.use(express.json());

// Root route (/) par HTML page dikhane ke liye
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// In-memory array jo temporary database ke taur par kaam karega (Data Persistence Layer)
let users = [
  { id: 1, name: "Ali Khan", email: "ali@gmail.com", role: "member" },
  { id: 2, name: "Sana Ahmed", email: "sana@gmail.com", role: "admin" }
];

// ==========================================
// 1. GET /users - Saare users retrieve karne ke liye (Safe, Idempotent)[cite: 1]
// ==========================================
app.get('/users', (req, res) => {
  // Success Response with 200 OK Status Code[cite: 1]
  res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    data: users
  });
});

// ==========================================
// 2. POST /users - Naya user create karne ke liye (Unsafe, Creation)[cite: 1]
// ==========================================
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;

  // --- LAYER 1: Syntactic Validation (Format & Fields Check)[cite: 1] ---
  if (!name || !email || !role) {
    return res.status(400).json({ // 400 Bad Request[cite: 1]
      status: "fail",
      error: "Bad Request",
      message: "Required fields missing! Please provide 'name', 'email', and 'role'."
    });
  }

  // Email format check karne ke liye Regex (Syntactic Validation)[cite: 1]
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ // 400 Bad Request[cite: 1]
      status: "fail",
      error: "Bad Request",
      message: "Invalid email format."
    });
  }

  // --- LAYER 2: Semantic Validation (Business Logic Check)[cite: 1] ---
  // Check karein ke email pehle se register to nahi (Duplicate Email Check)
  const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).json({ // 400 Bad Request / Conflict[cite: 1]
      status: "fail",
      error: "Bad Request",
      message: "Email is already registered."
    });
  }

  // Sahi Role Check (Sirf 'admin' ya 'member' allowed hai)
  const validRoles = ['admin', 'member'];
  if (!validRoles.includes(role.toLowerCase())) {
    return res.status(400).json({ // 400 Bad Request[cite: 1]
      status: "fail",
      error: "Bad Request",
      message: "Invalid role! Allowed roles are: 'admin' or 'member'."
    });
  }

  // --- SUCCESS PATH: Naya User create aur insert karein ---
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role: role.toLowerCase()
  };

  users.push(newUser);

  // Return 201 Created Status Code[cite: 1]
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: newUser
  });
});

// ==========================================
// 3. 404 Fallback - Har ghalt/invalid endpoint ke liye[cite: 1]
// ==========================================
app.use((req, res) => {
  res.status(404).json({ // 404 Not Found[cite: 1]
    status: "fail",
    error: "Not Found",
    message: "Requested API endpoint does not exist."
  });
});

// Server Listen
app.listen(PORT, () => {
  console.log(`🚀 System Engine is live at http://localhost:${PORT}`);
});