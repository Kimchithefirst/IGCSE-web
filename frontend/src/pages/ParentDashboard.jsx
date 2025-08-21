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
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  useColorMode,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  List,
  ListItem,
  ListIcon
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
  FaEnvelopeOpen,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaPrint,
  FaShare,
  FaCog,
  FaBell,
  FaSearch,
  FaFilter,
  FaSort,
  FaCalendar,
  FaFileAlt,
  FaChartBar,
  FaAward,
  FaMedal,
  FaStar,
  FaHeart,
  FaThumbsUp,
  FaComment,
  FaReply,
  FaPaperPlane,
  FaHistory,
  FaArchive,
  FaFlag,
  FaShieldAlt,
  FaUserShield,
  FaLock,
  FaUnlock,
  FaKey,
  FaUserCog,
  FaUserEdit,
  FaUserPlus,
  FaUserMinus,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaSchool,
  FaUniversity,
  FaHome,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaLink,
  FaUnlink,
  FaSync,
  FaRedo,
  FaUndo,
  FaSave,
  FaTimes,
  FaCheck,
  FaInfo,
  FaQuestion,
  FaQuestionCircle,
  FaExclamationCircle,
  FaWarning,
  FaBan,
  FaStop,
  FaPause,
  FaPlay,
  FaForward,
  FaBackward,
  FaStepForward,
  FaStepBackward,
  FaFastForward,
  FaFastBackward,
  FaExpand,
  FaCompress,
  FaWindowMaximize,
  FaWindowMinimize,
  FaWindowRestore,
  FaWindowClose
} from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const ParentDashboard = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const { isOpen: isMessageOpen, onOpen: onMessageOpen, onClose: onMessageClose } = useDisclosure();
  const { isOpen: isReportOpen, onOpen: onReportOpen, onClose: onReportClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childClasses, setChildClasses] = useState([]);
  const [childAssignments, setChildAssignments] = useState([]);
  const [childExams, setChildExams] = useState([]);
  const [childActivities, setChildActivities] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

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
      
      // Load children linked to this parent
      const { data: childrenData, error: childrenError } = await supabase
        .from('profiles')
        .select('*')
        .eq('parent_id', authUser.id)
        .eq('role', 'student');

      if (childrenError) {
        console.error('Error loading children:', childrenError);
        toast({
          title: 'Error loading children',
          description: childrenError.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // If no real children found, use mock data for demonstration
      let childrenToUse = childrenData;
      if (!childrenData || childrenData.length === 0) {
        childrenToUse = [
          {
            id: 'child1',
            full_name: 'Alex Johnson',
            username: 'alex_johnson',
            email: 'alex@example.com',
            grade: '10th Grade',
            overall_grade: 'B+',
            progress: 68,
            streak: 7,
            attendance: 92,
            next_exam: 'Mathematics - 15 May 2024',
            alerts: 2,
            bio: 'Dedicated student with strong academic performance'
          },
          {
            id: 'child2', 
            full_name: 'Emma Johnson',
            username: 'emma_johnson',
            email: 'emma@example.com',
            grade: '8th Grade',
            overall_grade: 'A-',
            progress: 85,
            streak: 12,
            attendance: 95,
            next_exam: 'Science - 18 May 2024',
            alerts: 0,
            bio: 'Excellent student with consistent high grades'
          }
        ];
      }
      
      setChildren(childrenToUse);
      if (childrenToUse.length > 0) {
        setSelectedChild(childrenToUse[0]);
        await loadChildData(childrenToUse[0].id);
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId) => {
    try {
      // Load child's classes
      const { data: classesData, error: classesError } = await supabase
        .from('class_students')
        .select(`
          *,
          class:classes(
            *,
            teacher:profiles!classes_teacher_id_fkey(
              full_name,
              email,
              username
            )
          )
        `)
        .eq('student_id', childId);

      if (classesError) {
        console.error('Error loading child classes:', classesError);
      }

      // Transform classes data
      const transformedClasses = (classesData || []).map(cs => ({
        id: cs.class.id,
        name: cs.class.name,
        subject: cs.class.subject,
        teacher: cs.class.teacher?.full_name || 'Unknown Teacher',
        teacher_email: cs.class.teacher?.email,
        progress: Math.floor(Math.random() * 40) + 60, // Mock progress
        grade: ['A', 'A-', 'B+', 'B', 'B-', 'C+'][Math.floor(Math.random() * 6)],
        next_assignment: `Assignment ${Math.floor(Math.random() * 10) + 1} - Due ${new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
      }));

      setChildClasses(transformedClasses);

      // Load mock assignments
      const mockAssignments = [
        {
          id: 'assign1',
          title: 'Mathematics Quiz',
          subject: 'Mathematics',
          due_date: '2024-05-15',
          status: 'submitted',
          grade: 'B+',
          teacher: 'Dr. Sarah Williams'
        },
        {
          id: 'assign2',
          title: 'Physics Lab Report',
          subject: 'Physics',
          due_date: '2024-05-18',
          status: 'pending',
          grade: null,
          teacher: 'Mr. David Chen'
        },
        {
          id: 'assign3',
          title: 'English Essay',
          subject: 'English',
          due_date: '2024-05-20',
          status: 'submitted',
          grade: 'A-',
          teacher: 'Ms. Jennifer Brown'
        }
      ];

      setChildAssignments(mockAssignments);

      // Load mock exams
      const mockExams = [
        {
          id: 'exam1',
          title: 'Mathematics Mid-Term',
          subject: 'Mathematics',
          date: '2024-05-15',
          time: '10:00 AM',
          location: 'Room 203',
          readiness: 'High'
        },
        {
          id: 'exam2',
          title: 'Physics Unit Test',
          subject: 'Physics',
          date: '2024-05-22',
          time: '2:00 PM',
          location: 'Physics Lab',
          readiness: 'Medium'
        }
      ];

      setChildExams(mockExams);

      // Load mock activities
      const mockActivities = [
        {
          id: 'act1',
          title: 'Completed Mathematics Quiz',
          time: '2 days ago',
          score: '85%',
          type: 'quiz'
        },
        {
          id: 'act2',
          title: 'Submitted Physics Assignment',
          time: '5 days ago',
          score: 'B+',
          type: 'assignment'
        },
        {
          id: 'act3',
          title: 'Attended Study Group',
          time: '1 week ago',
          score: null,
          type: 'activity'
        }
      ];

      setChildActivities(mockActivities);

      // Load teachers
      const uniqueTeachers = [...new Set(transformedClasses.map(c => c.teacher))];
      const teachersData = uniqueTeachers.map((teacher, index) => ({
        id: `teacher${index}`,
        name: teacher,
        subject: transformedClasses.find(c => c.teacher === teacher)?.subject || 'Unknown',
        email: transformedClasses.find(c => c.teacher === teacher)?.teacher_email || `${teacher.toLowerCase().replace(' ', '.')}@school.edu`,
        phone: `+1-555-${String(index + 100).padStart(3, '0')}-${String(index + 1000).padStart(4, '0')}`
      }));

      setTeachers(teachersData);

    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const handleChildChange = async (childId) => {
    const child = children.find(c => c.id === childId);
    setSelectedChild(child);
    await loadChildData(childId);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTeacher) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // In a real system, you'd save this to a messages table
      const newMessage = {
        id: Date.now().toString(),
        from: authUser.id,
        to: selectedTeacher.id,
        subject: messageSubject,
        content: messageText,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => [newMessage, ...prev]);
      
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setMessageText('');
      setMessageSubject('');
      onMessageClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getReadinessColor = (readiness) => {
    switch (readiness?.toLowerCase()) {
      case 'high': return 'green';
      case 'medium': return 'orange';
      case 'low': return 'red';
      default: return 'gray';
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'green';
    if (grade?.startsWith('B')) return 'blue';
    if (grade?.startsWith('C')) return 'yellow';
    if (grade?.startsWith('D') || grade?.startsWith('F')) return 'red';
    return 'gray';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'green';
      case 'pending': return 'orange';
      case 'late': return 'red';
      default: return 'gray';
    }
  };

  const parentData = {
    name: authUser?.name || 'Parent',
    totalChildren: children.length,
    totalClasses: childClasses.length,
    upcomingExams: childExams.length,
    alerts: children.reduce((total, child) => total + (child.alerts || 0), 0)
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading size="lg" color={generalHeadingColor} mb={2}>
              Parent Dashboard
            </Heading>
            <Text color={subtleTextColor}>
              Monitor your children's academic progress and stay connected with teachers
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={FaEnvelopeOpen} />}
              colorScheme="green"
              variant="outline"
              onClick={onMessageOpen}
            >
              Message Teachers
            </Button>
            <Button
              leftIcon={<Icon as={FaFileAlt} />}
              colorScheme="blue"
              variant="outline"
              onClick={onReportOpen}
            >
              Generate Report
            </Button>
            <IconButton
              icon={<Icon as={FaCog} />}
              colorScheme="gray"
              variant="ghost"
              onClick={onSettingsOpen}
              aria-label="Settings"
            />
          </HStack>
        </Flex>

        {/* Child Selector */}
        {children.length > 0 && (
          <Card bg={parentCardBg} boxShadow="lg" mb={6}>
            <CardBody>
              <Flex align="center" gap={4}>
                <Icon as={FaUserGraduate} color={parentPrimaryColor} />
                <Text fontWeight="semibold" color={textColor}>Select Child:</Text>
                <Select
                  value={selectedChild?.id || ''}
                  onChange={(e) => handleChildChange(e.target.value)}
                  maxW="300px"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.full_name || child.name} ({child.grade})
                    </option>
                  ))}
                </Select>
                <Badge colorScheme="green" ml="auto">
                  {children.length} Child{children.length !== 1 ? 'ren' : ''}
                </Badge>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
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

          <Card bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Active Classes</StatLabel>
                <StatNumber color={parentPrimaryColor}>{parentData.totalClasses}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaBook} mr={2} />
                  Current courses
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Upcoming Exams</StatLabel>
                <StatNumber color={parentPrimaryColor}>{parentData.upcomingExams}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaCalendarAlt} mr={2} />
                  This month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
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
              <Tab>Overview</Tab>
              <Tab>Classes</Tab>
              <Tab>Assignments</Tab>
              <Tab>Exams</Tab>
              <Tab>Activities</Tab>
              <Tab>Teachers</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    {selectedChild.full_name || selectedChild.name}'s Academic Overview
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
                            <Badge colorScheme={getGradeColor(selectedChild.overall_grade || selectedChild.overallGrade)} fontSize="md">
                              {selectedChild.overall_grade || selectedChild.overallGrade}
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
                          Quick Actions
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <Button
                            leftIcon={<Icon as={FaEnvelope} />}
                            colorScheme="green"
                            variant="outline"
                            size="sm"
                            onClick={onMessageOpen}
                          >
                            Contact Teachers
                          </Button>
                          <Button
                            leftIcon={<Icon as={FaFileAlt} />}
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            onClick={onReportOpen}
                          >
                            Download Progress Report
                          </Button>
                          <Button
                            leftIcon={<Icon as={FaCalendar} />}
                            colorScheme="purple"
                            variant="outline"
                            size="sm"
                          >
                            Schedule Parent Meeting
                          </Button>
                          <Button
                            leftIcon={<Icon as={FaChartBar} />}
                            colorScheme="orange"
                            variant="outline"
                            size="sm"
                          >
                            View Analytics
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Recent Activity */}
                  <Card bg={parentCardBg} boxShadow="lg" mt={6}>
                    <CardHeader>
                      <Heading size="sm" color={parentPrimaryColor}>
                        Recent Activity
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {childActivities.slice(0, 5).map((activity) => (
                          <Flex key={activity.id} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
                            <Box>
                              <Text fontWeight="medium" color={textColor}>
                                {activity.title}
                              </Text>
                              <Text fontSize="sm" color={subtleTextColor}>
                                {activity.time}
                              </Text>
                            </Box>
                            {activity.score && (
                              <Badge colorScheme="green">
                                {activity.score}
                              </Badge>
                            )}
                          </Flex>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Classes Tab */}
              <TabPanel>
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color={parentPrimaryColor}>
                      Class Progress
                    </Heading>
                    <HStack spacing={2}>
                      <Select size="sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">All Classes</option>
                        <option value="math">Mathematics</option>
                        <option value="science">Science</option>
                        <option value="english">English</option>
                      </Select>
                      <Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="date">Sort by Date</option>
                        <option value="grade">Sort by Grade</option>
                        <option value="progress">Sort by Progress</option>
                      </Select>
                    </HStack>
                  </Flex>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {childClasses.map((cls) => (
                      <Card key={cls.id} bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
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
                            <Badge colorScheme={getGradeColor(cls.grade)}>
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
                                Next: {cls.next_assignment}
                              </Text>
                            </Box>
                            <HStack spacing={2}>
                              <Button size="xs" colorScheme="blue" variant="outline">
                                <Icon as={FaEye} mr={1} />
                                View Details
                              </Button>
                              <Button size="xs" colorScheme="green" variant="outline">
                                <Icon as={FaEnvelope} mr={1} />
                                Contact Teacher
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              </TabPanel>

              {/* Assignments Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    Assignments & Homework
                  </Heading>
                  
                  <Table variant="simple" bg={parentCardBg} borderRadius="lg" overflow="hidden">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Assignment</Th>
                        <Th>Subject</Th>
                        <Th>Due Date</Th>
                        <Th>Status</Th>
                        <Th>Grade</Th>
                        <Th>Teacher</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {childAssignments.map((assignment) => (
                        <Tr key={assignment.id}>
                          <Td fontWeight="medium">{assignment.title}</Td>
                          <Td>{assignment.subject}</Td>
                          <Td>{new Date(assignment.due_date).toLocaleDateString()}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                          </Td>
                          <Td>
                            {assignment.grade ? (
                              <Badge colorScheme={getGradeColor(assignment.grade)}>
                                {assignment.grade}
                              </Badge>
                            ) : (
                              <Text color={subtleTextColor}>-</Text>
                            )}
                          </Td>
                          <Td>{assignment.teacher}</Td>
                          <Td>
                            <HStack spacing={1}>
                              <IconButton
                                icon={<Icon as={FaEye} />}
                                size="xs"
                                colorScheme="blue"
                                variant="ghost"
                                aria-label="View assignment"
                              />
                              <IconButton
                                icon={<Icon as={FaEnvelope} />}
                                size="xs"
                                colorScheme="green"
                                variant="ghost"
                                aria-label="Contact teacher"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* Exams Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    Upcoming Exams
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {childExams.map((exam) => (
                      <Card key={exam.id} bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
                        <CardHeader>
                          <Flex justify="space-between" align="center">
                            <Heading size="sm" color={parentPrimaryColor}>
                              {exam.title}
                            </Heading>
                            <Badge colorScheme={getReadinessColor(exam.readiness)}>
                              {exam.readiness} Readiness
                            </Badge>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Subject:</Text>
                              <Text fontSize="sm" color={textColor} fontWeight="medium">
                                {exam.subject}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Date:</Text>
                              <Text fontSize="sm" color={textColor}>
                                {new Date(exam.date).toLocaleDateString()}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Time:</Text>
                              <Text fontSize="sm" color={textColor}>
                                {exam.time}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Text fontSize="sm" color={subtleTextColor}>Location:</Text>
                              <Text fontSize="sm" color={textColor}>
                                {exam.location}
                              </Text>
                            </Flex>
                            <Button size="sm" colorScheme="blue" variant="outline">
                              <Icon as={FaCalendar} mr={2} />
                              Add to Calendar
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              </TabPanel>

              {/* Activities Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    Recent Activities
                  </Heading>
                  
                  <VStack spacing={4} align="stretch">
                    {childActivities.map((activity) => (
                      <Card key={activity.id} bg={parentCardBg} boxShadow="lg">
                        <CardBody>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="medium" color={textColor}>
                                {activity.title}
                              </Text>
                              <Text fontSize="sm" color={subtleTextColor}>
                                {activity.time}
                              </Text>
                            </Box>
                            <HStack spacing={2}>
                              {activity.score && (
                                <Badge colorScheme="green">
                                  {activity.score}
                                </Badge>
                              )}
                              <Badge colorScheme="blue" variant="outline">
                                {activity.type}
                              </Badge>
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              </TabPanel>

              {/* Teachers Tab */}
              <TabPanel>
                <Box>
                  <Heading size="md" color={parentPrimaryColor} mb={4}>
                    Teacher Contacts
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {teachers.map((teacher) => (
                      <Card key={teacher.id} bg={parentCardBg} boxShadow="lg" _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
                        <CardHeader>
                          <Flex align="center" gap={3}>
                            <Avatar size="md" name={teacher.name} bg={parentPrimaryColor} />
                            <Box>
                              <Heading size="sm" color={parentPrimaryColor}>
                                {teacher.name}
                              </Heading>
                              <Text color={subtleTextColor} fontSize="sm">
                                {teacher.subject}
                              </Text>
                            </Box>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Flex align="center" gap={2}>
                              <Icon as={FaEnvelope} color={subtleTextColor} />
                              <Text fontSize="sm" color={textColor}>
                                {teacher.email}
                              </Text>
                            </Flex>
                            <Flex align="center" gap={2}>
                              <Icon as={FaPhone} color={subtleTextColor} />
                              <Text fontSize="sm" color={textColor}>
                                {teacher.phone}
                              </Text>
                            </Flex>
                            <HStack spacing={2}>
                              <Button size="sm" colorScheme="green" variant="outline" flex={1}>
                                <Icon as={FaEnvelope} mr={1} />
                                Message
                              </Button>
                              <Button size="sm" colorScheme="blue" variant="outline" flex={1}>
                                <Icon as={FaPhone} mr={1} />
                                Call
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
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
            <Button colorScheme="green" leftIcon={<Icon as={FaUserPlus} />}>
              Add Child Account
            </Button>
          </Box>
        )}
      </Container>

      {/* Message Modal */}
      <Modal isOpen={isMessageOpen} onClose={onMessageClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Message to Teacher</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Select Teacher</FormLabel>
                <Select
                  value={selectedTeacher?.id || ''}
                  onChange={(e) => setSelectedTeacher(teachers.find(t => t.id === e.target.value))}
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.subject})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Input
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Message subject..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Message</FormLabel>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMessageClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={sendMessage}>
              Send Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportOpen} onClose={onReportClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Progress Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Generate a comprehensive progress report for {selectedChild?.full_name || selectedChild?.name}</Text>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Button leftIcon={<Icon as={FaDownload} />} colorScheme="blue">
                  Download PDF
                </Button>
                <Button leftIcon={<Icon as={FaPrint} />} colorScheme="green">
                  Print Report
                </Button>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onReportClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Parent Dashboard Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Configure your dashboard preferences and notifications</Text>
              <Alert status="info">
                <AlertIcon />
                Settings configuration coming soon!
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSettingsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ParentDashboard; 