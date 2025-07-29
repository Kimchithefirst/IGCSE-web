import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button as ChakraButton,
  Spinner,
  Text,
  VStack,
  Box,
  // List, // Not used
  // ListItem, // Not used
  Flex,
  useDisclosure,
  // Grid, // Not used
  Badge,
  IconButton,
  Tooltip,
  useToast,
  // ScaleFade, // Not used in current refactor
  // SlideFade, // Not used in current refactor
  Collapse, // Used for explanations
  HStack,
  // Divider, // Not used
  useBreakpointValue,
  Container,
  Heading,
  Alert,     // Added Alert
  AlertIcon, // Added AlertIcon
  AlertTitle,// Added AlertTitle
  AlertDescription, // Added AlertDescription
  Icon,      // Added Icon
  useColorModeValue // Added useColorModeValue
} from '@chakra-ui/react';
import { RepeatIcon, StarIcon, CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'; // Added more icons
import { FaBook, FaRedo, FaChartBar, FaQuestionCircle } from 'react-icons/fa'; // Added some react-icons
import api from '../utils/api';

const ExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const toast = useToast();

  // Theme-based colors
  const pageBg = useColorModeValue('secondary.100', 'secondary.900');
  const cardBg = useColorModeValue('defaults.cardBg.default', 'defaults.cardBg._dark'); // Updated
  const headingColor = useColorModeValue('brand.800', 'brand.200');
  const textColor = useColorModeValue('gray.700', 'gray.400');
  const subtleTextColor = useColorModeValue('gray.500', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const correctColor = useColorModeValue('green.500', 'green.300');
  const incorrectColor = useColorModeValue('red.500', 'red.300');
  const explanationBg = useColorModeValue('blue.50', 'blue.900');
  const explanationBorder = useColorModeValue('blue.400', 'blue.600');

  // const navigate = useNavigate(); // Removed duplicate declaration
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const [activeQuestionForRecommendations, setActiveQuestionForRecommendations] = useState(null);
  const [originalQuestionTextForModal, setOriginalQuestionTextForModal] = useState('');
  const [modalTitle, setModalTitle] = useState('Similar Questions');
  const [revealedAnswers, setRevealedAnswers] = useState({}); // State for revealed answers in modal
  const [refreshing, setRefreshing] = useState(false); // State for refreshing similar questions
  const [favorites, setFavorites] = useState(new Set()); // State for favorited questions
  // const [showAnimations, setShowAnimations] = useState(true); // Removed unused state
  const [questionMetadata, setQuestionMetadata] = useState(null); // State for storing question metadata

  
  // Responsive modal size
  const modalSize = useBreakpointValue({ base: 'full', md: '4xl', lg: '5xl' }); // Adjusted modal size
  // const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 }); // For recommended questions grid

  useEffect(() => {
    if (location.state?.examData) {
      const { answers, questions, title, subject, paperCode, examSession } = location.state.examData;
      
      let correctCount = 0;
      const questionResults = questions.map(q => {
        const userAnswer = answers[q.id] || ''; // Fix: Use q.id instead of q._id
        let isCorrect = false;
        let correctOptionText = '';

        if (q.type === 'multiple-choice') {
          const correctOption = q.options?.find(opt => opt.isCorrect);
          if (correctOption) {
            correctOptionText = correctOption.text;
            if (userAnswer === correctOption.text) {
              isCorrect = true;
            }
          }
        } else {
          // For questions without explicit type, assume they use correctAnswer field
          isCorrect = userAnswer === q.correctAnswer;
          correctOptionText = q.correctAnswer;
        }
        
        if (isCorrect) {
          correctCount++;
        }
        
        return {
          ...q,
          userAnswer,
          isCorrect,
          correctOptionText: q.type === 'multiple-choice' ? correctOptionText : q.correctAnswer
        };
      });
      
      const scorePercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      
      setResults({
        title, // Store the specific paper title
        subject, // Store the broader subject category
        paperCode,
        examSession,
        questions: questionResults,
        totalQuestions: questions.length,
        correctAnswers: correctCount
      });
      
      setScore(scorePercentage);
      setLoading(false);
    } else {
      // Redirect if no exam data available
      navigate('/dashboard');
    }
  }, [location, navigate]);

  // Helper function to generate meaningful modal titles
  const generateModalTitle = (topics, subject, questionText) => {
    if (topics && topics.length > 0) {
      const topicLabels = {
        forces: 'Forces & Motion',
        waves: 'Waves & Light',
        mechanics: 'Mechanics',
        energy: 'Energy & Power',
        electricity: 'Electricity',
        thermal: 'Heat & Temperature',
        atomic: 'Atomic Physics'
      };
      
      const readableTopics = topics.map(topic => topicLabels[topic] || topic).join(', ');
      return `Similar Questions: ${readableTopics}`;
    } else if (subject) {
      return `More ${subject} Practice`;
    } else {
      // Fallback: extract key terms from question
      const keyTerms = extractKeyTerms(questionText);
      if (keyTerms.length > 0) {
        return `Similar Questions: ${keyTerms.join(', ')}`;
      }
      return 'Related Practice Questions';
    }
  };

  // Helper to extract key terms from question text for fallback titles
  const extractKeyTerms = (questionText) => {
    if (!questionText) return [];
    
    const text = questionText.toLowerCase();
    const terms = [];
    
    // Physics concepts
    if (text.includes('newton') || text.includes('law')) terms.push("Newton's Laws");
    if (text.includes('force')) terms.push('Forces');
    if (text.includes('motion')) terms.push('Motion');
    if (text.includes('energy')) terms.push('Energy');
    if (text.includes('light') || text.includes('wave')) terms.push('Waves');
    if (text.includes('electric')) terms.push('Electricity');
    if (text.includes('heat') || text.includes('temperature')) terms.push('Thermal Physics');
    
    return terms.slice(0, 2); // Limit to 2 key terms
  };

  const handleViewSimilarQuestions = async (questionId, questionText) => {
    setActiveQuestionForRecommendations(questionId);
    setOriginalQuestionTextForModal(questionText || 'Question'); // Keep for fallback
    setLoadingRecommendations(true);
    setRecommendationError(null);
    setRecommendedQuestions([]);
    
    // Set initial modal title while loading
    setModalTitle('Loading Similar Questions...');
    openModal(); // Open the modal

    try {
      // Call the new similar questions API endpoint
      const response = await api.get(`/api/questions/${questionId}/similar`);
      
      console.log('Similar questions response:', response);
      
      if (response && response.success && response.data) {
        setRecommendedQuestions(response.data);
        
        // Store metadata for display
        if (response.metadata) {
          setQuestionMetadata(response.metadata);
        }
        
        // Generate meaningful modal title from API response
        const sourceQuestion = response.sourceQuestion;
        const subject = response.data[0]?.subject || 'Physics'; // Fallback to Physics
        const topics = sourceQuestion?.topics || [];
        
        const meaningfulTitle = generateModalTitle(topics, subject, questionText);
        setModalTitle(meaningfulTitle);
        
        if (response.data.length === 0) {
          setRecommendationError('No similar questions found for this topic.');
          setModalTitle('No Similar Questions Found');
        }
      } else {
        setRecommendedQuestions([]);
        setRecommendationError('No similar questions found.');
        setModalTitle('No Similar Questions Found');
      }
    } catch (err) {
      console.error("Error fetching similar questions:", err);
      if (err.message.includes('404')) {
        setRecommendationError('Question not found in database.');
        setModalTitle('Question Not Found');
      } else {
        setRecommendationError(err.message || 'Failed to fetch similar questions.');
        setModalTitle('Error Loading Questions');
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const toggleRevealAnswer = (questionId) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Function to refresh similar questions (get a different set)
  const handleRefreshSimilarQuestions = async () => {
    if (!activeQuestionForRecommendations) return;
    
    setRefreshing(true);
    setLoadingRecommendations(true);
    setRecommendedQuestions([]);
    setRevealedAnswers({});
    
    try {
      // Add a timestamp to force bypass cache
      const response = await api.get(`/api/questions/${activeQuestionForRecommendations}/similar?refresh=${Date.now()}`);
      
      if (response && response.success && response.data) {
        setRecommendedQuestions(response.data);
        setQuestionMetadata(response.metadata);
        
        toast({
          title: "Questions Refreshed!",
          description: `Found ${response.data.length} new similar questions`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error refreshing similar questions:", err);
      toast({
        title: "Refresh Failed",
        description: "Could not load new questions. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRefreshing(false);
      setLoadingRecommendations(false);
    }
  };

  // Function to toggle favorite status of a question
  const toggleFavorite = (questionId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(questionId)) {
        newFavorites.delete(questionId);
        toast({
          title: "Removed from Favorites",
          status: "info",
          duration: 1500,
          isClosable: true,
        });
      } else {
        newFavorites.add(questionId);
        toast({
          title: "Added to Favorites",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
      }
      return newFavorites;
    });
  };

  // Function to get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'core':
        return 'green';
      case 'medium':
      case 'standard':
        return 'yellow';
      case 'hard':
      case 'extended':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Enhanced close modal function with cleanup
  const handleCloseModal = () => {
    closeModal();
    setActiveQuestionForRecommendations(null);
    setRecommendedQuestions([]);
    setRecommendationError(null);
    setOriginalQuestionTextForModal('');
    setModalTitle('Similar Questions');
    setRevealedAnswers({});
    setRefreshing(false);
    setQuestionMetadata(null);
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'Escape':
          handleCloseModal();
          break;
        case 'r':
        case 'R':
          if (!loadingRecommendations && !refreshing) {
            handleRefreshSimilarQuestions();
          }
          break;
        case '1':
        case '2': 
        case '3':
          const questionIndex = parseInt(event.key) - 1;
          if (recommendedQuestions[questionIndex]) {
            toggleRevealAnswer(recommendedQuestions[questionIndex]._id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, loadingRecommendations, refreshing, recommendedQuestions]);

  const handleReturnToDashboard = () => {
    navigate('/dashboard'); // Or role-specific dashboard
  };

  const handleTakeAnotherExam = () => {
    navigate('/courses'); // Navigate to courses page to select another exam
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh" bg={pageBg}>
        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
        <Text ml={4} fontSize="xl" color={textColor}>Calculating your results...</Text>
      </Flex>
    );
  }

  if (!results) { // Should not happen if loading is false and navigation from exam is correct
    return (
       <Container centerContent py={10} bg={pageBg} minH="100vh">
        <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" bg={cardBg} borderRadius="lg" boxShadow="md">
          <AlertIcon boxSize="40px" mr={0} color="red.500" />
          <AlertTitle mt={4} mb={1} fontSize="xl" color={headingColor}>Results Not Available</AlertTitle>
          <AlertDescription maxWidth="sm" color={textColor}>There was an issue loading your exam results.</AlertDescription>
           <ChakraButton mt={4} colorScheme="brand" onClick={() => navigate(-1)}>Go Back</ChakraButton>
        </Alert>
      </Container>
    );
  }

  const scoreColor = score >= 70 ? 'green.500' : score >= 40 ? 'yellow.500' : 'red.500';

  return (
    <Box bg={pageBg} minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="container.lg">
        <VStack spacing={{base:6, md:8}} align="stretch">
          {/* Header & Score Summary */}
          <Box p={{base:4, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg" textAlign="center">
            <Heading as="h1" size="xl" color={headingColor} mb={2}>
              Exam Results: {results.title}
            </Heading>
            <HStack spacing={4} justify="center" color={subtleTextColor} fontSize="sm" mb={4} wrap="wrap">
              {results.subject && <Text><strong>Subject:</strong> {results.subject}</Text>}
              {results.paperCode && <Text><strong>Paper Code:</strong> {results.paperCode}</Text>}
              {results.examSession && <Text><strong>Session:</strong> {results.examSession}</Text>}
            </HStack>
            <Flex direction="column" align="center" justify="center" p={6} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
              <Text fontSize="5xl" fontWeight="bold" color={scoreColor} mb={2}>
                {score}%
              </Text>
              <Heading size="md" color={textColor} mb={2}>
                {score >= 70 ? 'Excellent!' : score >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
              </Heading>
              <Text fontSize="lg" color={subtleTextColor}>
                You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly.
              </Text>
            </Flex>
          </Box>

          {/* Detailed Feedback Section */}
          <Box p={{base:4, md:6}} bg={cardBg} borderRadius="xl" boxShadow="lg">
            <Heading size="lg" color={headingColor} mb={6}>
              Detailed Feedback
            </Heading>
            <VStack spacing={6} align="stretch">
              {results.questions.map((question, index) => (
                <Box
                  key={question.id || index}
                  p={5}
                  borderWidth="1px"
                  borderColor={question.isCorrect ? correctColor : incorrectColor}
                  borderRadius="lg"
                  bg={useColorModeValue(question.isCorrect ? 'green.50' : 'red.50', question.isCorrect ? 'green.900' : 'red.900')}
                  boxShadow="sm"
                >
                  <HStack justify="space-between" mb={3}>
                    <Heading size="md" color={textColor}>Question {index + 1}</Heading>
                    <Badge colorScheme={question.isCorrect ? 'green' : 'red'} variant="solid" px={3} py={1} borderRadius="md">
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </HStack>
                  <Text fontSize="md" color={textColor} mb={4}>{question.text || question.questionText}</Text>

                  {question.type === 'multiple-choice' ? (
                    <VStack spacing={3} align="stretch" mb={4}>
                      {question.options?.map((option, optIndex) => (
                        <Box
                          key={option._id || optIndex}
                          p={3}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={
                            option.text === question.correctOptionText ? correctColor :
                            (option.text === question.userAnswer && !question.isCorrect) ? incorrectColor :
                            borderColor
                          }
                          bg={
                            option.text === question.correctOptionText ? useColorModeValue('green.100', 'green.700') :
                            (option.text === question.userAnswer && !question.isCorrect) ? useColorModeValue('red.100', 'red.700') :
                            cardBg // or a neutral subtleBg
                          }
                        >
                          <Flex align="center">
                            <Text flex={1} color={textColor} fontWeight={option.text === question.userAnswer || option.text === question.correctOptionText ? "medium" : "normal"}>
                              {String.fromCharCode(65 + optIndex)}. {option.text}
                            </Text>
                            {option.text === question.correctOptionText && <Icon as={CheckCircleIcon} color={correctColor} ml={2} />}
                            {option.text === question.userAnswer && !question.isCorrect && <Icon as={WarningIcon} color={incorrectColor} ml={2} />}
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <VStack spacing={3} align="stretch" mb={4}>
                      <Box>
                        <Text fontWeight="medium" color={subtleTextColor}>Your Answer:</Text>
                        <Text p={2} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md" color={textColor}>
                          {question.userAnswer || '(No answer provided)'}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium" color={subtleTextColor}>Correct Answer:</Text>
                        <Text p={2} bg={useColorModeValue('green.100', 'green.800')} borderRadius="md" color={correctColor} fontWeight="bold">
                          {question.correctOptionText || question.correctAnswer || '(Not available)'}
                        </Text>
                      </Box>
                    </VStack>
                  )}

                  {question.explanation && (
                    <Box mt={3} p={3} bg={explanationBg} borderRadius="md" borderLeft="4px" borderColor={explanationBorder}>
                      <Heading size="sm" color={useColorModeValue('blue.700', 'blue.200')} mb={1}>Explanation:</Heading>
                      <Text fontSize="sm" color={useColorModeValue('blue.800', 'blue.100')}>{question.explanation}</Text>
                    </Box>
                  )}
                  <ChakraButton
                    size="sm"
                    variant="outline"
                    colorScheme="brand"
                    mt={4}
                    leftIcon={<Icon as={FaQuestionCircle}/>}
                    onClick={() => handleViewSimilarQuestions(question.id, question.text || question.questionText)}
                  >
                    Practice Similar Questions
                  </ChakraButton>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Actions Footer */}
          <Flex direction={{ base: 'column', sm: 'row' }} justify="center" gap={4} mt={4}>
            <ChakraButton onClick={handleTakeAnotherExam} colorScheme="brand" variant="solid" size="lg" leftIcon={<Icon as={FaRedo}/>}>
              Take Another Exam
            </ChakraButton>
            <ChakraButton onClick={handleReturnToDashboard} colorScheme="gray" variant="outline" size="lg" leftIcon={<Icon as={FaChartBar}/>}>
              Return to Dashboard
            </ChakraButton>
          </Flex>
        </VStack>
      </Container>

      {/* Modal for Similar Questions - STUBBED for now, will be complex */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size={modalSize} scrollBehavior="inside" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg={cardBg} borderRadius="xl" maxH="90vh" boxShadow="2xl">
          <ModalHeader color={headingColor} borderBottomWidth="1px" borderColor={borderColor}>
             <Flex justify="space-between" align="center" wrap="wrap">
              <Box>
                {modalTitle}
                {questionMetadata && (
                  <Text fontSize="sm" color={subtleTextColor} mt={1}>
                    {questionMetadata.fromDatabase} from database • {questionMetadata.fromAI} AI-generated
                  </Text>
                )}
              </Box>
              <IconButton
                icon={<RepeatIcon />}
                size="sm"
                variant="ghost"
                colorScheme="brand"
                onClick={handleRefreshSimilarQuestions}
                isLoading={refreshing}
                isDisabled={loadingRecommendations}
                aria-label="Refresh questions"
                mt={{ base: 2, md: 0 }}
              />
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6} px={{base:4, md:6}}>
            {/* Content from original modal, to be styled with Chakra components */}
            {loadingRecommendations && (
              <Flex justify="center" align="center" minH="200px" direction="column">
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text mt={4} fontSize="lg" color={textColor}>Finding similar questions...</Text>
                <Text fontSize="sm" color={subtleTextColor} mt={1}>Searching database and generating AI questions.</Text>
              </Flex>
            )}
            {recommendationError && (
              <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" py={6} borderRadius="lg">
                <AlertIcon boxSize="30px" as={WarningIcon} color="red.400"/>
                <AlertTitle mt={3} mb={1} fontSize="lg" color={headingColor}>{modalTitle}</AlertTitle>
                <AlertDescription color={textColor}>{recommendationError}</AlertDescription>
              </Alert>
            )}
            {!loadingRecommendations && !recommendationError && recommendedQuestions.length === 0 && (
               <Text textAlign="center" color={textColor} py={10}>🔍 No similar questions found. Try refreshing or select another question.</Text>
            )}
             {!loadingRecommendations && !recommendationError && recommendedQuestions.length > 0 && (
              <VStack spacing={5} align="stretch">
                 {recommendedQuestions.map((recQuestion, index) => (
                  <Box
                    key={recQuestion._id || index} 
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={borderColor}
                    bg={recQuestion.generatedBy === 'AI' ? useColorModeValue('purple.50', 'purple.800') : useColorModeValue('green.50', 'green.800')}
                    _hover={{ borderColor: recQuestion.generatedBy === 'AI' ? 'purple.400' : 'green.400', shadow:"md"}}
                    position="relative"
                    transition="all 0.2s ease-in-out"
                  >
                    <HStack justify="space-between" align="flex-start" mb={2}>
                      <Text fontSize="sm" color={subtleTextColor} fontWeight="medium">Question {index + 1}</Text>
                      <HStack>
                         {recQuestion.difficulty && (
                          <Badge variant="subtle" colorScheme={getDifficultyColor(recQuestion.difficulty)}>{recQuestion.difficulty}</Badge>
                        )}
                        <Badge variant="solid" colorScheme={recQuestion.generatedBy === 'AI' ? 'purple' : 'green'} fontSize="xs">
                          {recQuestion.generatedBy === 'AI' ? '🤖 AI' : '📚 DB'}
                        </Badge>
                         <IconButton
                            icon={<StarIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme={favorites.has(recQuestion._id) ? 'yellow' : 'gray'}
                            color={favorites.has(recQuestion._id) ? 'yellow.400' : subtleTextColor}
                            onClick={() => toggleFavorite(recQuestion._id)}
                            aria-label="Toggle favorite"
                          />
                      </HStack>
                    </HStack>
                    <Text fontWeight="medium" color={textColor} mb={3} fontSize="md">{recQuestion.text || recQuestion.questionText}</Text>

                    {recQuestion.options && recQuestion.options.length > 0 && (
                      <VStack spacing={2} align="stretch" mt={2}>
                        {recQuestion.options.map((opt, optIndex) => (
                          <Box
                            key={opt._id || optIndex}
                            p={2.5} borderRadius="md"
                            bg={revealedAnswers[recQuestion._id] && opt.isCorrect ? useColorModeValue('green.100', 'green.700') : useColorModeValue('gray.50', 'gray.700')}
                            borderWidth="1px"
                            borderColor={revealedAnswers[recQuestion._id] && opt.isCorrect ? useColorModeValue('green.300', 'green.500') : borderColor }
                          >
                            <Text fontSize="sm" color={revealedAnswers[recQuestion._id] && opt.isCorrect ? useColorModeValue('green.700', 'green.100') : textColor}>
                              {String.fromCharCode(65 + optIndex)}. {opt.text}
                              {revealedAnswers[recQuestion._id] && opt.isCorrect && " (Correct)"}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    )}
                    {revealedAnswers[recQuestion._id] && recQuestion.type !== 'multiple-choice' && recQuestion.correctAnswer && (
                       <Text fontSize="sm" color={correctColor} mt={2} p={2} bg={useColorModeValue('green.100', 'green.700')} borderRadius="md"><strong>Correct Answer:</strong> {recQuestion.correctAnswer}</Text>
                    )}
                    {revealedAnswers[recQuestion._id] && recQuestion.explanation && (
                      <Box mt={3} p={3} bg={explanationBg} borderRadius="md" borderLeft="3px" borderColor={explanationBorder}>
                        <Text fontSize="sm" color={useColorModeValue('blue.800', 'blue.100')}><strong>Explanation:</strong> {recQuestion.explanation}</Text>
                      </Box>
                    )}
                     <ChakraButton size="sm" mt={3} colorScheme={revealedAnswers[recQuestion._id] ? "red" : "blue"} variant="outline" onClick={() => toggleRevealAnswer(recQuestion._id)}>
                      {revealedAnswers[recQuestion._id] ? 'Hide Answer' : 'Show Answer'}
                    </ChakraButton>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} bg={useColorModeValue('gray.50', 'gray.800')}>
             <VStack align="start" spacing={1} flex={1} mr={4}>
                <Text fontSize="xs" color={subtleTextColor}>Shortcuts: R = Refresh, 1-3 = Reveal Answer, ESC = Close</Text>
              </VStack>
            <ChakraButton colorScheme="brand" variant="ghost" onClick={handleCloseModal}>Close</ChakraButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExamResults; 