import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gql } from '@apollo/client';
import { toast } from "sonner";
import { useAuth } from './AuthContext'; // Import the hook
import { useAuthenticate } from '@account-kit/react';


// Validation Utility Functions
const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  const passwordRules = [
    { test: (pw) => pw.length >= 8, message: 'Password must be at least 8 characters long' },
    { test: (pw) => /[A-Z]/.test(pw), message: 'Password must contain at least one uppercase letter' },
    { test: (pw) => /[a-z]/.test(pw), message: 'Password must contain at least one lowercase letter' },
    { test: (pw) => /[0-9]/.test(pw), message: 'Password must contain at least one number' },
    { test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw), message: 'Password must contain at least one special character' }
  ];
  for (const rule of passwordRules) {
    if (!rule.test(password)) return rule.message;
  }
  return null;
};

// GraphQL Mutations
const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name :String!) {
    register(email: $email, name:$name, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;


const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

const AuthDialog = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const { login } = useAuth(); // Use the login function
  const { authenticate, isPending } = useAuthenticate();
  const [email, setEmail] = React.useState('');

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [forgotPasswordMutation, { loading: forgotPasswordLoading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(loginEmail);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    const passwordError = validatePassword(loginPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    try {
      const { data } = await loginMutation({
        variables: { email: loginEmail, password: loginPassword }
      });
      localStorage.setItem('token', data.login.token);
      toast.success('Logged in successfully');
      login(data.login.token); // Update auth state via context
    } catch (error) {
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                           (error.networkError ? 'Network error. Please check your connection.' : 'An unexpected error occurred');
      toast.error(errorMessage);
      console.error('Login error', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(registerEmail);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    const passwordError = validatePassword(registerPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (registerPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { data } = await registerMutation({
        variables: { email: registerEmail, name:registerName, password: registerPassword }
      });
      localStorage.setItem('token', data.register.token);
      toast.success('Registered successfully');
    } catch (error) {
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                           (error.networkError ? 'Network error. Please check your connection.' : 'An unexpected error occurred');
      toast.error(errorMessage);
      console.error('Registration error', error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(forgotPasswordEmail);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    try {
      const { data } = await forgotPasswordMutation({ variables: { email: forgotPasswordEmail } });
      if (data.forgotPassword.success) {
        toast.success('Password reset email sent');
      } else {
        toast.error(data.forgotPassword.message);
      }
    } catch (error) {
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                           (error.networkError ? 'Network error. Please check your connection.' : 'An unexpected error occurred');
      toast.error(errorMessage);
      console.error('Forgot password error', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button  variant="outline">Sign In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email"
                  type="email" 
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loginLoading}
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password"
                  type="password" 
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loginLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="register-email">Email</Label>
                <Input 
                  id="register-email"
                  type="email" 
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  disabled={registerLoading}  
                />
              </div>
              <div>
                <Label htmlFor="register-name">Name</Label>
                <Input 
                  id="register-name"
                  type="name" 
                  placeholder="Enter your name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  disabled={registerLoading}
                />
              </div>
              <div>
                <Label htmlFor="register-password">Password</Label>
                <Input 
                  id="register-password"
                  type="password" 
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  disabled={registerLoading}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password"
                  type="password" 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={registerLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerLoading}
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="forgot">
            <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="forgot-password-email">Email</Label>
                <Input 
                  id="forgot-password-email"
                  type="email" 
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={forgotPasswordLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
