import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';

// Check for API key at the top level
const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const scoring_weights = {
  customization: 15,
  spelling_grammar: 10,
  summary_statement: 10,
  measurable_results: 15,
  word_choice: 10,
  formatting: 10,
  optimal_length: 10,
  contact_information: 10,
  comprehensiveness: 10,
};

export async function POST(req: NextRequest) {
  // Return error if API key is missing
  if (!openaiApiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const jobTitle = formData.get('jobTitle') as string;

  if (!file || !jobTitle) {
    return NextResponse.json({ error: 'Missing file or job title' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let resumeText = '';

  try {
    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      resumeText = data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer });
      resumeText = value;
    } else if (file.type === 'text/plain') {
      resumeText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: 'The resume file is empty or contains no text.' }, { status: 400 });
    }

    const jobRequirements = await getJobRequirements(jobTitle);
    const scoreData = await scoreResume(resumeText, jobTitle, jobRequirements);

    return NextResponse.json(scoreData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process the resume' }, { status: 500 });
  }
}

async function getJobRequirements(jobTitle: string) {
  const prompt = `Identify the essential skills, keywords, and certifications for the job title: "${jobTitle}". Please provide a concise list.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content;
}

async function scoreResume(resumeText: string, jobTitle: string, jobRequirements: string | null) {
  const prompt = `
    Please score the following resume for the job title "${jobTitle}".
    The essential skills, keywords, and certifications for this role are:
    ${jobRequirements}

    Score the resume out of 100 based on the following criteria and weights:
    ${JSON.stringify(scoring_weights, null, 2)}

    For each criterion, provide a score, positive feedback, and negative feedback.
    Finally, provide a total score and an overall summary feedback.

    Return the output as a JSON object with the following structure:
    {
      "scores": [
        {
          "criterion": "Criterion Name",
          "score": "Score (0-10 or weighted)",
          "positive": "Positive feedback",
          "negative": "Negative feedback"
        }
      ],
      "total_score": "Total score out of 100",
      "summary_feedback": "Overall summary feedback"
    }

    Resume Text:
    ${resumeText}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a resume scoring expert.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
