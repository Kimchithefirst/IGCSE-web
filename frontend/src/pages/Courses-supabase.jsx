import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Input, 
  InputGroup, 
  InputLeftElement,
  Select,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  useColorModeValue,
  Icon,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import CourseCard from '../components/CourseCard';
import { supabaseApi } from '../services/supabaseApi';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const Courses = () => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useSupabaseAuth();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch both courses and subjects data
      const [coursesResponse, subjectsResponse] = await Promise.all([
        supabaseApi.courses.getCourses(),
        supabaseApi.subjects.getSubjects()
      ]);

      if (coursesResponse.success && coursesResponse.data) {
        setAllCoursesData(coursesResponse.data);
      }

      if (subjectsResponse.success && subjectsResponse.data) {
        setSubjectsData(subjectsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    let filtered = allCoursesData.filter(course =>
      course.title.toLowerCase().includes(filter.toLowerCase()) ||
      course.subject.toLowerCase().includes(filter.toLowerCase()) ||
      course.description.toLowerCase().includes(filter.toLowerCase())
    );

    // Sort courses
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'level':
        filtered.sort((a, b) => a.level.localeCompare(b.level));
        break;
      case 'subject':
        filtered.sort((a, b) => a.subject.localeCompare(b.subject));
        break;
      case 'popular':
      default:
        // Keep original order or implement popularity sorting
        break;
    }

    return filtered;
  }, [allCoursesData, filter, sortBy]);

  // Group courses by level
  const coursesByLevel = React.useMemo(() => {
    const grouped = filteredAndSortedCourses.reduce((acc, course) => {
      const level = course.level || 'Other';
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(course);
      return acc;
    }, {});
    
    return grouped;
  }, [filteredAndSortedCourses]);

  // Group subjects by category for subjects tab
  const subjectsByCategory = React.useMemo(() => {
    const categorized = {
      'Sciences': subjectsData.filter(s => ['Physics', 'Chemistry', 'Biology'].includes(s.name)),
      'Mathematics': subjectsData.filter(s => s.name.includes('Mathematics') || s.name.includes('Math')),
      'Languages': subjectsData.filter(s => s.name.includes('English') || s.name.includes('French') || s.name.includes('Spanish') || s.name.includes('German')),
      'Other': subjectsData.filter(s => !['Physics', 'Chemistry', 'Biology'].includes(s.name) && 
                                      !s.name.includes('Mathematics') && !s.name.includes('Math') &&
                                      !s.name.includes('English') && !s.name.includes('French') && 
                                      !s.name.includes('Spanish') && !s.name.includes('German'))
    };
    
    // Remove empty categories
    Object.keys(categorized).forEach(key => {
      if (categorized[key].length === 0) {
        delete categorized[key];
      }
    });
    
    return categorized;
  }, [subjectsData]);

  if (isLoading) {
    return (
      <Center minH="50vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Header */}
        <Box mb={8}>
          <Heading size="xl" mb={4}>
            IGCSE Courses & Subjects
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Explore our comprehensive collection of IGCSE courses and subjects.
            {user && ` Welcome back, ${user.name || user.email}!`}
          </Text>
        </Box>

        {/* Search and Filter Controls */}
        <Box mb={8} p={6} bg={cardBg} borderRadius="lg" shadow="sm">
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <InputGroup flex={2}>
              <InputLeftElement>
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search courses and subjects..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </InputGroup>
            
            <Select 
              flex={1} 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              minW="150px"
            >
              <option value="popular">Sort by Popularity</option>
              <option value="name">Sort by Name</option>
              <option value="level">Sort by Level</option>
              <option value="subject">Sort by Subject</option>
            </Select>
          </Flex>
        </Box>

        {/* Tabs for Courses and Subjects */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Courses ({allCoursesData.length})</Tab>
            <Tab>Subjects ({subjectsData.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Courses Tab */}
            <TabPanel px={0}>
              {Object.keys(coursesByLevel).length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text fontSize="lg" color="gray.500">
                    No courses found matching your search.
                  </Text>
                </Box>
              ) : (
                <Box>
                  {Object.entries(coursesByLevel).map(([level, courses]) => (
                    <Box key={level} mb={8}>
                      <Heading size="md" mb={4} color="blue.600">
                        {level} ({courses.length})
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {courses.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Subjects Tab */}
            <TabPanel px={0}>
              {Object.keys(subjectsByCategory).length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text fontSize="lg" color="gray.500">
                    No subjects found.
                  </Text>
                </Box>
              ) : (
                <Box>
                  {Object.entries(subjectsByCategory).map(([category, subjects]) => (
                    <Box key={category} mb={8}>
                      <Heading size="md" mb={4} color="green.600">
                        {category} ({subjects.length})
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                        {subjects.map((subject) => (
                          <Box 
                            key={subject.id} 
                            p={4} 
                            bg={cardBg} 
                            borderRadius="lg" 
                            shadow="sm"
                            borderLeft="4px solid"
                            borderLeftColor={subject.color || 'blue.500'}
                            _hover={{ 
                              shadow: 'md', 
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <HStack mb={2}>
                              <Text fontSize="2xl">{subject.icon || '📚'}</Text>
                              <Heading size="sm">{subject.name}</Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                              Code: {subject.code}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {subject.description || 'IGCSE subject preparation'}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))}
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default Courses;