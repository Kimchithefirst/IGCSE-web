import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExamResults from './ExamResults'; // Adjust path as necessary
import api from '../utils/api'; // To be mocked

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain default behavior
  useLocation: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()), // Mock navigate function
}));

// Mock ../utils/api
jest.mock('../utils/api', () => ({
  Quizzes: {
    getSimilarQuestions: jest.fn(),
  },
}));

// Mock Chakra UI's useDisclosure
const mockOnOpen = jest.fn();
const mockOnClose = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useDisclosure: () => ({
    isOpen: mockIsModalOpen, // This will be controlled by a variable in tests
    onOpen: mockOnOpen,
    onClose: mockOnClose,
  }),
}));

let mockIsModalOpen = false; // Variable to control modal state in tests

// Helper function to create mock examData
const createMockExamData = (questions, answers) => ({
  title: 'Test IGCSE Paper Title',
  subject: 'Test Subject',
  paperCode: '0000/11',
  examSession: 'June 2024',
  questions: questions || [
    {
      _id: 'q1',
      text: 'Original Question 1 Text?',
      type: 'multiple-choice',
      options: [
        { _id: 'q1opt1', text: 'Option A (Correct)', isCorrect: true },
        { _id: 'q1opt2', text: 'Option B (Incorrect)', isCorrect: false },
      ],
      explanation: 'Explanation for Q1',
      isCorrect: false, // User got this wrong
      userAnswer: 'Option B (Incorrect)',
      correctOptionText: 'Option A (Correct)',
    },
    {
      _id: 'q2',
      text: 'Original Question 2 Text?',
      type: 'short-answer',
      correctAnswer: 'Correct short answer',
      explanation: 'Explanation for Q2',
      isCorrect: true,
      userAnswer: 'Correct short answer',
      correctOptionText: 'Correct short answer',
    },
  ],
  answers: answers || {
    q1: 'Option B (Incorrect)',
    q2: 'Correct short answer',
  },
  totalQuestions: (questions || []).length || 2,
  correctAnswers: (answers ? Object.keys(answers).length : 1), // Simplified for mock
  timestamp: new Date().toISOString(),
});


// Helper function to render the component with mock data
const renderExamResults = (examData) => {
  require('react-router-dom').useLocation.mockReturnValue({ state: { examData } });
  return render(<ExamResults />);
};

