import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { Send } from '@mui/icons-material';
import { BASE_URL } from '../config/Constants'; 
const ChatContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '20px',
  width: '600px',
  height: 'calc(100vh - 200px)', // Adjusted height to fit within the viewport minus heading and padding
  margin: '0 auto',
  border: '1px solid #ddd',
  position: 'relative',
  overflow: 'hidden', // Ensure the container does not overflow
});

const MessageContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: '10px',
});

const Message = styled(Paper)(({ theme, isQuestion }) => ({
  padding: '10px',
  backgroundColor: isQuestion ? 'white' : 'rgba(0, 128, 0, 0.3)',
  color: isQuestion ? 'black' : 'black',
  alignSelf: isQuestion ? 'flex-end' : 'flex-start',
  maxWidth: '80%',
  whiteSpace: 'pre-line', // Preserve whitespace and handle newlines
}));

const MessagesWrapper = styled(Box)({
  width: '100%',
  overflowY: 'auto',
  flexGrow: 1,
  paddingBottom: '70px',
});

const Header = styled(Typography)({
  position: 'fixed',
  top: '20px',
  backgroundColor: 'white',
});

const initialGreeting = "Hi, hope you’re having a good day, how can I assist you today?";

function Chat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [userBotName,setUserBotName] = useState("")
  const defaultBotName = "ZenAssist";
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    const savedBotName = localStorage.getItem("botName");
    if (savedBotName) setUserBotName(savedBotName);
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      if (parsedMessages.length > 0) {
        setMessages(parsedMessages);
      } else {
        setMessages([{ text: initialGreeting, isQuestion: false }]);
      }
    } else {
      setMessages([{ text: initialGreeting, isQuestion: false }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // const handleSendMessage = async () => {
  //   if (!question.trim()) return;

  //   const lowerCaseQuestion = question.toLowerCase();
  //   const greetingPhrases = ['hi', 'hi there', 'hello', 'hello there'];

  //   if (greetingPhrases.includes(lowerCaseQuestion)) {
  //     setMessages([...messages, { text: question, isQuestion: true }, { text: initialGreeting, isQuestion: false }]);
  //     setQuestion('');
  //     return;
  //   }

  //   setMessages([...messages, { text: question, isQuestion: true }]);

  //   try {
  //     const response = await fetch('http://localhost:5000/ask', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ question }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       const answerLower = data.answer.toLowerCase();
  //       const supportPhrases = [
  //         "i don't know",
  //         "i do not know",
  //         "i'm not sure",
  //         "cannot answer",
  //         "can't answer",
  //         "don't have the information",
  //         "do not have the information",
  //       ];

  //       const needsSupport = supportPhrases.some((phrase) => answerLower.includes(phrase));

  //       const answerText = needsSupport
  //         ? `${data.answer}\n\nFor further assistance, please call our customer support at 1-800-123-4567.`
  //         : data.answer;

  //       setMessages((prevMessages) => [
  //         ...prevMessages,
  //         { text: answerText, isQuestion: false },
  //       ]);
  //     } else {
  //       setMessages((prevMessages) => [
  //         ...prevMessages,
  //         { text: `Error: ${data.error}`, isQuestion: false },
  //       ]);
  //     }
  //   } catch (error) {
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { text: `Error: ${error.message}`, isQuestion: false },
  //     ]);
  //   } finally {
  //     setQuestion('');
  //   }
  // };


  const handleSendMessage = async () => {
    if (!question.trim()) return;
  
    const lowerCaseQuestion = question.toLowerCase();
    const greetingPhrases = ['hi', 'hi there', 'hello', 'hello there'];
  
    if (greetingPhrases.includes(lowerCaseQuestion)) {
      setMessages([...messages, { text: question, isQuestion: true }, { text: initialGreeting, isQuestion: false }]);
      setQuestion('');
      return;
    }
  
    setMessages([...messages, { text: question, isQuestion: true }]);
  
    try {
      const previousMessages = messages.slice(-6).map((msg) => ({
        text: msg.text,
        isQuestion: msg.isQuestion,
      }));
  
      const response = await fetch(`${BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, context: previousMessages }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const answerLower = data.answer.toLowerCase();
        const supportPhrases = [
          "i don't know",
          "i do not know",
          "i'm not sure",
          "cannot answer",
          "can't answer",
          "don't have the information",
          "do not have the information",
        ];
  
        const needsSupport = supportPhrases.some((phrase) => answerLower.includes(phrase));
  
        const answerText = needsSupport
          ? `${data.answer}\n\nFor further assistance, please call our customer support at 1-800-123-4567.`
          : data.answer;
  
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: answerText, isQuestion: false },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `Error: ${data.error}`, isQuestion: false },
        ]);
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Error: ${error.message}`, isQuestion: false },
      ]);
    } finally {
      setQuestion('');
    }
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === 'Return') {
      handleSendMessage();
    }
  };

  return (
    <Box>
        {userBotName && <Header variant="h4" gutterBottom>
        Chat with {userBotName}
      </Header>}
      {!userBotName && <Header variant="h4" gutterBottom>
        Chat with {defaultBotName}
      </Header>}
      <ChatContainer>
        <MessagesWrapper>
          {messages.map((message, index) => (
            <MessageContainer key={index}>
              <Message isQuestion={message.isQuestion}>
                {message.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Message>
            </MessageContainer>
          ))}
        </MessagesWrapper>
        <Box style={{ display: 'flex', paddingTop: "10px", width: "100%" }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
          >
            <Send />
          </IconButton>
        </Box>
      </ChatContainer>
    </Box>
  );
}

export default Chat;
