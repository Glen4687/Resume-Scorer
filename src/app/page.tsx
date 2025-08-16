"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, Target, CheckCircle, AlertCircle, TrendingUp, Award, Clock, User } from "lucide-react"

interface ScoreData {
  overall: number
  breakdown: {
    customization: number
    grammar: number
    summary: number
    results: number
    wordChoice: number
    formatting: number
    length: number
    contact: number
    comprehensiveness: number
  }
  feedback: {
    [key: string]: string
  }
}

export default function ResumeScorer() {
  const [file, setFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        droppedFile.type === "text/plain"
      ) {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file || !jobTitle.trim()) return

    setIsAnalyzing(true)
    setScoreData(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobTitle', jobTitle)

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to score resume')
      }

      const data = await response.json()

      // Transform the API response to match the new UI's data structure
      const breakdown: { [key: string]: number } = {}
      const feedback: { [key: string]: string } = {}
      
      data.scores.forEach((item: any) => {
        const key = item.criterion.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')
        breakdown[key] = parseInt(item.score, 10)
        feedback[key] = `${item.positive} ${item.negative}`
      });

      const transformedData: ScoreData = {
        overall: parseInt(data.total_score, 10),
        breakdown: breakdown as ScoreData['breakdown'],
        feedback,
      }

      setScoreData(transformedData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const criteriaLabels = {
    customization: "Job Customization",
    grammar: "Grammar & Spelling",
    summary: "Summary Statement",
    results: "Measurable Results",
    wordChoice: "Word Choice",
    formatting: "Formatting",
    length: "Optimal Length",
    contact: "Contact Information",
    comprehensiveness: "Comprehensiveness",
  }

  const criteriaIcons = {
    customization: Target,
    grammar: CheckCircle,
    summary: FileText,
    results: TrendingUp,
    wordChoice: Award,
    formatting: FileText,
    length: Clock,
    contact: User,
    comprehensiveness: CheckCircle,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Resume Scorer</h1>
              <p className="text-primary-foreground/80">Elevate Your Resume with AI-Powered Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!scoreData ? (
          <div className="space-y-8 animate-fade-in-up">
            {/* Upload Section */}
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume in PDF, DOCX, or TXT format for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    {file ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <Badge variant="secondary" className="animate-scale-in">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Drag and drop your resume here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT files up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Title Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target Job Title
                </CardTitle>
                <CardDescription>Enter the job title you're applying for to get customized feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Senior Software Engineer, Marketing Manager, Data Analyst"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={!file || !jobTitle.trim() || isAnalyzing}
                size="lg"
                className="px-8 py-3 text-base font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* Overall Score */}
            <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20">
                    <span className="text-3xl font-bold text-primary">{scoreData.overall}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Overall Resume Score</h2>
                    <p className="text-muted-foreground">
                      Your resume scored {scoreData.overall}/100 for the {jobTitle} position
                    </p>
                  </div>
                  <Badge
                    variant={
                      scoreData.overall >= 80 ? "default" : scoreData.overall >= 60 ? "secondary" : "destructive"
                    }
                    className="text-sm px-4 py-1"
                  >
                    {scoreData.overall >= 80 ? "Excellent" : scoreData.overall >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Score Breakdown</CardTitle>
                <CardDescription>See how your resume performs across key criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(scoreData.breakdown).map(([key, score], index) => {
                  const Icon = criteriaIcons[key as keyof typeof criteriaIcons]
                  return (
                    <div key={key} className="space-y-3" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{criteriaLabels[key as keyof typeof criteriaLabels]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(score)}
                          <span className={`font-semibold ${getScoreColor(score)}`}>{score}/100</span>
                        </div>
                      </div>
                      <Progress
                        value={score}
                        className="h-2 animate-progress-fill"
                        style={{ animationDelay: `${index * 200}ms` }}
                      />
                      <p className="text-sm text-muted-foreground pl-8">{scoreData.feedback[key]}</p>
                      {index < Object.entries(scoreData.breakdown).length - 1 && <Separator className="mt-4" />}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setScoreData(null)
                  setFile(null)
                  setJobTitle("")
                }}
                variant="outline"
                size="lg"
              >
                Analyze Another Resume
              </Button>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Download Detailed Report
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Resume Scorer. Powered by AI to help you land your dream job.</p>
        </div>
      </footer>
    </div>
  )
}