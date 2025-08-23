"use client"

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, ProgressBar, Form, Alert, Navbar } from 'react-bootstrap';

interface ScoreData {
  overall: number;
  breakdown: { [key: string]: number };
  feedback: { [key: string]: string };
}

const scoring_weights: { [key: string]: number } = {
  customization: 15,
  grammar_spelling: 10,
  summary_statement: 10,
  measurable_results: 15,
  word_choice: 10,
  formatting: 10,
  optimal_length: 10,
  contact_information: 10,
  comprehensiveness: 10,
};

const criteriaLabels: { [key: string]: string } = {
  customization: "Job Customization",
  grammar_spelling: "Grammar & Spelling",
  summary_statement: "Summary Statement",
  measurable_results: "Measurable Results",
  word_choice: "Word Choice",
  formatting: "Formatting",
  optimal_length: "Optimal Length",
  contact_information: "Contact Information",
  comprehensiveness: "Comprehensiveness",
};

export default function ResumeScorer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.style.fontFamily = "'Aptos', sans-serif";
  }, [isDarkMode]);

  const handleAnalyze = async () => {
    if (!file || !jobTitle.trim()) return;
    setIsAnalyzing(true);
    setScoreData(null);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobTitle', jobTitle);
    try {
      const response = await fetch('/api/score', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'An unknown error occurred.');
      if (!data.scores || !Array.isArray(data.scores) || !data.total_score) throw new Error('Invalid data format from server.');
      const breakdown: { [key: string]: number } = {};
      const feedback: { [key: string]: string } = {};
      data.scores.forEach((item: { criterion: string; score: string; positive: string; negative: string }) => {
        const key = item.criterion.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        breakdown[key] = parseInt(item.score, 10) || 0;
        feedback[key] = `${item.positive} ${item.negative}`;
      });
      setScoreData({ overall: parseInt(data.total_score, 10) || 0, breakdown, feedback });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Navbar bg={isDarkMode ? "dark" : "primary"} variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">Resume Scorer</Navbar.Brand>
          <Button variant="outline-light" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Container>
      </Navbar>

      <Container className="my-5">
        {!scoreData ? (
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Upload Your Resume</Card.Title>
                  <Card.Text>Upload your resume in PDF, DOCX, or TXT format.</Card.Text>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Control type="file" accept=".pdf,.docx,.txt" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null)} />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card>
                <Card.Body>
                  <Card.Title>Target Job Title</Card.Title>
                  <Form.Group controlId="jobTitle">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" size="lg" onClick={handleAnalyze} disabled={!file || !jobTitle.trim() || isAnalyzing}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                </Button>
              </div>

              {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
            </Col>
          </Row>
        ) : (
          <>
            <Row className="justify-content-center text-center">
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>Overall Score</Card.Title>
                    <h1 className="display-1">{scoreData.overall}</h1>
                    <p className={`h4 text-${scoreData.overall >= 80 ? 'success' : scoreData.overall >= 60 ? 'warning' : 'danger'}`}>
                      {scoreData.overall >= 80 ? "Excellent" : scoreData.overall >= 60 ? "Good" : "Needs Improvement"}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <h2 className="text-center mb-4">Detailed Score Breakdown</h2>
            <Row>
              {Object.entries(scoreData.breakdown).map(([key, score]) => (
                <Col md={4} key={key} className="mb-4 d-flex">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>{criteriaLabels[key] || key}</Card.Title>
                      <div className="d-flex justify-content-between align-items-center">
                        <h4>{score}<small className="text-muted">/{scoring_weights[key]}</small></h4>
                      </div>
                      <ProgressBar now={(score / scoring_weights[key]) * 100} />
                      <Card.Text className="mt-3">{scoreData.feedback[key]}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="text-center mt-4">
              <Button variant="primary" onClick={() => { setScoreData(null); setFile(null); setJobTitle(""); }}>
                Analyze Another Resume
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}