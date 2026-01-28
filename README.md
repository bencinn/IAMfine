# IAMfine

## Setup
1. Generate JWKS
   ```bash
   cd packages/server
   bun run scripts/generate-jwks.ts
   ```
2. Start the development server
   ```bash
   bun run dev
   ```

The web server is on port 3002.
The api server is on port 3001.
Idk why I separate it into two servers but ye.
