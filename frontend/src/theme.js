import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: (props) => ({ // Ensure props is passed if using semantic tokens that depend on color mode
      body: {
        bg: 'pageBgGradient', // Reference to semantic token
        color: 'defaultText', // Reference to semantic token
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
      '#root': { // Assuming your React app's root element has id="root"
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      },
      html: { // Added for scrollBehavior as in previous theme
        scrollBehavior: 'smooth',
      }
    }),
  },
  colors: {
    brand: { // Example: Kept existing brand from previous theme for primary actions
      50: '#E6F0FF',
      100: '#B9D7FF',
      200: '#8CBFFF',
      300: '#5EA7FF',
      400: '#308FFF',
      500: '#0077FF',
      600: '#005ECC',
      700: '#004499',
      800: '#002B66',
      900: '#001133',
    },
    secondary: { // Example: Grays for secondary text/elements
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
    student: {
      primary: { default: 'teal.500', _dark: 'teal.300' },
      secondary: { default: 'orange.400', _dark: 'orange.300' },
      cardBg: { default: 'white', _dark: 'gray.700' },
    },
    teacher: {
      primary: { default: 'purple.500', _dark: 'purple.300' },
      secondary: { default: 'green.500', _dark: 'green.300' },
      cardBg: { default: 'white', _dark: 'gray.700' },
    },
    parent: {
      primary: { default: 'green.500', _dark: 'green.300' },
      secondary: { default: 'pink.400', _dark: 'pink.300' },
      cardBg: { default: 'white', _dark: 'gray.700' },
    },
    defaults: { // Renamed from 'default' to 'defaults' to avoid keyword clash
      cardBg: { default: 'white', _dark: 'gray.700' },
    }
  },
  semanticTokens: {
    colors: {
      pageBgGradient: {
        default: 'linear-gradient(to bottom, #F0F8FF 0%, #E6F0FA 100%)', // AliceBlue to a lighter variant
        _dark: 'linear-gradient(to bottom, #232834 0%, #1A202C 100%)', // Darker desaturated blue to Chakra gray.800
      },
      defaultText: { default: 'secondary.700', _dark: 'secondary.100' }, // gray.700 / gray.100
      subtleText: { default: 'secondary.500', _dark: 'secondary.300' }, // gray.500 / gray.300

      // Role-specific semantic tokens (examples, can be expanded)
      studentPrimaryAccent: { default: 'student.primary.default', _dark: 'student.primary._dark' },
      studentCardBackground: { default: 'student.cardBg.default', _dark: 'student.cardBg._dark' },

      teacherPrimaryAccent: { default: 'teacher.primary.default', _dark: 'teacher.primary._dark' },
      teacherCardBackground: { default: 'teacher.cardBg.default', _dark: 'teacher.cardBg._dark' },

      parentPrimaryAccent: { default: 'parent.primary.default', _dark: 'parent.primary._dark' },
      parentCardBackground: { default: 'parent.cardBg.default', _dark: 'parent.cardBg._dark' },

      // Default card background semantic token
      defaultCardSurface: { default: 'defaults.cardBg.default', _dark: 'defaults.cardBg._dark'},
    },
  },
  components: {
    // Global component style overrides can go here if needed later
    // Example: Overriding Button to use brand colors by default
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "md",
        transition: "all 0.2s ease-in-out",
      },
      variants: {
        solid: (props) => ({ // Default solid variant
          bg: props.colorMode === "dark" ? "brand.300" : "brand.500", // Adjusted for better visibility in dark mode
          color: props.colorMode === "dark" ? "gray.800" : "white",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.400" : "brand.600",
            transform: "scale(1.03)",
          },
        }),
        outline: (props) => ({ // Default outline variant
          borderColor: props.colorMode === "dark" ? "brand.300" : "brand.500",
          color: props.colorMode === "dark" ? "brand.200" : "brand.600",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.200_10" : "brand.50", // Using brand.50 for light, custom for dark
            color: props.colorMode === "dark" ? "brand.200" : "brand.600",
            transform: "scale(1.03)",
          },
        }),
      },
      defaultProps: {
        // colorScheme: 'brand', // This would make all buttons use brand color scheme by default
      }
    },
    Card: { // Default Card component style
        baseStyle: (props) => ({
            bg: props.colorMode === 'dark' ? 'defaults.cardBg._dark' : 'defaults.cardBg.default',
            borderRadius: "xl", // More rounded
            boxShadow: "lg",    // Softer shadow
        }),
    },
    Heading: {
        baseStyle: (props) => ({
            color: props.colorMode === 'dark' ? 'brand.100' : 'brand.800', // Default heading color
        }),
    },
    Input: { // Default Input style
        baseStyle: {
            field: {
                borderRadius: "md",
            },
        },
        defaultProps: {
            focusBorderColor: 'brand.500', // Using brand color for focus
        }
    },
    Select: { // Default Select style
        baseStyle: {
            field: {
                borderRadius: "md",
            },
        },
        defaultProps: {
            focusBorderColor: 'brand.500',
        }
    },
    Radio: { // Default Radio style
        baseStyle: {
           control: {
             _checked: {
                borderColor: 'brand.500',
                bg: 'brand.500',
             }
           }
        }
    },
    Checkbox: { // Default Checkbox style
        baseStyle: {
           control: {
             _checked: {
                borderColor: 'brand.500',
                bg: 'brand.500',
             }
           }
        }
    }
  },
  fonts: { // Re-added fonts here for clarity, was in prompt
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
});

export default theme;
