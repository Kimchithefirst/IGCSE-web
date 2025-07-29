import React, { useEffect, useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  SimpleGrid,
  Progress as ChakraProgress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  useColorModeValue, // Added
  Flex,             // Added
  Spinner,          // Added
  Alert,            // Added
  AlertIcon,        // Added
  AlertTitle,       // Added
  AlertDescription, // Added
  HStack,           // Added
  Divider,          // Added
  Button,           // Added for empty state
} from '@chakra-ui/react';
import axios from 'axios';

const Progress = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate(); // Added for empty state button action

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.700', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProgressData(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load progress data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh" bg={pageBg}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text ml={4} fontSize="xl" color={textColor}>Loading Progress Data...</Text>
      </Flex>
    );
  }

  if (!progressData) {
     return (
      <Container centerContent py={10} bg={pageBg} minH="100vh">
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          bg={cardBg}
          borderRadius="lg"
          boxShadow="md"
        >
          <AlertIcon boxSize="40px" mr={0} color="brand.500" />
          <AlertTitle mt={4} mb={1} fontSize="xl" color={headingColor}>
            No Progress Data
          </AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>
            We couldn't find any progress data for your account yet.
          </AlertDescription>
          <Button mt={4} colorScheme="brand" onClick={() => navigate('/courses')}>
            Start Learning
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Heading as="h1" size="2xl" color={headingColor} textAlign="center">
            Your Learning Progress
          </Heading>

          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
            <StatBox label="Total Study Time" value={`${progressData?.totalStudyTime || 0} hours`} helpText="This month" />
            <StatBox label="Tests Completed" value={`${progressData?.testsCompleted || 0}`} helpText="Total tests taken" />
            <StatBox label="Average Score" value={`${progressData?.averageScore || 0}%`} helpText="Across all tests" />
          </SimpleGrid>

          {/* Subject Progress */}
          {progressData?.subjects && progressData.subjects.length > 0 && (
            <Box p={{base:4, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <Heading size="lg" color={headingColor} mb={6}>Subject Progress</Heading>
              <VStack spacing={5} align="stretch">
                {progressData.subjects.map((subject) => (
                  <Box key={subject.id} p={5} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={useColorModeValue("gray.50", "gray.700")}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="semibold" fontSize="lg" color={textColor}>{subject.name}</Text>
                      <Text fontWeight="medium" color="brand.500">{subject.progress}% Complete</Text>
                    </HStack>
                    <ChakraProgress
                      value={subject.progress}
                      colorScheme="brand"
                      size="md" // Slightly larger progress bar
                      borderRadius="md"
                      bg={useColorModeValue('brand.100', 'brand.700')}
                    />
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* Recent Test Scores */}
          {progressData?.recentTests && progressData.recentTests.length > 0 && (
            <Box p={{base:4, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <Heading size="lg" color={headingColor} mb={6}>Recent Test Scores</Heading>
              <VStack spacing={4} align="stretch" divider={<Divider borderColor={borderColor} />}>
                {progressData.recentTests.map((test) => (
                  <Flex
                    key={test.id}
                    p={4}
                    justifyContent="space-between"
                    alignItems="center"
                    _hover={{bg: useColorModeValue("gray.50", "gray.700")}}
                    borderRadius="md"
                  >
                    <VStack align="start" spacing={0.5}>
                      <Text fontWeight="medium" fontSize="md" color={textColor}>{test.name}</Text>
                      <Text fontSize="sm" color={subtleTextColor}>
                        {new Date(test.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                    </VStack>
                    <Text
                      fontWeight="bold"
                      fontSize="xl"
                      color={test.score >= 70 ? 'green.500' : test.score >=50 ? 'yellow.500' : 'red.500'}
                    >
                      {test.score}%
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

// Helper component for StatBox to avoid repetition
const StatBox = ({ label, value, helpText }) => {
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.700', 'brand.300');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Stat
      p={{base:4, md:6}}
      bg={cardBg}
      boxShadow="lg"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <StatLabel fontSize="md" color={subtleTextColor} fontWeight="medium">{label}</StatLabel>
      <StatNumber fontSize="3xl" fontWeight="bold" color={headingColor}>{value}</StatNumber>
      <StatHelpText color={textColor}>{helpText}</StatHelpText>
    </Stat>
  // ); // Removed misplaced parenthesis
};

export default Progress;
// Removed duplicate export