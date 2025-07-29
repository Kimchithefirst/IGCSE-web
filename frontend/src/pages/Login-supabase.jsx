import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Link,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Alert,
  AlertIcon,
  Divider
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabaseApi } from '../services/supabaseApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useSupabase, setUseSupabase] = useState(true);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { login: supabaseLogin, user, loading } = useSupabaseAuth();
  
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const formBg = useColorModeValue('white', 'gray.800');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Demo credentials
  const demoCredentials = [
    { email: 'student@igcse.com', password: 'password123', role: 'Student' },
    { email: 'teacher@igcse.com', password: 'password123', role: 'Teacher' },
    { email: 'parent@igcse.com', password: 'password123', role: 'Parent' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (useSupabase) {
        // Use Supabase authentication
        await supabaseLogin(email, password);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        navigate('/dashboard');
      } else {
        // Legacy authentication (for demo purposes)
        console.log('Using legacy auth');
        // This would call the old auth system
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (credentials) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  const handleCreateTestAccount = async () => {
    try {
      setIsLoading(true);
      
      // Create a test student account
      const testEmail = `test.student.${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      await supabaseApi.auth.register({
        email: testEmail,
        password: testPassword,
        fullName: 'Test Student',
        role: 'student'
      });

      setEmail(testEmail);
      setPassword(testPassword);
      
      toast({
        title: 'Test account created',
        description: `Email: ${testEmail}`,
        status: 'success',
        duration: 8000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to create test account',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={pageBg}>
        <Text fontSize="lg">Loading...</Text>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={pageBg}>
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <Stack spacing="8">
          <Stack spacing="6">
            <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
              <Heading size={{ base: 'xs', md: 'sm' }}>
                Sign in to your account
              </Heading>
              <Text color="muted">
                Welcome to IGCSE Mock Test Platform
              </Text>
            </Stack>
          </Stack>
          
          <Box
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={formBg}
            boxShadow={{ base: 'none', sm: 'md' }}
            borderRadius={{ base: 'none', sm: 'xl' }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing="6">
                <Stack spacing="5">
                  <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <InputGroup>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </Stack>
                
                <Stack spacing="6">
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    fontSize="md"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign in
                  </Button>
                </Stack>
              </Stack>
            </form>
            
            {/* Demo credentials section */}
            {import.meta.env.DEV && (
              <>
                <Divider my="6" />
                <Stack spacing="4">
                  <Text fontSize="sm" fontWeight="medium" textAlign="center">
                    Demo Credentials (Development)
                  </Text>
                  <Stack spacing="2">
                    {demoCredentials.map((cred, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials(cred)}
                      >
                        {cred.role}: {cred.email}
                      </Button>
                    ))}
                  </Stack>
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="green"
                    onClick={handleCreateTestAccount}
                    isLoading={isLoading}
                  >
                    Create Test Account
                  </Button>
                </Stack>
              </>
            )}
          </Box>
          
          <Stack spacing="6">
            <Text textAlign="center">
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color="blue.500">
                Sign up
              </Link>
            </Text>
            
            {/* Auth system toggle for development */}
            {import.meta.env.DEV && (
              <Alert status="info">
                <AlertIcon />
                <Text fontSize="sm">
                  Using {useSupabase ? 'Supabase' : 'Legacy'} authentication.{' '}
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setUseSupabase(!useSupabase)}
                  >
                    Switch to {useSupabase ? 'Legacy' : 'Supabase'}
                  </Button>
                </Text>
              </Alert>
            )}
          </Stack>
        </Stack>
      </Container>
    </Flex>
  );
};

export default Login;