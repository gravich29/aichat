import { saveSettings } from '../utils/storage';

document.addEventListener('DOMContentLoaded', () => {
  // Load saved character
  chrome.storage.local.get(['settings'], (result) => {
    if (result.settings && result.settings.character) {
      document.getElementById('character-select').value = result.settings.character;
    }
  });
});

document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value.trim();
  const character = document.getElementById('character-select').value;
  
  if (!userInput) {
    displayMessage('Please enter a message.', 'error');
    return;
  }

  const prompt = `Imagine you are a ${character}. ${userInput}`;
  const response = await fetchChatGPTResponse(prompt);
  displayMessage(response, character);
  document.getElementById('user-input').value = ''; // Clear input
  
  // Save selected character
  saveSettings({ character });
});

document.getElementById('new-chat-btn').addEventListener('click', () => {
  document.getElementById('messages').innerHTML = ''; // Clear chat
});

document.getElementById('character-select').addEventListener('change', () => {
  const character = document.getElementById('character-select').value;
  saveSettings({ character });
});

async function fetchChatGPTResponse(prompt) {
  const API_KEY = 'sk-a4d48058a9164094b04c1475120f6de7'; // Note: Replace with secure storage
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: true // Enable streaming
      })
    });

    if (response.status !== 200) {
      throw new Error('API request failed');
    }

    return await handleStreamingResponse(response);
  } catch (error) {
    console.error('Error:', error);
    return "Произошла ошибка при запросе";
  }
}

async function handleStreamingResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      const message = line.replace(/^data: /, '');
      if (message === '[DONE]') {
        return result;
      }

      try {
        const parsed = JSON.parse(message);
        const content = parsed.choices[0].delta.content;
        if (content) {
          result += content;
          updateLastMessage(result);
        }
      } catch (e) {
        console.error('Parsing error:', e);
      }
    }
  }
  return result;
}

function displayMessage(message, character) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'message';
  const avatar = document.createElement('div');
  avatar.className = `avatar ${character}`;
  avatar.textContent = character[0].toUpperCase(); // First letter of character
  const text = document.createElement('span');
  text.textContent = message;
  messageElement.appendChild(avatar);
  messageElement.appendChild(text);
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to latest message
}

function updateLastMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const lastMessage = messagesDiv.lastElementChild;
  if (lastMessage) {
    lastMessage.querySelector('span').textContent = message;
  }
}