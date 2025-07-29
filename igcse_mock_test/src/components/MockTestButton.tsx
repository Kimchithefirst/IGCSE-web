import React from 'react';

interface MockTestButtonProps {
  subjectName: string;
  onClick: () => void;
}

const MockTestButton: React.FC<MockTestButtonProps> = ({ subjectName, onClick }) => {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
      onClick={onClick}
    >
      Take {subjectName} Mock Test
    </button>
  );
};

export default MockTestButton; 