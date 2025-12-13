#!/usr/bin/env node

/**
 * CLI tool to initialize a new @aibadgr/router project
 * 
 * Usage:
 *   npx @aibadgr/router init [directory]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetDir = process.argv[2] || '.';

console.log('🚀 Initializing @aibadgr/router project...\n');

// Create directory if it doesn't exist
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
}

// Create .env.example
const envExample = `# AI Badgr API Key (Required - get yours at https://aibadgr.com)
AIBADGR_API_KEY=your-aibadgr-api-key-here

# Optional: Custom AI Badgr base URL
# AIBADGR_BASE_URL=https://aibadgr.com/api/v1

# Optional: OpenAI API Key (for premium routing)
# OPENAI_API_KEY=your-openai-api-key-here

# Optional: Anthropic API Key (for Claude routing)
# ANTHROPIC_API_KEY=your-anthropic-api-key-here
`;

writeFileSync(join(targetDir, '.env.example'), envExample);
console.log('✅ Created .env.example');

// Create starter script
const starterScript = `import { createRouter } from "@aibadgr/router";

// Load environment variables (you may need dotenv in a real project)
// import 'dotenv/config';

const router = createRouter({
  providers: {
    aibadgr: {
      apiKey: process.env.AIBADGR_API_KEY || "your-api-key-here",
    },
    // Optional: Add more providers
    // openai: { apiKey: process.env.OPENAI_API_KEY },
    // anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }
  },
  routes: {
    // Optional: Route specific tasks to specific providers
    // code: "anthropic",
    // reasoning: "openai"
  }
});

async function main() {
  console.log("🚀 Running AI Badgr Router example\\n");

  // Example 1: Summarization
  const result = await router.run({
    task: "summarize",
    input: "The quick brown fox jumps over the lazy dog. This is a sample text to demonstrate the router."
  });

  console.log("✅ Result:");
  console.log("  Output:", result.outputText);
  console.log("  Provider:", result.provider);
  console.log("  Cost:", "$" + (result.cost?.estimatedUsd || 0).toFixed(6));
  console.log("  Latency:", result.latencyMs + "ms");
}

main().catch(console.error);
`;

writeFileSync(join(targetDir, 'index.js'), starterScript);
console.log('✅ Created index.js');

// Create package.json
const packageJson = {
  "name": "my-aibadgr-router-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "demo": "node index.js"
  },
  "dependencies": {
    "@aibadgr/router": "^0.1.0"
  }
};

writeFileSync(join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('✅ Created package.json');

// Create README
const readme = `# AI Badgr Router Starter

This project was initialized with \`npx @aibadgr/router init\`.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy \`.env.example\` to \`.env\` and add your API key:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Get your API key from https://aibadgr.com and add it to \`.env\`

## Run

\`\`\`bash
npm start
\`\`\`

## Learn More

- [Documentation](https://github.com/michaelbrinkworth/ai-task-router#readme)
- [Examples](https://github.com/michaelbrinkworth/ai-task-router/tree/main/examples)
- [API Reference](https://github.com/michaelbrinkworth/ai-task-router#api-reference)
`;

writeFileSync(join(targetDir, 'README.md'), readme);
console.log('✅ Created README.md');

// Create .gitignore
const gitignore = `node_modules/
.env
*.log
.DS_Store
`;

writeFileSync(join(targetDir, '.gitignore'), gitignore);
console.log('✅ Created .gitignore');

console.log('\n🎉 Project initialized successfully!\n');
console.log('Next steps:');
if (targetDir !== '.') {
  console.log(`  1. cd ${targetDir}`);
  console.log('  2. npm install');
} else {
  console.log('  1. npm install');
}
console.log('  3. cp .env.example .env');
console.log('  4. Edit .env and add your AIBADGR_API_KEY (get one at https://aibadgr.com)');
console.log('  5. npm start');
console.log('\n💡 Need help? Check out the examples/ folder in the @aibadgr/router package\n');
