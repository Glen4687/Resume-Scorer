
import argparse
import json
import os
from pathlib import Path

import docx
import fitz  # PyMuPDF
import openai
from tabulate import tabulate


def load_config(config_path="config.json"):
    """Loads the configuration from a JSON file."""
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Configuration file '{config_path}' not found.")
        exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in configuration file '{config_path}'.")
        exit(1)


def get_resume_text(file_path):
    """Extracts text from a resume file (PDF, DOCX, or TXT)."""
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' was not found.")

        file_extension = Path(file_path).suffix.lower()
        text = ""
        if file_extension == ".pdf":
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
        elif file_extension == ".docx":
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif file_extension == ".txt":
            with open(file_path, "r") as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")

        if not text.strip():
            raise ValueError("The resume file is empty or contains no text.")

        return text
    except Exception as e:
        print(f"Error reading resume file: {e}")
        exit(1)


def get_job_requirements(job_title, api_key):
    """Identifies essential skills, keywords, and certifications for a job title using GPT-4o."""
    client = openai.Client(api_key=api_key)
    prompt = f"""
    Identify the essential skills, keywords, and certifications for the job title: "{job_title}".
    Please provide a concise list.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting job requirements from OpenAI: {e}")
        exit(1)


def score_resume(resume_text, job_title, job_requirements, api_key, scoring_weights):
    """Scores a resume based on job requirements and other criteria using GPT-4o."""
    client = openai.Client(api_key=api_key)
    prompt = f"""
    Please score the following resume for the job title "{job_title}".
    The essential skills, keywords, and certifications for this role are:
    {job_requirements}

    Score the resume out of 100 based on the following criteria and weights:
    {json.dumps(scoring_weights, indent=2)}

    For each criterion, provide a score, positive feedback, and negative feedback.
    Finally, provide a total score and an overall summary feedback.

    Return the output as a JSON object with the following structure:
    {{
      "scores": [
        {{
          "criterion": "Criterion Name",
          "score": "Score (0-10 or weighted)",
          "positive": "Positive feedback",
          "negative": "Negative feedback"
        }}
      ],
      "total_score": "Total score out of 100",
      "summary_feedback": "Overall summary feedback"
    }}

    Resume Text:
    {resume_text}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a resume scoring expert."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error scoring resume with OpenAI: {e}")
        exit(1)


def display_results(results):
    """Displays the scoring results in a table and saves them to a JSON file."""
    headers = ["Criterion", "Score", "Positive Feedback", "Negative Feedback"]
    table_data = [
        [
            item["criterion"],
            item["score"],
            item["positive"],
            item["negative"],
        ]
        for item in results["scores"]
    ]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    print(f"\nTotal Score: {results['total_score']}/100")
    print(f"\nSummary Feedback:\n{results['summary_feedback']}")

    # Save results to a JSON file
    output_filename = "resume_score_results.json"
    with open(output_filename, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nFull results saved to {output_filename}")


def main():
    """Main function to run the resume scorer."""
    parser = argparse.ArgumentParser(description="Resume Scorer")
    parser.add_argument("resume_file", help="Path to the resume file (PDF, DOCX, or TXT)")
    parser.add_argument("job_title", help="The job title to score the resume against")
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    config = load_config(script_dir / "config.json")
    api_key = config.get("openai_api_key")
    scoring_weights = config.get("scoring_weights")

    if not api_key or api_key == "YOUR_OPENAI_API_KEY":
        print("Error: OpenAI API key not found in config.json.")
        print("Please add your API key to the config.json file.")
        exit(1)

    resume_text = get_resume_text(args.resume_file)
    job_requirements = get_job_requirements(args.job_title, api_key)
    print("Identified Job Requirements:\n", job_requirements)

    print("\nScoring resume...")
    results = score_resume(
        resume_text, args.job_title, job_requirements, api_key, scoring_weights
    )

    display_results(results)


if __name__ == "__main__":
    main()
