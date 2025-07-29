import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  Radio,
  RadioGroup,
  // Stack, // Replaced with VStack/HStack
  Progress,
  useToast,
  Alert,
  AlertIcon,
  useColorModeValue, // Added
  Flex,             // Added
  Spinner,          // Added
  AlertTitle,       // Added
  AlertDescription, // Added
  HStack,           // Added
} from '@chakra-ui/react';
import axios from 'axios';

const PracticeTest = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.700', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  const fetchTestData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tests/${testId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTest(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load test data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tests/${testId}/submit`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: 'Success',
        description: `Test submitted! Score: ${response.data.score}%`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit test',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh" bg={pageBg}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text ml={4} fontSize="xl" color={textColor}>Loading Test...</Text>
      </Flex>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <Container centerContent py={10} bg={pageBg} minH="100vh">
        <Alert
          status="warning"
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
          <AlertIcon boxSize="40px" mr={0} color="yellow.500" />
          <AlertTitle mt={4} mb={1} fontSize="xl" color={headingColor}>
            Test Not Available
          </AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>
            This practice test could not be loaded or has no questions.
          </AlertDescription>
          <Button mt={4} colorScheme="brand" onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </Alert>
      </Container>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <Box bg={pageBg} minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="container.md"> {/* Max width for better readability of questions */}
        <VStack spacing={{base: 5, md:8}} align="stretch">
          {/* Header: Test Name & Description */}
          <Box textAlign="center" bg={cardBg} p={6} borderRadius="xl" boxShadow="lg">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>{test.name}</Heading>
            <Text color={textColor}>{test.description}</Text>
          </Box>

          {/* Progress Bar and Question Count */}
          <Box bg={cardBg} p={4} borderRadius="xl" boxShadow="lg">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color={subtleTextColor}>Progress</Text>
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                Question {currentQuestionIndex + 1} of {test.questions.length}
              </Text>
            </HStack>
            <Progress value={progressPercent} colorScheme="brand" borderRadius="md" size="lg" />
          </Box>

          {/* Current Question */}
          {currentQuestion && (
            <Box p={{base:5, md:8}} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <VStack align="stretch" spacing={6}>
                <Heading size="md" color={textColor} lineHeight="tall">{currentQuestion.content}</Heading>

                <RadioGroup
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleAnswerChange}
                >
                  <VStack spacing={4} align="stretch">
                    {currentQuestion.options.map((option, index) => (
                      <Radio
                        key={index}
                        value={option}
                        size="lg"
                        colorScheme="brand"
                        borderColor={borderColor}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        _hover={{ bg: useColorModeValue('brand.50', 'brand.900')}}
                      >
                        <Text color={textColor} fontSize="md">{option}</Text>
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>

                {!answers[currentQuestionIndex] && (
                  <Alert status="info" variant="subtle" borderRadius="md" bg={useColorModeValue('blue.50', 'blue.800')}>
                    <AlertIcon color="blue.500" />
                    <Text color={useColorModeValue('blue.700', 'blue.200')} fontSize="sm">Please select an answer to continue.</Text>
                  </Alert>
                )}
              </VStack>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align="center"
            p={4}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
          >
            <Button
              onClick={handlePrevious}
              isDisabled={currentQuestionIndex === 0}
              colorScheme="brand"
              variant="outline"
              size="lg"
              w={{base: "full", sm: "auto"}} mb={{base:2, sm:0}}
            >
              Previous
            </Button>
            {currentQuestionIndex === test.questions.length - 1 ? (
              <Button
                colorScheme="green"
                onClick={handleSubmit}
                isLoading={submitting}
                isDisabled={!answers[currentQuestionIndex]}
                size="lg"
                w={{base: "full", sm: "auto"}}
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                colorScheme="brand"
                variant="solid"
                isDisabled={!answers[currentQuestionIndex]}
                size="lg"
                w={{base: "full", sm: "auto"}}
              >
                Next
              </Button>
            )}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default PracticeTest; 