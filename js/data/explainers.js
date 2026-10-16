// Interactive explainers, each a self-contained page under /explainers/<slug>/.
// `group` sets the section on the explainers page; `featured` puts one on the home page
// (keep it to three, so they fill a row).
export const explainerGroups = [
  { id: 'concepts', title: 'Concepts', lead: 'How the moving parts underneath an application fit together.' },
  { id: 'languages', title: 'Language references', lead: 'For picking up a language when you already know another, with side-by-side comparisons.' },
];

export const explainers = [
  {
    slug: 'system-design',
    title: 'System design field guide',
    desc: 'Earn your complexity: start with one box, and add each piece — cache, queue, replica — only when a real signal asks for it.',
    tags: ['Architecture', 'Hosting', 'Deploys'],
    group: 'concepts',
    featured: true,
  },
  {
    slug: 'containers',
    title: 'Containers, explained',
    desc: 'What a container actually is, how Docker, Compose, Podman and Kubernetes stack up, and which to reach for when.',
    tags: ['Docker', 'Compose', 'Kubernetes'],
    group: 'concepts',
    featured: true,
  },
  {
    slug: 'networking',
    title: 'How things connect',
    desc: 'Every connection is envelopes inside envelopes. The protocol stack, the handshakes, and the real-time options, step by step.',
    tags: ['TCP/IP', 'TLS', 'HTTP'],
    group: 'concepts',
    featured: true,
  },
  {
    slug: 'auth',
    title: 'Auth field guide',
    desc: 'Who are you, and what are you allowed to do? From hashing and TLS through sessions, JWTs, OAuth, OIDC and passkeys.',
    tags: ['OAuth', 'JWT', 'Passkeys'],
    group: 'concepts',
  },
  {
    slug: 'sql',
    title: 'SQL reference',
    desc: 'SQL the way the database reads it, with every example switchable between Postgres, DuckDB and SQLite.',
    tags: ['Postgres', 'DuckDB', 'SQLite'],
    group: 'concepts',
  },
  {
    slug: 'js-ts',
    title: 'JS / TS field guide',
    desc: 'How JavaScript and TypeScript work underneath: the event loop, the type layer that gets erased, and where they differ from other languages.',
    tags: ['TypeScript 7', 'Node 24'],
    group: 'languages',
  },
  {
    slug: 'python',
    title: 'Python 3.15 primer',
    desc: 'Modern Python from the toolchain to the memory model, with JavaScript, TypeScript, Java and Go alongside.',
    tags: ['Python 3.15', 'uv'],
    group: 'languages',
  },
  {
    slug: 'go',
    title: 'Go 1.27 field guide',
    desc: 'A one-page Go reference: slices, interfaces, errors and goroutines, with step-through visuals and a cheat sheet.',
    tags: ['Go 1.27'],
    group: 'languages',
  },
  {
    slug: 'java',
    title: 'Modern Java primer',
    desc: 'Java 25 LTS for people who last looked a while ago: records, sealed types, pattern matching and virtual threads.',
    tags: ['Java 25 LTS'],
    group: 'languages',
  },
];
