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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
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
  Divider,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FaBook, 
  FaCalendarAlt,
  FaPlayCircle,
  FaChartLine, 
  FaClock, 
  FaGraduationCap, 
  FaRegBell, 
  FaTasks, 
  FaTrophy,
  FaPlus,
  FaSearch,
  FaUsers,
  FaChalkboardTeacher,
  FaEye,
  FaSignInAlt
} from 'react-icons/fa';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const StudentDashboard = () => {
  const { user: authUser } = useSupabaseAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningClass, setJoiningClass] = useState(false);

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const studentCardBg = useColorModeValue('student.cardBg.default', 'student.cardBg._dark');
  const studentPrimaryColor = useColorModeValue('student.primary.default', 'student.primary._dark');
  const studentSecondaryColor = useColorModeValue('student.secondary.default', 'student.secondary._dark');
  const generalHeadingColor = useColorModeValue('brand.800', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.500');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const studentIconContainerBg = useColorModeValue('teal.50', 'teal.800');
  const studentIconColor = studentPrimaryColor;
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');

  // Load student data on component mount
  useEffect(() => {
    if (authUser) {
      loadStudentData();
    }
  }, [authUser]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Load enrolled classes
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('class_students')
        .select('*, class:classes(*)')
        .eq('student_id', authUser.id);

      if (enrolledError) {
        console.error('Error loading enrolled classes:', enrolledError);
      } else {
        setEnrolledClasses(enrolledData || []);
      }

      // Load available classes (classes not enrolled in)
      const { data: availableData, error: availableError } = await supabase
        .from('classes')
        .select('*')
        .not('id', 'in', `(${enrolledData?.map(c => c.class_id).join(',') || '00000000-0000-0000-0000-000000000000'})`);

      if (availableError) {
        console.error('Error loading available classes:', availableError);
      } else {
        setAvailableClasses(availableData || []);
      }

      // Load assignments for enrolled classes
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(name, subject)
        `)
        .in('class_id', enrolledData?.map(c => c.class_id) || []);

      if (assignmentsError) {
        console.error('Error loading assignments:', assignmentsError);
      } else {
        const assignmentsWithClassNames = assignmentsData?.map(assignment => ({
          ...assignment,
          class_name: assignment.class?.name || 'Unknown Class',
          class_subject: assignment.class?.subject || 'Unknown Subject'
        })) || [];
        setAssignments(assignmentsWithClassNames);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinClassByCode = async () => {
    if (!classCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a class code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setJoiningClass(true);

      // Find class by code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('class_code', classCode.toUpperCase())
        .single();

      if (classError || !classData) {
        throw new Error('Class not found. Please check the class code.');
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', classData.id)
        .eq('student_id', authUser.id)
        .single();

      if (existingEnrollment) {
        throw new Error('You are already enrolled in this class.');
      }

      // Check if class is full
      const { count: studentCount } = await supabase
        .from('class_students')
        .select('*', { count: 'exact' })
        .eq('class_id', classData.id);

      if (studentCount >= classData.max_students) {
        throw new Error('This class is full.');
      }

      // Join the class
      const { error: joinError } = await supabase
        .from('class_students')
        .insert({
          class_id: classData.id,
          student_id: authUser.id
        });

      if (joinError) {
        throw joinError;
      }

      toast({
        title: 'Success!',
        description: `You have joined ${classData.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setClassCode('');
      setIsJoinClassOpen(false);
      loadStudentData(); // Reload data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setJoiningClass(false);
    }
  };

  const studentData = {
    name: authUser?.name || 'Student',
    enrolledClasses: enrolledClasses.length,
    totalProgress: enrolledClasses.length > 0 ? 75 : 0, // Mock progress
    streak: 7,
    nextExam: 'Mathematics - 15 May 2024'
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading size="lg" color={generalHeadingColor} mb={2}>
              Welcome back, {studentData.name}!
            </Heading>
            <Text color={subtleTextColor}>
              Continue your learning journey
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={FaPlus} />}
            colorScheme="teal"
            onClick={() => setIsJoinClassOpen(true)}
          >
            Join Class
          </Button>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={studentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Enrolled Classes</StatLabel>
                <StatNumber color={studentPrimaryColor}>{studentData.enrolledClasses}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaBook} mr={2} />
                  Active courses
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={studentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Overall Progress</StatLabel>
                <StatNumber color={studentPrimaryColor}>{studentData.totalProgress}%</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaChartLine} mr={2} />
                  Course completion
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={studentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Study Streak</StatLabel>
                <StatNumber color={studentPrimaryColor}>{studentData.streak} days</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaTrophy} mr={2} />
                  Keep it up!
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={studentCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Next Exam</StatLabel>
                <StatNumber color={studentPrimaryColor} fontSize="lg">15 May</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaCalendarAlt} mr={2} />
                  Mathematics
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content */}
        <Tabs variant="enclosed" colorScheme="teal">
          <TabList>
            <Tab>My Classes</Tab>
            <Tab>Assignments</Tab>
            <Tab>Available Classes</Tab>
            <Tab>Progress</Tab>
          </TabList>

          <TabPanels>
            {/* My Classes Tab */}
            <TabPanel>
              {loading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="lg" color={studentPrimaryColor} />
                  <Text mt={4}>Loading your classes...</Text>
                </Box>
              ) : enrolledClasses.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Icon as={FaBook} size="3xl" color={subtleTextColor} mb={4} />
                  <Text fontSize="lg" color={textColor} mb={2}>
                    No classes enrolled yet
                  </Text>
                  <Text color={subtleTextColor} mb={4}>
                    Join a class to get started with your learning
                  </Text>
                  <Button
                    leftIcon={<Icon as={FaPlus} />}
                    colorScheme="teal"
                    onClick={() => setIsJoinClassOpen(true)}
                  >
                    Join Your First Class
                  </Button>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {enrolledClasses.map((enrollment) => (
                    <Card key={enrollment.id} bg={studentCardBg} boxShadow="lg">
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Heading size="md" color={studentPrimaryColor}>
                              {enrollment.class.name}
                            </Heading>
                            <Text color={subtleTextColor} fontSize="sm">
                              {enrollment.class.subject}
                            </Text>
                          </Box>
                          <Badge colorScheme="teal">
                            Enrolled
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Text color={textColor} mb={4}>
                          {enrollment.class.description || 'No description provided'}
                        </Text>
                        <VStack spacing={3} align="stretch">
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color={subtleTextColor}>Teacher:</Text>
                            <Text fontSize="sm" color={textColor}>
                              {enrollment.class.teacher?.full_name || 'Unknown'}
                            </Text>
                          </Flex>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color={subtleTextColor}>Class Code:</Text>
                            <Badge variant="outline" colorScheme="teal">
                              {enrollment.class.class_code}
                            </Badge>
                          </Flex>
                        </VStack>
                        <Flex gap={2} mt={4}>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaPlayCircle} />}
                            colorScheme="teal"
                            variant="outline"
                            as={RouterLink}
                            to={`/courses/${enrollment.class.id}`}
                          >
                            Start Learning
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaEye} />}
                            variant="ghost"
                            colorScheme="teal"
                          >
                            View Details
                          </Button>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
                         </TabPanel>

             {/* Assignments Tab */}
             <TabPanel>
               <Box>
                 <Heading size="lg" color={studentPrimaryColor} mb={6}>
                   My Assignments
                 </Heading>

                 {loading ? (
                   <Text>Loading assignments...</Text>
                 ) : assignments.length === 0 ? (
                   <Alert status="info">
                     <AlertIcon />
                     <Box>
                       <AlertTitle>No assignments yet!</AlertTitle>
                       <AlertDescription>
                         Assignments from your enrolled classes will appear here.
                       </AlertDescription>
                     </Box>
                   </Alert>
                 ) : (
                   <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                     {assignments.map((assignment) => (
                       <Card key={assignment.id} bg={studentCardBg} boxShadow="lg">
                         <CardHeader>
                           <Flex justify="space-between" align="center">
                             <Box>
                               <Heading size="md" color={studentPrimaryColor}>
                                 {assignment.title}
                               </Heading>
                               <Text color={subtleTextColor} fontSize="sm">
                                 {assignment.class_name} - {assignment.class_subject}
                               </Text>
                             </Box>
                             <Badge
                               colorScheme={
                                 assignment.status === 'published' ? 'green' :
                                 assignment.status === 'draft' ? 'yellow' : 'red'
                               }
                             >
                               {assignment.status}
                             </Badge>
                           </Flex>
                         </CardHeader>
                         <CardBody>
                           <Text color={textColor} mb={4}>
                             {assignment.description || 'No description provided'}
                           </Text>
                           <VStack align="start" spacing={2} mb={4}>
                             <HStack>
                               <Icon as={FaCalendarAlt} color={studentIconColor} />
                               <Text fontSize="sm" color={subtleTextColor}>
                                 Due: {new Date(assignment.due_date).toLocaleDateString()}
                               </Text>
                             </HStack>
                             <HStack>
                               <Icon as={FaTrophy} color={studentIconColor} />
                               <Text fontSize="sm" color={subtleTextColor}>
                                 {assignment.total_points} points
                               </Text>
                             </HStack>
                             <HStack>
                               <Icon as={FaFileAlt} color={studentIconColor} />
                               <Text fontSize="sm" color={subtleTextColor}>
                                 {assignment.assignment_type}
                               </Text>
                             </HStack>
                           </VStack>
                           <Flex gap={2}>
                             <Button size="sm" variant="outline" colorScheme="teal">
                               View Details
                             </Button>
                             <Button size="sm" variant="outline" colorScheme="teal">
                               Submit Work
                             </Button>
                           </Flex>
                         </CardBody>
                       </Card>
                     ))}
                   </SimpleGrid>
                 )}
               </Box>
             </TabPanel>

             {/* Available Classes Tab */}
            <TabPanel>
              <Box>
                <Heading size="md" color={studentPrimaryColor} mb={4}>
                  Available Classes
                </Heading>
                <Text color={subtleTextColor} mb={6}>
                  Discover and join new classes
                </Text>
                
                {availableClasses.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>No Available Classes</AlertTitle>
                      <AlertDescription>
                        All classes are currently full or you're already enrolled in them.
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {availableClasses.map((cls) => (
                      <Card key={cls.id} bg={studentCardBg} boxShadow="lg">
                        <CardHeader>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Heading size="md" color={studentPrimaryColor}>
                                {cls.name}
                              </Heading>
                              <Text color={subtleTextColor} fontSize="sm">
                                {cls.subject}
                              </Text>
                            </Box>
                            <Badge colorScheme="blue">
                              {cls.students?.[0]?.count || 0}/{cls.max_students} students
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <Text color={textColor} mb={4}>
                            {cls.description || 'No description provided'}
                          </Text>
                          <VStack spacing={3} align="stretch">
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Teacher:</Text>
                              <Text fontSize="sm" color={textColor}>
                                {cls.teacher?.full_name || 'Unknown'}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Class Code:</Text>
                              <Badge variant="outline" colorScheme="blue">
                                {cls.class_code}
                              </Badge>
                            </Flex>
                          </VStack>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaSignInAlt} />}
                            colorScheme="teal"
                            variant="outline"
                            w="full"
                            mt={4}
                            onClick={() => {
                              setClassCode(cls.class_code);
                              setIsJoinClassOpen(true);
                            }}
                          >
                            Join Class
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            </TabPanel>

            {/* Progress Tab */}
            <TabPanel>
              <Box>
                <Heading size="md" color={studentPrimaryColor} mb={4}>
                  Learning Progress
                </Heading>
                <Text color={subtleTextColor} mb={6}>
                  Track your performance across all classes
                </Text>
                
                <Alert status="info" mb={6}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Progress Tracking Coming Soon!</AlertTitle>
                    <AlertDescription>
                      Detailed progress tracking and analytics will be available in the next update.
                    </AlertDescription>
                  </Box>
                </Alert>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Join Class Modal */}
        <Modal isOpen={isJoinClassOpen} onClose={() => setIsJoinClassOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Join a Class</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Class Code</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaSearch} color={subtleTextColor} />
                    </InputLeftElement>
                    <Input
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="Enter class code (e.g., ABC12345)"
                      maxLength={8}
                    />
                  </InputGroup>
                </FormControl>
                
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    Ask your teacher for the class code to join their class.
                  </AlertDescription>
                </Alert>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsJoinClassOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="teal" 
                onClick={joinClassByCode}
                isLoading={joiningClass}
                isDisabled={!classCode.trim()}
              >
                Join Class
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default StudentDashboard; 