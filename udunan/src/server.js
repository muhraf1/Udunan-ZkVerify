import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
// Prisma Client
import { PrismaClient } from '@prisma/client';

// Environment Variables
import dotenv from 'dotenv';
dotenv.config();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Prisma Initialization
const prisma = new PrismaClient();

// Express App
const app = express();

// Middleware Configurations
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Update CORS Configuration
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS to the entire app
app.use(cors(corsOptions));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------
✅ TOKEN VERIFICATION
--------------------------------------------- */
const verifyToken = (token) => {
  try {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '');
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Token received:', cleanToken);
    }
    return jwt.verify(cleanToken, JWT_SECRET);
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
};

/* ---------------------------------------------
✅ GET USER FUNCTION
--------------------------------------------- */
const getUser = async (token) => {
  try {
    if (!token) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('No token provided');
      }
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded?.userid) return null;

    return await prisma.user.findUnique({
      where: { id: decoded.userid },
      select: {
        id: true,
        email: true,
        orgId: true,
        type: true,
        address: true,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
};

/* ---------------------------------------------
✅ APOLLO SERVER SETUP
--------------------------------------------- */
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true, // Enable introspection for development
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: error.extensions,
    };
  },
});

await server.start();

// GraphQL endpoint middleware
app.use(
  '/graphql',
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const user = await getUser(token);
      
      return {
        prisma,
        user,
        token: token.replace('Bearer ', ''),
      };
    },
  })
);

/* ---------------------------------------------
✅ START SERVER
--------------------------------------------- */
httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running!
🔉 Listening on port ${PORT}
📭 Query at http://localhost:${PORT}/graphql
`);
});

/* ---------------------------------------------
✅ GRACEFUL SHUTDOWN
--------------------------------------------- */
const shutdown = async (signal) => {
  console.log(`\n🛑 ${signal} signal received. Initiating shutdown...`);
  try {
    await server.stop();
    console.log('🛑 Apollo Server stopped');

    await new Promise((resolve) => httpServer.close(resolve));
    console.log('🛑 HTTP server closed');

    await prisma.$disconnect();
    console.log('🛑 Database disconnected');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
