const mongoose = require('mongoose');
const Event = require('./models/Event');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await Admin.deleteMany({});

    // Create admin user
    const admin = new Admin({
      username: 'admin',
      email: 'admin@sewingcircle.com',
      password: 'follow.admin'
    });
    await admin.save();
    console.log('Admin user created with username: admin');

    // Upcoming events
    const upcomingEvents = [
      {
        type: 'upcoming',
        name: "Sewing Circle Feb Meet Up",
        date: "Feb 7",
        time: "5 pm",
        venue: "https://share.google/yLevXhWoI7LuiYwiu",
        description: "Our February meetup offers an informal space for meaningful conversations around careers, technology, AI, personal interests, and evolving paths. Whether you're exploring growth, change, or new ideas, you'll find thoughtful dialogue and genuine connection here.\\n\\nCome as you are. Leave inspired.\\n\\n👉 Join us this February and be part of a community that grows together."
      }
    ];

    // Past events
    const pastEvents = [
      {
        type: 'past',
        header: "February 2025",
        theme: "Thoughtful Conversations, Shared Perspectives",
        teaser: "Eleven participants explored AI, testing, workplace culture, and learning mindsets in an afternoon of thoughtful conversation.",
        fullDescription: "The February Sewing Circle brought together eleven individuals for an afternoon of open and engaging conversation. Participants explored topics including the evolving role of UI/UX and manual testing in an AI-driven world, workplace culture, identity beyond job titles, and learning mindsets.\\n\\nDiverse perspectives sparked reflection, discussion, and meaningful dialogue. Attendees left with new insights and connections, capturing the essence of Sewing Circle as a space for curiosity, learning, and human connection.",
        location: "Brass Tap, Plano",
        duration: "2 hours",
        participants: 11,
        facilitator: "Asha",
        coverImage: "/uploads/feb1.jpeg",
        gallery: ["/uploads/feb1.jpeg", "/uploads/feb2.jpeg"]
      },
      {
        type: 'past',
        header: "April 2025",
        theme: "Tech Insights and Industry Exchange",
        teaser: "IT professionals shared insights on Oracle, NetSuite, SAP, and the intersection of reinsurance with technology.",
        fullDescription: "The April Sewing Circle marked the community's second gathering, bringing IT professionals together for focused, insight-driven conversations. Discussions covered rising Oracle costs, the evolving role of NetSuite, new SAP tools for data visibility, and an eye-opening exploration of reinsurance and its intersection with technology.\\n\\nThe meetup fostered knowledge-sharing and professional exchange, offering participants fresh perspectives and the opportunity to connect with like-minded peers.",
        location: "Brass Tap, Allen",
        duration: "2 hours",
        participants: 12,
        facilitator: "Asha",
        coverImage: "/uploads/april1.jpeg",
        gallery: ["/uploads/april1.jpeg", "/uploads/april2.jpeg", "/uploads/april3.jpeg"]
      },
      {
        type: 'past',
        header: "June 2025",
        theme: "Exploring AI, Cybersecurity, and Industry Insights",
        teaser: "Discussions spanned AI, cybersecurity, healthcare applications, virtual assistants, and legacy systems, with lighter conversations adding fun.",
        fullDescription: "The June Sewing Circle welcomed nine participants for an evening of engaging conversation and collaboration. Discussions included AI-driven exposure management, real-world AI use cases across cybersecurity, healthcare, manufacturing, and customer service, prompt engineering, virtual assistants in healthcare, and the enduring role of AS400 in enterprise systems.\\n\\nLighter conversations on movies, luxury car rivalries, and cultural reflections added fun and variety. Attendees left with valuable industry insights and a sense of community.",
        location: "La Souq, Richardson",
        duration: "2 hours",
        participants: 9,
        facilitator: "Asha",
        coverImage: "/uploads/june1.jpeg",
        gallery: ["/uploads/june1.jpeg", "/uploads/june2.jpeg"]
      },
      {
        type: 'past',
        header: "October 2025",
        theme: "Navigating AI, Education, and the Future of Work",
        teaser: "Professionals examined AI's impact on work, Gen Alpha's education shifts, fractional roles, and preparing graduates for the future.",
        fullDescription: "The October Sewing Circle gathered professionals from technology, healthcare, HR, and other domains for a thought-provoking evening. Key topics included AI's impact on job markets, evolving organizational structures, Gen Alpha's approach to education, rising tuition costs, and the trend of fractional roles for senior professionals.\\n\\nParticipants also discussed preparing fresh graduates for the workforce and how AI is transforming operational layers. The meetup emphasized meaningful human connection alongside professional insights.",
        location: "Haraz Coffee House, Plano",
        duration: "2 hours",
        participants: 8,
        facilitator: "Asha",
        coverImage: "/uploads/oct1.jpeg",
        gallery: ["/uploads/oct1.jpeg", "/uploads/oct2.jpeg", "/uploads/oct3.jpeg"]
      },
      {
        type: 'past',
        header: "December 2025",
        theme: "Celebrating Connections and Passions",
        teaser: "Twelve participants connected over digital transformation, AI trends, and personal passions, fostering support and meaningful dialogue.",
        fullDescription: "The December Sewing Circle brought together 12 professionals for conversation, collaboration, and reflection. Discussions ranged from digital transformation in government and healthcare to AI trends including Physical AI and AGI, and emerging investment ideas.\\n\\nBeyond technology, attendees shared personal passions—from music composition and DJing to crafts, app development, and fashion—creating genuine encouragement and support. The gathering highlighted Sewing Circle's role as a space for growth, inspiration, and human connection.",
        location: "Heritage Coffee, Frisco",
        duration: "2 hours",
        participants: 12,
        facilitator: "Asha",
        coverImage: "/uploads/dec1.jpeg",
        gallery: ["/uploads/dec1.jpeg", "/uploads/dec2.jpeg"]
      }
    ];

    // Insert events
    await Event.insertMany([...upcomingEvents, ...pastEvents]);
    console.log('Events seeded successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();