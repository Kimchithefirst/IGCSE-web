import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  SimpleGrid,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
  useColorModeValue, // Added
  Flex,             // Added
  Spinner,          // Added
  Alert,            // Added
  AlertIcon,        // Added
  AlertTitle,       // Added
  AlertDescription, // Added
} from '@chakra-ui/react';
import axios from 'axios';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.700', 'brand.200'); // Main page heading
  const cardHeadingColor = useColorModeValue('brand.600', 'brand.300'); // Subject name in card
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardHoverBorderColor = useColorModeValue('brand.300', 'brand.500');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjects(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
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
        <Text ml={4} fontSize="xl" color={textColor}>Loading Subjects...</Text>
      </Flex>
    );
  }

  if (!subjects || subjects.length === 0) {
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
            No Subjects Available
          </AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>
            There are no subjects available at the moment. Please check back later.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh">
      <Container maxW="container.xl" py={{ base: 8, md: 16 }}>
        <VStack spacing={{ base: 6, md: 10 }} align="stretch">
          <VStack spacing={3} textAlign="center">
            <Heading as="h1" size="2xl" color={headingColor}>
              Explore Our Subjects
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="container.md">
              Dive into comprehensive learning materials for each IGCSE subject.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 5, md: 8 }}>
            {subjects.map((subject) => (
              <Box
                key={subject.id}
                p={6}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow="lg"
                _hover={{
                  boxShadow: 'xl',
                  transform: 'translateY(-5px)',
                  borderColor: cardHoverBorderColor,
                }}
                transition="all 0.3s ease-in-out"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <VStack spacing={3} align="stretch" flexGrow={1}>
                  <Heading size="lg" color={cardHeadingColor} noOfLines={1}>{subject.name}</Heading>
                  <Text color={textColor} fontSize="sm" minH={{base: "auto", md:"3.6em"}} noOfLines={3}> {/* Approx 3 lines */}
                    {subject.description || "Detailed study materials and resources available."}
                  </Text>
                </VStack>
                <Button
                  colorScheme="brand"
                  variant="solid"
                  size="md"
                  mt={6}
                  w="full"
                  onClick={() => navigate(`/topics/${subject.id}`)} // Assuming this links to a topic page for the subject
                >
                  View Topics
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default SubjectList; 