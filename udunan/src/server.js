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

// CORS Configuration
const corsOptions = {
  origin: [FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Apollo-Require-Preflight',
    'x-apollo-operation-name',
    'apollo-require-preflight',
  ],
  maxAge: 86400,
};
app.use(cors(corsOptions));

/* ---------------------------------------------
✅ TOKEN VERIFICATION
--------------------------------------------- */
const verifyToken = (token) => {
  try {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '');
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
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageLocalDefault({ embed: false })
      : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
  formatError: (error) => {
    const formattedError = {
      message: error.message,
      locations: error.locations,
      path: error.path,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };

    if (process.env.NODE_ENV !== 'production') {
      console.error('🛑 GraphQL Error:', {
        ...formattedError,
        stack: error.extensions?.exception?.stacktrace,
      });
    }

    return formattedError;
  },
});

// Start Apollo Server
await server.start();

// Middleware with Authentication Context
app.use(
  '/graphql',
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      try {
        const token = req.headers.authorization || req.cookies?.authToken || '';
        const user = await getUser(token);

        return {
          prisma,
          user,
          token: token.replace('Bearer ', ''),
        };
      } catch (error) {
        console.error('❌ Context creation error:', error.message);
        return {
          prisma,
          user: null,
          token: null,
        };
      }
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
