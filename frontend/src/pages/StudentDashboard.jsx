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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { supabaseApi } from '../services/supabaseApi';
import { 
  FaBook, 
  FaCalendarAlt,
  FaPlayCircle,
  FaChartLine, 
  FaClock, 
  FaGraduationCap, 
  FaRegBell, 
  FaTasks, 
  FaTrophy 
} from 'react-icons/fa';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const StudentDashboard = () => {
  // Hooks
  const { user: authUser } = useSupabaseAuth(); // Get authenticated user

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const studentCardBg = useColorModeValue('student.cardBg.default', 'student.cardBg._dark');
  const studentPrimaryColor = useColorModeValue('student.primary.default', 'student.primary._dark');
  const studentSecondaryColor = useColorModeValue('student.secondary.default', 'student.secondary._dark');
  const generalHeadingColor = useColorModeValue('brand.800', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.500');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const studentIconContainerBg = useColorModeValue('teal.50', 'teal.800');
  const studentIconColor = studentPrimaryColor; // Derived from studentPrimaryColor, so after it
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');

  // State
  // Mock data for userData - would come from API in a real application
  const [userData, setUserData] = useState({
    name: 'Alex Johnson', // This would ideally come from useAuth() context
    courses: 4,
    nextExam: 'Mathematics - 15 May 2024',
    progress: 68,
    streak: 7
  });
  const [inProgressQuizzes, setInProgressQuizzes] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [enrolledCoursesData, setEnrolledCoursesData] = useState([]);
  const [upcomingExamsData, setUpcomingExamsData] = useState([]);
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);

  // Effects
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authUser?._id) {
        setIsLoadingDashboard(false);
        return;
      }
      try {
        setIsLoadingDashboard(true);
        const response = await supabaseApi.dashboard.getDashboardData(); // Use Supabase API
        if (response && response.success && response.data) {
          setUserData(prevData => ({
            ...prevData,
            name: authUser?.name || response.data.userName || prevData.name,
            courses: response.data.totalEnrolledCourses || prevData.courses,
            progress: response.data.overallProgress || prevData.progress,
            streak: response.data.streak?.current || prevData.streak,
          }));
          setInProgressQuizzes(response.data.inProgressQuizzes || []);
          setEnrolledCoursesData(response.data.enrolledCourses || []);
          setUpcomingExamsData(response.data.upcomingExams || []);
          setRecentActivitiesData(response.data.recentActivity || []);

          // Update a portion of userData state for the 'Next Exam' card from the new upcomingExamsData
          if (response.data.upcomingExams && response.data.upcomingExams.length > 0) {
            const nextExamData = response.data.upcomingExams[0];
            setUserData(prevData => ({
              ...prevData,
              nextExam: `${nextExamData.title} - ${nextExamData.date}`
            }));
          } else {
            setUserData(prevData => ({
              ...prevData,
              nextExam: 'No upcoming exams scheduled'
            }));
          }
        } else {
          setDashboardError('Failed to load dashboard data properly.');
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardError(error.message || 'An error occurred while fetching dashboard data.');
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [authUser]);

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading as="h1" size="xl" mb={1} color={studentPrimaryColor}> {/* Changed to student primary */}
              Student Dashboard
            </Heading>
            <Text color={textColor}>
              Welcome back, {authUser?.name || userData.name}! Continue your learning journey.
            </Text>
          </Box>
          <Flex align="center">
            <Box mr={4} position="relative" cursor="pointer" _hover={{ color: studentPrimaryColor }}>
              <Icon as={FaRegBell} boxSize={6} color={subtleTextColor} />
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
                <Text fontSize="xs" fontWeight="bold" color="white">3</Text>
              </Box>
            </Box>
            <Avatar name={authUser?.name || userData.name} size="md" bg={studentPrimaryColor} color="white">
              <AvatarBadge boxSize='1.25em' bg='green.500' borderColor={studentCardBg} />
            </Avatar>
          </Flex>
        </Flex>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
          <Card 
            bg={studentCardBg}
            boxShadow="lg"
            borderRadius="xl"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box 
                    bg={studentIconContainerBg}
                    p={3}
                    borderRadius="lg" 
                    mr={4}
                  >
                    <Icon as={FaGraduationCap} boxSize={6} color={studentIconColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Enrolled Courses</StatLabel>
                    <StatNumber color={studentPrimaryColor} fontWeight="bold">{userData.courses}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={useColorModeValue('orange.50', 'orange.800')} p={3} borderRadius="lg" mr={4}> {/* Student secondary for this one */}
                    <Icon as={FaCalendarAlt} boxSize={6} color={studentSecondaryColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Next Exam</StatLabel>
                    <StatNumber fontSize="md" color={studentSecondaryColor} fontWeight="bold">{userData.nextExam}</StatNumber>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={studentIconContainerBg} p={3} borderRadius="lg" mr={4}>
                    <Icon as={FaChartLine} boxSize={6} color={studentIconColor} />
                  </Box>
                  <Box flex={1}>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Overall Progress</StatLabel>
                    <StatNumber color={studentPrimaryColor} fontWeight="bold">{userData.progress}%</StatNumber>
                    <Progress value={userData.progress} size="sm" colorScheme="teal" mt={2} borderRadius="full" bg={useColorModeValue('teal.100', 'teal.700')} /> {/* Assuming student primary is teal */}
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl" transition="all 0.2s ease-in-out" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}>
            <CardBody>
              <Stat>
                <Flex align="center">
                  <Box bg={useColorModeValue('yellow.50', 'yellow.800')} p={3} borderRadius="lg" mr={4}> {/* Student secondary for this one */}
                    <Icon as={FaTrophy} boxSize={6} color={studentSecondaryColor} />
                  </Box>
                  <Box>
                    <StatLabel color={subtleTextColor} fontWeight="medium">Study Streak</StatLabel>
                    <StatNumber color={studentPrimaryColor} fontWeight="bold">{userData.streak} days</StatNumber>
                    <StatHelpText color={subtleTextColor}>Keep it up!</StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Continue Learning Section */}
        {isLoadingDashboard && (
          <Flex justify="center" my={8}><Spinner size="xl" color={studentPrimaryColor} /></Flex>
        )}
        {dashboardError && (
          <Alert status="error" my={4} borderRadius="md">
            <AlertIcon />
            {dashboardError}
          </Alert>
        )}
        {!isLoadingDashboard && !dashboardError && inProgressQuizzes.length > 0 && (
          <Box mb={{ base: 6, md: 8 }}>
            <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <HStack>
                  <Icon as={FaPlayCircle} color={studentPrimaryColor} boxSize={6} />
                  <Heading size="lg" color={studentPrimaryColor}>Continue Learning</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {inProgressQuizzes.map(quiz => (
                    <Box
                      key={quiz.attemptId}
                      p={4}
                      bg={useColorModeValue('secondary.50', 'secondary.700')}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={subtleBorderColor}
                      _hover={{ borderColor: studentPrimaryColor, boxShadow: 'sm' }}
                      transition="all 0.2s ease-in-out"
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Heading size="md" color={studentPrimaryColor} _dark={{ color: 'teal.200' }}>{quiz.quizTitle}</Heading>
                          <Text fontSize="sm" color={subtleTextColor}>Subject: {quiz.subject}</Text>
                          {quiz.topicTags && quiz.topicTags.length > 0 && (
                             <Text fontSize="xs" color={subtleTextColor} mt={1}>Topics: {quiz.topicTags.join(', ')}</Text>
                          )}
                        </Box>
                        <Button
                          as={RouterLink}
                          to={`/exam/attempt/${quiz.attemptId}`}
                          bg={studentPrimaryColor}
                          color="white"
                          _hover={{ bg: useColorModeValue('teal.500', 'teal.300')}} // Adjusted hover for dark mode
                        >
                          Continue Quiz
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}

        {/* Main Content Grid */}
        <Grid
          templateColumns={{ base: "1fr", lg: "2.5fr 1.5fr" }} // Adjusted column ratio
          gap={{ base: 6, md: 8 }}
        >
          {/* Left Column - My Courses */}
          <GridItem>
            <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaBook} color={studentPrimaryColor} boxSize={6} />
                    <Heading size="lg" color={studentPrimaryColor}>My Courses</Heading> {/* Changed to student primary */}
                  </HStack>
                  <Button size="sm" variant="outline" borderColor={studentPrimaryColor} color={studentPrimaryColor} _hover={{bg: useColorModeValue('teal.50', 'teal.800')}}>View All</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={5} align="stretch">
                  {enrolledCoursesData.map(course => (
                    <Box
                      key={course.id}
                      p={4}
                      bg={useColorModeValue('secondary.50', 'secondary.700')}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={subtleBorderColor}
                      _hover={{ borderColor: studentPrimaryColor, boxShadow: 'sm' }}
                      transition="all 0.2s ease-in-out"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack>
                          <Heading size="md" color={studentPrimaryColor} _dark={{ color: 'teal.200' }}>{course.title}</Heading> {/* Student primary, lighter in dark mode */}
                          {course.badge && (
                            <Badge colorScheme={course.badge === 'New' ? 'green' : 'purple'} variant="subtle">
                              {course.badge}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color={subtleTextColor} fontWeight="medium">{course.progress}%</Text>
                      </Flex>
                      <Progress value={course.progress} size="sm" colorScheme="teal" mb={3} borderRadius="full" bg={useColorModeValue('teal.100', 'teal.700')} />
                      <Flex justify="space-between" align="center" mt={2}>
                        <Text fontSize="sm" color={subtleTextColor}>Next: {course.nextLesson}</Text>
                        <Button size="sm" bg={studentPrimaryColor} color="white" _hover={{ bg: useColorModeValue('teal.500', 'teal.200')}}>Continue</Button>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Right Column - Exams & Activities */}
          <GridItem>
            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
              {/* Upcoming Exams */}
              <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaClock} color={studentSecondaryColor} boxSize={6} />
                    <Heading size="lg" color={studentSecondaryColor}>Upcoming Exams</Heading> {/* Student Secondary */}
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {upcomingExamsData.map(exam => (
                      <Box key={exam.id} p={4} bg={useColorModeValue('orange.50', 'orange.800')} borderRadius="lg">
                        <Heading size="sm" mb={1} color={useColorModeValue('orange.700', 'orange.200')}>{exam.title}</Heading>
                        <Flex justify="space-between" color={useColorModeValue('orange.600', 'orange.300')}>
                          <Text fontSize="sm">{exam.date}</Text>
                          <Text fontSize="sm">{exam.time}</Text>
                        </Flex>
                      </Box>
                    ))}
                    <Button size="sm" variant="outline" borderColor={studentSecondaryColor} color={studentSecondaryColor} _hover={{bg: useColorModeValue('orange.50', 'orange.800')}} w="full" mt={2}>
                      View All Exams
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Recent Activities */}
              <Card bg={studentCardBg} boxShadow="lg" borderRadius="xl">
                <CardHeader>
                  <HStack>
                    <Icon as={FaTasks} color={studentPrimaryColor} boxSize={6} />
                    <Heading size="lg" color={studentPrimaryColor}>Recent Activities</Heading> {/* Student Primary */}
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={0} align="stretch">
                    {recentActivitiesData.map((activity, index) => (
                      <Box
                        key={activity.id}
                        p={4}
                        borderBottomWidth={index === recentActivitiesData.length - 1 ? "0" : "1px"}
                        borderColor={subtleBorderColor}
                      >
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" color={textColor}>{activity.title}</Text>
                            <Text fontSize="sm" color={subtleTextColor}>{activity.time}</Text>
                          </VStack>
                          {activity.score && (
                            <Badge 
                              variant="subtle"
                              colorScheme={
                                activity.score === 'Pending' ? 'yellow' : 
                                parseInt(activity.score) > 80 ? 'green' : 
                                parseInt(activity.score) > 60 ? 'teal' : 'orange'
                              }
                            >
                              {activity.score}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    ))}
                    <Button size="sm" variant="outline" borderColor={studentPrimaryColor} color={studentPrimaryColor} _hover={{bg: useColorModeValue('teal.50', 'teal.800')}} w="full" mt={4}>
                      View All Activities
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

export default StudentDashboard; 