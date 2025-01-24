import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { FaMicrophone, FaPaperPlane, FaImage, FaSun, FaMoon } from 'react-icons/fa';
import Tesseract from 'tesseract.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Update the medical context for more precise range analysis
const MEDICAL_CONTEXT = `You are a precise medical assistant chatbot. Your role is to:
- Analyze medical reports and lab results with strict attention to numerical values
- Compare all numeric values against their reference ranges using exact mathematical comparison
- Flag any value that falls outside the reference range, even if it's close to the range
- For each test result, explicitly state if the value is:
  * LOWER than reference range minimum
  * HIGHER than reference range maximum
  * Within reference range (only if value falls exactly within range)
- Explain medical terms in simple language
- Provide context for test results
- Suggest relevant follow-up questions or tests when appropriate

When analyzing numeric values:
1. Always treat the reference range as a strict mathematical range
2. If a value is even slightly below the minimum range, mark it as LOW
3. If a value is even slightly above the maximum range, mark it as HIGH
4. Only declare a value as "normal" if it falls within the inclusive range

Example format for each test:
Test Name: [value] [units]
Reference Range: [min] - [max] [units]
Status: LOW/HIGH/NORMAL (based on strict mathematical comparison)
Interpretation: [explanation]

Important notes:
1. Always remind users that you are an AI and cannot provide medical diagnosis
2. Be extremely precise about abnormal values - never round or approximate when comparing to ranges
3. Use clear, simple language to explain medical terms
4. Format the response with clear sections and bullet points for readability
5. If unsure about a comparison, flag it for human verification`;

// Add this SVG logo component at the top of your file, after the imports
const BotLogo = () => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 40 40" 
    className="mr-3"
  >
    <circle cx="20" cy="20" r="18" fill="#8B5CF6" />
    <path
      d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10ZM24 21H21V24C21 24.552 20.552 25 20 25C19.448 25 19 24.552 19 24V21H16C15.448 21 15 20.552 15 20C15 19.448 15.448 19 16 19H19V16C19 15.448 19.448 15 20 15C20.552 15 21 15.448 21 16V19H24C24.552 19 25 19.448 25 20C25 20.552 24.552 21 24 21Z"
      fill="white"
    />
  </svg>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  // Update dark mode in localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Voice input handling
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chat = textModel.startChat({
        history: [
          {
            role: "user",
            parts: MEDICAL_CONTEXT,
          },
          {
            role: "model",
            parts: "I understand my role. I will analyze the medical information carefully and provide clear explanations.",
          }
        ],
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      const botResponse = {
        role: 'bot',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'I apologize, but I encountered an error analyzing the results. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the processImageWithOCR function to return raw text
  const processImageWithOCR = async (file) => {
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setMessages(prev => prev.map((msg, i) => 
              i === prev.length - 1 ? 
              {...msg, content: `Processing: ${Math.round(m.progress * 100)}%`} : 
              msg
            ));
          }
        }
      });

      return result.data.text;
    } catch (error) {
      throw new Error('Failed to extract text from image: ' + error.message);
    }
  };

  // Update the preProcessWithGemini function with more explicit comparison logic
  const preProcessWithGemini = async (text) => {
    try {
      const chat = textModel.startChat({
        history: [
          {
            role: "user",
            parts: `You are a medical document processor with strict mathematical comparison abilities. Process this raw OCR text following these exact rules:

1. Extract all numeric values and their reference ranges exactly as shown
2. Maintain precise decimal places and units
3. For each test value, compare it mathematically with its reference range:
   - If value >= minimum AND value <= maximum → Status: NORMAL
   - If value < minimum → Status: LOWER
   - If value > maximum → Status: HIGHER

Example comparisons:
- Value: 90, Range: 60-100 → NORMAL (because 90 >= 60 AND 90 <= 100)
- Value: 73, Range: 100-150 → LOWER (because 73 < 100)
- Value: 160, Range: 100-150 → HIGHER (because 160 > 150)

Format the output as:

# Medical Report

## Test Results
[Test Name]:
    - Value: [Exact numeric value] [units]
    - Reference Range: [min] - [max] [units]
    - Status: [NORMAL/LOWER/HIGHER] (based on above mathematical rules)

Here's the raw OCR text to process:

${text}`,
          },
        ],
      });

      const result = await chat.sendMessage(`Process this medical text using strict mathematical comparison:
- NORMAL: value is within range (inclusive)
- LOWER: value is less than minimum
- HIGHER: value is greater than maximum
Preserve all exact numbers and units.`);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in Gemini pre-processing:', error);
      throw error;
    }
  };

  // Update the handleImageInput function
  const handleImageInput = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file.');
      }

      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Processing medical document...',
        timestamp: new Date()
      }]);

      // Get raw OCR text
      const extractedText = await processImageWithOCR(file);
      console.log('Raw OCR Text:', extractedText);
      
      // Send directly to Gemini for processing
      const formattedText = await preProcessWithGemini(extractedText);
      console.log('Gemini Formatted Text:', formattedText);
      
      // Set the formatted text in the textarea
      setInput(formattedText);
      
      // Update status message
      setMessages(prev => [...prev.slice(0, -1), {
        role: 'system',
        content: 'Document processed and formatted. You can review and edit the text before sending for analysis.',
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error processing document:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${error.message} Please try again with a clearer image.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="chat-container">
        <header className="text-center py-4 relative flex items-center justify-between px-6">
          <div className="flex items-center">
            <BotLogo />
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                HealthHype
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                YOUR HEALTH, SIMPLIFIED.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <FaSun className="w-5 h-5 text-yellow-400" /> : <FaMoon className="w-5 h-5 text-gray-600" />}
          </button>
        </header>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === 'user' 
                  ? 'user-message dark:bg-purple-900 dark:text-white' 
                  : 'bot-message dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {message.role === 'bot' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
          ))}
          {isLoading && (
            <div className="loading-dots dark:bg-gray-800">
              <div className="dot dark:bg-purple-400"></div>
              <div className="dot dark:bg-purple-400"></div>
              <div className="dot dark:bg-purple-400"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container dark:bg-gray-900/95">
          <div className="relative max-w-3xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="chat-input dark:bg-gray-800 dark:text-white dark:border-gray-700"
              rows="1"
            />
            <div className="action-buttons">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="action-button dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                title="Upload Image"
              >
                <FaImage className="w-4 h-4" />
              </button>
              <button
                onClick={handleVoiceInput}
                className={`action-button dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${
                  isListening ? 'text-purple-500 dark:text-purple-400' : ''
                }`}
                title="Voice Input"
              >
                <FaMicrophone className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                className="action-button send-button dark:bg-purple-600 dark:hover:bg-purple-700"
                disabled={!input.trim() || isLoading}
              >
                <FaPaperPlane className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageInput}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
