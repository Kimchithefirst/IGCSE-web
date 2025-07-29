import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  SimpleGrid,
  Progress,
  useToast,
  useColorModeValue, // Added
  Flex,             // Added
  Spinner,          // Added
  Alert,            // Added
  AlertIcon,        // Added
  AlertTitle,       // Added
  AlertDescription, // Added
  HStack,           // Added
  Badge,            // Added
} from '@chakra-ui/react';
import axios from 'axios';

const TopicView = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.700', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.400');
  // const subtleTextColor = useColorModeValue('gray.500', 'gray.300'); // Removed, textColor or specific component colors used
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const itemCtaButtonColorScheme = "brand"; // e.g. "brand" or specific like "teal" for study, "purple" for practice

  useEffect(() => {
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/topics/${topicId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTopic(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load topic data',
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
        <Text ml={4} fontSize="xl" color={textColor}>Loading Topic Details...</Text>
      </Flex>
    );
  }

  if (!topic) {
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
            Topic Not Found
          </AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>
            The topic you are looking for could not be loaded.
          </AlertDescription>
          <Button mt={4} colorScheme="brand" onClick={() => navigate(-1)}>Go Back</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh">
      <Container maxW="container.xl" py={{ base: 8, md: 12 }}>
        <VStack spacing={{ base: 6, md: 10 }} align="stretch">
          {/* Topic Header */}
          <Box textAlign="center" bg={cardBg} p={{base:6, md:8}} borderRadius="xl" boxShadow="lg">
            <Heading as="h1" size="2xl" color={headingColor} mb={3}>{topic.name}</Heading>
            <Text fontSize="lg" color={textColor} maxW="container.md" mx="auto">{topic.description}</Text>
          </Box>

          {/* Progress Section */}
          {topic.progress !== undefined && ( // Only show if progress data exists
            <Box p={{base:5, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <Heading size="lg" color={headingColor} mb={4}>Your Progress</Heading>
              <Progress
                value={topic.progress || 0}
                colorScheme="brand"
                size="lg" // Make progress bar more prominent
                borderRadius="md"
                hasStripe
                isAnimated
              />
              <Text mt={2} textAlign="right" color={textColor} fontWeight="medium">
                {topic.progress || 0}% Complete
              </Text>
            </Box>
          )}

          {/* Study Materials Section */}
          {topic.materials && topic.materials.length > 0 && (
            <Box p={{base:5, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <Heading size="lg" color={headingColor} mb={6}>Study Materials</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, md: 6 }}>
                {topic.materials.map((material) => (
                  <Box
                    key={material.id}
                    p={5}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    boxShadow="md"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    display="flex" flexDirection="column" justifyContent="space-between"
                    _hover={{ borderColor: 'brand.400', shadow: 'lg', transform: 'translateY(-3px)'}}
                    transition="all 0.2s ease-in-out"
                  >
                    <VStack align="stretch" spacing={3} flexGrow={1}>
                      <Heading size="md" color={useColorModeValue("brand.600", "brand.300")}>{material.title}</Heading>
                      <Text fontSize="sm" color={textColor} minH="3em" noOfLines={3}>{material.description}</Text>
                    </VStack>
                    <Button
                      mt={4}
                      colorScheme={itemCtaButtonColorScheme}
                      variant="solid"
                      onClick={() => window.open(material.url, '_blank')}
                      w="full"
                    >
                      Study Now
                    </Button>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Practice Questions Section */}
          {topic.questions && topic.questions.length > 0 && (
            <Box p={{base:5, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
              <Heading size="lg" color={headingColor} mb={6}>Practice Questions</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, md: 6 }}>
                {topic.questions.map((question) => (
                  <Box
                    key={question.id}
                    p={5}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    boxShadow="md"
                    bg={useColorModeValue("gray.50", "gray.700")}
                    display="flex" flexDirection="column" justifyContent="space-between"
                     _hover={{ borderColor: 'purple.400', shadow: 'lg', transform: 'translateY(-3px)'}}
                    transition="all 0.2s ease-in-out"
                  >
                    <VStack align="stretch" spacing={3} flexGrow={1}>
                      <HStack justify="space-between">
                        <Heading size="md" color={useColorModeValue("purple.600", "purple.300")}>Question</Heading>
                        <Badge colorScheme="purple" variant="subtle">
                          Difficulty: {question.difficulty}/5
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color={textColor} minH="3em" noOfLines={3}>{question.content}</Text>
                    </VStack>
                    <Button
                      mt={4}
                      colorScheme="purple" // Differentiate from study materials
                      variant="solid"
                      onClick={() => navigate(`/practice/${question.id}`)} // Assuming a route like this
                      w="full"
                    >
                      Practice Now
                    </Button>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default TopicView; 