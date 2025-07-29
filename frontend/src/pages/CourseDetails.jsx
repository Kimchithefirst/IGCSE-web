import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  useToast,
  Button,
  Flex,
  Badge,
  Divider,
  Select,
  HStack,
  useColorModeValue // Added this
} from '@chakra-ui/react';
import api from '../utils/api';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [igcsePapers, setIgcsePapers] = useState([]);
  const [igcseLoading, setIgcseLoading] = useState(false);
  const [igcseError, setIgcseError] = useState(null);
  const [examSessionFilter, setExamSessionFilter] = useState('');
  const [paperTypeFilter, setPaperTypeFilter] = useState('');
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  // Theme-based colors and styles
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const defaultCardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Use this for cards
  const headingColor = useColorModeValue('brand.700', 'brand.300');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const subtleBg = defaultCardBg; // Updated: For topic boxes and paper items
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = defaultCardBg; // Updated: Consistent with Courses page

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        // This needs to use the QuizzesAPI or a generic courses API if available
        // Assuming a generic api.get for now as per existing code
        // const response = await api.Courses.getById(courseId);
        const response = await api.get(`/api/courses/${courseId}`); // Placeholder if CoursesAPI doesn't exist
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load course details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, toast]);

  useEffect(() => {
    const fetchIgcsePapers = async () => {
      if (course && course.subject) {
        setIgcseLoading(true);
        setIgcseError(null);
        try {
          const params = { subject: course.subject };
          if (examSessionFilter) {
            params.examSession = examSessionFilter;
          }
          if (paperTypeFilter) {
            params.paperType = paperTypeFilter;
          }
          const response = await api.Quizzes.getIgcsePapers(params);
          if (response && response.data) {
            setIgcsePapers(response.data);
          } else {
            setIgcsePapers([]);
          }
        } catch (error) {
          console.error('Error fetching IGCSE papers:', error);
          setIgcseError(error.message || 'Failed to load IGCSE papers for this subject.');
          setIgcsePapers([]);
        } finally {
          setIgcseLoading(false);
        }
      }
    };

    fetchIgcsePapers();
  }, [course, examSessionFilter, paperTypeFilter]); // Rerun when course or filters change

  // Derive filter options from igcsePapers (only when not filtering, to get all options)
  // This is a bit tricky because filtering papers will reduce the options.
  // A better approach would be to fetch all papers once, then filter client-side,
  // or have separate API endpoints for filter options if data is large.
  // For now, we'll derive from the currently displayed papers, which means options might shrink after filtering.
  // Or, fetch all papers initially and then filter client-side or re-fetch with filters.
  // The current subtask implies re-fetching. So, we'll derive options from the *initial* fetch.
  // To do this properly, we need to fetch *all* papers for the subject once to populate filters,
  // then allow re-fetching with those filters.
  // Simpler approach for now: options are derived from the current set of papers. This is not ideal but fits the re-fetch model.

  const availableExamSessions = useMemo(() => {
    const sessions = new Set(igcsePapers.map(p => p.examSession).filter(Boolean));
    return ['All', ...sessions];
  }, [igcsePapers]);

  const availablePaperTypes = useMemo(() => {
    const types = new Set(igcsePapers.map(p => p.paperType).filter(Boolean));
    return ['All', ...types];
  }, [igcsePapers]);


  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh"> {/* Increased minH */}
        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
      </Flex>
    );
  }

  if (!course) {
    return (
      <Container maxW="container.md" py={{ base: 8, md: 12 }} textAlign="center"> {/* Centered message */}
        <Heading size="lg" color={headingColor} mb={4}>Course Not Found</Heading>
        <Text color={textColor}>We couldn't find the course you were looking for.</Text>
        <Button mt={6} colorScheme="brand" onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh"> {/* Added root Box with pageBg and minH */}
      <Container maxW="container.lg" py={{ base: 6, md: 10 }}> {/* Consistent padding */}
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Box>
            <Heading as="h1" size="2xl" mb={2} color={headingColor}>{course.title}</Heading>
          <Badge colorScheme="brand" variant="solid" fontSize="md" px={3} py={1}>{course.subject}</Badge> {/* Themed badge */}
        </Box>

        <Divider borderColor={borderColor} />

        <Box>
          <Heading size="lg" mb={3} color={headingColor}>Course Description</Heading> {/* Larger section heading */}
          <Text color={textColor} fontSize="md" lineHeight="tall">{course.description}</Text> {/* Themed text */}
        </Box>

        {course.topics && course.topics.length > 0 && (
          <Box>
            <Heading size="lg" mb={3} color={headingColor}>Topics Covered</Heading>
            <VStack spacing={3} align="stretch">
              {course.topics.map((topic, index) => (
                <Box
                  key={index}
                  p={4}
                  bg={subtleBg}
                  borderRadius="lg" // Consistent rounding
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Text fontWeight="semibold" color={useColorModeValue('gray.700', 'whiteAlpha.900')}>{topic.title}</Text>
                  <Text fontSize="sm" color={textColor}>{topic.description}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        <Divider borderColor={borderColor} />

        <Box>
          <Heading size="lg" mb={4} color={headingColor}>IGCSE Past Papers</Heading>

          <HStack spacing={4} mb={6}> {/* Increased margin bottom */}
            <Select
              placeholder="Filter by Exam Session"
              value={examSessionFilter}
              onChange={(e) => setExamSessionFilter(e.target.value === 'All' ? '' : e.target.value)}
              bg={inputBg}
              size="lg" // Consistent input size
              borderRadius="md"
              borderColor={borderColor}
            >
              {availableExamSessions.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Paper Type"
              value={paperTypeFilter}
              onChange={(e) => setPaperTypeFilter(e.target.value === 'All' ? '' : e.target.value)}
              bg={inputBg}
              size="lg" // Consistent input size
              borderRadius="md"
              borderColor={borderColor}
            >
              {availablePaperTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </HStack>

          {igcseLoading && (
            <Flex justify="center" align="center" minH="100px">
              <Spinner size="md" color="brand.500"/>
              <Text ml={3} color={textColor}>Loading past papers...</Text>
            </Flex>
          )}
          {igcseError && (
            <Text color="red.400" fontWeight="medium">Error: {igcseError}</Text> // Themed error text
          )}
          {!igcseLoading && !igcseError && igcsePapers.length > 0 && (
            <VStack spacing={4} align="stretch">
              {igcsePapers.map((paper) => (
                <Box
                  key={paper._id}
                  p={5} // Increased padding
                  bg={subtleBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg" // Consistent rounding
                  boxShadow="sm" // Subtle shadow
                  onClick={() => navigate(`/exam-simulation/${paper._id}`)}
                  cursor="pointer"
                  _hover={{ shadow: 'md', borderColor: 'brand.400', bg: useColorModeValue('gray.100', 'gray.600') }}
                  role="group"
                  transition="all 0.2s ease-in-out" // Added transition
                >
                  <Heading size="md" mb={2} _groupHover={{ color: 'brand.600' }} color={useColorModeValue('gray.700', 'whiteAlpha.900')}> {/* Themed heading */}
                    {paper.title}
                  </Heading>
                  {paper.paperCode && (
                    <Badge colorScheme="teal" variant="subtle" mr={2}>Code: {paper.paperCode}</Badge> {/* Themed badge */}
                  )}
                  {paper.examSession && (
                    <Badge colorScheme="purple" variant="subtle">Session: {paper.examSession}</Badge> {/* Themed badge */}
                  )}
                </Box>
              ))}
            </VStack>
          )}
          {!igcseLoading && !igcseError && igcsePapers.length === 0 && (
            <Text color={textColor} fontStyle="italic">No IGCSE past papers found for this subject or matching your filters.</Text> // Themed text
          )}
        </Box>

        {user?.role === 'student' && (
          <Button colorScheme="brand" variant="solid" size="lg" width="full" mt={4}> {/* Themed button, adjusted margin */}
            Enroll in Course
          </Button>
        )}
      </VStack>
    </Container>
  </Box> // Added root Box
  );
};

export default CourseDetails; 