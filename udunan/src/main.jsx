import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import './index.css';
import App from './App.jsx';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:4000', // Use environment variable or fallback to localhost
  cache: new InMemoryCache(),
 
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provide Apollo Client to the entire app */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
