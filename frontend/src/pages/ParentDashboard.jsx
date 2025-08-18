import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  SimpleGrid, 
  Card, 
  CardHeader, 
  CardBody, 
  Stack,
  Flex,
  Icon,
  Progress,
  HStack,
  VStack,
  Button,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  useColorModeValue,
  Avatar,
  AvatarBadge,
  Select,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { 
  FaBook, 
  FaCalendarAlt, 
  FaChartLine, 
  FaClock, 
  FaGraduationCap, 
  FaRegBell, 
  FaTasks, 
  FaTrophy,
  FaUserGraduate,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaChalkboardTeacher,
  FaUsers,
  FaEye,
  FaEnvelopeOpen
} from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const ParentDashboard = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childClasses, setChildClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const parentCardBg = useColorModeValue('parent.cardBg.default', 'parent.cardBg._dark');
  const parentPrimaryColor = useColorModeValue('parent.primary.default', 'parent.primary._dark');
  const parentSecondaryColor = useColorModeValue('parent.secondary.default', 'parent.secondary._dark');
  const generalHeadingColor = useColorModeValue('brand.800', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.500');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const parentIconContainerBg = useColorModeValue('green.50', 'blue.800');
  const parentIconColor = parentPrimaryColor;
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Load parent data on component mount
  useEffect(() => {
    if (authUser) {
      loadParentData();
    }
  }, [authUser]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll simulate children data since we don't have parent-child relationships set up
      // In a real system, you'd query for children linked to this parent
      const mockChildren = [
        {
          id: 'child1',
          name: 'Alex Johnson',
          grade: '10th Grade',
          email: 'alex@example.com',
          overallGrade: 'B+',
          progress: 68,
          streak: 7,
          attendance: 92,
          nextExam: 'Mathematics - 15 May 2024',
          alerts: 2
        },
        {
          id: 'child2', 
          name: 'Emma Johnson',
          grade: '8th Grade',
          email: 'emma@example.com',
          overallGrade: 'A-',
          progress: 85,
          streak: 12,
          attendance: 95,
          nextExam: 'Science - 18 May 2024',
          alerts: 0
        }
      ];
      
      setChildren(mockChildren);
      if (mockChildren.length > 0) {
        setSelectedChild(mockChildren[0]);
        await loadChildClasses(mockChildren[0].id);
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildClasses = async (childId) => {
    try {
      // In a real system, you'd query for the child's enrolled classes
      // For now, we'll use mock data
      const mockClasses = [
        {
          id: 'class1',
          name: 'Advanced Mathematics',
          subject: 'Mathematics',
          teacher: 'Dr. Sarah Williams',
          progress: 75,
          grade: 'B+',
          nextAssignment: 'Quadratic Equations Quiz - Due May 12'
        },
        {
          id: 'class2',
          name: 'Physics Fundamentals',
          subject: 'Physics', 
          teacher: 'Mr. David Chen',
          progress: 60,
          grade: 'B',
          nextAssignment: 'Lab Report - Due May 15'
        },
        {
          id: 'class3',
          name: 'English Literature',
          subject: 'English',
          teacher: 'Ms. Jennifer Brown',
          progress: 90,
          grade: 'A-',
          nextAssignment: 'Essay - Due May 20'
        }
      ];
      
      setChildClasses(mockClasses);
    } catch (error) {
      console.error('Error loading child classes:', error);
    }
  };

  const handleChildChange = async (childId) => {
    const child = children.find(c => c.id === childId);
    setSelectedChild(child);
    await loadChildClasses(childId);
  };

  const parentData = {
    name: authUser?.name || 'Parent',
    totalChildren: children.length,
    totalClasses: children.reduce((total, child) => total + 3, 0), // Mock: 3 classes per child
    upcomingExams: children.reduce((total, child) => total + 1, 0), // Mock: 1 exam per child
    alerts: children.reduce((total, child) => total + child.alerts, 0)
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading size="lg" color={generalHeadingColor} mb={2}>
              Welcome back, {parentData.name}!
            </Heading>
            <Text color={subtleTextColor}>
              Monitor your children's academic progress
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={FaEnvelopeOpen} />}
            colorScheme="green"
            variant="outline"
          >
            Contact Teachers
          </Button>
        </Flex>

        {/* Child Selector */}
        {children.length > 0 && (
          <Card bg={parentCardBg} boxShadow="lg" mb={6}>
            <CardBody>
              <Flex align="center" gap={4}>
                <Text fontWeight="semibold" color={textColor}>Select Child:</Text>
                <Select
                  value={selectedChild?.id || ''}
                  onChange={(e) => handleChildChange(e.target.value)}
                  maxW="300px"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} ({child.grade})
                    </option>
                  ))}
                </Select>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={parentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Total Children</StatLabel>
                <StatNumber color={parentPrimaryColor}>{parentData.totalChildren}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaUserGraduate} mr={2} />
                  Enrolled students
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Total Classes</StatLabel>
                <StatNumber color={parentPrimaryColor}>{parentData.totalClasses}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaBook} mr={2} />
                  Active courses
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Upcoming Exams</StatLabel>
                <StatNumber color={parentPrimaryColor}>{parentData.upcomingExams}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaCalendarAlt} mr={2} />
                  This week
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Alerts</StatLabel>
                <StatNumber color={parentPrimaryColor}>{parentData.alerts}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaRegBell} mr={2} />
                  Need attention
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content */}
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="lg" color={parentPrimaryColor} />
            <Text mt={4}>Loading dashboard...</Text>
          </Box>
        ) : selectedChild ? (
          <Tabs variant="enclosed" colorScheme="green">
            <TabList>
              <Tab>Child Overview</Tab>
              <Tab>Class Progress</Tab>
              <Tab>Communications</Tab>
            </TabList>

            <TabPanels>
              {/* Child Overview Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    {selectedChild.name}'s Overview
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                    <Card bg={parentCardBg} boxShadow="lg">
                      <CardHeader>
                        <Heading size="sm" color={parentPrimaryColor}>
                          Academic Performance
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Flex justify="space-between" align="center">
                            <Text color={textColor}>Overall Grade:</Text>
                            <Badge colorScheme="green" fontSize="md">
                              {selectedChild.overallGrade}
                            </Badge>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <Text color={textColor}>Progress:</Text>
                            <Text color={textColor} fontWeight="semibold">
                              {selectedChild.progress}%
                            </Text>
                          </Flex>
                          <Progress 
                            value={selectedChild.progress} 
                            colorScheme="green" 
                            size="sm"
                          />
                          <Flex justify="space-between" align="center">
                            <Text color={textColor}>Attendance:</Text>
                            <Text color={textColor} fontWeight="semibold">
                              {selectedChild.attendance}%
                            </Text>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <Text color={textColor}>Study Streak:</Text>
                            <Text color={textColor} fontWeight="semibold">
                              {selectedChild.streak} days
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg={parentCardBg} boxShadow="lg">
                      <CardHeader>
                        <Heading size="sm" color={parentPrimaryColor}>
                          Upcoming Events
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Box p={3} bg="orange.50" borderRadius="md">
                            <Text fontWeight="semibold" color="orange.700">
                              Next Exam: {selectedChild.nextExam}
                            </Text>
                          </Box>
                          {selectedChild.alerts > 0 && (
                            <Box p={3} bg="red.50" borderRadius="md">
                              <Text fontWeight="semibold" color="red.700">
                                {selectedChild.alerts} alert(s) need attention
                              </Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </Box>
              </TabPanel>

              {/* Class Progress Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    Class Progress
                  </Heading>
                  <Text color={subtleTextColor} mb={6}>
                    Detailed progress for each class
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {childClasses.map((cls) => (
                      <Card key={cls.id} bg={parentCardBg} boxShadow="lg">
                        <CardHeader>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Heading size="md" color={parentPrimaryColor}>
                                {cls.name}
                              </Heading>
                              <Text color={subtleTextColor} fontSize="sm">
                                {cls.subject}
                              </Text>
                            </Box>
                            <Badge colorScheme="green">
                              {cls.grade}
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Teacher:</Text>
                              <Text fontSize="sm" color={textColor}>
                                {cls.teacher}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Progress:</Text>
                              <Text fontSize="sm" color={textColor} fontWeight="semibold">
                                {cls.progress}%
                              </Text>
                            </Flex>
                            <Progress 
                              value={cls.progress} 
                              colorScheme="green" 
                              size="sm"
                            />
                            <Box p={2} bg="blue.50" borderRadius="md">
                              <Text fontSize="xs" color="blue.700">
                                Next: {cls.nextAssignment}
                              </Text>
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              </TabPanel>

              {/* Communications Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    Teacher Communications
                  </Heading>
                  <Text color={subtleTextColor} mb={6}>
                    Stay connected with your child's teachers
                  </Text>
                  
                  <Alert status="info" mb={6}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Communication Features Coming Soon!</AlertTitle>
                      <AlertDescription>
                        Direct messaging with teachers, progress reports, and notifications will be available in the next update.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Box textAlign="center" py={10}>
            <Icon as={FaUserGraduate} size="3xl" color={subtleTextColor} mb={4} />
            <Text fontSize="lg" color={textColor} mb={2}>
              No children linked to your account
            </Text>
            <Text color={subtleTextColor} mb={4}>
              Contact your school administrator to link your children's accounts.
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ParentDashboard; 