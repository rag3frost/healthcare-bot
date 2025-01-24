# Medical Report Analyzer Chatbot - HealthHype

A React-based healthcare assistant / medical report analysis chatbot powered by Google's Gemini AI. This application can process medical reports through OCR, analyze lab results, and provide detailed explanations in simple language.

![Medical Report Analyzer Demo](https://github.com/rag3frost/blank-app/blob/main/2025-01-24-22-40-17.gif)  
![Medical Report Analyzer Demo](https://github.com/rag3frost/blank-app/blob/main/2025-01-24-22-36-24.gif)
## Features

- 🏥 Medical report analysis with detailed explanations
- 📷 OCR processing of medical document images
- 🤖 Two-stage Gemini AI processing:
  1. Initial OCR text formatting and structuring
  2. Detailed medical analysis and interpretation
- 🎯 Precise numerical value comparison with reference ranges
- 🗣️ Voice input support
- 💬 Interactive chat interface
- ✨ Markdown support for formatted responses

### Unique OCR-to-Analysis Pipeline

This chatbot features a sophisticated document processing pipeline:

1. When you upload a medical document image, it first goes through OCR processing
2. The raw OCR text is automatically sent to Gemini AI for initial formatting and structuring
3. The formatted text appears in the text area for your review
4. You can then send this pre-processed text for final analysis, or modify it if needed
5. The entire process happens in the background, providing a seamless experience

## Technologies Used

- React.js
- Google Gemini AI API
- Tesseract.js for OCR
- React Markdown
- React Icons

## Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or higher)
- npm or yarn
- A Google Gemini API key

## Installation

1. Clone the repository:
bash
git clone https://github.com/rag3frost/medical-report-analyzer.git
cd medical-report-analyzer

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Usage

1. **Upload a Medical Report**
   - Click the image icon in the input area
   - Select a medical report image (supported formats: jpg, png, etc.)
   - Wait for OCR processing and initial AI formatting

2. **Review and Edit**
   - The processed text will appear in the input area
   - Review and edit if necessary
   - Press Enter or click the send button for detailed analysis

3. **Voice Input**
   - Click the microphone icon for voice input
   - Speak your question or description
   - The text will appear in the input area

4. **View Analysis**
   - The chatbot will provide a detailed analysis
   - Results are formatted with clear sections
   - Abnormal values are clearly highlighted
   - Medical terms are explained in simple language

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for the powerful language model
- Tesseract.js for OCR capabilities
- React and its community for the excellent framework and tools

## Contact

Project Link: [https://github.com/rag3frost/healthcare-bot](https://github.com/rag3frost/healthcare-bot)

## Support

⭐️ If you found this project helpful, please give it a star!

---

Made with ❤️ by Sujal Sakhare
