import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting WiseKids database seeding...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const teacherPassword = await bcrypt.hash("Teacher@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Dr. Eleanor Vance (Admin)",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      profile: {
        create: {
          bio: "Head Administrator & Dean of Curriculum at WiseKids Learning Academy.",
          phone: "+1 (555) 019-2831",
          address: "100 Academic Way, Suite 400, Cambridge, MA",
          qualifications: "Ph.D. in Educational Leadership, M.Ed.",
          subjectsTaught: "Administration, Curriculum Design",
        },
      },
    },
  });
  console.log(`Created Admin: ${admin.email}`);

  // 2. Create 3 Teachers
  const teacherData = [
    {
      name: "Prof. Sarah Jenkins",
      email: "sarah.math@wisekids.org",
      bio: "Math Olympiad Coach & STEM enthusiast with 10+ years experience inspiring young thinkers.",
      subjects: "Mathematics, Logic, Olympiad Problem Solving",
      qualifications: "M.S. in Applied Mathematics (MIT)",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "David Chen",
      email: "david.science@wisekids.org",
      bio: "Robotics Engineer and Science Educator dedicated to hands-on experiment based learning.",
      subjects: "Robotics, Physical Sciences, AI for Kids",
      qualifications: "B.S. in Robotics Engineering (Carnegie Mellon)",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Elena Gomez",
      email: "elena.art@wisekids.org",
      bio: "Digital Illustrator and Junior Coding specialist making creative arts come alive through code.",
      subjects: "Creative Arts, Python Game Dev, Storytelling",
      qualifications: "B.F.A. in Digital Arts & Interactive Media (RISD)",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const teacher = await prisma.user.create({
      data: {
        name: t.name,
        email: t.email,
        password: teacherPassword,
        role: "TEACHER",
        status: "ACTIVE",
        image: t.image,
        profile: {
          create: {
            bio: t.bio,
            subjectsTaught: t.subjects,
            qualifications: t.qualifications,
            phone: "+1 (555) 234-5678",
          },
        },
      },
    });
    teachers.push(teacher);
    console.log(`Created Teacher: ${teacher.email}`);
  }

  // 3. Create 15 Students
  const studentNames = [
    "Leo Alexander", "Maya Patel", "Ethan Wright", "Sophia Martinez", "Oliver Kim",
    "Emma Watson", "Lucas Rossi", "Aria Takahashi", "Noah Miller", "Chloe Dubois",
    "James Wilson", "Isabella Santos", "Benjamin Taylor", "Zoe Anderson", "Liam O'Connor"
  ];

  const students = [];
  for (let i = 0; i < 15; i++) {
    const student = await prisma.user.create({
      data: {
        name: studentNames[i],
        email: `student${i + 1}@wisekids.org`,
        password: studentPassword,
        role: "STUDENT",
        status: "ACTIVE",
        image: `https://images.unsplash.com/photo-${1500000000000 + (i * 12345678) % 9999999}?w=150&auto=format&fit=crop&q=80`,
        profile: {
          create: {
            bio: `Enthusiastic Grade ${3 + (i % 6)} explorer eager to master science, math, and coding!`,
            gradeLevel: `Grade ${3 + (i % 6)}`,
            parentName: `Parent of ${studentNames[i]}`,
            parentPhone: `+1 (555) 700-${1000 + i}`,
            address: `City Center, District ${i + 1}`,
          },
        },
      },
    });
    students.push(student);
  }
  console.log(`Created 15 Students (student1@wisekids.org to student15@wisekids.org)`);

  // 4. Categories
  const categoriesData = [
    { name: "Mathematics & Logic", slug: "math-logic", icon: "Calculator", color: "#3B82F6", description: "Brain teasers, algebra, geometry & Olympiad math." },
    { name: "Science & Robotics", slug: "science-robotics", icon: "FlaskConical", color: "#10B981", description: "Physics wonders, hands-on circuits & space exploration." },
    { name: "Coding & Technology", slug: "coding-tech", icon: "Code", color: "#8B5CF6", description: "Scratch, Python game design, web apps & AI primers." },
    { name: "Creative Arts & Design", slug: "creative-arts", icon: "Palette", color: "#EC4899", description: "Digital illustration, animation, storytelling & craft." },
    { name: "Language & Junior Debate", slug: "language-debate", icon: "BookOpen", color: "#F59E0B", description: "Public speaking, persuasive debate & creative writing." },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.create({ data: c });
    categories.push(cat);
  }

  // 5. Create 6 Courses with Modules, Lessons, Assignments, Quizzes
  const coursesData = [
    {
      title: "Junior Math Olympiad Masters",
      slug: "junior-math-olympiad-masters",
      description: "A thrilling mathematical journey designed to turn elementary students into master problem solvers. Cover number patterns, logic grids, combinatorics, and Olympiad competition strategy.",
      shortDesc: "Master mental math, logic puzzles, and competition problem solving.",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
      price: 149.0,
      isFree: false,
      level: "Intermediate",
      featured: true,
      ageGroup: "8-12 Years",
      durationWeeks: 8,
      categoryId: categories[0].id,
      teacherId: teachers[0].id,
      modules: [
        {
          title: "Module 1: Number Magic & Fast Arithmetic",
          description: "Mental math shortcuts, divisibility rules, and speed calculating tricks.",
          lessons: [
            { title: "Secrets of Lightning Mental Addition", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 18, isFree: true, text: "In this lesson, we break down two-digit and three-digit rapid mental decomposition." },
            { title: "Divisibility Rules & Prime Hunters", type: "PDF", url: "https://example.com/math-mod1-primes.pdf", duration: 25, isFree: true, text: "Master divisibility by 3, 4, 7, 9, and 11 using visual remainder patterns." },
            { title: "Interactive Speed Math Practice", type: "TEXT", url: null, duration: 15, isFree: false, text: "Try solving 20 mental challenges in 3 minutes. Focus on rounding to nearest tens first!" }
          ],
        },
        {
          title: "Module 2: Logic Grids & Secret Codes",
          description: "Deductive reasoning puzzles, Venn diagrams, and cryptography basics.",
          lessons: [
            { title: "Mastering the 4x4 Logic Matrix", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 22, isFree: false, text: "Learn how to use process of elimination on multi-variable logic puzzles." },
            { title: "Caesar Ciphers & Secret Number Codes", type: "SLIDE", url: "https://example.com/slides/ciphers.pdf", duration: 20, isFree: false, text: "Decode historical ciphers using modular arithmetic." }
          ],
        },
      ],
      assignment: {
        title: "Olympiad Challenge Set: Logic Grids & Fast Factors",
        instructions: "Complete all 5 puzzle worksheets. Write out your step-by-step reasoning for Problem 4. Upload your scan or typed solution.",
        maxMarks: 100,
        dueDateDays: 7,
      },
      quiz: {
        title: "Arithmetic & Logic Olympiad Sprint Quiz",
        description: "Test your speed and precision in mental math and pattern recognition.",
        timeLimitMinutes: 20,
        passingScore: 75,
        questions: [
          {
            text: "What is the sum of all integers from 1 to 20?",
            type: "MCQ",
            points: 25,
            explanation: "Using Gauss formula: n*(n+1)/2 = 20*21/2 = 210.",
            options: [
              { text: "210", isCorrect: true },
              { text: "200", isCorrect: false },
              { text: "190", isCorrect: false },
              { text: "220", isCorrect: false },
            ],
          },
          {
            text: "Is 437 divisible by 19?",
            type: "TRUE_FALSE",
            points: 25,
            explanation: "437 = 19 * 23, so yes!",
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ],
          },
          {
            text: "If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
            type: "MCQ",
            points: 25,
            explanation: "Each cat catches 1 mouse in 3 minutes. In 100 minutes, 1 cat catches 33.3 mice. So 3 cats will catch 100 mice!",
            options: [
              { text: "3 cats", isCorrect: true },
              { text: "100 cats", isCorrect: false },
              { text: "33 cats", isCorrect: false },
              { text: "10 cats", isCorrect: false },
            ],
          },
          {
            text: "What is the smallest positive prime number that is also an even number?",
            type: "SHORT_ANSWER",
            points: 25,
            explanation: "2 is the only even prime number.",
            options: [
              { text: "2", isCorrect: true },
            ],
          },
        ],
      },
    },
    {
      title: "Young Explorers: Hands-on Science & Physics",
      slug: "young-explorers-science-physics",
      description: "Exciting kitchen-science experiments, Newton's laws in action, astronomy tours, and simple robotics circuits that make natural sciences irresistibly fun.",
      shortDesc: "Discover the physical world through experiments, gravity, and electricity.",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
      price: 129.0,
      isFree: false,
      level: "Beginner",
      featured: true,
      ageGroup: "7-11 Years",
      durationWeeks: 6,
      categoryId: categories[1].id,
      teacherId: teachers[1].id,
      modules: [
        {
          title: "Module 1: Forces, Motion & Rollercoasters",
          description: "Newtonian mechanics built with marble runs and paper tracks.",
          lessons: [
            { title: "Gravity & Potential Energy in Rollercoasters", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 20, isFree: true, text: "Observe how kinetic energy trades places with gravitational potential energy." },
            { title: "Building a Zero-Friction Marble Loop", type: "PDF", url: "https://example.com/marble-loop.pdf", duration: 30, isFree: false, text: "Step by step blueprint for paper track loops." },
          ],
        },
        {
          title: "Module 2: Static Electricity & Simple Circuits",
          description: "Battery circuits, conductors vs insulators, and electroscopes.",
          lessons: [
            { title: "Lemon Batteries & Glowing LEDs", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 25, isFree: false, text: "Extract electrical current from citric acid and copper-zinc plates!" },
          ],
        },
      ],
      assignment: {
        title: "Kitchen Physics Experiment & Lab Report",
        instructions: "Conduct the density column experiment using water, oil, and honey. Take a photo and write down your hypothesis and results.",
        maxMarks: 100,
        dueDateDays: 5,
      },
      quiz: {
        title: "Forces & Matter Discovery Quiz",
        description: "Check your understanding of density, gravity, and circuits.",
        timeLimitMinutes: 15,
        passingScore: 70,
        questions: [
          {
            text: "Which object will float on liquid water?",
            type: "MCQ",
            points: 50,
            explanation: "Wood has a lower density than liquid water.",
            options: [
              { text: "A dry block of wood", isCorrect: true },
              { text: "A solid iron nail", isCorrect: false },
              { text: "A glass marble", isCorrect: false },
              { text: "A gold coin", isCorrect: false },
            ],
          },
          {
            text: "Electrons carry a positive charge.",
            type: "TRUE_FALSE",
            points: 50,
            explanation: "Electrons carry negative charge; protons carry positive charge.",
            options: [
              { text: "False", isCorrect: true },
              { text: "True", isCorrect: false },
            ],
          },
        ],
      },
    },
    {
      title: "Coding Adventures with Python & Pygame",
      slug: "coding-adventures-python-pygame",
      description: "Learn fundamental computer science concepts by building arcade games, pixel animations, and interactive stories using Python 3 and Pygame Zero.",
      shortDesc: "Build real 2D games, animations, and solve interactive coding quests.",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      price: 179.0,
      isFree: false,
      level: "Beginner to Intermediate",
      featured: true,
      ageGroup: "9-14 Years",
      durationWeeks: 10,
      categoryId: categories[2].id,
      teacherId: teachers[2].id,
      modules: [
        {
          title: "Module 1: Variables, Loops & Turtle Graphics",
          description: "Drawing geometric mandalas and building text adventures.",
          lessons: [
            { title: "Hello Python World & Variable Boxes", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 15, isFree: true, text: "Understanding how variables store numbers and text." },
            { title: "Rainbow Spirograph with Python Turtle", type: "TEXT", url: null, duration: 25, isFree: true, text: "Code a colorful 360-degree rotating starburst loop." },
          ],
        },
        {
          title: "Module 2: Building Space Invaders Arcade",
          description: "Sprites, collision detection, and keyboard controls.",
          lessons: [
            { title: "Player Movement & Keyboard Event Handlers", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 30, isFree: false, text: "Use pygame keydown listeners to guide our hero spaceship." },
            { title: "Lasers, Sound FX & High Score Saving", type: "PDF", url: "https://example.com/pygame-lasers.pdf", duration: 20, isFree: false, text: "Complete game loop and file saving code." },
          ],
        },
      ],
      assignment: {
        title: "Create Your Custom Retro Arcade Minigame",
        instructions: "Add a new enemy type with unique movement patterns to your Space Defender project. Submit your .py file or web demo link.",
        maxMarks: 100,
        dueDateDays: 10,
      },
      quiz: {
        title: "Python Syntax & Logic Quest",
        description: "Test your skills on if-else conditions, loops, and list manipulation.",
        timeLimitMinutes: 15,
        passingScore: 80,
        questions: [
          {
            text: "Which keyword defines a function in Python?",
            type: "MCQ",
            points: 50,
            explanation: "'def' is used to define functions in Python.",
            options: [
              { text: "def", isCorrect: true },
              { text: "function", isCorrect: false },
              { text: "func", isCorrect: false },
              { text: "define", isCorrect: false },
            ],
          },
          {
            text: "What is the index of the very first element in a Python list?",
            type: "SHORT_ANSWER",
            points: 50,
            explanation: "Python uses 0-based indexing.",
            options: [
              { text: "0", isCorrect: true },
            ],
          },
        ],
      },
    },
    {
      title: "Digital Art & 2D Character Animation",
      slug: "digital-art-2d-character-animation",
      description: "Unleash creativity! Learn digital drawing, color theory, character rigging, and frame-by-frame animation to create stunning cartoon shorts.",
      shortDesc: "Illustrate characters, paint fantasy worlds, and animate cartoon clips.",
      thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
      price: 0.0,
      isFree: true,
      level: "All Levels",
      featured: false,
      ageGroup: "8-14 Years",
      durationWeeks: 6,
      categoryId: categories[3].id,
      teacherId: teachers[2].id,
      modules: [
        {
          title: "Module 1: Character Anatomy & Expressions",
          description: "Drawing expressive eyes, dynamic poses, and proportions.",
          lessons: [
            { title: "The 12 Principles of Animation for Kids", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 24, isFree: true, text: "Squash, stretch, anticipation, and follow-through made easy." },
            { title: "Mastering Character Emotion Sheets", type: "PDF", url: "https://example.com/art-emotions.pdf", duration: 20, isFree: true, text: "Draw happy, surprised, determined, and curious character faces." },
          ],
        },
      ],
      assignment: {
        title: "Bouncing Ball with Squash & Stretch",
        instructions: "Animate a 12-frame bouncing ball loop showing proper weight and deceleration at the top.",
        maxMarks: 100,
        dueDateDays: 7,
      },
      quiz: {
        title: "Color Theory & Animation Basics",
        description: "Test complementary colors and frame rates.",
        timeLimitMinutes: 10,
        passingScore: 70,
        questions: [
          {
            text: "What is the complementary color of Blue on the standard color wheel?",
            type: "MCQ",
            points: 50,
            explanation: "Orange is opposite blue on the color wheel.",
            options: [
              { text: "Orange", isCorrect: true },
              { text: "Green", isCorrect: false },
              { text: "Purple", isCorrect: false },
              { text: "Yellow", isCorrect: false },
            ],
          },
          {
            text: "Squash and stretch helps give animated characters a sense of weight and flexibility.",
            type: "TRUE_FALSE",
            points: 50,
            explanation: "Yes, it is principle #1 of animation.",
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ],
          },
        ],
      },
    },
    {
      title: "Junior Public Speaking & Parliamentary Debate",
      slug: "junior-public-speaking-debate",
      description: "Build unshakable confidence, articulate viewpoints persuasively, construct structured arguments, and practice parliamentary-style debate rounds.",
      shortDesc: "Master stage confidence, persuasive arguments, and live debate rounds.",
      thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
      price: 139.0,
      isFree: false,
      level: "Beginner",
      featured: false,
      ageGroup: "9-15 Years",
      durationWeeks: 8,
      categoryId: categories[4].id,
      teacherId: teachers[0].id,
      modules: [
        {
          title: "Module 1: The Anatomy of a Powerful Speech",
          description: "Hooks, body structure, rhetorical devices, and memorable conclusions.",
          lessons: [
            { title: "Hooking Your Audience in 10 Seconds", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 16, isFree: true, text: "Learn the power of questions, surprising statistics, and stories." },
            { title: "Structuring Claims with the ARE Method (Assertion, Reasoning, Evidence)", type: "TEXT", url: null, duration: 20, isFree: true, text: "Form airtight arguments that withstand refutation." },
          ],
        },
      ],
      assignment: {
        title: "2-Minute Persuasive Speech Video Submission",
        instructions: "Record a 2-minute speech on the topic: 'Should schools replace physical textbooks with digital tablets?'.",
        maxMarks: 100,
        dueDateDays: 8,
      },
      quiz: {
        title: "Debate Terminology & Structure Check",
        description: "Review rebuttal techniques and speaker roles.",
        timeLimitMinutes: 15,
        passingScore: 70,
        questions: [
          {
            text: "What does ARE stand for in argument construction?",
            type: "MCQ",
            points: 50,
            explanation: "Assertion, Reasoning, Evidence.",
            options: [
              { text: "Assertion, Reasoning, Evidence", isCorrect: true },
              { text: "Action, Result, Evaluation", isCorrect: false },
              { text: "Argument, Refutation, Example", isCorrect: false },
              { text: "Audience, Reaction, Emotion", isCorrect: false },
            ],
          },
          {
            text: "A counterargument is an argument that directly opposes your main thesis.",
            type: "TRUE_FALSE",
            points: 50,
            explanation: "True, addressing counterarguments strengthens your speech.",
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ],
          },
        ],
      },
    },
    {
      title: "Robotics & Smart IoT Inventions",
      slug: "robotics-smart-iot-inventions",
      description: "Construct obstacle-avoiding rovers, smart home alarms, and environmental sensors using micro:bit and Arduino controllers.",
      shortDesc: "Build programmable robots, sensor networks, and automated smart gadgets.",
      thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      price: 199.0,
      isFree: false,
      level: "Intermediate",
      featured: true,
      ageGroup: "10-15 Years",
      durationWeeks: 8,
      categoryId: categories[1].id,
      teacherId: teachers[1].id,
      modules: [
        {
          title: "Module 1: Microcontrollers & Sensor Inputs",
          description: "Ultrasonic rangefinders, servo motors, and light-dependent resistors.",
          lessons: [
            { title: "Wiring Your First Ultrasonic Sonar Sensor", type: "VIDEO", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 25, isFree: true, text: "Measure distances in centimeters with ultrasonic pulses." },
            { title: "Calibrating Servo Motors for Steering", type: "PDF", url: "https://example.com/servo-calibration.pdf", duration: 15, isFree: false, text: "Pulse width modulation fundamentals." },
          ],
        },
      ],
      assignment: {
        title: "Smart Room Security Alarm Circuit Blueprint",
        instructions: "Design a circuit diagram with a buzzer, motion PIR sensor, and LED status lights. Write the microcontroller pseudocode.",
        maxMarks: 100,
        dueDateDays: 6,
      },
      quiz: {
        title: "Sensors & Actuators Assessment",
        description: "Test your understanding of digital vs analog signals.",
        timeLimitMinutes: 15,
        passingScore: 75,
        questions: [
          {
            text: "Which sensor is best suited to measure exact distances in centimeters?",
            type: "MCQ",
            points: 50,
            explanation: "Ultrasonic sonar sensors measure echo time of sound waves.",
            options: [
              { text: "Ultrasonic Distance Sensor", isCorrect: true },
              { text: "Photoresistor (LDR)", isCorrect: false },
              { text: "Thermistor", isCorrect: false },
              { text: "Buzzer", isCorrect: false },
            ],
          },
          {
            text: "A Servo motor can be instructed to rotate to a specific angular degree.",
            type: "TRUE_FALSE",
            points: 50,
            explanation: "Yes, standard hobby servos rotate between 0 and 180 degrees.",
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ],
          },
        ],
      },
    },
  ];

  const createdCourses = [];

  for (const cData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: cData.title,
        slug: cData.slug,
        description: cData.description,
        shortDesc: cData.shortDesc,
        thumbnail: cData.thumbnail,
        price: cData.price,
        isFree: cData.isFree,
        level: cData.level,
        status: "PUBLISHED",
        featured: cData.featured,
        ageGroup: cData.ageGroup,
        durationWeeks: cData.durationWeeks,
        categoryId: cData.categoryId,
        teacherId: cData.teacherId,
      },
    });
    createdCourses.push(course);

    // Create Modules and Lessons
    for (let mIdx = 0; mIdx < cData.modules.length; mIdx++) {
      const mData = cData.modules[mIdx];
      const moduleRecord = await prisma.module.create({
        data: {
          courseId: course.id,
          title: mData.title,
          description: mData.description,
          order: mIdx + 1,
          isPublished: true,
        },
      });

      for (let lIdx = 0; lIdx < mData.lessons.length; lIdx++) {
        const lData = mData.lessons[lIdx];
        await prisma.lesson.create({
          data: {
            moduleId: moduleRecord.id,
            title: lData.title,
            contentType: lData.type,
            contentUrl: lData.url,
            contentText: lData.text,
            durationMinutes: lData.duration,
            isFreePreview: lData.isFree,
            order: lIdx + 1,
          },
        });
      }
    }

    // Create Assignment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + cData.assignment.dueDateDays);
    await prisma.assignment.create({
      data: {
        courseId: course.id,
        teacherId: cData.teacherId,
        title: cData.assignment.title,
        instructions: cData.assignment.instructions,
        maxMarks: cData.assignment.maxMarks,
        dueDate: dueDate,
        allowResubmission: true,
      },
    });

    // Create Quiz
    const quizRecord = await prisma.quiz.create({
      data: {
        courseId: course.id,
        teacherId: cData.teacherId,
        title: cData.quiz.title,
        description: cData.quiz.description,
        timeLimitMinutes: cData.quiz.timeLimitMinutes,
        passingScore: cData.quiz.passingScore,
        randomizeQuestions: false,
        isPublished: true,
      },
    });

    for (let qIdx = 0; qIdx < cData.quiz.questions.length; qIdx++) {
      const qData = cData.quiz.questions[qIdx];
      const questionRecord = await prisma.question.create({
        data: {
          quizId: quizRecord.id,
          text: qData.text,
          type: qData.type,
          points: qData.points,
          explanation: qData.explanation,
          order: qIdx + 1,
        },
      });

      for (let oIdx = 0; oIdx < qData.options.length; oIdx++) {
        const oData = qData.options[oIdx];
        await prisma.option.create({
          data: {
            questionId: questionRecord.id,
            text: oData.text,
            isCorrect: oData.isCorrect,
            order: oIdx + 1,
          },
        });
      }
    }
  }
  console.log(`Created 6 comprehensive courses with modules, lessons, assignments, and quizzes.`);

  // 6. Create Batches
  const batches = [];
  for (let i = 0; i < createdCourses.length; i++) {
    const course = createdCourses[i];
    const batch = await prisma.batch.create({
      data: {
        name: `Alpha Cohort - ${course.title.slice(0, 20)}`,
        code: `WK-2026-${i + 1}01`,
        courseId: course.id,
        teacherId: course.teacherId,
        startDate: new Date(),
        maxStudents: 20,
        scheduleText: i % 2 === 0 ? "Mon, Wed, Fri 4:30 PM - 5:30 PM EST" : "Tue, Thu, Sat 5:00 PM - 6:00 PM EST",
        meetingLink: "https://meet.google.com/wis-ekid-cls",
      },
    });
    batches.push(batch);
  }
  console.log(`Created ${batches.length} live class batches.`);

  // 7. Enroll Students across courses
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    // Each student is enrolled in 2 courses
    const course1 = createdCourses[i % createdCourses.length];
    const course2 = createdCourses[(i + 1) % createdCourses.length];
    const batch1 = batches[i % batches.length];
    const batch2 = batches[(i + 1) % batches.length];

    const progress1 = Math.floor(Math.random() * 85) + 15;
    const progress2 = Math.floor(Math.random() * 60) + 10;

    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course1.id,
        batchId: batch1.id,
        progressPercentage: progress1,
        status: "ACTIVE",
      },
    });

    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course2.id,
        batchId: batch2.id,
        progressPercentage: progress2,
        status: "ACTIVE",
      },
    });

    // Create payments for paid courses
    if (!course1.isFree) {
      await prisma.payment.create({
        data: {
          userId: student.id,
          courseId: course1.id,
          amount: course1.price,
          currency: "USD",
          status: "COMPLETED",
          invoiceNumber: `INV-2026-${1000 + i}`,
          paymentMethod: i % 2 === 0 ? "CARD" : "PAYPAL",
        },
      });
    }

    // Sample attendance records
    for (let day = 1; day <= 4; day++) {
      const attDate = new Date();
      attDate.setDate(attDate.getDate() - day * 2);
      await prisma.attendance.create({
        data: {
          batchId: batch1.id,
          courseId: course1.id,
          studentId: student.id,
          markedById: course1.teacherId,
          date: attDate,
          status: Math.random() > 0.15 ? "PRESENT" : (Math.random() > 0.5 ? "LATE" : "ABSENT"),
          notes: "Active class participation.",
        },
      });
    }
  }
  console.log("Enrolled students, generated payments & attendance records.");

  // 8. Sample Assignment Submissions & Quiz Attempts for the first few students
  const assignments = await prisma.assignment.findMany();
  if (assignments.length > 0) {
    for (let i = 0; i < 5; i++) {
      const student = students[i];
      const asg = assignments[i % assignments.length];
      await prisma.submission.create({
        data: {
          assignmentId: asg.id,
          studentId: student.id,
          fileUrl: "https://example.com/submissions/student-work-sample.pdf",
          comments: "Here is my completed work and experimental observations! Really enjoyed the challenge.",
          marks: 92 + (i % 8),
          feedback: "Outstanding logical reasoning and neat presentation! Keep up the brilliant effort.",
          status: "GRADED",
          submittedAt: new Date(Date.now() - 86400000 * 3),
          gradedAt: new Date(Date.now() - 86400000),
        },
      });
    }

    // Pending submission
    await prisma.submission.create({
      data: {
        assignmentId: assignments[0].id,
        studentId: students[5].id,
        fileUrl: "https://example.com/submissions/student6-project.pdf",
        comments: "I solved problems 1 through 5, please review!",
        status: "PENDING",
        submittedAt: new Date(),
      },
    });
  }

  // 9. Sample Certificates
  await prisma.certificate.create({
    data: {
      userId: students[0].id,
      courseId: createdCourses[0].id,
      certificateNumber: "WK-CERT-2026-8831",
      verificationCode: "VERIF-MATH-8831",
      pdfUrl: "https://example.com/certificates/WK-CERT-2026-8831.pdf",
    },
  });

  // 10. Sample Announcements
  await prisma.announcement.create({
    data: {
      authorId: admin.id,
      title: "🎉 Welcome to the 2026 Spring Term at WiseKids Academy!",
      content: "We are thrilled to welcome all new students, parents, and faculty. Check your portal dashboard for upcoming live classes, club activities, and the Olympiad schedule.",
      targetRole: "ALL",
      isPinned: true,
    },
  });

  await prisma.announcement.create({
    data: {
      authorId: teachers[0].id,
      title: "📐 Math Olympiad Mock Contest this Saturday at 10 AM EST",
      content: "All Math Olympiad Masters cohort students should log into the live classroom 10 minutes early. Bring pencils, scratch paper, and a curious mindset!",
      targetRole: "STUDENT",
      targetCourseId: createdCourses[0].id,
      isPinned: false,
    },
  });

  // 11. Sample Notifications
  for (let i = 0; i < 3; i++) {
    await prisma.notification.create({
      data: {
        userId: students[i].id,
        title: "Assignment Graded! 🌟",
        message: `Your teacher graded your latest submission with a score of 95/100!`,
        type: "GRADE",
        link: "/student/grades",
      },
    });
  }

  // 12. Contact Messages & Subscribers
  await prisma.contactMessage.create({
    data: {
      name: "Mrs. Jennifer Taylor",
      email: "jennifer.parent@gmail.com",
      subject: "Inquiry about Junior Robotics program for 9-year old",
      message: "Hello, I would like to know if starter hardware kits are shipped directly to international addresses or if we can use virtual simulators?",
      status: "UNREAD",
    },
  });

  await prisma.contactMessage.create({
    data: {
      name: "Mark Evans",
      email: "mark.evans@techschools.edu",
      subject: "School Partnership & Group Enrollments",
      message: "We would like to enroll 45 students from our STEM club into the Python Game Dev curriculum.",
      status: "READ",
    },
  });

  const sampleSubscribers = [
    "parent.alex@gmail.com",
    "maria.curious@yahoo.com",
    "stem.teacher@school.org",
    "samuel.k@outlook.com"
  ];
  for (const s of sampleSubscribers) {
    await prisma.newsletterSubscriber.create({
      data: { email: s },
    });
  }

  // 13. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM_INITIALIZATION",
      entity: "Database",
      entityId: "system-001",
      detailsJson: JSON.stringify({ event: "Initial demo database seeded with curriculum, teachers, students" }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✅ WiseKids database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
