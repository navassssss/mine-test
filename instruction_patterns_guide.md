# Instruction Patterns & Formatting Guide

This guide shows all the ways you can instruct me to format responses, adjust tone, or adopt a persona.

---

## 1. Output Formats

| Format | Example Instruction | Sample Output Style |
|--------|---------------------|---------------------|
| JSON | `FORMAT: json` | `{ "key": "value" }` |
| Markdown | `FORMAT: markdown` | `# Heading`, `**bold**` |
| HTML | `FORMAT: html` | `<h1>Heading</h1>` |
| CSV | `FORMAT: csv` | `name,age
John,30` |
| XML | `FORMAT: xml` | `<root><item/></root>` |
| YAML | `FORMAT: yaml` | `key: value` |
| Plain Text | `FORMAT: plain_text` | No formatting at all |
| LaTeX | `FORMAT: latex` | `\section{Heading}` |
| Code Block | `FORMAT: code_block` | Triple backticks with language |
| Table | `FORMAT: table` | Markdown table |

---

## 2. Instruction Patterns

### 2.1 Inline Prefix
Place the format before the question.

```
FORMAT: json
Question: What is the capital of France?
```

**Example Output:**
```json
{
  "capital": "Paris"
}
```

---

### 2.2 Delimiter Style
Wrap the format in brackets or tags.

```
[FORMAT: markdown]
Explain quantum computing.
```

**Example Output:**
```markdown
# Quantum Computing

Quantum computing uses **qubits** instead of classical bits...
```

---

### 2.3 Suffix Style
Place the format after the question.

```
Who won the 2022 FIFA World Cup? | OUTPUT AS: json
```

**Example Output:**
```json
{
  "winner": "Argentina",
  "year": 2022
}
```

---

### 2.4 Block Style
Use a YAML-like frontmatter block.

```
---
format: csv
---
List the top 3 programming languages in 2024.
```

**Example Output:**
```csv
rank,language,popularity
1,Python,28%
2,JavaScript,20%
3,Java,16%
```

---

### 2.5 Tag Style
Use XML/HTML-like tags.

```
<format>html</format>
Create a simple about page.
```

**Example Output:**
```html
<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body>
  <h1>About Us</h1>
  <p>We build amazing things.</p>
</body>
</html>
```

---

### 2.6 Role + Format
Combine a persona with a format.

```
ROLE: Senior Python Developer | FORMAT: code_block
Write a function to reverse a string.
```

**Example Output:**
```python
def reverse_string(s: str) -> str:
    """Return the reverse of a string."""
    return s[::-1]
```

---

## 3. Other Instruction Types

### 3.1 Tone
Adjust the tone of the response.

| Tone | Example | Description |
|------|---------|-------------|
| Formal | `TONE: formal` | Professional, polite, structured |
| Casual | `TONE: casual` | Friendly, conversational |
| Technical | `TONE: technical` | Jargon-heavy, precise |
| Concise | `TONE: concise` | Short, to the point |
| Detailed | `TONE: detailed` | In-depth, comprehensive |

**Example:**
```
TONE: casual
Tell me about black holes.
```

**Example Output:**
> Hey! So black holes are basically these crazy dense spots in space where gravity is so strong that not even light can escape. Pretty wild, right?

---

### 3.2 Audience
Tailor the response to a specific audience.

| Audience | Example | Description |
|----------|---------|-------------|
| Beginner | `AUDIENCE: beginner` | Simple terms, foundational concepts |
| Expert | `AUDIENCE: expert` | Advanced, assumes prior knowledge |
| Child | `AUDIENCE: child` | Simple language, analogies |
| Executive | `AUDIENCE: executive` | High-level, business-focused |

**Example:**
```
AUDIENCE: child
What is photosynthesis?
```

**Example Output:**
> Imagine plants are like little chefs. They take sunlight, water from the ground, and air, and mix them together to make their own food! This is called photosynthesis.

---

### 3.3 Constraints
Add specific constraints to the response.

| Constraint | Example | Description |
|------------|---------|-------------|
| Word limit | `MAX_WORDS: 50` | Response must be under 50 words |
| No emojis | `NO_EMOJIS: true` | No emoji characters |
| Bullet only | `BULLETS_ONLY: true` | Only bullet points |
| No code | `NO_CODE: true` | Exclude code examples |
| Single paragraph | `SINGLE_PARAGRAPH: true` | One paragraph only |

**Example:**
```
MAX_WORDS: 30 | TONE: concise
Explain machine learning.
```

**Example Output:**
> Machine learning is a branch of AI where computers learn patterns from data to make predictions without explicit programming.

---

### 3.4 Roleplay / Persona
Adopt a specific role or character.

| Role | Example | Description |
|------|---------|-------------|
| Lawyer | `ROLE: lawyer` | Legal perspective, cautious language |
| Doctor | `ROLE: doctor` | Medical terminology, health-focused |
| Coder | `ROLE: senior software engineer` | Code-first, technical solutions |
| Teacher | `ROLE: teacher` | Educational, explanatory |
| Marketer | `ROLE: marketer` | Persuasive, benefit-focused |

**Example:**
```
ROLE: cybersecurity expert | FORMAT: markdown
How do I secure my home Wi-Fi?
```

