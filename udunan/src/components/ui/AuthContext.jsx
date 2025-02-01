import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUser, useSignerStatus, useLogout } from "@account-kit/react";
import { toast } from 'sonner';
import { gql, useMutation } from '@apollo/client';

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $userId: String, $orgId: String, $type: String, $address: String ) {
    register(email: $email, userId: $userId, orgId: $orgId, type: $type, address: $address) {
      token
      user {
        id
        email
        userId
        orgId
        address
        type
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!) {
    login(email: $email) {
      token
      user {
        id
        email
        userId
        orgId
        address
        type
      }
    }
  }
`;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  
  const user = useUser();
  const signerStatus = useSignerStatus();
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const { logout: _logout } = useLogout({
    onSuccess: () => {
      setIsLoggedIn(false);
      navigate('/');
      toast.success('You have been logged out successfully.');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    }
  });

  // Validate Authentication State
  useEffect(() => {
    const storedToken = Cookies.get('authToken');
      try {
       
        if (user?.userId && signerStatus.isConnected && !signerStatus.isInitializing) {
          if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true);
          } else {
            // If no token but user is connected, attempt to login
            login();
          }
        } else {
          setIsLoggedIn(false);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsLoggedIn(false);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }, [user, signerStatus.isConnected, signerStatus.isInitializing]);


    
    const login = async () => {
      try {
        if (!user?.email) {
          throw new Error("User email is required");
        }
    
        const { data } = await loginMutation({
          variables: { email: user.email }
        });
    
        if (data?.login?.token) {
          Cookies.set('authToken', data.login.token);
          setToken(data.login.token);
          setIsLoggedIn(true);
          toast.success('Login successful!');
          return;
        }
      } catch (loginError) {
        console.error('Login failed:', loginError.message);
    
        if (loginError.message.includes('User not found')) {
          // Attempt registration if the user is not found
          const { data: registerData } = await registerMutation({
            variables: { email: user.email, userId : user.userId, address : user.address, type: user.type, orgId: user.orgId}
          });
    
          if (registerData?.register?.token) {
            Cookies.set('authToken', registerData.register.token);
            setToken(registerData.register.token);
            setIsLoggedIn(true);
            toast.success('Registration successful!');
            return;
          } else {
            throw new Error('Registration failed.');
          }
        } else {
          throw loginError;
        }
      }
    };
    
  

  const logout = async () => {
    try {
      setIsLoading(true);
      await _logout();
      Cookies.remove('authToken');
      setToken(null);
      setIsLoggedIn(false);
      toast.success("Logout successful");
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoggedIn,
    isLoading,
    login,
    logout,
    user,
    token,
    signerStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};