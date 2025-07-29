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
  Td
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
  FaChalkboardTeacher
} from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const ParentDashboard = () => {
  // Mock data - would come from API in a real application
  const [selectedChild, setSelectedChild] = useState('alex');

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900'); // Keep page background neutral
  // Parent role-specific colors from theme
  const parentCardBg = useColorModeValue('parent.cardBg.default', 'parent.cardBg._dark');
  const parentPrimaryColor = useColorModeValue('parent.primary.default', 'parent.primary._dark');
  const parentSecondaryColor = useColorModeValue('parent.secondary.default', 'parent.secondary._dark');

  const generalHeadingColor = useColorModeValue('brand.800', 'brand.200'); // For main page title
  const textColor = useColorModeValue('gray.700', 'gray.500'); // Default text
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  // Icon container for stat cards will use shades of parent primary
  const parentIconContainerBg = useColorModeValue('green.50', 'blue.800'); // Assuming parent.primary is green(light)/blue(dark)
  const parentIconColor = parentPrimaryColor;

  const subtleBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'secondary.700');
  const { user: authUser } = useAuth();
  
  const children = {
    alex: {
      name: 'Alex Johnson',
      grade: '10th Grade',
      avatar: '',
      courses: 4,
      overallGrade: 'B+',
      progress: 68,
      streak: 7,
      attendance: 92,
      nextExam: 'Mathematics - 15 May 2024',
      alerts: 2
    },
    emma: {
      name: 'Emma Johnson',
      grade: '8th Grade',
      avatar: '',
      courses: 3,
      overallGrade: 'A-',
      progress: 81,
      streak: 12,
      attendance: 96,
      nextExam: 'Biology - 22 May 2024',
      alerts: 0
    }
  };
  
  const childData = children[selectedChild];

  // Mock enrolled courses for the selected child
  const enrolledCourses = {
    alex: [
      { id: 1, title: 'Mathematics (0580)', progress: 75, grade: 'B', lastActivity: '2 days ago' },
      { id: 2, title: 'Physics (0625)', progress: 62, grade: 'C+', lastActivity: '5 days ago' },
      { id: 3, title: 'Biology (0610)', progress: 88, grade: 'A', lastActivity: 'Yesterday' },
      { id: 4, title: 'Chemistry (0620)', progress: 45, grade: 'B-', lastActivity: '1 week ago' }
    ],
    emma: [
      { id: 1, title: 'Mathematics (0580)', progress: 82, grade: 'A-', lastActivity: '1 day ago' },
      { id: 2, title: 'English (0500)', progress: 75, grade: 'B+', lastActivity: '3 days ago' },
      { id: 3, title: 'Geography (0460)', progress: 92, grade: 'A', lastActivity: 'Yesterday' }
    ]
  }[selectedChild];

  const upcomingExams = {
    alex: [
      { id: 1, title: 'Mathematics Mock Exam', date: '15 May 2024', time: '10:00', readiness: 'Medium' },
      { id: 2, title: 'Physics Unit Test', date: '22 May 2024', time: '14:00', readiness: 'Low' }
    ],
    emma: [
      { id: 1, title: 'Biology Mid-Term', date: '22 May 2024', time: '09:00', readiness: 'High' },
      { id: 2, title: 'Geography Project Due', date: '5 June 2024', time: '15:00', readiness: 'Medium' }
    ]
  }[selectedChild];

  const recentActivities = {
    alex: [
      { id: 1, title: 'Completed Mathematics Quiz', time: '2 days ago', score: '75%' },
      { id: 2, title: 'Watched Physics Lecture', time: '5 days ago', score: '' },
      { id: 3, title: 'Submitted Biology Assignment', time: '1 week ago', score: 'B+' },
      { id: 4, title: 'Missed Chemistry Homework', time: '2 weeks ago', score: '', type: 'alert' }
    ],
    emma: [
      { id: 1, title: 'Completed English Essay', time: '1 day ago', score: 'A-' },
      { id: 2, title: 'Geography Map Quiz', time: '3 days ago', score: '92%' },
      { id: 3, title: 'Mathematics Practise Test', time: '4 days ago', score: '85%' }
    ]
  }[selectedChild];

  const teacherContacts = {
    alex: [
      { id: 1, name: 'Dr. Sarah Williams', subject: 'Mathematics', email: 'swilliams@school.edu', phone: '+1-555-123-4567' },
      { id: 2, name: 'Mr. Robert Chen', subject: 'Physics', email: 'rchen@school.edu', phone: '+1-555-234-5678' },
      { id: 3, name: 'Ms. Ava Rodriguez', subject: 'Biology', email: 'arodriguez@school.edu', phone: '+1-555-345-6789' },
      { id: 4, name: 'Dr. James Parker', subject: 'Chemistry', email: 'jparker@school.edu', phone: '+1-555-456-7890' }
    ],
    emma: [
      { id: 1, name: 'Ms. Lisa Thompson', subject: 'Mathematics', email: 'lthompson@school.edu', phone: '+1-555-567-8901' },
      { id: 2, name: 'Mr. Daniel Brooks', subject: 'English', email: 'dbrooks@school.edu', phone: '+1-555-678-9012' },
      { id: 3, name: 'Dr. Olivia Martin', subject: 'Geography', email: 'omartin@school.edu', phone: '+1-555-789-0123' }
    ]
  }[selectedChild];

  const getReadinessColor = (readiness) => {
    switch(readiness) {
      case 'High': return 'green';
      case 'Medium': return 'orange';
      case 'Low': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading as="h1" size="xl" mb={1} color={generalHeadingColor}>
              Parent Dashboard
            </Heading>
            <Text color={textColor}>
              Monitor {childData.name}'s academic progress and activities.
            </Text>
          </Box>
          <Flex align="center">
            <Box mr={4} position="relative" cursor="pointer" _hover={{ color: parentPrimaryColor }}>
              <Icon as={FaRegBell} boxSize={6} color={subtleTextColor} />
              {childData.alerts > 0 && (
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
                  <Text fontSize="xs" fontWeight="bold" color="white">{childData.alerts}</Text>
                </Box>
              )}
            </Box>
            <Avatar name={authUser?.name || "Parent User"} size="md" bg={parentPrimaryColor} color="white">
              <AvatarBadge boxSize='1.25em' bg='green.500' borderColor={parentCardBg} />
            </Avatar>
          </Flex>
        </Flex>

        {/* Child Selector */}
        <Card mb={{ base: 6, md: 8 }} bg={parentCardBg} boxShadow="lg" borderRadius="xl">
          <CardBody p={{ base: 4, md: 6 }}>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'stretch', md: 'center' }}
              gap={4}
            >
              <HStack spacing={3}>
                <Icon as={FaUserGraduate} boxSize={6} color={parentPrimaryColor} />
                <Text fontWeight="semibold" color={textColor} whiteSpace="nowrap">Viewing For:</Text>
              </HStack>
              <Select 
                value={selectedChild} 
                onChange={(e) => setSelectedChild(e.target.value)}
                maxW={{ base: 'full', md: '300px' }}
                size="lg"
                bg={inputBg}
                borderColor={subtleBorderColor}
                borderRadius="md"
                focusBorderColor={parentPrimaryColor}
              >
                <option value="alex">Alex Johnson ({children.alex.grade})</option>
                <option value="emma">Emma Johnson ({children.emma.grade})</option>
              </Select>
              <HStack spacing={3} wrap="wrap" justify={{base: "center", md: "flex-end"}}>
                <Badge colorScheme="green" variant="subtle" px={3} py={1}>{childData.grade}</Badge>
                <Badge colorScheme="pink" variant="subtle" px={3} py={1}>{childData.courses} Courses</Badge>
                <Badge colorScheme="green" variant="subtle" px={3} py={1}>Overall Grade: {childData.overallGrade}</Badge>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
          <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={parentIconContainerBg} p={3} borderRadius="lg" mr={4}>
                    <Icon as={FaGraduationCap} boxSize={6} color={parentIconColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Overall Grade</StatLabel>
                    <StatNumber color={parentPrimaryColor} fontWeight="bold">{childData.overallGrade}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={useColorModeValue('pink.50', 'pink.800')} p={3} borderRadius="lg" mr={4}> {/* Parent Secondary */}
                    <Icon as={FaCalendarAlt} boxSize={6} color={parentSecondaryColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Attendance</StatLabel>
                    <StatNumber color={parentPrimaryColor} fontWeight="bold">{childData.attendance}%</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={parentIconContainerBg} p={3} borderRadius="lg" mr={4}>
                    <Icon as={FaChartLine} boxSize={6} color={parentIconColor} />
                  </Box>
                  <Box flex={1}>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Overall Progress</StatLabel>
                    <StatNumber color={parentPrimaryColor} fontWeight="bold">{childData.progress}%</StatNumber>
                    <Progress value={childData.progress} size="sm" colorScheme="green" mt={2} borderRadius="full" bg={useColorModeValue('green.100', 'green.700')} /> {/* Parent primary is green */}
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={useColorModeValue('pink.50', 'pink.800')} p={3} borderRadius="lg" mr={4}> {/* Parent Secondary */}
                    <Icon as={FaTrophy} boxSize={6} color={parentSecondaryColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Study Streak</StatLabel>
                    <StatNumber color={parentPrimaryColor} fontWeight="bold">{childData.streak} days</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2.5fr 1.5fr" }} // Adjusted column ratio
          gap={{ base: 6, md: 8 }}
        >
          {/* Left Column - Courses & Teachers */}
          <GridItem>
            <Tabs colorScheme="green" variant="soft-rounded" mb={{ base: 6, md: 8 }}> {/* Parent primary colorScheme */}
              <TabList>
                <Tab fontWeight="semibold">Enrolled Courses</Tab>
                <Tab fontWeight="semibold">Teacher Contacts</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0} pt={4}>
                  <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Icon as={FaBook} color={parentPrimaryColor} boxSize={6} />
                          <Heading size="lg" color={generalHeadingColor}>{childData.name}'s Courses</Heading>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Box overflowX="auto">
                        <Table variant="simple" size="md">
                          <Thead>
                            <Tr>
                              <Th color={subtleTextColor}>Course</Th>
                              <Th color={subtleTextColor}>Progress</Th>
                              <Th color={subtleTextColor}>Grade</Th>
                              <Th color={subtleTextColor}>Last Activity</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {enrolledCourses.map(course => (
                              <Tr key={course.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                <Td fontWeight="medium" color={textColor}>{course.title}</Td>
                                <Td>
                                  <Flex align="center">
                                    <Progress
                                      value={course.progress}
                                      size="sm"
                                      colorScheme="green" // Parent primary color
                                      borderRadius="full"
                                      w={{ base: "80px", md: "100px" }}
                                      mr={2}
                                      bg={useColorModeValue('green.100', 'green.700')}
                                    />
                                    <Text fontSize="sm" color={textColor}>{course.progress}%</Text>
                                  </Flex>
                                </Td>
                                <Td>
                                  <Badge
                                    variant="subtle"
                                    colorScheme={
                                      course.grade.startsWith('A') ? 'green' :
                                      course.grade.startsWith('B') ? 'blue' : // Parent primary might be blue in dark
                                      course.grade.startsWith('C') ? 'yellow' : 'red'
                                    }
                                    px={2} py={0.5} borderRadius="md"
                                  >
                                    {course.grade}
                                  </Badge>
                                </Td>
                                <Td fontSize="sm" color={textColor}>{course.lastActivity}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                      <Flex justify="flex-end" mt={4}>
                        <Button size="sm" colorScheme="green" variant="outline">View Detailed Reports</Button>
                      </Flex>
                    </CardBody>
                  </Card>
                </TabPanel>
                
                <TabPanel px={0} pt={4}>
                  <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Icon as={FaChalkboardTeacher} color={parentPrimaryColor} boxSize={6} />
                          <Heading size="lg" color={generalHeadingColor}>Teacher Contacts</Heading>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Box overflowX="auto">
                        <Table variant="simple" size="md">
                          <Thead>
                            <Tr>
                              <Th color={subtleTextColor}>Teacher</Th>
                              <Th color={subtleTextColor}>Subject</Th>
                              <Th color={subtleTextColor}>Contact</Th>
                              <Th color={subtleTextColor}>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {teacherContacts.map(teacher => (
                              <Tr key={teacher.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                <Td fontWeight="medium" color={textColor}>{teacher.name}</Td>
                                <Td color={textColor}>{teacher.subject}</Td>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={1}>
                                      <Icon as={FaEnvelope} color={parentPrimaryColor} />
                                      <Text fontSize="sm" color={textColor}>{teacher.email}</Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                      <Icon as={FaPhone} color={parentSecondaryColor} /> {/* Or another distinct color */}
                                      <Text fontSize="sm" color={textColor}>{teacher.phone}</Text>
                                    </HStack>
                                  </VStack>
                                </Td>
                                <Td>
                                  <Button size="xs" colorScheme="green" variant="outline">Message</Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridItem>

          {/* Right Column - Exams, Activities & Parent Actions */}
          <GridItem>
            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
              {/* Upcoming Exams */}
              <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaClock} color={parentSecondaryColor} boxSize={6} /> {/* Use parent secondary */}
                    <Heading size="lg" color={generalHeadingColor}>Upcoming Exams</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {upcomingExams.map(exam => (
                      <Box key={exam.id} p={4} bg={useColorModeValue('pink.50', 'pink.800')} borderRadius="lg"> {/* Parent secondary shade */}
                        <Flex justify="space-between" align="center" mb={1}>
                          <Heading size="sm" color={useColorModeValue('pink.700', 'pink.200')}>{exam.title}</Heading>
                          <Badge variant="subtle" colorScheme={getReadinessColor(exam.readiness)} px={2} py={0.5} borderRadius="md">
                            {exam.readiness} Readiness
                          </Badge>
                        </Flex>
                        <Flex justify="space-between" color={useColorModeValue('pink.600', 'pink.300')}>
                          <Text fontSize="sm">{exam.date}</Text>
                          <Text fontSize="sm">{exam.time}</Text>
                        </Flex>
                      </Box>
                    ))}
                    <Button size="sm" colorScheme="pink" variant="outline" w="full" mt={2}>View All Exams</Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Recent Activities */}
              <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaTasks} color={parentPrimaryColor} boxSize={6} />
                    <Heading size="lg" color={generalHeadingColor}>Recent Activities</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={0} align="stretch">
                    {recentActivities.map((activity, index) => (
                      <Box 
                        key={activity.id} 
                        p={4}
                        borderBottomWidth={index === recentActivities.length - 1 ? "0" : "1px"}
                        borderColor={subtleBorderColor}
                        bg={activity.type === 'alert' ? useColorModeValue('red.50', 'red.900') : 'transparent'}
                        _hover={{bg: activity.type !== 'alert' && useColorModeValue('gray.50', 'gray.700')}}
                        transition="background-color 0.2s ease-in-out"
                      >
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Flex align="center">
                              {activity.type === 'alert' && (
                                <Icon as={FaExclamationTriangle} color="red.500" mr={2} />
                              )}
                              <Text fontWeight="medium" color={textColor}>{activity.title}</Text>
                            </Flex>
                            <Text fontSize="sm" color={subtleTextColor}>{activity.time}</Text>
                          </VStack>
                          {activity.score && (
                            <Badge 
                              variant="subtle"
                              colorScheme={
                                activity.score.includes('A') ? 'green' : 
                                activity.score.includes('B') ? 'blue' : // Parent primary (blue for dark)
                                activity.score.includes('C') ? 'yellow' : 
                                activity.score === 'Pending' ? 'gray' :
                                parseInt(activity.score) > 80 ? 'green' : 
                                parseInt(activity.score) > 60 ? 'blue' : 'orange' // Parent primary for medium scores
                              }
                              px={2} py={0.5} borderRadius="md"
                            >
                              {activity.score}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    ))}
                    <Button size="sm" colorScheme="green" variant="outline" w="full" mt={4}>View All Activities</Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Parent Actions */}
              <Card bg={parentCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={FaUserGraduate} color={parentPrimaryColor} boxSize={6} />
                    <Heading size="lg" color={generalHeadingColor}>Parent Actions</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Button colorScheme="green" variant="solid" leftIcon={<Icon as={FaCalendarAlt} />}> {/* Parent Primary colorScheme */}
                      Schedule Parent-Teacher Meeting
                    </Button>
                    <Button colorScheme="green" variant="outline" leftIcon={<Icon as={FaBook} />}>
                      View Curriculum Plan
                    </Button>
                    <Button colorScheme="green" variant="outline" leftIcon={<Icon as={FaEnvelope} />}>
                      Message All Teachers
                    </Button>
                    <Button colorScheme="green" variant="outline" leftIcon={<Icon as={FaChartLine} />}>
                      View Progress Report
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

export default ParentDashboard; 