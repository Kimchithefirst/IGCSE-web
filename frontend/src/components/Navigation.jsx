import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Avatar,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useSupabaseAuth as useAuth } from '../context/SupabaseAuthContext';

const Navigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const commonItems = [
      { label: 'Dashboard', to: '/' },
      { label: 'Subjects', to: '/subjects' },
    ];

    switch (user.role) {
      case 'student':
        return [
          ...commonItems,
          { label: 'My Progress', to: '/progress' },
          { label: 'Practice Tests', to: '/practice' },
        ];
      case 'teacher':
        return [
          ...commonItems,
          { label: 'Create Test', to: '/create-test' },
          { label: 'Student Progress', to: '/student-progress' },
        ];
      case 'parent':
        return [
          ...commonItems,
          { label: 'Child Progress', to: '/child-progress' },
          { label: 'Reports', to: '/reports' },
        ];
      default:
        return commonItems;
    }
  };

  const NavLink = ({ children, to }) => (
    <Link
      as={RouterLink}
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      to={to}
    >
      {children}
    </Link>
  );

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Box fontWeight="bold">IGCSE Prep</Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            {getNavItems().map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Avatar
                size="sm"
                name={user.fullName}
              />
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/profile">
                Profile
              </MenuItem>
              <MenuItem as={RouterLink} to="/settings">
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            {getNavItems().map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navigation; 