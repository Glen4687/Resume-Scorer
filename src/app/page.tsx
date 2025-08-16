'use client';

import { useState } from 'react';

interface Score {
  criterion: string;
  score: string;
  positive: string;
  negative: string;
}

interface Results {
  scores: Score[];
  total_score: string;
  summary_feedback: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobTitle) {
      setError('Please provide both a resume file and a job title.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobTitle', jobTitle);

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Resume Scorer</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="resume" className="block text-gray-700 text-sm font-bold mb-2">
              Upload Resume (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              id="resume"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="jobTitle" className="block text-gray-700 text-sm font-bold mb-2">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            >
              {loading ? 'Scoring...' : 'Score Resume'}
            </button>
          </div>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {results && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Scoring Results</h2>
            <p className="text-xl font-bold mb-4 text-center text-gray-800">Total Score: {results.total_score}/100</p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Criterion</th>
                    <th className="py-2 px-4 border-b">Score</th>
                    <th className="py-2 px-4 border-b">Positive Feedback</th>
                    <th className="py-2 px-4 border-b">Negative Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {results.scores.map((item: Score, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">{item.criterion}</td>
                      <td className="py-2 px-4 border-b text-center">{item.score}</td>
                      <td className="py-2 px-4 border-b">{item.positive}</td>
                      <td className="py-2 px-4 border-b">{item.negative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Summary Feedback</h3>
              <p>{results.summary_feedback}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}