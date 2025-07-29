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
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
  RadioGroup,
  Radio,
  VisuallyHidden,
  FormHelperText,
  useColorModeValue, // Added this
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { register, login } = useAuth();
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const formBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.700', 'brand.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const linkColor = useColorModeValue('brand.600', 'brand.400');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the user
      const userData = await register({
        email: formData.email,
        fullName: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role
      });
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Automatically log in the user
      const user = await login(formData.email, formData.password);
      
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
        title: 'Registration failed',
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
      bg={pageBg}
      py={{ base: 12, md: 16 }}
      px={{ base: 4, sm: 6, md: 8 }}
    >
      <Container
        maxW="lg"
        bg={formBg}
        boxShadow="xl"
        rounded="xl" // More rounded
        p={{ base: 6, sm: 8, md: 10 }} // Responsive padding
      >
        <Stack spacing={6}> {/* Reduced main stack spacing slightly */}
          <Stack align="center" spacing={3}>
            <Heading as="h1" size="xl" color={headingColor} textAlign="center">
              Create Your IGCSE Prep Account
            </Heading>
            <Text fontSize="md" color={textColor} textAlign="center">
              Start your exam preparation journey today.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={5}> {/* Adjusted form element spacing */}
              <FormControl id="name" isRequired>
                <FormLabel color={textColor}>Name</FormLabel> {/* Themed label */}
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  size="lg" // Larger input
                />
              </FormControl>

              <FormControl id="email" isRequired>
                <FormLabel color={textColor}>Email</FormLabel> {/* Themed label */}
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  size="lg" // Larger input
                />
              </FormControl>

              <FormControl id="username" isRequired>
                <FormLabel color={textColor}>Username</FormLabel> {/* Themed label */}
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  placeholder="Choose a unique username (e.g., student123)"
                  size="lg" // Larger input
                />
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel color={textColor}>Password</FormLabel> {/* Themed label */}
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-describedby="password-requirements"
                    size="lg" // Larger input
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      colorScheme="brand" // Themed icon button
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText color={textColor} mt={1}> {/* Themed helper text */}
                  Password must be at least 8 characters long.
                </FormHelperText>
              </FormControl>

              <FormControl id="confirmPassword" isRequired>
                <FormLabel color={textColor}>Confirm Password</FormLabel> {/* Themed label */}
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-describedby="confirm-password-requirements"
                  size="lg" // Larger input
                />
                <FormHelperText color={textColor} mt={1}> {/* Themed helper text */}
                  Please enter your password again.
                </FormHelperText>
              </FormControl>

              <FormControl id="role" isRequired>
                <FormLabel color={textColor}>I am a</FormLabel> {/* Themed label */}
                <RadioGroup
                  name="role"
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  colorScheme="brand" // Themed radio
                >
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={{ base: 2, sm: 4 }}> {/* Responsive direction and spacing */}
                    <Radio value="student" aria-describedby="student-description">Student</Radio>
                    <Radio value="teacher" aria-describedby="teacher-description">Teacher</Radio>
                    <Radio value="parent" aria-describedby="parent-description">Parent</Radio>
                    {/* VisuallyHidden helps screen readers but content can be simplified for brevity here */}
                    <VisuallyHidden id="student-description">Register as a student</VisuallyHidden>
                    <VisuallyHidden id="teacher-description">Register as a teacher</VisuallyHidden>
                    <VisuallyHidden id="parent-description">Register as a parent</VisuallyHidden>
                  </Stack>
                </RadioGroup>
                <FormHelperText color={textColor}>Select your role to access appropriate features.</FormHelperText> {/* Themed helper text */}
              </FormControl>

              <Stack spacing={6} pt={2}> {/* Adjusted spacing */}
                <Button
                  type="submit"
                  colorScheme="brand" // Use theme color scheme
                  variant="solid"
                  size="lg" // Larger button
                  isLoading={isLoading}
                  w="full" // Full width
                >
                  Create Account
                </Button>
              </Stack>
            </Stack>
          </form>

          <Stack pt={4} spacing={3}> {/* Adjusted spacing */}
            <Text align="center" color={textColor}>
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color={linkColor} fontWeight="medium"> {/* Themed link */}
                Sign In
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Container>
    </Flex> // Changed Box to Flex
  );
};

export default Register;