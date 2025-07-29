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
  Icon // Added Icon
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../utils/api'; // Corrected import path

const Courses = () => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCourses();
        // Backend returns { success: true, data: coursesWithoutTopics, count: coursesWithoutTopics.length }
        // So, the actual courses array is in response.data.data
        if (response && response.data && Array.isArray(response.data.data)) {
          setAllCoursesData(response.data.data);
        } else {
          // Handle cases where the structure might not be as expected
          // For example, if response.data is the array directly (as assumed in api.js)
          if (Array.isArray(response.data)) {
             setAllCoursesData(response.data)
          } else {
            console.error('Fetched data is not in the expected format:', response);
            setAllCoursesData([]); // Set to empty array to avoid runtime errors
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message || 'Failed to load courses.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  const enrolledCourses = allCoursesData.filter(course => course.isEnrolled);
  const discoverCourses = allCoursesData.filter(course => !course.isEnrolled);
  
  const filterCourses = (courses) => {
    return courses.filter(course => 
      course.title.toLowerCase().includes(filter.toLowerCase()) ||
      course.description.toLowerCase().includes(filter.toLowerCase())
    );
  };
  
  const sortCourses = (courses) => {
    if (sortBy === 'title') {
      return [...courses].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'popular') {
      return [...courses].sort((a, b) => (b.badge === 'Popular' ? 1 : 0) - (a.badge === 'Popular' ? 1 : 0));
    } else if (sortBy === 'new') {
      return [...courses].sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
    }
    return courses;
  };
  
  const filteredEnrolledCourses = sortCourses(filterCourses(enrolledCourses));
  const filteredDiscoverCourses = sortCourses(filterCourses(discoverCourses));

  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('brand.800', 'brand.200');
  const inputBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated: For the "no courses" box
  
  if (isLoading) {
    return (
      <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }} display="flex" justifyContent="center" alignItems="center">
        <Container maxW="container.xl">
          <Text fontSize="xl" textAlign="center">Loading courses...</Text>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }} display="flex" justifyContent="center" alignItems="center">
        <Container maxW="container.xl">
          <Text fontSize="xl" textAlign="center" color="red.500">
            Failed to load courses. Please try again later. <br />
            Error: {error}
          </Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        <Box mb={{ base: 6, md: 8 }}>
          <Heading as="h1" size="2xl" mb={3} color={headingColor}>
            Explore Courses
          </Heading>
          <Text fontSize="lg" color={textColor}>
            Find the perfect IGCSE course to achieve your academic goals.
          </Text>
        </Box>
        
        {/* Search and Filter */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          mb={{ base: 6, md: 8 }}
          gap={4}
          align={{ base: 'stretch', md: 'center' }}
        >
          <InputGroup flex={1} maxW={{ base: '100%', md: 'auto' }}> {/* Allow input to take more space */}
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color={useColorModeValue('gray.400', 'gray.500')} />
            </InputLeftElement>
            <Input 
              placeholder="Search courses by title or description..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              bg={inputBg}
              size="lg" // Larger input
              borderRadius="md"
            />
          </InputGroup>
          
          <Select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
            bg={inputBg}
            size="lg" // Larger select
            borderRadius="md"
            colorScheme="brand"
          >
            <option value="popular">Popular First</option>
            <option value="new">Newest First</option>
            <option value="title">Alphabetical (A-Z)</option>
          </Select>
        </Flex>
        
        {/* Tabs */}
        <Tabs colorScheme="brand" variant="soft-rounded" mb={6}> {/* Themed tabs */}
          <TabList>
            <Tab fontWeight="semibold">My Courses ({filteredEnrolledCourses.length})</Tab>
            <Tab fontWeight="semibold">Discover ({filteredDiscoverCourses.length})</Tab>
          </TabList>
          
          <TabPanels>
            {/* My Courses Tab */}
            <TabPanel p={0} pt={6}>
              {filteredEnrolledCourses.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl:4 }} spacing={{ base: 4, md: 6 }}> {/* Responsive columns and spacing */}
                  {filteredEnrolledCourses.map(course => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box 
                  p={8} 
                  textAlign="center" 
                  bg={cardBg}
                  borderRadius="xl" // Consistent with CourseCard
                  boxShadow="md"
                >
                  <Text color={textColor}>You are not enrolled in any courses, or no courses match your search.</Text>
                </Box>
              )}
            </TabPanel>
            
            {/* Discover Tab */}
            <TabPanel p={0} pt={6}>
              {filteredDiscoverCourses.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl:4 }} spacing={{ base: 4, md: 6 }}> {/* Responsive columns and spacing */}
                  {filteredDiscoverCourses.map(course => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box 
                  p={8} 
                  textAlign="center" 
                  bg={cardBg}
                  borderRadius="xl" // Consistent with CourseCard
                  boxShadow="md"
                >
                  <Text color={textColor}>No courses found matching your criteria. Explore more soon!</Text>
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