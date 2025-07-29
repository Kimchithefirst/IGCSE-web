// Question Bank Data
export const questionBanks = {
  math: Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    type: index % 2 === 0 ? 'multiple-choice' : 'text',
    question: index % 2 === 0
      ? `Solve the equation: ${Math.floor(index/2)}x² + ${Math.floor(index/2 + 1)}x + ${Math.floor(index/2 + 2)} = 0`
      : `Explain the following mathematical concept: ${['Function', 'Triangle', 'Probability', 'Statistics', 'Vector'][Math.floor(index/2) % 5]}`,
    options: index % 2 === 0
      ? [
          `x = ${Math.floor(index/2)}, ${Math.floor(index/2 + 1)}`,
          `x = ${Math.floor(index/2 + 2)}, ${Math.floor(index/2 + 3)}`,
          `x = ${Math.floor(index/2 + 4)}, ${Math.floor(index/2 + 5)}`,
          `x = ${Math.floor(index/2 + 6)}, ${Math.floor(index/2 + 7)}`,
        ]
      : undefined,
    correctAnswer: index % 2 === 0
      ? `x = ${Math.floor(index/2)}, ${Math.floor(index/2 + 1)}`
      : 'Detailed explanation of this mathematical concept...'
  })),

  physics: Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    type: index % 2 === 0 ? 'multiple-choice' : 'text',
    question: index % 2 === 0
      ? `Calculate: Problem related to ${['Force', 'Velocity', 'Acceleration', 'Power', 'Energy'][Math.floor(index/2) % 5]}`
      : `Explain the physics concept: ${['Newton\'s Laws of Motion', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Quantum Mechanics'][Math.floor(index/2) % 5]}`,
    options: index % 2 === 0
      ? [
          `${Math.floor(index/2) * 10} N`,
          `${Math.floor(index/2 + 1) * 10} N`,
          `${Math.floor(index/2 + 2) * 10} N`,
          `${Math.floor(index/2 + 3) * 10} N`,
        ]
      : undefined,
    correctAnswer: index % 2 === 0
      ? `${Math.floor(index/2) * 10} N`
      : 'Detailed explanation of this physics concept...'
  })),

  chemistry: Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    type: index % 2 === 0 ? 'multiple-choice' : 'text',
    question: index % 2 === 0
      ? `Chemical Reaction: Problem related to ${['Acid-Base', 'Redox', 'Precipitation', 'Gas', 'Organic'][Math.floor(index/2) % 5]} reactions`
      : `Explain the chemistry concept: ${['Atomic Structure', 'Chemical Bonding', 'Thermochemistry', 'Electrochemistry', 'Organic Chemistry'][Math.floor(index/2) % 5]}`,
    options: index % 2 === 0
      ? [
          `${['HCl', 'NaOH', 'H2SO4', 'KOH'][Math.floor(index/2) % 4]}`,
          `${['HCl', 'NaOH', 'H2SO4', 'KOH'][(Math.floor(index/2) + 1) % 4]}`,
          `${['HCl', 'NaOH', 'H2SO4', 'KOH'][(Math.floor(index/2) + 2) % 4]}`,
          `${['HCl', 'NaOH', 'H2SO4', 'KOH'][(Math.floor(index/2) + 3) % 4]}`,
        ]
      : undefined,
    correctAnswer: index % 2 === 0
      ? `${['HCl', 'NaOH', 'H2SO4', 'KOH'][Math.floor(index/2) % 4]}`
      : 'Detailed explanation of this chemistry concept...'
  })),

  biology: Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    type: index % 2 === 0 ? 'multiple-choice' : 'text',
    question: index % 2 === 0
      ? `Biological Process: Problem related to ${['Photosynthesis', 'Respiration', 'Cell Division', 'Inheritance', 'Evolution'][Math.floor(index/2) % 5]}`
      : `Explain the biological concept: ${['Cell Structure', 'Ecosystem', 'Genetics', 'Evolution Theory', 'Human Body Systems'][Math.floor(index/2) % 5]}`,
    options: index % 2 === 0
      ? [
          `${['Chloroplast', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'][Math.floor(index/2) % 4]}`,
          `${['Chloroplast', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'][(Math.floor(index/2) + 1) % 4]}`,
          `${['Chloroplast', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'][(Math.floor(index/2) + 2) % 4]}`,
          `${['Chloroplast', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'][(Math.floor(index/2) + 3) % 4]}`,
        ]
      : undefined,
    correctAnswer: index % 2 === 0
      ? `${['Chloroplast', 'Mitochondria', 'Nucleus', 'Endoplasmic Reticulum'][Math.floor(index/2) % 4]}`
      : 'Detailed explanation of this biological concept...'
  })),

  english: Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    type: index % 2 === 0 ? 'multiple-choice' : 'text',
    question: index % 2 === 0
      ? `Grammar: ${['Present Perfect', 'Past Simple', 'Future Continuous', 'Conditionals', 'Passive Voice'][Math.floor(index/2) % 5]} usage`
      : `Write an essay about: ${['Technology', 'Environment', 'Education', 'Culture', 'Society'][Math.floor(index/2) % 5]}`,
    options: index % 2 === 0
      ? [
          `${['has been', 'have been', 'had been', 'will be'][Math.floor(index/2) % 4]} working`,
          `${['has been', 'have been', 'had been', 'will be'][(Math.floor(index/2) + 1) % 4]} working`,
          `${['has been', 'have been', 'had been', 'will be'][(Math.floor(index/2) + 2) % 4]} working`,
          `${['has been', 'have been', 'had been', 'will be'][(Math.floor(index/2) + 3) % 4]} working`,
        ]
      : undefined,
    correctAnswer: index % 2 === 0
      ? `${['has been', 'have been', 'had been', 'will be'][Math.floor(index/2) % 4]} working`
      : 'A well-structured essay should...'
  })),
};