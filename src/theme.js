import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      900: "#1a365d", // Dark Blue
      800: "#153e75",
      700: "#2a69ac", // Medium Blue
      600: "#3b82f6", // Bright Blue (accent)
      500: "#60a5fa",
      400: "#93c5fd",
      300: "#bfdbfe",
      200: "#dbeafe",
      100: "#eff6ff", // Lightest Blue
    },
    secondary: {
      900: "#4a5568", // Dark Gray
      800: "#718096",
      700: "#a0aec0", // Medium Gray
      600: "#cbd5e0",
      500: "#e2e8f0", // Light Gray
      400: "#edf2f7",
      300: "#f7fafc",
      200: "#ffffff", // White
      100: "#f0f4f8", // Off-white
    },
    // Role-specific and default colors
    student: {
      primary: { default: "teal.400", _dark: "teal.300" },
      secondary: { default: "orange.300", _dark: "yellow.300" },
      cardBg: { default: "whiteAlpha.800", _dark: "whiteAlpha.100" }, // Example, could be light teal/blue
    },
    teacher: {
      primary: { default: "purple.400", _dark: "purple.300" },
      secondary: { default: "gray.400", _dark: "green.200" },
      cardBg: { default: "whiteAlpha.900", _dark: "whiteAlpha.200" }, // Example, could be cooler off-white
    },
    parent: {
      primary: { default: "green.400", _dark: "blue.300" },
      secondary: { default: "pink.100", _dark: "pink.200" }, // Example, very desaturated
      cardBg: { default: "#FFF8E1", _dark: "#4A4A4A" }, // Example: light cream / dark neutral gray
    },
    defaults: { // Default colors for cards, etc., if not role-specific
      cardBg: { default: "white", _dark: "gray.700" },
    }
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: { // Added global styles
    global: (props) => ({
      'html, body': {
        fontFamily: 'body',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
        // bg will be handled by body specific gradient
        lineHeight: 'base',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      html: {
        scrollBehavior: 'smooth',
      },
      body: {
        overflowX: 'hidden',
        bg: props.colorMode === 'dark'
          ? 'linear-gradient(to bottom, #2D3748, #1A202C)' // Dark: gray.700 to gray.800
          : 'linear-gradient(to bottom, #F0F8FF, #F8FAFF)', // Light: AliceBlue to a near-white blue
        // Ensure content still fills the viewport height
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        '& > #root': { // Assuming your React app's root element has id="root"
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        }
      }
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "md",
        transition: "all 0.2s ease-in-out", // Added global transition
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === "dark" ? "brand.600" : "brand.700",
          color: "white",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.500" : "brand.600",
            transform: "scale(1.03)", // Added slight scale effect
          },
        }),
        outline: (props) => ({
          borderColor: props.colorMode === "dark" ? "brand.500" : "brand.700",
          color: props.colorMode === "dark" ? "brand.500" : "brand.700",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.600" : "brand.700",
            color: "white",
            transform: "scale(1.03)", // Added slight scale effect
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        borderRadius: "lg",
        boxShadow: "md",
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "md",
          _focus: {
            borderColor: "brand.600",
            boxShadow: `0 0 0 1px var(--chakra-colors-brand-600)`,
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: "heading",
        fontWeight: "bold",
      },
    },
  },
});

export default theme;
