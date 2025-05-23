document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  const response = await fetchChatGPTResponse(userInput);
  displayMessage(response);
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
        messages: [{role: "user", content: prompt}]
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
}

async function handleStreamingResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while(true) {
    const { done, value } = await reader.read();
    if(done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for(const line of lines) {
      const message = line.replace(/^data: /, '');
      if(message === '[DONE]') return;
      
      try {
        const parsed = JSON.parse(message);
        const content = parsed.choices[0].delta.content;
        if(content) {
          result += content;
          updateLastMessage(result);
        }
      } catch(e) {
        console.error('Parsing error:', e);
      }
    }
  }
}