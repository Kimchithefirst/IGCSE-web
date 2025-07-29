import React from 'react';
import { ChakraProvider, Box, Text, VStack } from '@chakra-ui/react';
import theme from './theme'; // Import the custom theme

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box p={5}>
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">Welcome to the Themed App!</Text>
          {/* You can add more components here to test the theme */}
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
