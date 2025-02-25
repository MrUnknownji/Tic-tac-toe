# Tic Tac Toe Game

A full-stack implementation of the classic Tic Tac Toe game with React frontend and Node.js backend.

## Project Structure

The project is divided into two main parts:

- `client/`: Frontend application built with React + Vite
- `server/`: Backend API built with Node.js, Express, and MongoDB

## Technologies Used

### Frontend
- React 19
- TypeScript
- Vite
- React Router DOM
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Joi for validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (Latest LTS version)
- pnpm (v9.15.4 or later)
- MongoDB

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tic-tac-toe
```

2. Install Frontend Dependencies:
```bash
cd client
pnpm install
```

3. Install Backend Dependencies:
```bash
cd ../server
pnpm install
```

## Environment Setup

1. In the server directory, create a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
```

## Running the Application

### Frontend
```bash
cd client
pnpm dev
```
The frontend will be available at `http://localhost:5173`

### Backend
```bash
cd server
pnpm dev
```
The backend API will be available at `http://localhost:3000`

## Building for Production

### Frontend
```bash
cd client
pnpm build
```

### Backend
```bash
cd server
pnpm build
```

## Features

- Real-time game updates
- User authentication
- Game history tracking
- Responsive design
- TypeScript support for better development experience

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 