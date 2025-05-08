# KJK Astro Project

> **Note:** This is the authoritative README for the project. If you see a duplicate (such as `README2.md`), please refer only to this file and consider removing the duplicate to avoid confusion.

## Project Overview
This project is a modern web application built with Astro, featuring custom markdown processing, Unicode sanitation tools, and a suite of interactive games. It includes robust testing with Playwright and a modular component structure.

## Setup Instructions
1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. To start the development server:
   ```sh
   npm run dev
   ```

## Development Workflow
- Source code is in the `src/` directory.
- Components are in `components/` and `src/components/`.
- Public assets and games are in `public/`.
- Use the linter script to sanitize and check code/markdown:
  ```sh
  node linter.js <files>
  ```

## Testing Instructions
- End-to-end tests are in the `tests/` directory.
- To run all tests:
  ```sh
  npx playwright test
  ```
- Test results are output to `test-results/`.

## Contribution Guidelines
- Ensure code passes linting before committing.
- Write clear commit messages.
- Add or update tests for new features or bug fixes.
- For questions, see `docs/` or contact the maintainers.
