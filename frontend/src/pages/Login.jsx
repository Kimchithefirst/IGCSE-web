import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex, // Added this
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
  useColorModeValue, // Added this
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const Login = () => {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const formBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated to defaultCardBg
  // const headingColor = useColorModeValue('brand.700', 'brand.300');
  // const textColor = useColorModeValue('gray.600', 'gray.400');
  // const linkColor = useColorModeValue('brand.600', 'brand.400');
  // These color variables are correctly defined using useColorModeValue below, no change needed to their definition lines.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(username, password);
      
      // Navigate based on user role
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent-dashboard');
      } else {
        // Default to student dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex // Changed Box to Flex for centering content vertically
      minH="100vh"
      align="center" // Center vertically
      justify="center" // Center horizontally
      bg={pageBg} // Use variable
      py={{ base: 12, md: 16 }}
      px={{ base: 4, sm: 6, md: 8 }}
    >
      <Container
        maxW="lg"
        bg={formBg} // Use variable
        boxShadow="xl"
        rounded="xl" // More rounded
        p={{ base: 6, sm: 8, md: 10 }} // Responsive padding
      >
        <Stack spacing={6}> {/* Reduced main stack spacing slightly */}
          <Stack align="center" spacing={3}>
            <Heading as="h1" size="xl" color={useColorModeValue('brand.700', 'brand.300')} textAlign="center"> {/* Direct use */}
              Welcome Back to IGCSE Prep
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center"> {/* Direct use */}
              Sign in to continue your exam preparation.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={5}> {/* Adjusted form element spacing */}
              <FormControl id="username" isRequired>
                <FormLabel color={useColorModeValue('gray.600', 'gray.400')}>Username</FormLabel> {/* Direct use */}
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Enter username (e.g., student)"
                  size="lg" // Larger input fields
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel color={useColorModeValue('gray.600', 'gray.400')}>Password</FormLabel> {/* Direct use */}
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    size="lg" // Larger input fields
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      colorScheme="brand" // Themed icon button
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Stack spacing={10}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align="start"
                  justify="space-between"
                >
                  <Link as={RouterLink} to="#" color={useColorModeValue('brand.600', 'brand.400')} fontWeight="medium"> {/* Direct use */}
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  colorScheme="brand" // Use theme color scheme
                  variant="solid"
                  size="lg" // Larger button
                  isLoading={isLoading}
                  w="full" // Full width
                >
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </form>

          <Stack pt={4} spacing={3}> {/* Adjusted spacing */}
            <Text align="center" color={useColorModeValue('gray.600', 'gray.400')}> {/* Direct use */}
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color={useColorModeValue('brand.600', 'brand.400')} fontWeight="medium"> {/* Direct use */}
                Create one
              </Link>
            </Text>
            
            {process.env.NODE_ENV === 'development' && (
              <Box mt={4} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" boxShadow="sm">
                <Text fontSize="sm" fontWeight="bold" mb={2} color={useColorModeValue('gray.700', 'gray.200')}>Production Testing Guide:</Text>
                <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}> {/* Direct use */}
                  • For student dashboard: Use username "student" with password "password123"
                </Text>
                <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}> {/* Direct use */}
                  • Default credentials are pre-filled for convenience
                </Text>
                <Text fontSize="xs" mt={1} fontStyle="italic" color={useColorModeValue('gray.600', 'gray.400')}> {/* Direct use */}
                  Note: Production mode uses real authentication
                </Text>
              </Box>
            )}
          </Stack>
        </Stack>
      </Container>
    </Flex> // Changed Box to Flex
  );
};

export default Login;