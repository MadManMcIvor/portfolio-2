export const curioItems = [
  {
    id: 'wails',
    title: 'Wails',
    type: 'Framework',
    description: 'Go framework for building desktop applications with web technologies. Native performance with web frontend flexibility.',
    thoughts: 'I love the idea of using Go for desktop apps. Wails makes it easy to build cross-platform apps with a native feel while leveraging web tech for the UI. Also, compared to Electron apps, Wails apps are lightweight and fast since they don\'t bundle a full browser engine.', 
    date: new Date('2025-12-31'),
    url: 'https://wails.io/'
  },
  {
    id: 'go',
    title: 'Go',
    type: 'Language',
    description: 'Simple, concurrent, compiled language. Great for building servers, CLIs, and backend systems. Fast build times and minimal dependencies.',
    thoughts: 'Go strikes a great balance between performance and simplicity. Its concurrency model with goroutines and channels makes it easy to build scalable applications. The standard library is robust, and the tooling around Go (like go modules) simplifies dependency management. You get a ton of power without too much extra complexity from a similar systems level language.',
    date: new Date('2025-12-31'),
    url: 'https://go.dev/'
  },
  {
    id: 'redis-postgres-article',
    title: 'Redis is fast. I\'ll cache in Postgres.',
    type: 'Article',
    description: 'Thoughtful piece on the tradeoffs between Redis and Postgres caching. Sometimes simpler tooling and fewer moving parts wins.',
    thoughts: 'Great article that adds to my thinking that you need to give me a reason NOT to use Postgres. Most applications won\'t need the complexity of an additional caching layer like Redis. Postgres has so many built-in features (like in-memory caching, materialized views, and JSONB support) that can often meet caching needs without the operational overhead of managing another system.',
    date: new Date('2025-12-31'),
    url: 'https://dizzy.zone/2025/09/24/Redis-is-fast-Ill-cache-in-Postgres/'
  },
  {
    id: 'supabase',
    title: 'Supabase',
    type: 'Platform',
    description: 'Open-source Firebase alternative built on Postgres. Real-time capabilities with the reliability of a mature database.',
    thoughts: 'Makes managing backend services so much easier. I like the platform as a service idea of being able to focus on the UI/UX while Supabase handles the database, authentication, and real-time features.', 
    date: new Date('2025-12-31'),
    url: 'https://supabase.com/'
  },
  {
    id: 'pocketbase',
    title: 'PocketBase',
    type: 'Platform',
    description: 'Lightweight self-hosted backend written in Go. Single executable, real-time features, admin dashboard included. Perfect for side projects.',
    thoughts: 'I\'ve yet to actually use this, but have this bookmarked for future side projects. I love the idea of a single binary (Go) that you can drop anywhere to get a full backend with database, auth, and real-time capabilities up and running quickly all built on SQLite, which is modern marvel in my mind.', 
    date: new Date('2025-12-31'),
    url: 'https://pocketbase.io/'
  },
  {
    id: 'basecoat',
    title: 'Basecoat',
    type: 'UI Framework',
    description: 'Minimal CSS component library with excellent accessibility. Lightweight, customizable, and doesn\'t force you into a framework.',
    thoughts: 'This portfolio site was built using Basecoat! I love the simplicity of it. As much as I\'m a fan of React/Vue/etc. you often don\'t need a full framework for smaller projects. Basecoat provides just enough structure and styling to build clean, accessible UIs without the bloat of larger frameworks.',
    date: new Date('2025-12-31'),
    url: 'https://basecoatui.com/'
  },
  {
    id: 'htmx',
    title: 'HTMX',
    type: 'Technology',
    description: 'Bringing interactivity to server-rendered HTML without needing SPAs. A clever take on progressive enhancement.',
    thoughts: 'I\'ve yet to actually use this, but I have been intrigued by the idea of a more powerful HTML without needing a full SPA framework. Again, this keeps in mind the right tool for the job. Not all things need a heavy frontend framework.',
    date: new Date('2025-12-31'),
    url: 'https://htmx.org/'
  },
  {
    id: 'sqlite',
    title: 'SQLite',
    type: 'Technology',
    description: 'An underrated database. Single-file deployment, zero configuration, excellent for projects of all sizes.',
    thoughts: 'SQLite amazes me. An in-process database that is so reliable and performant. It\'s one of of the most deployed pieces of software in the world. It\'s much more powerful than people think. My current thought process is that unless you have a specific need for a client-server database, SQLite should be your default choice. (then you should choose Postgres if you do need client-server database)', 
    date: new Date('2025-12-31'),
    url: 'https://www.sqlite.org/'
  },
  {
    id: 'duckdb',
    title: 'DuckDB',
    type: 'Technology',
    description: 'Columnar SQL database optimized for analytical queries. Incredibly fast for data exploration.',
    thoughts: 'A new contender in the database space. I love it\'s focus on analytical workloads and improved SQL syntax. I haven\'t had too much reason to put it to use other than analyzing CSVs and JSON quickly, but if I had a known dataset, this is definitely my choice for data exploration and analysis.', 
    date: new Date('2025-12-31'),
    url: 'https://duckdb.org/'
  },
  {
    id: 'obsidian',
    title: 'Obsidian',
    type: 'Tool',
    description: 'Local-first knowledge management. The way backlinks work encourages genuine understanding and connection building.',
    thoughts: 'This goes hand in hand with my love of selfhosted stuff. I love that my notes are just markdown files on my computer, but Obsidian adds a powerful layer of organization and connectivity on top of that. The graph view is fantastic for visualizing connections between ideas. It\'s become my go-to tool for personal knowledge management.', 
    date: new Date('2025-12-31'),
    url: 'https://obsidian.md/'
  },
  {
    id: 'rust',
    title: 'Rust',
    type: 'Language',
    description: 'Systems programming with memory safety. Fascinating approach to eliminating entire classes of bugs at compile time.',
    thoughts: 'I\'m intrigued by Rust\'s approach to memory safety without a garbage collector. I haven\'t learned it yet, but if I had a need for a systems programming language, this would be my choice.',
    date: new Date('2025-12-31'),
    url: 'https://www.rust-lang.org/'
  },
];
