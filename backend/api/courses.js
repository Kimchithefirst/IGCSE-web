const express = require('express');
const router = express.Router();

// Mock courses data for demo
const mockCourses = [
  {
    id: '1',
    title: 'IGCSE Mathematics',
    description: 'Complete IGCSE Mathematics course covering algebra, geometry, statistics and more',
    subject: 'Mathematics',
    level: 'IGCSE',
    topics: [
      { id: '1', name: 'Algebra', description: 'Linear and quadratic equations' },
      { id: '2', name: 'Geometry', description: 'Shapes, areas, and volumes' },
      { id: '3', name: 'Statistics', description: 'Data handling and probability' }
    ],
    duration: '6 months',
    difficulty: 'Intermediate'
  },
  {
    id: '2', 
    title: 'IGCSE Chemistry',
    description: 'Comprehensive chemistry course covering organic, inorganic and physical chemistry',
    subject: 'Chemistry',
    level: 'IGCSE',
    topics: [
      { id: '4', name: 'Atomic Structure', description: 'Atoms, elements and the periodic table' },
      { id: '5', name: 'Chemical Bonding', description: 'Ionic and covalent bonding' },
      { id: '6', name: 'Organic Chemistry', description: 'Carbon compounds and reactions' }
    ],
    duration: '6 months',
    difficulty: 'Advanced'
  },
  {
    id: '3',
    title: 'IGCSE Physics', 
    description: 'Physics fundamentals including mechanics, electricity, and waves',
    subject: 'Physics',
    level: 'IGCSE',
    topics: [
      { id: '7', name: 'Mechanics', description: 'Forces, motion and energy' },
      { id: '8', name: 'Electricity', description: 'Circuits and electrical components' },
      { id: '9', name: 'Waves', description: 'Sound and light waves' }
    ],
    duration: '6 months', 
    difficulty: 'Intermediate'
  },
  {
    id: '4',
    title: 'IGCSE English Language',
    description: 'English language skills including reading, writing, and comprehension',
    subject: 'English',
    level: 'IGCSE', 
    topics: [
      { id: '10', name: 'Reading Comprehension', description: 'Understanding and analyzing texts' },
      { id: '11', name: 'Creative Writing', description: 'Descriptive and narrative writing' },
      { id: '12', name: 'Grammar', description: 'Sentence structure and language rules' }
    ],
    duration: '6 months',
    difficulty: 'Intermediate'
  }
];

// Get all courses
router.get('/', async (req, res) => {
  try {
    // Return courses without topics for the list view
    const coursesWithoutTopics = mockCourses.map(course => {
      const { topics, ...courseWithoutTopics } = course;
      return {
        ...courseWithoutTopics,
        topicCount: topics.length
      };
    });
    
    res.json({
      success: true,
      data: coursesWithoutTopics,
      count: coursesWithoutTopics.length
    });
  } catch (error) {
    console.error('Courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = mockCourses.find(c => c.id === id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Course details error:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Get topics for a course
router.get('/:id/topics', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = mockCourses.find(c => c.id === id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      success: true,
      data: course.topics,
      courseTitle: course.title
    });
  } catch (error) {
    console.error('Topics error:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Create new course (for future functionality)
router.post('/', async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real app, this would save to database
    const newCourse = {
      id: String(mockCourses.length + 1),
      title,
      description,
      subject,
      level: 'IGCSE',
      topics: [],
      duration: '6 months',
      difficulty: 'Intermediate'
    };

    mockCourses.push(newCourse);

    res.status(201).json({
      success: true,
      data: newCourse,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get subjects list
router.get('/meta/subjects', (req, res) => {
  const subjects = [...new Set(mockCourses.map(course => course.subject))];
  res.json({
    success: true,
    data: subjects
  });
});

module.exports = router; 