**Example Output:**
```markdown
# Securing Your Home Wi-Fi

## 1. Change Default Credentials
- Replace the default admin username and password on your router.

## 2. Enable WPA3 Encryption
- Use WPA3 (or WPA2 if unavailable). Avoid WEP at all costs.

## 3. Disable WPS
- Wi-Fi Protected Setup is vulnerable to brute-force attacks.

## 4. Update Firmware Regularly
- Check for router firmware updates monthly.

## 5. Use a Strong Password
- Minimum 16 characters with mixed case, numbers, and symbols.
```

---

### 3.5 Language
Request the response in a specific language.

| Language | Example |
|----------|---------|
| Spanish | `LANGUAGE: Spanish` |
| Hindi | `LANGUAGE: Hindi` |
| French | `LANGUAGE: French` |
| Chinese | `LANGUAGE: Chinese` |
| Japanese | `LANGUAGE: Japanese` |

**Example:**
```
LANGUAGE: Spanish
What is the weather like today?
```

**Example Output:**
> El clima de hoy es soleado con una temperatura de 25°C.

---

### 3.6 Structure
Specify how the response should be organized.

| Structure | Example | Description |
|-----------|---------|-------------|
| Step-by-step | `STRUCTURE: step-by-step` | Numbered instructions |
| Pros/Cons | `STRUCTURE: pros_cons` | Two-column comparison |
| Compare/Contrast | `STRUCTURE: compare_contrast` | Side-by-side analysis |
| FAQ | `STRUCTURE: faq` | Question-and-answer format |
| Summary first | `STRUCTURE: summary_first` | TL;DR at the top |

**Example:**
```
STRUCTURE: pros_cons | FORMAT: table
Should I use React or Vue?
```

**Example Output:**
| Aspect | React | Vue |
|--------|-------|-----|
| **Pros** | Huge ecosystem, Facebook-backed | Gentle learning curve, great docs |
| **Cons** | Steep learning curve, boilerplate | Smaller ecosystem, fewer jobs |

---

## 4. Combining Multiple Instructions

You can combine multiple instruction types in a single message.

### Example 1
```
FORMAT: json | TONE: technical | ROLE: data scientist
Explain overfitting in machine learning.
```

**Example Output:**
```json
{
  "concept": "Overfitting",
  "definition": "A modeling error where the model learns the training data too well, including noise and outliers, resulting in poor generalization to unseen data.",
  "symptoms": [
    "High training accuracy, low validation accuracy",
    "Complex decision boundaries",
    "Sensitivity to small fluctuations in training data"
  ],
  "mitigation": [
    "Regularization (L1, L2)",
    "Cross-validation",
    "Early stopping",
    "Dropout (in neural networks)"
  ]
}
```

### Example 2
```
---
format: markdown
language: English
audience: beginner
structure: step-by-step
---
How do I bake chocolate chip cookies?
```

**Example Output:**
```markdown
# How to Bake Chocolate Chip Cookies

## Step 1: Preheat Your Oven
Set your oven to 375°F (190°C).

## Step 2: Mix Dry Ingredients
In a bowl, combine 2 1/4 cups flour, 1 tsp baking soda, and 1 tsp salt.

## Step 3: Cream Butter and Sugar
Beat 1 cup softened butter with 3/4 cup sugar and 3/4 cup brown sugar until fluffy.

## Step 4: Add Eggs and Vanilla
Mix in 2 eggs and 1 tsp vanilla extract.

## Step 5: Combine and Add Chips
Gradually add dry ingredients, then fold in 2 cups chocolate chips.

## Step 6: Bake
Drop spoonfuls onto a baking sheet and bake for 9-11 minutes.
```

### Example 3
```
[FORMAT: yaml]
[TONE: formal]
[ROLE: financial analyst]
Summarize the key risks of investing in cryptocurrency.
```

**Example Output:**
```yaml
cryptocurrency_investment_risks:
  market_volatility:
    description: Cryptocurrency prices are highly volatile and can fluctuate significantly within short timeframes.
    impact: Potential for substantial financial loss.
  regulatory_uncertainty:
    description: Governments worldwide are still developing frameworks for cryptocurrency regulation.
    impact: Sudden policy changes may adversely affect asset value or accessibility.
  security_risks:
    description: Digital assets are susceptible to hacking, phishing, and exchange failures.
    impact: Irreversible loss of funds with limited recourse.
  liquidity_risks:
    description: Some cryptocurrencies have low trading volumes.
    impact: Difficulty in executing large trades without affecting market price.
```

---

## 5. Quick Reference Cheat Sheet

| You Write | I Do |
|-----------|------|
| `FORMAT: json` | Respond in JSON |
| `TONE: casual` | Use friendly, informal language |
| `AUDIENCE: expert` | Skip basics, go deep |
| `ROLE: doctor` | Answer from a medical perspective |
| `LANGUAGE: Spanish` | Respond in Spanish |
| `MAX_WORDS: 100` | Keep it under 100 words |
| `STRUCTURE: pros_cons` | Organize as pros vs cons |
| `NO_EMOJIS: true` | No emoji characters |
| `BULLETS_ONLY: true` | Only bullet points |

---

## 6. Best Practices

1. **Be explicit**: The clearer your instruction, the better the output.
2. **Combine wisely**: You can stack instructions, but avoid conflicting ones (e.g., `TONE: concise` + `TONE: detailed`).
3. **Use delimiters consistently**: Pick one style and stick with it per conversation.
4. **Test and iterate**: If the output isn't perfect, refine your instruction.

---

*Use any combination of the above. I'm ready when you are!*
