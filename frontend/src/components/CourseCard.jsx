import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  // Badge, // Removed as custom Box is used
  Image,
  Icon,
  Progress,
  useColorModeValue,
  VStack // Added VStack
} from '@chakra-ui/react';
import { FaBook } from 'react-icons/fa'; // Assuming FaBook is still relevant
import { Link as RouterLink } from 'react-router-dom';

const CourseCard = ({ 
  id, 
  title, 
  progress, 
  description, 
  image, 
  level, 
  badge, 
  nextLesson,
  isEnrolled = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const placeholderBg = useColorModeValue('gray.100', 'gray.700');
  const iconColor = useColorModeValue('brand.600', 'brand.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const levelBadgeBg = useColorModeValue('brand.600', 'brand.400');
  const statusBadgeBg = badge === 'New' ? 'green.500' :
                        badge === 'Popular' ? 'purple.500' :
                        useColorModeValue('orange.400', 'orange.300');

  return (
    <VStack
      bg={bgColor}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      transition="all 0.3s ease-in-out"
      _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl' }}
      spacing={0}
      align="stretch"
      minH="400px"
      maxW={{ base: "90%", sm: "350px" }}
      w="full"
    >
      <Box h="180px" bg={placeholderBg} position="relative" overflow="hidden">
        {image ? (
          <Image src={image} alt={title} objectFit="cover" w="100%" h="100%" />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <Icon as={FaBook} boxSize={12} color={iconColor} />
          </Flex>
        )}
        {level && (
          <Box
            position="absolute"
            top="12px"
            right="12px"
            bg={levelBadgeBg}
            color="white"
            fontSize="xs"
            px={3}
            py={1.5}
            borderRadius="md"
            fontWeight="semibold"
          >
            {level}
          </Box>
        )}
        {badge && (
          <Box
            position="absolute"
            top="12px"
            left="12px"
            bg={statusBadgeBg}
            color="white"
            fontSize="xs"
            px={3}
            py={1.5}
            borderRadius="md"
            fontWeight="semibold"
          >
            {badge}
          </Box>
        )}
      </Box>

      <VStack
        p={{ base: 4, md: 5 }}
        spacing={3}
        align="stretch"
        flexGrow={1}
        justifyContent="space-between"
      >
        <VStack spacing={2} align="stretch" flexGrow={1}>
          <Heading
            size="md"
            color={headingColor}
            noOfLines={2}
            minHeight="2.8em"
            title={title}
          >
            {title}
          </Heading>
          {description && (
            <Text
              fontSize="sm"
              color={textColor}
              noOfLines={3}
              minHeight="3.6em"
            >
              {description}
            </Text>
          )}
        </VStack>

        {isEnrolled && progress !== undefined && (
          <Box pt={2} width="full">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" fontWeight="medium" color={textColor}>Progress</Text>
              <Text fontSize="xs" color={textColor}>{progress}%</Text>
            </Flex>
            <Progress value={progress} size="xs" colorScheme="blue" borderRadius="full" />
            {nextLesson && (
              <Text fontSize="xs" mt={1.5} color={textColor} fontStyle="italic" noOfLines={1}>
                Next: {nextLesson}
              </Text>
            )}
          </Box>
        )}

        <Button
          as={RouterLink}
          to={`/courses/${id}`}
          size="sm"
          variant="solid"
          colorScheme={isEnrolled ? "green" : "blue"}
          width="full"
          mt={3}
          // _hover={{ opacity: 0.9 }} // Removed to allow global theme hover to apply
        >
          {isEnrolled ? 'Continue Learning' : 'View Course Details'}
        </Button>
      </VStack>
    </VStack>
  );
};

export default CourseCard;