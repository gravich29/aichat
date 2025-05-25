document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  const character = document.getElementById('character-select').value;
  const prompt = `Imagine you are a ${character}. ${userInput}`;
  const response = await fetchChatGPTResponse(prompt);
  displayMessage(response);
  document.getElementById('user-input').value = ''; // Clear input
});

document.getElementById('new-chat-btn').addEventListener('click', () => {
  document.getElementById('messages').innerHTML = ''; // Clear chat
});

async function fetchChatGPTResponse(prompt) {
  const API_KEY = 'sk-a4d48058a9164094b04c1475120f6de7';
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
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    return "Произошла ошибка при запросе";
  }
}

function displayMessage(message) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to latest message
}