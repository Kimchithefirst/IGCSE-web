import MockTestButton from '@/components/MockTestButton';

export default function Home() {
  const handleStartTest = (subject: string) => {
    console.log(`Starting ${subject} mock test...`);
    // Will be implemented later with actual navigation
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-800">
          IGCSE Mock Test Platform
        </h1>
        <p className="text-lg mb-10 text-gray-700">
          Practice for your IGCSE exams with our realistic mock tests. Get immediate feedback and improve your performance.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {['Mathematics', 'Biology', 'Chemistry', 'Physics', 'English', 'Computer Science'].map((subject) => (
            <div key={subject} className="flex justify-center">
              <MockTestButton 
                subjectName={subject} 
                onClick={() => handleStartTest(subject)} 
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">How It Works</h2>
          <ol className="text-left list-decimal list-inside space-y-3 text-gray-800">
            <li>Select your subject from the options above</li>
            <li>Take a timed mock test with realistic exam questions</li>
            <li>Receive instant feedback and detailed explanations</li>
            <li>Track your progress and identify areas for improvement</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
