import React from 'react'; // Removed useState
import { 
  Box, 
  Flex, 
  HStack, 
  IconButton, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Container,
  Heading,
  Avatar,
  // Text, // Removed as not explicitly used
  Link,
  Icon,
  useDisclosure,
  Stack,
  Collapse,
  useTheme // Added useTheme
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaSignOutAlt, 
  FaChalkboardTeacher, 
  FaBook, 
  FaGraduationCap, 
  FaUserGraduate,
  FaClock 
} from 'react-icons/fa';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const NavLink = ({ children, to, icon }) => (
  <Link
    as={RouterLink}
    to={to}
    px={3} // Increased padding
    py={2} // Increased padding
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('brand.100', 'brand.700'), // Theme hover color
      color: useColorModeValue('brand.700', 'white'), // Theme hover text color
    }}
    display="flex"
    alignItems="center"
    fontWeight="medium" // Medium font weight for nav links
  >
    {icon && <Icon as={icon} mr={2} />}
    {children}
  </Link>
);

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const theme = useTheme(); // Added
  const navbarBg = useColorModeValue(theme.colors.defaults.cardBg.default, theme.colors.defaults.cardBg._dark); // Updated
  const logoColor = useColorModeValue('brand.700', 'brand.300'); // Theme logo color - remains brand for now
  const menuListBorderColor = useColorModeValue('gray.200', 'gray.700');
  const collapseBorderColor = useColorModeValue('gray.200', 'gray.700');
  const signoutHoverBg = useColorModeValue('red.100', 'red.700');
  const signoutHoverColor = useColorModeValue('red.700', 'white');
  const signoutTextColor = useColorModeValue('gray.600', 'gray.200');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Role would normally come from the user object
  const userRole = user?.role || 'student'; // Default to student if not specified
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    switch(userRole) {
      case 'parent':
        return '/pdashboard';
      case 'teacher':
        return '/tdashboard';
      default:
        return '/dashboard';
    }
  };

  const getDashboardIcon = () => {
    switch(userRole) {
      case 'parent':
        return FaUserGraduate;
      case 'teacher':
        return FaChalkboardTeacher;
      default:
        return FaChalkboardTeacher;
    }
  };

  const getDashboardText = () => {
    switch(userRole) {
      case 'parent':
        return 'Parent Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Box bg={navbarBg} px={{ base: 4, md: 6 }} boxShadow="md"> {/* Adjusted padding and shadow */}
      <Container maxW="container.xl">
        <Flex h={{ base: 16, md: 20 }} alignItems={'center'} justifyContent={'space-between'}> {/* Increased height */}
          <IconButton
            size={'md'}
            variant="ghost" // Ghost variant for hamburger
            colorScheme="brand" // Use brand color
            icon={isOpen ? <FaTimes /> : <FaBars />}
            aria-label={'Toggle Navigation'}
            display={{ md: 'none' }}
            onClick={onToggle}
          />
          
          <HStack spacing={{ base: 4, md: 8 }} alignItems={'center'}> {/* Responsive spacing */}
            <Box as={RouterLink} to="/">
              <Heading size="md" color={logoColor}>
                <Flex alignItems="center">
                  <Icon as={FaGraduationCap} mr={2} />
                  IGCSE Prep
                </Flex>
              </Heading>
            </Box>
            <HStack as={'nav'} spacing={{ base: 2, md: 4 }} display={{ base: 'none', md: 'flex' }}> {/* Responsive spacing */}
              <NavLink to="/" icon={FaBook}>Home</NavLink>
              {user && (
                <>
                  <NavLink to={getDashboardLink()} icon={getDashboardIcon()}>
                    {getDashboardText()}
                  </NavLink>
                  <NavLink to="/courses" icon={FaBook}>Courses</NavLink>
                  <NavLink to="/exam-simulation" icon={FaClock}>Exam Simulation</NavLink>
                </>
              )}
            </HStack>
          </HStack>
          
          <Flex alignItems={'center'}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'ghost'} // Ghost variant for avatar button
                  cursor={'pointer'}
                  minW={0}
                  colorScheme="brand" // Use brand color
                >
                  <Avatar
                    size={'sm'}
                    name={user.name || 'User'}
                    bg="brand.500" // Themed avatar
                    color="white"
                  />
                </MenuButton>
                <MenuList boxShadow="lg" borderColor={menuListBorderColor}>
                  <MenuItem icon={<Icon as={FaUser} color="brand.600" />}>Profile</MenuItem>
                  <MenuItem icon={<Icon as={FaBook} color="brand.600" />}>My Courses</MenuItem>
                  {userRole === 'parent' && (
                    <MenuItem 
                      icon={<Icon as={FaUserGraduate} color="brand.600" />}
                      as={RouterLink} 
                      to="/pdashboard"
                    >
                      Parent Dashboard
                    </MenuItem>
                  )}
                  {userRole === 'student' && (
                    <MenuItem 
                      icon={<Icon as={FaChalkboardTeacher} color="brand.600" />}
                      as={RouterLink} 
                      to="/dashboard"
                    >
                      Student Dashboard
                    </MenuItem>
                  )}
                  {userRole === 'teacher' && (
                    <MenuItem 
                      icon={<Icon as={FaChalkboardTeacher} color="brand.600" />}
                      as={RouterLink} 
                      to="/tdashboard"
                    >
                      Teacher Dashboard
                    </MenuItem>
                  )}
                  <MenuDivider />
                  <MenuItem icon={<Icon as={FaSignOutAlt} color="red.500" />} onClick={handleLogout}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={{ base: 2, md: 4 }}> {/* Responsive spacing */}
                <Button as={RouterLink} to="/login" variant="outline" colorScheme="brand"> {/* Changed to outline */}
                  Sign In
                </Button>
                <Button as={RouterLink} to="/register" colorScheme="brand" variant="solid"> {/* Themed button */}
                  Sign Up
                </Button>
              </HStack>
            )}
          </Flex>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Box
            pb={4}
            display={{ md: 'none' }}
            borderTopWidth="1px"
            borderColor={collapseBorderColor}
            mt={2} // Margin top for separation
          >
            <Stack as={'nav'} spacing={3} pt={3}> {/* Adjusted spacing */}
              <NavLink to="/">Home</NavLink>
              {user && (
                <>
                  <NavLink to={getDashboardLink()} icon={getDashboardIcon()}>{getDashboardText()}</NavLink>
                  <NavLink to="/courses" icon={FaBook}>Courses</NavLink>
                  <NavLink to="/exam-simulation" icon={FaClock}>Exam Simulation</NavLink>
                  <NavLink to="/profile" icon={FaUser}>Profile</NavLink>
                  {/* Added Profile NavLink */}
                  <Box
                    as="button" // Use a button for semantic correctness for an action
                    onClick={handleLogout}
                    w="100%" // Make it full width like NavLink
                    px={3} py={2} // Match NavLink padding
                    rounded="md"
                    _hover={{
                      textDecoration: 'none',
                      bg: signoutHoverBg, // Distinct hover for signout
                      color: signoutHoverColor,
                    }}
                    display="flex"
                    alignItems="center"
                    fontWeight="medium"
                    textAlign="left" // Align text to left
                    color={signoutTextColor} // Default text color
                  >
                    <Icon as={FaSignOutAlt} mr={2} color="red.500" />
                    Sign Out
                  </Box>
                </>
              )}
              {!user && (
                <>
                  <NavLink to="/login">Sign In</NavLink>
                  <NavLink to="/register">Sign Up</NavLink>
                </>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default Navbar;