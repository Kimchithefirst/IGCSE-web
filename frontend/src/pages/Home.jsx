import React from 'react';
import { Box, Button, Container, Flex, Grid, GridItem, Heading, Icon, Link, Stack, Text, VStack, useColorModeValue } from '@chakra-ui/react'; // Removed Image
import { Link as RouterLink } from 'react-router-dom';
import { FaBook, FaChartLine, FaClock, FaGraduationCap, FaUserFriends } from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';
import BackendTest from '../components/BackendTest';
import CourseCard from '../components/CourseCard'; // Import shared CourseCard

const Feature = ({ icon, title, text }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl" // Match CourseCard
      boxShadow="lg" // Match CourseCard
      transition="all 0.3s ease-in-out" // Smoother transition
      _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl' }} // Match CourseCard
      minH="100%"
    >
      <Icon as={icon} boxSize={10} color="brand.500" mb={4} /> {/* Slightly lighter brand color for icon */}
      <Heading size="md" fontWeight="semibold" mb={3}>{title}</Heading> {/* Slightly bolder title, more margin */}
      <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text> {/* Ensure md font size */}
    </VStack>
  );
};

// Local CourseCard definition is removed

const Home = () => {
  const { user } = useAuth();
  const [showBackendTest, setShowBackendTest] = React.useState(false);

  // Hidden keyboard shortcut to show backend test (Ctrl+Shift+D for Debug)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setShowBackendTest(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box>
      {/* Backend Connection Test - Hidden by default, toggle with Ctrl+Shift+D */}
      {showBackendTest && (
        <Container maxW="container.xl" pt={20}>
          <Box position="relative">
            <BackendTest />
            <Button
              position="absolute"
              top={2}
              right={2}
              size="sm"
              onClick={() => setShowBackendTest(false)}
              colorScheme="red"
              variant="ghost"
            >
              ✕ Hide
            </Button>
          </Box>
        </Container>
      )}

      {/* Hero Section */}
      <Box
        bgGradient={useColorModeValue(
          "linear(to-r, blue.600, purple.500)",
          "linear(to-r, blue.800, purple.700)"
        )}
        py={{ base: 24, md: 32 }} // Increased padding
        px={{ base: 4, md: 8 }} // Added horizontal padding for full-width feel
      >
        <Container maxW="container.lg"> {/* Slightly reduced maxW for better text centering */}
          <Grid templateColumns={{ base: '1fr', md: '1.2fr 0.8fr' }} gap={12} alignItems="center"> {/* Adjusted column ratio and gap */}
            <GridItem>
              <VStack align={{base: "center", md: "start"}} spacing={8} textAlign={{base: "center", md: "left"}}> {/* Centered on mobile */}
                <Heading
                  as="h1"
                  fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} // Responsive font size
                  fontWeight="extrabold" // Bolder
                  color="white" // White text for better contrast on gradient
                  lineHeight="1.1" // Adjusted line height
                >
                  {user ? `Welcome back, ${user.name}!` : 'Master Your IGCSE Exams with Personalised Prep'}
                </Heading>
                <Text
                  fontSize={{ base: "lg", md: "xl" }} // Responsive font size
                  color={useColorModeValue('gray.100', 'gray.300')} // Lighter text for contrast
                  maxW={{ base: "md", md: "xl" }} // Max width for readability
                >
                  Achieve top grades with AI-powered learning, realistic exam simulations, and detailed progress tracking. Your success story starts here.
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={6} w={{ base: '100%', sm: 'auto' }} justify={{base: "center", md: "start"}}>
                  <Button
                    as={RouterLink}
                    to={user ? "/exam-simulation" : "/register"} // Dynamic primary CTA
                    size="lg"
                    colorScheme={user ? "green" : "yellow"} // Different color for logged in user
                    fontWeight="bold"
                    px={10} // Increased padding
                    py={7} // Increased padding
                    leftIcon={user ? <Icon as={FaClock} /> : undefined}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    {user ? "Start Exam Simulation" : "Get Started Free"}
                  </Button>
                  <Button
                    as={RouterLink}
                    to={user ? "/dashboard" : "/login"} // Secondary CTA
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.700"
                    fontWeight="medium"
                    px={10} // Increased padding
                    py={7} // Increased padding
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    {user ? "My Dashboard" : "Sign In"}
                  </Button>
                </Stack>
              </VStack>
            </GridItem>
            <GridItem display={{ base: 'none', md: 'flex' }} alignItems="center" justifyContent="center"> {/* Ensure flex properties */}
              <Flex justify="center" align="center" w="full" h="full"> {/* Added align and h="full" */}
                <Box
                  w={{ base: "80%", lg: "full"}} // Responsive width
                  h={{ base: "300px", lg: "400px" }} // Responsive height
                  bg="whiteAlpha.200" // Semi-transparent background for the image placeholder
                  borderRadius="2xl" // More rounded
                  overflow="hidden"
                  position="relative"
                  boxShadow="2xl" // Stronger shadow
                >
                  {/* Placeholder for a more engaging visual, e.g., an illustration or abstract shapes */}
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="100%"
                    textAlign="center"
                    p={8}
                  >
                    <Icon as={FaGraduationCap} boxSize={{base: 16, lg: 24}} color="white" mb={6} />
                    <Heading size="lg" color="white" fontWeight="semibold">
                      Interactive Learning Platform
                    </Heading>
                    <Text color="whiteAlpha.800" mt={2}>
                      Engage with dynamic content and track your progress.
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={{ base: 16, md: 24 }}> {/* Increased vertical padding */}
        <Container maxW="container.xl">
          <VStack spacing={{ base: 10, md: 16 }}> {/* Increased spacing */}
            <VStack spacing={5} textAlign="center"> {/* Increased spacing */}
              <Heading size="2xl" fontWeight="bold">Key Features</Heading> {/* Bolder and larger heading */}
              <Text fontSize={{ base: "md", md: "lg"}} color={useColorModeValue('gray.600', 'gray.400')} maxW="container.lg"> {/* Adjusted text size and maxW */}
                Our platform offers a comprehensive suite of tools designed to help IGCSE students prepare effectively for their exams.
              </Text>
            </VStack>

            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} // Adjusted responsive columns
              gap={{ base: 6, md: 8 }} // Responsive gap
            >
              <Feature
                icon={FaBook}
                title="Realistic Exam Simulations"
                text="Practise with exam-style questions that mirror the format, difficulty, and time constraints of actual IGCSE exams."
              />
              <Feature
                icon={FaChartLine}
                title="Personalised Learning Paths"
                text="AI-driven learning paths that adapt to your performance, focusing on areas that need improvement."
              />
              <Feature
                icon={FaClock}
                title="Time Management Tools"
                text="Structured study sessions with time tracking to help you optimise your study habits and exam time allocation."
              />
              <Feature
                icon={FaUserFriends}
                title="Parent-Teacher Connection"
                text="Enable parents and teachers to monitor progress and provide timely support when needed."
              />
              <Feature
                icon={FaGraduationCap}
                title="Layered Teaching Approach"
                text="Tiered question sets for different academic goals, from foundation to top-tier university preparation."
              />
              <Feature
                icon={FaChartLine}
                title="Error Pattern Analysis"
                text="Identify recurring mistake patterns to focus your revision on areas that will most improve your scores."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Featured Courses */}
      <Box py={{ base: 16, md: 24 }} bg={useColorModeValue('gray.50', 'gray.900')}> {/* Increased padding */}
        <Container maxW="container.xl">
          <VStack spacing={{ base: 10, md: 16 }}> {/* Increased spacing */}
            <VStack spacing={5} textAlign="center"> {/* Increased spacing */}
              <Heading size="2xl" fontWeight="bold">Featured Courses</Heading> {/* Bolder and larger heading */}
              <Text fontSize={{ base: "md", md: "lg"}} color={useColorModeValue('gray.600', 'gray.400')} maxW="container.lg"> {/* Adjusted text size and maxW */}
                Explore our most popular IGCSE preparation courses across different subjects
              </Text>
            </VStack>

            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={{ base: 6, md: 8 }}
              alignItems="stretch" // Ensure cards in a row stretch to the same height if minH is set
            >
              {[
                { title: "Mathematics (0580)", level: "IGCSE", badge: "Popular" },
                { title: "Physics (0625)", level: "IGCSE", description: "Understand the fundamental principles of physics." },
                { title: "Chemistry (0620)", level: "IGCSE" },
                { title: "Biology (0610)", level: "IGCSE", badge: "New" },
                { title: "English Language (0500)", level: "IGCSE", description: "Master the nuances of the English language." },
                { title: "Computer Science (0478)", level: "IGCSE" },
              ].map(course => (
                <CourseCard
                  key={course.title}
                  id={course.title.toLowerCase().replace(/\s+/g, '-')} // Generate simple ID
                  title={course.title}
                  level={course.level}
                  description={course.description || "A comprehensive IGCSE course to help you excel."}
                  // image={course.image || undefined} // Add image prop if available
                  badge={course.badge || undefined}
                  // nextLesson={undefined} // Not typically shown on homepage marketing cards
                  // progress={undefined} // Not typically shown on homepage marketing cards
                  // isEnrolled={false} // Default for homepage cards
                />
              ))}
            </Grid>

            <Button
              size="lg"
              colorScheme="blue"
              mt={8}
              as={RouterLink}
              to="/register"
            >
              Explore All Courses
            </Button>
            {user && (
              <Button
                size="lg"
                colorScheme="green"
                mt={4}
                leftIcon={<FaClock />}
                as={RouterLink}
                to="/exam-simulation"
              >
                Start Exam Simulation
              </Button>
            )}
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={16}>
        <Container maxW="container.md" textAlign="center">
          <VStack spacing={8}>
            <Heading size="xl">Ready to Excel in Your IGCSE Exams?</Heading>
            <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.400')}>
              Join thousands of students who have improved their exam scores with our platform
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center">
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="blue"
                px={8}
              >
                Create Free Account
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                variant="outline"
                colorScheme="blue"
              >
                Sign In
              </Button>
              {user && (
                <Button
                  as={RouterLink}
                  to="/exam-simulation"
                  size="lg"
                  colorScheme="green"
                  leftIcon={<FaClock />}
                >
                  Try Exam Simulation
                </Button>
              )}
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={10}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="md">IGCSE Prep</Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  Empowering students to excel in their IGCSE exams through personalised preparation.
                </Text>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="sm">Resources</Heading>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Practise Tests</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Study Guides</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Past Papers</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Revision Tips</Link>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="sm">Company</Heading>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>About Us</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Partners</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Careers</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Contact Us</Link>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="start" spacing={4}>
                <Heading size="sm">Legal</Heading>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Terms of Service</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Privacy Policy</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>Cookie Policy</Link>
                <Link _hover={{ color: 'brand.500', textDecoration: 'underline' }}>GDPR Compliance</Link>
              </VStack>
            </GridItem>
          </Grid>
          <Text mt={12} textAlign="center" fontSize="sm" color={useColorModeValue('gray.500', 'gray.500')}>
            © 2025 IGCSE Prep. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;