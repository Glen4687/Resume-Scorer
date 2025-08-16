# Resume Scorer - Web Application

This is a full-stack web application that scores a resume against a job title using the OpenAI GPT-4o API.

## Features

- **Upload Resumes:** Supports PDF, DOCX, and TXT file formats.
- **Job Title Input:** Score resumes for specific job titles.
- **AI-Powered Scoring:** Uses GPT-4o to analyze and score resumes based on multiple criteria.
- **Detailed Feedback:** Provides positive and negative feedback for each scoring criterion.
- **Responsive UI:** Clean and responsive user interface built with Next.js and Tailwind CSS.

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **File Parsing:** `pdf-parse` (for PDF), `mammoth` (for DOCX)
- **AI:** OpenAI GPT-4o API

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm
- An OpenAI API key

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Glen4687/Resume-Scorer.git
   cd Resume-Scorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a file named `.env.local` in the root of the project and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment on Vercel

Deploy this application to Vercel with a single click.

1. **Create a new project on Vercel** and import your repository `https://github.com/Glen4687/Resume-Scorer.git`.

2. **Set the environment variable:**
   - In the Vercel project settings, navigate to the "Environment Variables" section.
   - Add a new variable named `OPENAI_API_KEY` and paste your OpenAI API key as the value.

3. **Deploy:**
   Vercel will automatically build and deploy the application. Once the deployment is complete, you will get a public URL for your Resume Scorer.

## CLI Version

The original Python-based CLI version of this application is available in the `/cli-version` directory. See the `README.md` file in that directory for instructions on how to use it.