import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  SimpleGrid,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Badge,
  useToast, // Added back
  Spinner,
  Center,
  useColorModeValue // Added this
} from '@chakra-ui/react';
import { 
  FaFlask, 
  FaCalculator, 
  FaAtom, 
  FaDna, 
  FaChartLine 
} from 'react-icons/fa';
import { supabaseApi } from '../services/supabaseApi';

const SubjectSelection = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast(); // Added back

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('white', 'secondary.800');
  const headingColor = useColorModeValue('brand.700', 'brand.200'); // Main page heading
  const cardHeadingColor = useColorModeValue('brand.600', 'brand.300'); // Subject name in card
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardHoverBorderColor = useColorModeValue('brand.300', 'brand.500');

  // Subject icons mapping (can remain as is)
  const subjectIcons = {
    'Physics': FaAtom,
    'Chemistry': FaFlask,
    'Mathematics': FaCalculator,
    'Biology': FaDna,
    'Economics': FaChartLine
  };

  // Subject colors mapping - this will be simplified to use brand for consistency
  // const subjectColors = { ... };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await supabaseApi.subjects.getSubjects();
      if (response.success) {
        setSubjects(response.data);
      } else {
        throw new Error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subject) => {
    // Navigate to exam simulation with the selected subject
    navigate(`/exam-simulation/${subject.id}`);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={{ base: 8, md: 16 }} bg={pageBg} minH="60vh">
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" thickness="4px" />
            <Text color={textColor} fontSize="lg">Loading IGCSE subjects...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh">
      <Container maxW="container.xl" py={{ base: 8, md: 16 }}>
        <VStack spacing={{ base: 6, md: 10 }} align="stretch">
          <VStack spacing={3} textAlign="center">
            <Heading as="h1" size="2xl" color={headingColor}>
              Choose Your IGCSE Subject
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="container.md">
              Select a subject to start your practice session. All questions are authentic IGCSE past paper questions.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, md: 8 }}>
            {subjects.map((subject) => {
              const IconComponent = subjectIcons[subject.name] || FaAtom; // Default icon

              return (
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
                  cursor="pointer"
                  onClick={() => handleSubjectSelect(subject)}
                  display="flex" // Added for flex column layout
                  flexDirection="column" // Added for flex column layout
                  justifyContent="space-between" // Added for spacing button
                >
                  <VStack spacing={4} align="stretch" flexGrow={1}> {/* Allow content to grow */}
                    <HStack justify="space-between" align="flex-start"> {/* Align start for badge */}
                      <Icon
                        as={IconComponent}
                        boxSize={10} // Increased size
                        color="brand.500" // Consistent brand color for icon
                      />
                      {subject.questionCount && (
                        <Badge
                          colorScheme="brand"
                          variant="subtle"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="sm" // Slightly larger badge text
                        >
                          {subject.questionCount} Questions
                        </Badge>
                      )}
                    </HStack>

                    <VStack align="stretch" spacing={1.5}> {/* Reduced spacing */}
                      <Heading size="lg" color={cardHeadingColor} noOfLines={1}> {/* Ensure single line for consistency */}
                        {subject.name}
                      </Heading>
                      <Text color={textColor} fontSize="sm" minH="3.2em" noOfLines={3}> {/* Set min height and allow 3 lines */}
                        {subject.description || "Prepare for your IGCSE exams with comprehensive question banks."}
                      </Text>
                    </VStack>

                    {subject.sampleQuestions && subject.sampleQuestions.length > 0 && (
                      <Box pt={2}>
                        <Text fontSize="xs" color={subtleTextColor} mb={1} fontWeight="medium">
                          Sample Questions:
                        </Text>
                        <VStack align="stretch" spacing={0.5}>
                          {subject.sampleQuestions.slice(0, 2).map((sample, index) => (
                            <Text key={index} fontSize="xs" color={textColor} noOfLines={1} title={sample.text}>
                              • {sample.text}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>

                  <Button
                    colorScheme="brand" // Consistent brand color scheme
                    variant="solid" // Solid button for primary action
                    size="md" // Consistent button size
                    mt={6} // Margin top for spacing from content
                    w="full" // Full width button
                    // _hover will be handled by global theme
                  >
                    Start Practice
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>

          <VStack spacing={3} textAlign="center" pt={6}>
            <Text fontSize="sm" color={subtleTextColor}>
              Questions sourced from authentic IGCSE past papers • AI-powered similar questions available
            </Text>
            <HStack spacing={6}>
              <Text fontSize="sm" color={textColor}>
                Total Questions: {subjects.reduce((sum, s) => sum + (s.questionCount || 0), 0)}
              </Text>
              <Text fontSize="sm" color={textColor}>
                Subjects Available: {subjects.length}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default SubjectSelection; 