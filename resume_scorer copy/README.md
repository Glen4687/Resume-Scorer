# Resume Scorer

This is a command-line application that scores a resume against a job title using the OpenAI GPT-4o API.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/resume-scorer.git
   cd resume-scorer
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. **Set your OpenAI API Key:**
   Open the `config.json` file and replace `"YOUR_OPENAI_API_KEY"` with your actual OpenAI API key.

2. **(Optional) Adjust Scoring Weights:**
   You can modify the scoring weights in the `config.json` file to suit your needs. The default weights are:
   ```json
   {
     "customization": 15,
     "spelling_grammar": 10,
     "summary_statement": 10,
     "measurable_results": 15,
     "word_choice": 10,
     "formatting": 10,
     "optimal_length": 10,
     "contact_information": 10,
     "comprehensiveness": 10
   }
   ```

## Usage

Run the application from the command line with the following arguments:

```bash
python resume_scorer.py /path/to/your/resume.pdf "Software Engineer"
```

### Supported File Formats:

- PDF (.pdf)
- DOCX (.docx)
- TXT (.txt)

### Output

The application will output a table to the console with a breakdown of the resume's score. It will also save a JSON file with the full results.
