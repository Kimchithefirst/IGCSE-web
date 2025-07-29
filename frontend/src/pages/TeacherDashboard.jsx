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
  Input,
  InputGroup,
  InputLeftElement
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
  FaClipboardList,
  FaUserFriends,
  FaPencilAlt,
  FaSearch,
  FaFileAlt,
  FaPlus
} from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const TeacherDashboard = () => {
  // Mock data - would come from API in a real application
  const [selectedCourse, setSelectedCourse] = useState('math');
  
  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900'); // General page background
  // Teacher role-specific colors from theme
  const teacherCardBg = useColorModeValue('teacher.cardBg.default', 'teacher.cardBg._dark');
  const teacherPrimaryColor = useColorModeValue('teacher.primary.default', 'teacher.primary._dark');
  const teacherSecondaryColor = useColorModeValue('teacher.secondary.default', 'teacher.secondary._dark');

  const generalHeadingColor = useColorModeValue('brand.800', 'brand.200'); // For main page title
  const textColor = useColorModeValue('gray.700', 'gray.500'); // Default text
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  // Icon container for stat cards will use shades of teacher primary
  const teacherIconContainerBg = useColorModeValue('purple.50', 'purple.800'); // Assuming teacher.primary is purple-based
  const teacherIconColor = teacherPrimaryColor;

  const subtleBg = useColorModeValue('gray.50', 'gray.700'); // Keep for some neutral internal items if needed
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'secondary.700');
  const { user: authUser } = useAuth();

  const teacherData = {
    name: 'Dr. Sarah Williams', // This could come from authUser if available
    role: 'Mathematics Teacher',
    avatar: '',
    courses: 3,
    totalStudents: 87,
    upcomingClasses: 2,
    pendingGrading: 15,
    notifications: 4
  };
  
  // Mock courses taught by this teacher
  const courses = {
    math: {
      id: 'math',
      title: 'Mathematics (0580)',
      grade: '10th Grade',
      students: 32,
      avgPerformance: 76,
      lastClass: 'Monday, 10:00',
      nextClass: 'Wednesday, 10:00',
      pendingAssignments: 8,
      units: [
        { id: 1, title: 'Algebra II', completion: 85 },
        { id: 2, title: 'Geometry', completion: 60 },
        { id: 3, title: 'Calculus Basics', completion: 40 },
        { id: 4, title: 'Statistics', completion: 0 }
      ]
    },
    physics: {
      id: 'physics',
      title: 'Physics (0625)',
      grade: '11th Grade',
      students: 28,
      avgPerformance: 72,
      lastClass: 'Tuesday, 14:00',
      nextClass: 'Thursday, 14:00',
      pendingAssignments: 5,
      units: [
        { id: 1, title: 'Mechanics', completion: 90 },
        { id: 2, title: 'Electricity', completion: 75 },
        { id: 3, title: 'Waves', completion: 50 },
        { id: 4, title: 'Nuclear Physics', completion: 10 }
      ]
    },
    chemistry: {
      id: 'chemistry',
      title: 'Chemistry (0620)',
      grade: '9th Grade',
      students: 27,
      avgPerformance: 81,
      lastClass: 'Monday, 13:00',
      nextClass: 'Friday, 11:00',
      pendingAssignments: 2,
      units: [
        { id: 1, title: 'Periodic Table', completion: 100 },
        { id: 2, title: 'Chemical Bonding', completion: 80 },
        { id: 3, title: 'Organic Chemistry', completion: 30 },
        { id: 4, title: 'Analytical Chemistry', completion: 0 }
      ]
    }
  };

  const selectedCourseData = courses[selectedCourse];

  // Mock upcoming schedule
  const upcomingSchedule = [
    { id: 1, title: 'Mathematics (10th Grade)', type: 'Class', date: 'Wednesday, 15 May', time: '10:00 - 11:30', location: 'Room 203' },
    { id: 2, title: 'Physics (11th Grade)', type: 'Lab Session', date: 'Thursday, 16 May', time: '14:00 - 15:30', location: 'Physics Lab' },
    { id: 3, title: 'Chemistry (9th Grade)', type: 'Class', date: 'Friday, 17 May', time: '11:00 - 12:30', location: 'Room 105' },
    { id: 4, title: 'Faculty Meeting', type: 'Meeting', date: 'Friday, 17 May', time: '16:00 - 17:00', location: 'Conference Room' }
  ];

  // Mock student data for the selected course
  const studentPerformance = {
    math: [
      { id: 1, name: 'Alex Johnson', attendance: 95, overallGrade: 'A-', lastAssignment: 88, participation: 'High' },
      { id: 2, name: 'Emma Wilson', attendance: 92, overallGrade: 'B+', lastAssignment: 85, participation: 'Medium' },
      { id: 3, name: 'James Miller', attendance: 88, overallGrade: 'B', lastAssignment: 78, participation: 'High' },
      { id: 4, name: 'Sophia Brown', attendance: 98, overallGrade: 'A', lastAssignment: 95, participation: 'High' },
      { id: 5, name: 'Daniel Taylor', attendance: 85, overallGrade: 'C+', lastAssignment: 72, participation: 'Low' }
    ],
    physics: [
      { id: 1, name: 'Oliver Davis', attendance: 90, overallGrade: 'B+', lastAssignment: 84, participation: 'Medium' },
      { id: 2, name: 'Ava Moore', attendance: 95, overallGrade: 'A', lastAssignment: 92, participation: 'High' },
      { id: 3, name: 'Ethan Anderson', attendance: 82, overallGrade: 'B-', lastAssignment: 76, participation: 'Medium' },
      { id: 4, name: 'Isabella Thomas', attendance: 78, overallGrade: 'C+', lastAssignment: 69, participation: 'Low' },
      { id: 5, name: 'Lucas Jackson', attendance: 93, overallGrade: 'A-', lastAssignment: 88, participation: 'High' }
    ],
    chemistry: [
      { id: 1, name: 'Mia Martinez', attendance: 97, overallGrade: 'A', lastAssignment: 94, participation: 'High' },
      { id: 2, name: 'Noah Harris', attendance: 91, overallGrade: 'B+', lastAssignment: 86, participation: 'Medium' },
      { id: 3, name: 'Charlotte Clark', attendance: 89, overallGrade: 'B', lastAssignment: 82, participation: 'Medium' },
      { id: 4, name: 'Liam Lewis', attendance: 83, overallGrade: 'C+', lastAssignment: 75, participation: 'Low' },
      { id: 5, name: 'Amelia Young', attendance: 94, overallGrade: 'A-', lastAssignment: 89, participation: 'High' }
    ]
  }[selectedCourse];

  // Mock pending assignments
  const pendingAssignments = {
    math: [
      { id: 1, title: 'Quadratic Equations Quiz', type: 'Quiz', dueDate: '12 May 2024', submittedCount: 28, totalCount: 32 },
      { id: 2, title: 'Vectors and Matrices', type: 'Homework', dueDate: '14 May 2024', submittedCount: 25, totalCount: 32 },
      { id: 3, title: 'Mid-Term Test', type: 'Exam', dueDate: '20 May 2024', submittedCount: 0, totalCount: 32 }
    ],
    physics: [
      { id: 1, title: 'Newton\'s Laws Lab Report', type: 'Lab', dueDate: '15 May 2024', submittedCount: 22, totalCount: 28 },
      { id: 2, title: 'Circuit Diagrams', type: 'Homework', dueDate: '18 May 2024', submittedCount: 19, totalCount: 28 }
    ],
    chemistry: [
      { id: 1, title: 'Periodic Table Quiz', type: 'Quiz', dueDate: '14 May 2024', submittedCount: 25, totalCount: 27 },
      { id: 2, title: 'Chemical Reactions Lab', type: 'Lab', dueDate: '19 May 2024', submittedCount: 0, totalCount: 27 }
    ]
  }[selectedCourse];

  // Get participation color
  const getParticipationColor = (participation) => {
    switch(participation) {
      case 'High': return 'green';
      case 'Medium': return 'blue';
      case 'Low': return 'orange';
      default: return 'gray';
    }
  };

  // Get grade color
  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'green';
    if (grade.startsWith('B')) return 'blue';
    if (grade.startsWith('C')) return 'yellow';
    return 'red';
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading as="h1" size="xl" mb={1} color={generalHeadingColor}>
              Teacher Dashboard
            </Heading>
            <Text color={textColor}>
              Welcome, {authUser?.name || teacherData.name}! Manage your courses and students.
            </Text>
          </Box>
          <Flex align="center">
            <Box mr={4} position="relative" cursor="pointer" _hover={{ color: teacherPrimaryColor }}>
              <Icon as={FaRegBell} boxSize={6} color={subtleTextColor} />
              {teacherData.notifications > 0 && (
                <Box 
                  position="absolute" 
                  top="-5px" 
                  right="-5px" 
                  bg="red.500" 
                  borderRadius="full" 
                  w="18px" 
                  h="18px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  boxShadow="sm"
                >
                  <Text fontSize="xs" fontWeight="bold" color="white">{teacherData.notifications}</Text>
                </Box>
              )}
            </Box>
            <Avatar name={authUser?.name || teacherData.name} size="md" bg={teacherPrimaryColor} color="white">
              <AvatarBadge boxSize='1.25em' bg='green.500' borderColor={teacherCardBg} />
            </Avatar>
          </Flex>
        </Flex>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
          <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={teacherIconContainerBg} p={3} borderRadius="lg" mr={4}>
                    <Icon as={FaBook} boxSize={6} color={teacherIconColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Courses</StatLabel>
                    <StatNumber color={teacherPrimaryColor} fontWeight="bold">{teacherData.courses}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={useColorModeValue('gray.100', 'gray.700')} p={3} borderRadius="lg" mr={4}> {/* Teacher Secondary */}
                    <Icon as={FaUserGraduate} boxSize={6} color={teacherSecondaryColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Students</StatLabel>
                    <StatNumber color={teacherPrimaryColor} fontWeight="bold">{teacherData.totalStudents}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={teacherIconContainerBg} p={3} borderRadius="lg" mr={4}>
                    <Icon as={FaCalendarAlt} boxSize={6} color={teacherIconColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Upcoming Classes</StatLabel>
                    <StatNumber color={teacherPrimaryColor} fontWeight="bold">{teacherData.upcomingClasses}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={useColorModeValue('gray.100', 'gray.700')} p={3} borderRadius="lg" mr={4}> {/* Teacher Secondary */}
                    <Icon as={FaClipboardList} boxSize={6} color={teacherSecondaryColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Pending Grading</StatLabel>
                    <StatNumber color={teacherPrimaryColor} fontWeight="bold">{teacherData.pendingGrading}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Course Selector */}
        <Card mb={{ base: 6, md: 8 }} bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
          <CardBody p={{ base: 4, md: 6 }}>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'stretch', md: 'center' }}
              gap={4}
            >
              <HStack spacing={3}>
                <Icon as={FaChalkboardTeacher} boxSize={6} color={teacherPrimaryColor} />
                <Text fontWeight="semibold" color={textColor} whiteSpace="nowrap">Managing Course:</Text>
              </HStack>
              <Select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                maxW={{ base: 'full', md: '350px' }}
                size="lg"
                bg={inputBg}
                borderColor={subtleBorderColor}
                borderRadius="md"
                focusBorderColor={teacherPrimaryColor}
              >
                {Object.values(courses).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.grade})
                  </option>
                ))}
              </Select>
              <HStack spacing={3} wrap="wrap" justify={{base: "center", md: "flex-end"}}>
                <Badge colorScheme="purple" variant="subtle" px={3} py={1}>{selectedCourseData.students} Students</Badge>
                <Badge colorScheme="green" variant="subtle" px={3} py={1}>Avg. Performance: {selectedCourseData.avgPerformance}%</Badge>
                <Badge colorScheme="orange" variant="subtle" px={3} py={1}>{selectedCourseData.pendingAssignments} Pending Assignments</Badge>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2.5fr 1.5fr" }}
          gap={{ base: 6, md: 8 }}
        >
          {/* Left Column - Students & Assignments */}
          <GridItem>
            <Tabs colorScheme="purple" variant="soft-rounded" mb={{ base: 6, md: 8 }}> {/* teacher.primary colorScheme */}
              <TabList>
                <Tab fontWeight="semibold">Students</Tab>
                <Tab fontWeight="semibold">Assignments</Tab>
                <Tab fontWeight="semibold">Course Content</Tab>
              </TabList>
              
              <TabPanels>
                {/* Students Tab */}
                <TabPanel px={0} pt={4}>
                  <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
                    <CardHeader>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={3}>
                          <Icon as={FaUserGraduate} color={teacherPrimaryColor} boxSize={6} />
                          <Heading size="lg" color={generalHeadingColor}>Students</Heading>
                        </HStack>
                        <InputGroup maxW={{ base: "full", sm: "250px" }}>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaSearch} color={subtleTextColor} />
                          </InputLeftElement>
                          <Input placeholder="Search students..." bg={inputBg} borderRadius="md" borderColor={subtleBorderColor} focusBorderColor={teacherPrimaryColor}/>
                        </InputGroup>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Box overflowX="auto">
                        <Table variant="simple" size="md">
                          <Thead>
                            <Tr>
                              <Th color={subtleTextColor}>Student</Th>
                              <Th color={subtleTextColor}>Attendance</Th>
                              <Th color={subtleTextColor}>Grade</Th>
                              <Th color={subtleTextColor}>Last Assignment</Th>
                              <Th color={subtleTextColor}>Participation</Th>
                              <Th color={subtleTextColor}>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {studentPerformance.map(student => (
                              <Tr key={student.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                <Td fontWeight="medium" color={textColor}>{student.name}</Td>
                                <Td color={textColor}>
                                  <Flex align="center">
                                    <Text mr={2}>{student.attendance}%</Text>
                                    <Badge variant="subtle" colorScheme={student.attendance >= 90 ? 'green' : student.attendance >= 80 ? 'yellow' : 'red'}>
                                      {student.attendance >= 90 ? 'Excellent' : student.attendance >= 80 ? 'Good' : 'Poor'}
                                    </Badge>
                                  </Flex>
                                </Td>
                                <Td>
                                  <Badge variant="subtle" colorScheme={getGradeColor(student.overallGrade)} px={2} py={0.5} borderRadius="md">
                                    {student.overallGrade}
                                  </Badge>
                                </Td>
                                <Td color={textColor}>{student.lastAssignment}/100</Td>
                                <Td>
                                  <Badge variant="subtle" colorScheme={getParticipationColor(student.participation)} px={2} py={0.5} borderRadius="md">
                                    {student.participation}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button size="xs" colorScheme="purple" variant="outline">Details</Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                      <Flex justify="space-between" mt={4} wrap="wrap" gap={2}>
                        <Button size="sm" colorScheme="purple" variant="outline" leftIcon={<Icon as={FaFileAlt} />}>
                          Export Report
                        </Button>
                        <Button size="sm" bg={teacherPrimaryColor} color="white" _hover={{bg: useColorModeValue('purple.500', 'purple.200')}} leftIcon={<Icon as={FaEnvelope} />}>
                          Contact Parents
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                </TabPanel>
                
                {/* Assignments Tab */}
                <TabPanel px={0} pt={4}>
                  <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
                    <CardHeader>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={3}>
                          <Icon as={FaClipboardList} color={teacherSecondaryColor} boxSize={6} /> {/* Teacher secondary */}
                          <Heading size="lg" color={generalHeadingColor}>Assignments</Heading>
                        </HStack>
                        <Button bg={teacherPrimaryColor} color="white" _hover={{bg: useColorModeValue('purple.500', 'purple.200')}} size="sm" leftIcon={<Icon as={FaPlus} />}>
                          New Assignment
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Box overflowX="auto">
                        <Table variant="simple" size="md">
                          <Thead>
                            <Tr>
                              <Th color={subtleTextColor}>Assignment</Th>
                              <Th color={subtleTextColor}>Type</Th>
                              <Th color={subtleTextColor}>Due Date</Th>
                              <Th color={subtleTextColor}>Submissions</Th>
                              <Th color={subtleTextColor}>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {pendingAssignments.map(assignment => (
                              <Tr key={assignment.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                <Td fontWeight="medium" color={textColor}>{assignment.title}</Td>
                                <Td>
                                  <Badge
                                    variant="subtle"
                                    colorScheme={
                                      assignment.type === 'Exam' ? 'pink' :
                                      assignment.type === 'Quiz' ? 'purple' :
                                      assignment.type === 'Lab' ? 'green' : 'gray'
                                    }
                                    px={2} py={0.5} borderRadius="md"
                                  >
                                    {assignment.type}
                                  </Badge>
                                </Td>
                                <Td color={textColor}>{assignment.dueDate}</Td>
                                <Td>
                                  <Flex align="center">
                                    <Progress
                                      value={(assignment.submittedCount / assignment.totalCount) * 100}
                                      size="sm"
                                      colorScheme="purple"
                                      borderRadius="full"
                                      w={{ base: "80px", md: "100px" }}
                                      mr={2}
                                      bg={useColorModeValue('purple.100', 'purple.700')}
                                    />
                                    <Text fontSize="sm" color={textColor}>
                                      {assignment.submittedCount}/{assignment.totalCount}
                                    </Text>
                                  </Flex>
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <Button size="xs" colorScheme="orange" leftIcon={<Icon as={FaPencilAlt} boxSize={3} />}>
                                      Grade
                                    </Button>
                                    <Button size="xs" colorScheme="purple" variant="outline">
                                      Details
                                    </Button>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                      <Divider my={4} borderColor={subtleBorderColor} />
                      <Heading size="md" mb={3} color={generalHeadingColor}>Past Assignments</Heading>
                      <Button size="sm" colorScheme="purple" variant="outline" w="full">
                        View All Past Assignments
                      </Button>
                    </CardBody>
                  </Card>
                </TabPanel>
                
                {/* Course Content Tab */}
                <TabPanel px={0} pt={4}>
                  <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
                    <CardHeader>
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={3}>
                          <Icon as={FaBook} color={teacherPrimaryColor} boxSize={6} />
                          <Heading size="lg" color={generalHeadingColor}>Course Material</Heading>
                        </HStack>
                        <Button bg={teacherPrimaryColor} color="white" _hover={{bg: useColorModeValue('purple.500', 'purple.200')}} size="sm" leftIcon={<Icon as={FaPlus} />}>
                          Add Material
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {selectedCourseData.units.map(unit => (
                          <Box
                            key={unit.id}
                            p={4}
                            bg={subtleBg}
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor={subtleBorderColor}
                          >
                            <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
                              <Heading size="md" color={textColor}>{unit.title}</Heading>
                              <Text fontSize="sm" color={subtleTextColor} fontWeight="medium">
                                {unit.completion}% Complete
                              </Text>
                            </Flex>
                            <Progress 
                              value={unit.completion} 
                              size="sm" 
                              colorScheme="purple"
                              borderRadius="full" 
                              mb={3}
                              bg={useColorModeValue('purple.100', 'purple.700')}
                            />
                            <Flex justify="flex-end">
                              <HStack spacing={2}>
                                <Button size="xs" colorScheme="purple" variant="outline">
                                  Materials
                                </Button>
                                <Button size="xs" bg={teacherPrimaryColor} color="white" _hover={{bg: useColorModeValue('purple.500', 'purple.200')}}>
                                  Manage
                                </Button>
                              </HStack>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>

          {/* Right Column - Schedule & Actions */}
          <GridItem>
            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
              {/* Schedule */}
              <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaCalendarAlt} color={teacherSecondaryColor} boxSize={6} /> {/* Teacher secondary */}
                    <Heading size="lg" color={generalHeadingColor}>Upcoming Schedule</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {upcomingSchedule.map(item => (
                      <Box 
                        key={item.id} 
                        p={4}
                        bg={
                          item.type === 'Class' ? useColorModeValue('purple.50', 'purple.800') : // teacher primary shade
                          item.type === 'Lab Session' ? useColorModeValue('green.50', 'green.800') : // teacher secondary shade
                          item.type === 'Meeting' ? useColorModeValue('gray.100', 'gray.700') : subtleBg
                        } 
                        borderRadius="lg"
                      >
                        <Flex justify="space-between" align="center" mb={1} wrap="wrap" gap={1}>
                          <Heading size="sm" color={textColor}>{item.title}</Heading>
                          <Badge 
                            variant="subtle"
                            colorScheme={
                              item.type === 'Class' ? 'purple' :
                              item.type === 'Lab Session' ? 'green' : 
                              item.type === 'Meeting' ? 'gray' : 'gray'
                            }
                            px={2} py={0.5} borderRadius="md"
                          >
                            {item.type}
                          </Badge>
                        </Flex>
                        <Flex justify="space-between" align="center" color={subtleTextColor} wrap="wrap" gap={1}>
                          <Text fontSize="sm">{item.date}</Text>
                          <Text fontSize="sm">{item.time}</Text>
                        </Flex>
                        <Text fontSize="xs" mt={1} color={subtleTextColor}>
                          Location: {item.location}
                        </Text>
                      </Box>
                    ))}
                    <Button size="sm" colorScheme="green" variant="outline" w="full" mt={2}> {/* teacher secondary */}
                      View Full Schedule
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Course Analytics */}
              <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaChartLine} color={teacherPrimaryColor} boxSize={6} />
                    <Heading size="lg" color={generalHeadingColor}>Course Analytics</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{base: 1, sm:2}} spacing={4} mb={4}>
                    <Stat>
                      <StatLabel color={subtleTextColor}>Average Grade</StatLabel>
                      <StatNumber color={teacherPrimaryColor}>{selectedCourseData.avgPerformance}%</StatNumber>
                      <StatHelpText>
                        <Badge variant="subtle" colorScheme={selectedCourseData.avgPerformance >= 80 ? 'green' : selectedCourseData.avgPerformance >= 70 ? 'purple' : 'yellow'}>
                          {selectedCourseData.avgPerformance >= 80 ? 'Excellent' : selectedCourseData.avgPerformance >= 70 ? 'Good' : 'Fair'}
                        </Badge>
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel color={subtleTextColor}>Attendance Rate</StatLabel>
                      <StatNumber color={teacherPrimaryColor}>91%</StatNumber> {/* Mock data */}
                      <StatHelpText>
                        <Badge variant="subtle" colorScheme="green">Above Target</Badge>
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel color={subtleTextColor}>Completion Rate</StatLabel>
                      <StatNumber color={teacherPrimaryColor}>68%</StatNumber> {/* Mock data */}
                      <StatHelpText color={subtleTextColor}>Course Material</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel color={subtleTextColor}>Participation</StatLabel>
                      <StatNumber color={teacherPrimaryColor}>76%</StatNumber> {/* Mock data */}
                      <StatHelpText color={subtleTextColor}>Active Students</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                  <Button size="sm" colorScheme="purple" variant="outline" w="full">
                    View Detailed Analytics
                  </Button>
                </CardBody>
              </Card>

              {/* Teacher Actions */}
              <Card bg={teacherCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaChalkboardTeacher} color={teacherPrimaryColor} boxSize={6} />
                    <Heading size="lg" color={generalHeadingColor}>Quick Actions</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Button bg={teacherPrimaryColor} color="white" _hover={{bg: useColorModeValue('purple.500', 'purple.200')}} leftIcon={<Icon as={FaEnvelope} />}>
                      Message Students
                    </Button>
                    <Button colorScheme="purple" variant="outline" leftIcon={<Icon as={FaFileAlt} />}>
                      Create Lesson Plan
                    </Button>
                    <Button colorScheme="purple" variant="outline" leftIcon={<Icon as={FaClipboardList} />}>
                      Create Assessment
                    </Button>
                    <Button colorScheme="purple" variant="outline" leftIcon={<Icon as={FaUserFriends} />}>
                      Schedule Parent Meeting
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default TeacherDashboard; 