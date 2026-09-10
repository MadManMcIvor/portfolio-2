// Ordered most recent first.
export const projects = [
  {
    id: 'Workout',
    title: 'Workout',
    desc: 'A workout planner built for my own use: a library of kettlebell and bodyweight movements, circuits built from them, and a calendar to schedule sessions and mark off what actually got done. Installs to the home screen and runs offline, with no account and no backend.',
    tech: ['JavaScript','PWA','Service worker'],
    url: '/workout/',
    linkLabel: 'alexmcivor.com/workout',
  },
  {
    id: 'Steadwell',
    title: 'Steadwell',
    desc: 'A free iOS app that keeps a record of a house — how old the roof is, when the water heater went in, what paint is in the guest room. Local-first with no account and no ads; optional sync runs on your own iCloud.',
    tech: ['Vue','Ionic','Capacitor','SQLite'],
    url: 'https://steadwell.dev/',
    linkLabel: 'steadwell.dev',
  },
  {
    id: 'Abigail',
    title: 'Abigail',
    desc: 'A unifying web app connecting Pearson assessment authoring, delivery, and management tools empowered with AI',
    tech: ['Vue','Go','Postgres','AI'],
  },
  {
    id: 'WriteUp!',
    title: 'WriteUp!',
    desc: 'AI-powered writing assessment prep platform helping students improve their writing skills through practice and feedback.',
    tech: ['Vue','NodeJs','DynamoDB','AI'],
  },
  {
    id: 'PASS',
    title: 'PASS',
    desc: 'Pearson Assessment Scoring System - An API based scalable, secure platform for managing and scoring large-scale assessments.',
    tech: ['Java','Postgres','Microservices'],
  }
];
