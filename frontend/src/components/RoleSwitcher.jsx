import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Text,
  useColorModeValue,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Only show in development environment
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setShowSwitcher(true);
    }
  }, []);
  
  if (!showSwitcher) return null;
  
  return (
    <Box 
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={999}
      bg={bgColor}
      p={3}
      borderRadius="md"
      boxShadow="lg"
      border="1px solid"
      borderColor={borderColor}
    >
      <Text fontSize="xs" mb={2} fontWeight="bold" color="orange.500">
        DEV MODE: Role Switcher
      </Text>
      <Flex direction="column" gap={2}>
        <Button 
          size="sm" 
          colorScheme={user?.role === 'student' ? 'blue' : 'gray'} 
          leftIcon={<Icon as={FaUserGraduate} />}
          onClick={() => {
            console.log('Student button clicked');
            switchRole('student');
          }}
          justifyContent="flex-start"
        >
          Student
        </Button>
        <Button 
          size="sm" 
          colorScheme={user?.role === 'parent' ? 'blue' : 'gray'} 
          leftIcon={<Icon as={FaUserTie} />}
          onClick={() => {
            console.log('Parent button clicked');
            switchRole('parent');
          }}
          justifyContent="flex-start"
        >
          Parent
        </Button>
        <Button 
          size="sm" 
          colorScheme={user?.role === 'teacher' ? 'blue' : 'gray'} 
          leftIcon={<Icon as={FaChalkboardTeacher} />}
          onClick={() => {
            console.log('Teacher button clicked');
            switchRole('teacher');
          }}
          justifyContent="flex-start"
        >
          Teacher
        </Button>
      </Flex>
    </Box>
  );
};

export default RoleSwitcher;