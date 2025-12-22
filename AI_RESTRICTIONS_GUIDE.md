# 🔒 Diksuchi-AI Strict Content Restrictions

## Overview
Diksuchi-AI is now configured with **STRICT EDUCATIONAL-ONLY** mode. The AI will only respond to learning, coding, and project-related questions.

---

## ✅ What is ALLOWED

### 1. **Educational Topics**
- Programming and coding questions
- Project development help
- Technical concepts explanation
- Debugging and problem-solving
- Learning new technologies
- Algorithm explanations
- Code reviews and improvements
- Framework and library help (React, Node.js, Express, MongoDB, etc.)
- Project ideas and planning
- UI/UX for educational projects

### 2. **Supported Languages**
- 🇬🇧 **English**
- 🇮🇳 **తెలుగు (Telugu)**
- 🇮🇳 **हिंदी (Hindi)**

### 3. **Example Valid Questions**
```
✅ "How do I create a React component?"
✅ "Explain promises in JavaScript"
✅ "Help me debug this code error"
✅ "What is the difference between MongoDB and MySQL?"
✅ "రియాక్ట్ లో స్టేట్ ఎలా వాడాలి?" (Telugu)
✅ "JavaScript में async/await कैसे काम करता है?" (Hindi)
```

---

## 🚫 What is BLOCKED

### 1. **Inappropriate Content**
- Bad words or profanity (English, Telugu, Hindi)
- Adult content
- Violent content
- Hate speech

### 2. **Non-Educational Topics**
- Personal advice (dating, relationships)
- Medical advice
- Legal advice
- Financial investment advice
- Cryptocurrency trading
- Gambling
- Political discussions
- Religious discussions
- Personal information requests

### 3. **Unethical Requests**
- Hacking tutorials
- Piracy methods
- Illegal activities
- Scam techniques
- Fraud methods
- Weapon creation
- Drug-related content

### 4. **Example Blocked Questions**
```
🚫 "How do I hack a website?"
🚫 "Tell me about cryptocurrency investments"
🚫 "Can you help with my relationship?"
🚫 "What medicine should I take?"
🚫 "How to bypass security?"
🚫 Any message with bad words
```

---

## 🎯 AI Behavior

### When Content is Blocked
The AI will respond with:
> "I'm strictly here for educational purposes - helping you with coding, projects, and learning. I cannot assist with that topic. Let's focus on building something amazing! 🚀"

### Features
1. **Pre-validation**: All messages are checked BEFORE sending to AI
2. **Keyword Detection**: Scans for inappropriate words in all 3 languages
3. **Topic Validation**: Ensures questions are learning-related
4. **Quick Responses**: Common greetings don't cost credits
5. **Multi-language Support**: Works in English, Telugu, and Hindi

---

## 🧪 Testing the Restrictions

### Test Cases

#### ✅ Should ALLOW:
```javascript
// English
"How do I create a REST API in Node.js?"
"Explain React hooks"
"Help me fix this bug in my code"

// Telugu
"పైథాన్ ఎలా నేర్చుకోవాలి?"
"జావాస్క్రిప్ట్ లో ఫంక్షన్స్ ఏమిటి?"

// Hindi
"React में state कैसे manage करें?"
"Python में loops कैसे काम करते हैं?"
```

#### 🚫 Should BLOCK:
```javascript
// Inappropriate language
"[any bad words]"

// Non-educational
"How do I find a girlfriend?"
"Tell me about Bitcoin investment"
"Can you help with legal advice?"
"I need medical advice"

// Unethical
"How to hack a website?"
"How to pirate software?"
"Tell me about illegal activities"
```

---

## 📊 Credit System

- **Quick Responses** (greetings, thanks): FREE (no credits)
- **Short Messages** (< 500 chars): 0.5 credits
- **Long Messages** (≥ 500 chars): 1 credit
- **Coding Mode**: Always 1 credit
- **Blocked Messages**: No credits deducted

---

## 🔧 Technical Implementation

### Backend Validation
Located in: `backend/controllers/chatbotController.js`

1. **Content Filter**: Checks inappropriate words
2. **Topic Validator**: Ensures educational content
3. **Language Support**: Detects and validates 3 languages
4. **System Prompts**: Reinforces AI boundaries

### Frontend Handling
Files updated:
- `frontend/src/pages/DiksuchAI.jsx`
- `frontend/src/components/DiksuchAI.jsx`

Features:
- Shows clear error messages for blocked content
- Red toast notifications for violations
- Adds blocked messages to conversation history

---

## 📝 System Prompts

All AI modes (General, Coding, Creative) include:

```
🔒 STRICT RULES:
1. ONLY respond to learning, coding, programming, and project-related questions
2. ONLY support English, Telugu, and Hindi languages
3. REFUSE any non-educational topics
4. REFUSE inappropriate content or unethical requests
5. Redirect to educational content when needed
```

---

## 🎓 Purpose

**Diksuchi-AI is STRICTLY an EDUCATIONAL assistant** designed to:
- Help students learn programming
- Support project development
- Teach technical concepts
- Foster coding skills
- Encourage educational growth

**NOT for:**
- General conversation
- Personal advice
- Non-learning topics
- Inappropriate content

---

## 🚀 Deployment Notes

1. All validations happen server-side (secure)
2. Content filtering is language-aware
3. AI system prompts enforce boundaries
4. Frontend provides clear user feedback
5. No credits wasted on blocked content

---

**Remember**: The AI is a learning tool, not a general chatbot. Keep it focused on education! 🎓
