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
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
  FaClipboardList,
  FaUserFriends,
  FaPencilAlt,
  FaSearch,
  FaFileAlt,
  FaPlus,
  FaUsers,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const TeacherDashboard = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    description: '',
    maxStudents: 30
  });
  const [newStudent, setNewStudent] = useState({
    email: '',
    fullName: '',
    role: 'student'
  });
  
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    totalPoints: 100,
    assignmentType: 'quiz',
    instructions: ''
  });
  
  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const teacherCardBg = useColorModeValue('teacher.cardBg.default', 'teacher.cardBg._dark');
  const teacherPrimaryColor = useColorModeValue('teacher.primary.default', 'teacher.primary._dark');
  const teacherSecondaryColor = useColorModeValue('teacher.secondary.default', 'teacher.secondary._dark');
  const generalHeadingColor = useColorModeValue('brand.800', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.500');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const teacherIconContainerBg = useColorModeValue('purple.50', 'purple.800');
  const teacherIconColor = teacherPrimaryColor;
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'secondary.700');

  // Load teacher data on component mount
  useEffect(() => {
    if (authUser) {
      loadTeacherData();
    }
  }, [authUser]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Load teacher's classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', authUser.id);

      if (classesError) {
        console.error('Error loading classes:', classesError);
      } else {
        setClasses(classesData || []);
      }

      // Load all students (for adding to classes)
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (studentsError) {
        console.error('Error loading students:', studentsError);
      } else {
        setStudents(studentsData || []);
      }

      // Load assignments for teacher's classes
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(name)
        `)
        .eq('created_by', authUser.id);

      if (assignmentsError) {
        console.error('Error loading assignments:', assignmentsError);
      } else {
        // Add class_name to each assignment for display
        const assignmentsWithClassNames = assignmentsData?.map(assignment => ({
          ...assignment,
          class_name: assignment.class?.name || 'Unknown Class'
        })) || [];
        setAssignments(assignmentsWithClassNames);
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: newClass.name,
          subject: newClass.subject,
          description: newClass.description,
          max_students: newClass.maxStudents,
          teacher_id: authUser.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Class Created Successfully!',
        description: `${newClass.name} has been created with class code: ${data.class_code}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setNewClass({ name: '', subject: '', description: '', maxStudents: 30 });
      setIsCreateClassOpen(false);
      loadTeacherData(); // Reload data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const createAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          title: newAssignment.title,
          description: newAssignment.description,
          class_id: newAssignment.classId,
          created_by: authUser.id,
          due_date: newAssignment.dueDate,
          total_points: newAssignment.totalPoints,
          assignment_type: newAssignment.assignmentType,
          instructions: newAssignment.instructions,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Assignment Created Successfully!',
        description: `${newAssignment.title} has been created.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setNewAssignment({ 
        title: '', 
        description: '', 
        classId: '', 
        dueDate: '', 
        totalPoints: 100, 
        assignmentType: 'quiz',
        instructions: ''
      });
      setIsCreateAssignmentOpen(false);
      loadTeacherData(); // Reload data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addStudentToClass = async () => {
    try {
      // First, find the student by email
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newStudent.email)
        .eq('role', 'student')
        .single();

      if (studentError || !studentData) {
        throw new Error('Student not found. Please check the email address.');
      }

      // Add student to class
      const { error: classStudentError } = await supabase
        .from('class_students')
        .insert({
          class_id: selectedClass.id,
          student_id: studentData.id
        });

      if (classStudentError) {
        throw classStudentError;
      }

      toast({
        title: 'Student Added',
        description: `${newStudent.fullName} has been added to ${selectedClass.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setNewStudent({ email: '', fullName: '', role: 'student' });
      setIsAddStudentOpen(false);
      loadTeacherData(); // Reload data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const copyClassCode = async (classCode) => {
    try {
      await navigator.clipboard.writeText(classCode);
      toast({
        title: 'Class Code Copied!',
        description: 'The class code has been copied to your clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Please copy the code manually: ' + classCode,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const teacherData = {
    name: authUser?.name || 'Teacher',
    role: 'Teacher',
    avatar: '',
    courses: classes.length,
    totalStudents: classes.reduce((total, cls) => total + (cls.students?.length || 0), 0),
    upcomingClasses: 2,
    pendingGrading: 15,
    notifications: 4
  };

  return (
    <Box minH="100vh" bg={pageBg} py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Header Section */}
        <Flex justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <Box>
            <Heading size="lg" color={generalHeadingColor} mb={2}>
              Welcome back, {teacherData.name}!
            </Heading>
            <Text color={subtleTextColor}>
              Here's what's happening with your classes today
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={FaPlus} />}
            colorScheme="purple"
            onClick={() => setIsCreateClassOpen(true)}
          >
            Create New Class
          </Button>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={teacherCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Total Classes</StatLabel>
                <StatNumber color={teacherPrimaryColor}>{teacherData.courses}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaBook} mr={2} />
                  Active courses
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={teacherCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Total Students</StatLabel>
                <StatNumber color={teacherPrimaryColor}>{teacherData.totalStudents}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaUserGraduate} mr={2} />
                  Enrolled students
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={teacherCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Upcoming Classes</StatLabel>
                <StatNumber color={teacherPrimaryColor}>{teacherData.upcomingClasses}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaCalendarAlt} mr={2} />
                  Today's schedule
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={teacherCardBg} boxShadow="lg">
            <CardBody>
              <Stat>
                <StatLabel color={subtleTextColor}>Pending Grading</StatLabel>
                <StatNumber color={teacherPrimaryColor}>{teacherData.pendingGrading}</StatNumber>
                <StatHelpText color={subtleTextColor}>
                  <Icon as={FaTasks} mr={2} />
                  Assignments to grade
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content */}
        <Tabs variant="enclosed" colorScheme="purple">
              <TabList>
            <Tab>My Classes</Tab>
            <Tab>Assignments</Tab>
            <Tab>Student Management</Tab>
            <Tab>Analytics</Tab>
              </TabList>
              
              <TabPanels>
            {/* My Classes Tab */}
            <TabPanel>
              {loading ? (
                <Box textAlign="center" py={10}>
                  <Text>Loading classes...</Text>
                </Box>
              ) : classes.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Icon as={FaBook} size="3xl" color={subtleTextColor} mb={4} />
                  <Text fontSize="lg" color={textColor} mb={2}>
                    No classes created yet
                  </Text>
                  <Text color={subtleTextColor} mb={4}>
                    Create your first class to get started
                  </Text>
                  <Button
                    leftIcon={<Icon as={FaPlus} />}
                    colorScheme="purple"
                    onClick={() => setIsCreateClassOpen(true)}
                  >
                    Create Your First Class
                  </Button>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {classes.map((cls) => (
                    <Card key={cls.id} bg={teacherCardBg} boxShadow="lg">
                    <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Heading size="md" color={teacherPrimaryColor}>
                              {cls.name}
                            </Heading>
                            <Text color={subtleTextColor} fontSize="sm">
                              {cls.subject}
                            </Text>
                          </Box>
                          <VStack spacing={1} align="end">
                            <Badge colorScheme="purple">
                              {cls.students?.length || 0}/{cls.max_students} students
                            </Badge>
                            <Badge variant="outline" colorScheme="green" fontSize="xs">
                              Code: {cls.class_code}
                            </Badge>
                          </VStack>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                        <Text color={textColor} mb={4}>
                          {cls.description || 'No description provided'}
                        </Text>
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaUsers} />}
                            variant="outline"
                            colorScheme="purple"
                            onClick={() => {
                              setSelectedClass(cls);
                              setIsAddStudentOpen(true);
                            }}
                          >
                            Add Student
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaEye} />}
                            variant="ghost"
                            colorScheme="purple"
                          >
                            View Details
                        </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => copyClassCode(cls.class_code)}
                            title="Copy class code"
                          >
                            Copy Code
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
                 <Flex justify="space-between" align="center" mb={6}>
                   <Heading size="lg" color={teacherPrimaryColor}>
                     Assignments
                   </Heading>
                   <Button
                     leftIcon={<Icon as={FaPlus} />}
                     colorScheme="purple"
                     onClick={() => setIsCreateAssignmentOpen(true)}
                   >
                     Create Assignment
                   </Button>
                 </Flex>

                 {loading ? (
                   <Text>Loading assignments...</Text>
                 ) : assignments.length === 0 ? (
                   <Alert status="info">
                     <AlertIcon />
                     <Box>
                       <AlertTitle>No assignments yet!</AlertTitle>
                       <AlertDescription>
                         Create your first assignment to get started.
                       </AlertDescription>
                     </Box>
                   </Alert>
                 ) : (
                   <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                     {assignments.map((assignment) => (
                       <Card key={assignment.id} bg={teacherCardBg} boxShadow="lg">
                    <CardHeader>
                           <Flex justify="space-between" align="center">
                             <Box>
                               <Heading size="md" color={teacherPrimaryColor}>
                                 {assignment.title}
                               </Heading>
                               <Text color={subtleTextColor} fontSize="sm">
                                 {assignment.class_name}
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
                               <Icon as={FaCalendarAlt} color={teacherIconColor} />
                               <Text fontSize="sm" color={subtleTextColor}>
                                 Due: {new Date(assignment.due_date).toLocaleDateString()}
                               </Text>
                             </HStack>
                             <HStack>
                               <Icon as={FaTrophy} color={teacherIconColor} />
                               <Text fontSize="sm" color={subtleTextColor}>
                                 {assignment.total_points} points
                               </Text>
                             </HStack>
                             <HStack>
                               <Icon as={FaFileAlt} color={teacherIconColor} />
                               <Text fontSize="sm" color={subtleTextColor}>
                                 {assignment.assignment_type}
                               </Text>
                        </HStack>
                           </VStack>
                           <Flex gap={2}>
                             <Button size="sm" variant="outline" colorScheme="purple">
                               View Submissions
                             </Button>
                             <Button size="sm" variant="outline" colorScheme="purple">
                               Edit
                        </Button>
                      </Flex>
                         </CardBody>
                       </Card>
                     ))}
                   </SimpleGrid>
                 )}
               </Box>
             </TabPanel>

             {/* Student Management Tab */}
            <TabPanel>
              <Box>
                <Heading size="md" color={teacherPrimaryColor} mb={4}>
                  Student Management
                </Heading>
                <Text color={subtleTextColor} mb={6}>
                  Manage students across all your classes
                </Text>
                
                <Card bg={teacherCardBg} boxShadow="lg">
                  <CardHeader>
                    <Heading size="sm" color={teacherPrimaryColor}>
                      All Students ({students.length})
                    </Heading>
                    </CardHeader>
                    <CardBody>
                    <Table variant="simple">
                          <Thead>
                            <Tr>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Classes</Th>
                          <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                        {students.map((student) => (
                          <Tr key={student.id}>
                                <Td>
                                  <Flex align="center">
                                <Avatar size="sm" name={student.full_name} mr={3} />
                                {student.full_name}
                                  </Flex>
                                </Td>
                            <Td>{student.email}</Td>
                            <Td>
                              <Badge colorScheme="blue">
                                {classes.filter(cls => 
                                  cls.students?.some(s => s.student?.id === student.id)
                                ).length} classes
                              </Badge>
                                </Td>
                                <Td>
                              <Button size="sm" variant="ghost" colorScheme="purple">
                                <Icon as={FaEye} />
                                    </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                    </CardBody>
                  </Card>
              </Box>
                </TabPanel>

            {/* Analytics Tab */}
            <TabPanel>
              <Box>
                <Heading size="md" color={teacherPrimaryColor} mb={4}>
                  Class Analytics
                </Heading>
                <Text color={subtleTextColor} mb={6}>
                  Performance insights and trends
                </Text>
                
                <Alert status="info" mb={6}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Analytics Coming Soon!</AlertTitle>
                    <AlertDescription>
                      Detailed analytics and performance tracking will be available in the next update.
                    </AlertDescription>
                  </Box>
                </Alert>
                          </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>

        {/* Create Class Modal */}
        <Modal isOpen={isCreateClassOpen} onClose={() => setIsCreateClassOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Class</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Class Name</FormLabel>
                  <Input
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="e.g., Advanced Mathematics"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    value={newClass.subject}
                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                    placeholder="Select subject"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Economics">Economics</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    placeholder="Brief description of the class..."
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Maximum Students</FormLabel>
                  <Input
                    type="number"
                    value={newClass.maxStudents}
                    onChange={(e) => setNewClass({ ...newClass, maxStudents: parseInt(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </FormControl>

                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    A unique class code will be automatically generated for students to join.
                  </AlertDescription>
                </Alert>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsCreateClassOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="purple" 
                onClick={createClass}
                isDisabled={!newClass.name || !newClass.subject}
              >
                Create Class
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Student Modal */}
        <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Add Student to {selectedClass?.name}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Student Email</FormLabel>
                  <Input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </FormControl>
                
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    The student must already have an account with this email address.
                  </AlertDescription>
                </Alert>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsAddStudentOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="purple" 
                onClick={addStudentToClass}
                isDisabled={!newStudent.email}
              >
                Add Student
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Create Assignment Modal */}
        <Modal isOpen={isCreateAssignmentOpen} onClose={() => setIsCreateAssignmentOpen(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Assignment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Assignment Title</FormLabel>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="Enter assignment title"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Enter assignment description"
                    rows={3}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Class</FormLabel>
                  <Select
                    value={newAssignment.classId}
                    onChange={(e) => setNewAssignment({...newAssignment, classId: e.target.value})}
                    placeholder="Select a class"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Total Points</FormLabel>
                  <Input
                    type="number"
                    value={newAssignment.totalPoints}
                    onChange={(e) => setNewAssignment({...newAssignment, totalPoints: parseInt(e.target.value)})}
                    min="1"
                    max="1000"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Assignment Type</FormLabel>
                  <Select
                    value={newAssignment.assignmentType}
                    onChange={(e) => setNewAssignment({...newAssignment, assignmentType: e.target.value})}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="homework">Homework</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Instructions</FormLabel>
                  <Textarea
                    value={newAssignment.instructions}
                    onChange={(e) => setNewAssignment({...newAssignment, instructions: e.target.value})}
                    placeholder="Enter detailed instructions for students"
                    rows={4}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsCreateAssignmentOpen(false)}>
                Cancel
                    </Button>
              <Button 
                colorScheme="purple" 
                onClick={createAssignment}
                isDisabled={!newAssignment.title || !newAssignment.classId || !newAssignment.dueDate}
              >
                Create Assignment
                    </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default TeacherDashboard; 