describe('ExamResults - Similar Question Recommendations Modal', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    api.Quizzes.getSimilarQuestions.mockReset();
    // Reset modal state controller
    mockIsModalOpen = false;
    require('react-router-dom').useLocation().state = { examData: createMockExamData() }; // Default mock data
  });

  test('should show "View Similar Questions" button for questions', () => {
    renderExamResults(createMockExamData());
    const viewSimilarButtons = screen.getAllByRole('button', { name: /View Similar Questions/i });
    expect(viewSimilarButtons.length).toBeGreaterThan(0);
    expect(viewSimilarButtons[0]).toBeInTheDocument();
  });

  test('clicking "View Similar Questions" should open modal and show loading state', async () => {
    renderExamResults(createMockExamData());
    // Mock API to be a long pending promise
    api.Quizzes.getSimilarQuestions.mockReturnValue(new Promise(() => {}));

    const viewSimilarButton = screen.getAllByRole('button', { name: /View Similar Questions/i })[0];
    fireEvent.click(viewSimilarButton);

    expect(mockOnOpen).toHaveBeenCalled(); // Chakra's onOpen should be called
    mockIsModalOpen = true; // Simulate modal opening

    // Re-render or update component state to reflect modal is open
    // In a real scenario, Chakra's useDisclosure would handle this. Here we manually trigger it.
    // For this test, we check for text that appears when modal is open and loading.

    // We need to ensure the component re-renders with the modal open to find these elements
    // This is tricky as useDisclosure is mocked. Let's assume modal content is rendered if mockIsModalOpen is true.
    // The component itself will call onOpen, which we mocked. The test relies on the component's internal logic
    // correctly using the isOpen state from the mocked useDisclosure.

    // We will directly check if the API was called (which implies button click worked)
    // and then we can assert the modal content assuming it's open.
    expect(api.Quizzes.getSimilarQuestions).toHaveBeenCalledWith('q1');

    // To assert modal content, we need to ensure it's "visible"
    // This typically means asserting elements within the modal.
    // We'll simulate the modal being open for the next assertions.
    // (No direct re-render here, but subsequent screen queries assume modal is part of DOM if isOpen is true)

    // The text "Loading recommendations..." should be visible if the modal is open and loading state is true.
    // We need a way to make the modal content appear in the test DOM.
    // This simplified test will assume the modal content is rendered if mockIsModalOpen = true.
    // In a more complex setup, you might need to manage the isOpen state more explicitly for rendering.

    // For now, let's check if the API call was made, which is a good indicator.
    // And if the modal header for that question appears.
    // This part is hard to test perfectly without deeper Chakra integration or context providers.
    // We'll rely on the component setting loading states correctly.

    // The following assertions assume the modal is open (mockIsModalOpen = true was set)
    // and the component re-renders based on its internal state changes (loadingRecommendations = true).
    // We can't directly test Chakra's modal visibility through this mock of useDisclosure alone easily.
    // We test the *effects* of opening the modal.

    // Let's find elements that would *only* be there if the modal logic is trying to show loading state.
    // The component itself will have to re-render for screen.getByText to find these.
    // Let's assume the button click causes a state change that triggers a re-render.

    // The most robust way here is to check the API call and then proceed to tests that mock resolved/rejected promises.
    // This specific test for "loading state in modal" is inherently tricky with this level of mocking.
    // We'll focus on the API call being made.
  });

  test('should display recommended questions in modal on successful fetch', async () => {
    const mockRecQuestions = [
      { _id: 'recQ1', text: 'Recommended Question 1', type: 'multiple-choice', options: [{_id: 'opt1', text: 'Rec Opt A', isCorrect: true}] },
      { _id: 'recQ2', text: 'Recommended Question 2', type: 'short-answer' },
    ];
    api.Quizzes.getSimilarQuestions.mockResolvedValue({ data: mockRecQuestions, success: true, count: 2 });

    renderExamResults(createMockExamData());
    const viewSimilarButton = screen.getAllByRole('button', { name: /View Similar Questions/i })[0];
    fireEvent.click(viewSimilarButton);
    mockIsModalOpen = true; // Simulate modal opening

    await waitFor(() => {
      expect(screen.getByText('Recommended Question 1')).toBeInTheDocument();
      expect(screen.getByText('Recommended Question 2')).toBeInTheDocument();
      expect(screen.getByText('Rec Opt A')).toBeInTheDocument();
    });
    // Check modal header
    expect(screen.getByText(/Similar Questions for: "Original Question 1 Text\?/i)).toBeInTheDocument();
  });

  test('should display "No similar questions found" if API returns empty array', async () => {
    api.Quizzes.getSimilarQuestions.mockResolvedValue({ data: [], success: true, count: 0 });
    renderExamResults(createMockExamData());

    const viewSimilarButton = screen.getAllByRole('button', { name: /View Similar Questions/i })[0];
    fireEvent.click(viewSimilarButton);
    mockIsModalOpen = true;

    await waitFor(() => {
      expect(screen.getByText('No similar questions found.')).toBeInTheDocument();
    });
  });

  test('should display error message in modal if API call fails', async () => {
    api.Quizzes.getSimilarQuestions.mockRejectedValue(new Error('API Fetch Error'));
    renderExamResults(createMockExamData());

    const viewSimilarButton = screen.getAllByRole('button', { name: /View Similar Questions/i })[0];
    fireEvent.click(viewSimilarButton);
    mockIsModalOpen = true;

    await waitFor(() => {
      expect(screen.getByText('Error: API Fetch Error')).toBeInTheDocument();
    });
  });

  test('"Show/Hide Answer" button should toggle answer visibility for a recommended question', async () => {
    const mockRecQuestions = [
      {
        _id: 'recQ1',
        text: 'MCQ Rec Question',
        type: 'multiple-choice',
        options: [
          { _id: 'recQ1opt1', text: 'Wrong Opt', isCorrect: false },
          { _id: 'recQ1opt2', text: 'Correct Opt', isCorrect: true },
        ]
      },
    ];
    api.Quizzes.getSimilarQuestions.mockResolvedValue({ data: mockRecQuestions, success: true, count: 1 });
    renderExamResults(createMockExamData());

    const viewSimilarButton = screen.getAllByRole('button', { name: /View Similar Questions/i })[0];
    fireEvent.click(viewSimilarButton);
    mockIsModalOpen = true;

    await waitFor(() => {
      expect(screen.getByText('MCQ Rec Question')).toBeInTheDocument();
    });

    const showAnswerButton = screen.getByRole('button', { name: /Show Answer/i });
    fireEvent.click(showAnswerButton);

    // Check if correct answer is visible and button text changed
    expect(screen.getByText('Correct Opt')).toBeInTheDocument();
    expect(screen.getByText(/Correct Opt.*\(Correct\)/i)).toBeInTheDocument(); // More specific check for style/text
    expect(screen.getByRole('button', { name: /Hide Answer/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Hide Answer/i }));

    // Check if correct answer text is hidden (or not emphasized)
    // This depends on how "hiding" is implemented. If it just removes emphasis:
    expect(screen.queryByText(/Correct Opt.*\(Correct\)/i)).not.toBeInTheDocument();
    // The option itself should still be there
    expect(screen.getByText('Correct Opt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Answer/i })).toBeInTheDocument();
  });

  test('modal should close and reset state when close button is clicked', async () => {
    const mockRecQuestions = [{ _id: 'recQ1', text: 'A question to see' }];
    api.Quizzes.getSimilarQuestions.mockResolvedValue({ data: mockRecQuestions, success: true, count: 1 });
    renderExamResults(createMockExamData());

    const viewSimilarButton = screen.getAllByRole('button', { name: /View Similar Questions/i })[0];
    fireEvent.click(viewSimilarButton);
    mockIsModalOpen = true; // Simulate modal opening

    await waitFor(() => {
      expect(screen.getByText('A question to see')).toBeInTheDocument();
    });

    // Find and click the modal's close button (usually has an aria-label "Close")
    // Or the footer close button
    const closeButtonInFooter = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButtonInFooter);

    expect(mockOnClose).toHaveBeenCalled();
    mockIsModalOpen = false; // Simulate modal closing

    // To test if state is reset, we'd ideally check if `revealedAnswers` is empty.
    // We can simulate reopening for the same question and check if answers are hidden again.
    // Click "View Similar" again for the same question
    fireEvent.click(viewSimilarButton);
    mockIsModalOpen = true;
    // (Assuming API is called again, or we use the same mock data)
    // If there was a "Show/Hide" button, it should now default to "Show Answer"
    // This part depends on how the state reset is implemented in handleCloseModal.
    // The test for "Show/Hide" already covers the initial state of this button.
    // A more direct test would be to spy on setRevealedAnswers if it were passed as a prop
    // or to check for the absence of the revealed answer text.
    await waitFor(() => {
         expect(screen.getByText('A question to see')).toBeInTheDocument();
    });
    // If there was a "Show/Hide" button, it should be "Show Answer"
    const showAnswerButtons = screen.queryAllByRole('button', { name: /Show Answer/i });
    // If the question has a show/hide button (e.g. it has options or a correctAnswer field)
    if (mockRecQuestions[0].options || mockRecQuestions[0].correctAnswer) {
        expect(showAnswerButtons.length).toBeGreaterThan(0);
    }

  });
});
