import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaClock, FaExpand, FaRedo, FaListOl, FaQuestionCircle } from 'react-icons/fa';
// import '../App.css'; // Removed, styles will come from Chakra and theme

const ExamSimulation = () => {
  // Router Hooks
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();

  // UI Hooks
  const toast = useToast();
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark');
  const headingColor = useColorModeValue('brand.800', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // State Hooks
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(7200); // Default time, will be overwritten
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for local data (fallback if no quizId - potentially unused or for future dev)
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [numQuestions, setNumQuestions] = useState(5);
  // const [questionSeed, setQuestionSeed] = useState(0);

  // Constants for fallback mode (if used)
  const subjects = [
    { id: 'math', name: 'Mathematics (Local)' },
    { id: 'physics', name: 'Physics (Local)' },
  ];

  // Effect Hooks
  useEffect(() => {
    const fetchQuizOrAttemptData = async () => {
      setLoadingQuiz(true);
      setQuizError(null);
      try {
        if (attemptId) {
          const response = await api.get(`/api/attempts/${attemptId}`);
          if (response && response.success && response.data) {
            const attemptData = response.data;
            const quizDetails = attemptData.quiz;
            const questionsFromAttempt = attemptData.questionsWithAnswers;

            setCurrentQuiz({
              _id: quizDetails.id, // Assuming quiz object in attempt has id
              title: quizDetails.title,
              subject: quizDetails.subject,
              paperCode: quizDetails.paperCode || '',
              examSession: quizDetails.examSession || '',
              duration: quizDetails.duration,
            });

            const mappedQuestions = questionsFromAttempt.map(q => ({
              id: q.id, // Actual question ID
              questionText: q.text,
              options: q.options, // Ensure options are populated in questionsWithAnswers
              type: q.type, // Store question type if needed for answer restoration logic
              // ... other necessary fields from question object
            }));
            setExamQuestions(mappedQuestions);

            const restoredAnswers = {};
            let lastAnsweredQuestionIndex = 0;

            questionsFromAttempt.forEach((q, index) => {
              const questionId = q.id;
              if (q.answer) {
                if (q.type === 'multiple-choice' || q.type === 'true-false') {
                  if (q.answer.selectedOptionIds && q.answer.selectedOptionIds.length > 0) {
                    const selectedOption = q.options.find(opt => opt._id.toString() === q.answer.selectedOptionIds[0].toString());
                    if (selectedOption) {
                      restoredAnswers[questionId] = selectedOption.text;
                    }
                  }
                } else if (q.answer.textAnswer) {
                  restoredAnswers[questionId] = q.answer.textAnswer;
                } else if (q.answer.numericalAnswer !== undefined) {
                  restoredAnswers[questionId] = q.answer.numericalAnswer.toString();
                }
                if (restoredAnswers[questionId]) {
                    lastAnsweredQuestionIndex = index;
                }
              }
            });
            setAnswers(restoredAnswers);

            let firstUnansweredIndex = 0;
            for(let i=0; i < mappedQuestions.length; i++) {
                if (!restoredAnswers[mappedQuestions[i].id]) {
                    firstUnansweredIndex = i;
                    break;
                }
                if (i === mappedQuestions.length - 1) {
                    firstUnansweredIndex = i;
                }
            }
            setCurrentQuestionIndex(firstUnansweredIndex);

            if (quizDetails.duration) {
              const durationInSeconds = quizDetails.duration * 60;
              const timeAlreadySpent = attemptData.timeSpent || 0; // timeSpent is in seconds
              const remainingTime = durationInSeconds - timeAlreadySpent;
              setTimeLeft(remainingTime > 0 ? remainingTime : durationInSeconds); // Fallback if time spent is high or invalid
            } else {
              setTimeLeft(3600); // Default 60 minutes if no duration
            }

          } else {
            throw new Error(response?.message || 'Failed to load attempt data.');
          }
        } else if (quizId) {
          // Existing logic to fetch new quiz data based on quizId
          // For IGCSE quizzes, use the /api/quizzes/igcse endpoint
          if (quizId === 'igcse') {
            const response = await api.get('/api/quizzes/igcse');
            if (response && response.success && response.data && response.data.length > 0) {
              const quizData = response.data[0];
              setCurrentQuiz({
                _id: quizData._id || 'igcse', // Use actual ID if available
                title: quizData.paperCode || 'IGCSE Practice Quiz',
                paperCode: quizData.paperCode,
                examSession: quizData.examSession,
                subject: quizData.subject,
                duration: quizData.duration || 45
              });
              setExamQuestions(quizData.questions || []);
              setTimeLeft((quizData.duration || 45) * 60);
            } else {
              throw new Error('No IGCSE quiz data available');
            }
          } else {
            const subjectQuizMatch = quizId.match(/^(physics|chemistry|mathematics|biology|economics)$/i);
            if (subjectQuizMatch) {
              const response = await api.get(`/api/subjects/${quizId}/questions`);
              if (response && response.success && response.data) {
                const quizData = response.data;
                setCurrentQuiz({
                  _id: quizId,
                  title: quizData.title,
                  paperCode: quizData.paperCode,
                  examSession: quizData.examSession,
                  subject: quizData.subject,
                  duration: quizData.duration
                });
                setExamQuestions(quizData.questions || []);
                setTimeLeft(quizData.duration * 60);
              } else {
                throw new Error(`No questions found for ${quizId}`);
              }
            } else {
              const quizDetailsResponse = await api.get(`/api/quizzes/${quizId}`);
              if (quizDetailsResponse && quizDetailsResponse.success && quizDetailsResponse.data) {
                const quizData = quizDetailsResponse.data;
                 setCurrentQuiz({
                    _id: quizData._id,
                    title: quizData.title,
                    subject: quizData.subject,
                    paperCode: quizData.paperCode,
                    examSession: quizData.examSession,
                    duration: quizData.duration
                });
                // Assuming questions are part of quizData or fetched from another endpoint:
                // This might need adjustment if questions aren't directly on quizData
                const questionsResponse = await api.get(`/api/quizzes/${quizId}/questions`); // Or from quizData.questions
                setExamQuestions(questionsResponse.data || quizData.questions || []);
                setTimeLeft(quizData.duration ? quizData.duration * 60 : 3600);
              } else {
                 throw new Error(`Quiz with ID ${quizId} not found.`);
              }
            }
          }
          setAnswers({});
          setCurrentQuestionIndex(0);
        } else {
          setQuizError('No quiz or attempt specified.');
        }
      } catch (error) {
        console.error('Error fetching quiz/attempt data:', error);
        setQuizError(error.message || 'Failed to load data.');
        setExamQuestions([]);
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuizOrAttemptData();
  }, [quizId, attemptId, navigate]); // Added attemptId and navigate

  useEffect(() => {
    if (loadingQuiz || quizError || !examQuestions || examQuestions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitExam(); // Auto-submit when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Warning for visibility change (simplified)
    // const handleVisibilityChange = () => {
    //   if (document.hidden) {
    //     toast({
    //       title: 'Warning',
    //       description: 'Switching tabs or minimizing during an exam is not recommended.',
    //       status: 'warning',
    //       duration: 5000,
    //       isClosable: true,
    //     });
    //   }
    // };
    // document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadingQuiz, quizError, examQuestions]);

  // Placeholder for local question generation if needed
  // const getLocalQuestions = (subject, num) => { ... return questions ... }
  // const refreshLocalQuestions = () => { ... }

  const jumpToQuestion = (index) => {
    if (index >= 0 && index < examQuestions.length) {
      setCurrentQuestionIndex(index);
      // Optional: Scroll to question, though typically one question is shown at a time.
    }
  };

  const enterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
      await document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      await document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
      await document.documentElement.msRequestFullscreen();
    }
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmitExam = () => {
    if (Object.keys(answers).length === 0 && examQuestions.length > 0) {
      toast({
        title: 'No answers selected',
        description: 'Please answer at least one question before submitting.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const examData = {
      quizId: currentQuiz?._id,
      title: currentQuiz?.title || 'Exam Results',
      paperCode: currentQuiz?.paperCode,
      examSession: currentQuiz?.examSession,
      subject: currentQuiz?.subject,
      questions: examQuestions,
      answers,
      timeLeft, // Include time left or time taken if needed
      timestamp: new Date().toISOString(),
    };
    navigate('/exam-results', { state: { examData } });
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = examQuestions[currentQuestionIndex];

  if (loadingQuiz) {
    return (
      <Flex justify="center" align="center" minH="80vh" bg={pageBg}>
        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
        <Text ml={4} fontSize="xl" color={textColor}>Loading Quiz...</Text>
      </Flex>
    );
  }

  if (quizError) {
    return (
      <Container centerContent py={10} bg={pageBg} minH="100vh">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          bg={cardBg}
          borderRadius="lg"
          boxShadow="md"
        >
          <AlertIcon boxSize="40px" mr={0} color="red.500" />
          <AlertTitle mt={4} mb={1} fontSize="xl" color={headingColor}>
            Error Loading Quiz
          </AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>
            {quizError}
          </AlertDescription>
          <Button mt={4} colorScheme="brand" onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!currentQuiz || !examQuestions || examQuestions.length === 0) {
     return (
      <Container centerContent py={10} bg={pageBg} minH="100vh">
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          bg={cardBg}
          borderRadius="lg"
          boxShadow="md"
        >
          <Icon as={FaQuestionCircle} boxSize="40px" mr={0} color="brand.500" />
          <AlertTitle mt={4} mb={1} fontSize="xl" color={headingColor}>
            No Questions Available
          </AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>
            There are no questions available for this quiz at the moment.
          </AlertDescription>
          <Button mt={4} colorScheme="brand" onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            p={4}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
          >
            <VStack align={{ base: 'center', md: 'start' }} spacing={1} mb={{ base: 4, md: 0 }}>
              <Heading size="lg" color={headingColor}>{currentQuiz.title}</Heading>
              <HStack spacing={4} color={subtleTextColor} fontSize="sm">
                {currentQuiz.paperCode && <Text>Paper: {currentQuiz.paperCode}</Text>}
                {currentQuiz.examSession && <Text>Session: {currentQuiz.examSession}</Text>}
                <Text>Questions: {examQuestions.length}</Text>
              </HStack>
            </VStack>
            <HStack spacing={{ base: 2, md: 4 }} wrap="wrap" justify={{base: "center", md: "flex-end"}}>
              <Flex align="center" bg="red.500" color="white" px={3} py={1.5} borderRadius="md" boxShadow="md">
                <Icon as={FaClock} mr={2} />
                <Text fontWeight="bold" fontSize="md">{formatTime(timeLeft)}</Text>
              </Flex>
              {!isFullscreen && (
                <Button
                  leftIcon={<Icon as={FaExpand} />}
                  onClick={enterFullscreen}
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                >
                  Fullscreen
                </Button>
              )}
            </HStack>
          </Flex>

          {/* Question Area */}
          <Box p={{base:4, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
            <Heading size="md" mb={1} color={textColor}>
              Question {currentQuestionIndex + 1} of {examQuestions.length}
            </Heading>
            <Text fontSize="lg" color={textColor} mb={6} minH="3em">
              {currentQ?.questionText}
            </Text>

            <RadioGroup
              onChange={(value) => handleAnswerChange(currentQ.id, value)} // Use currentQ.id
              value={answers[currentQ.id] || ''} // Use currentQ.id
            >
              <VStack spacing={4} align="stretch">
                {currentQ?.options.map((option, optIndex) => ( // Ensure currentQ.options exists
                  <Radio
                    key={option._id || optIndex} // Use option._id if available, otherwise index
                    value={option.text} // The value passed to handleAnswerChange
                    size="lg"
                    colorScheme="brand"
                    borderColor={borderColor}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    _hover={{ bg: useColorModeValue('brand.50', 'brand.900')}}
                  >
                    <Text color={textColor} fontSize="md">{option.text}</Text>
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </Box>

          {/* Navigation & Submission Footer */}
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align="center"
            p={4}
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
            mt={4} // Added margin top for spacing from question box
          >
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              isDisabled={currentQuestionIndex === 0}
              colorScheme="brand"
              variant="outline"
              size="lg"
              mb={{base:2, sm:0}}
            >
              Previous
            </Button>
            <Text color={textColor} fontWeight="medium">
              Question {currentQuestionIndex + 1} / {examQuestions.length}
            </Text>
            {currentQuestionIndex < examQuestions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                isDisabled={currentQuestionIndex === examQuestions.length - 1}
                colorScheme="brand"
                variant="outline"
                size="lg"
                mt={{base:2, sm:0}}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmitExam} colorScheme="green" size="lg" mt={{base:2, sm:0}}>
                Submit Exam
              </Button>
            )}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExamSimulation;