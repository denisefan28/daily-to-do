import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

let session;

async function initDefaults() {
  if (!('aiOriginTrial' in chrome)) {
    console.error('Error: chrome.aiOriginTrial not supported in this browser');
    return;
  }
  const defaults = await chrome.aiOriginTrial.languageModel.capabilities();
  console.log('Model default:', defaults);
  if (defaults.available !== 'readily') {
    console.error(
      `Model not yet available (current state: "${defaults.available}")`
    );
    return;
  }
}

async function runPrompt(prompt, params) {
  try {
    if (!session) {
      console.log('Creating session');
      session = await chrome.aiOriginTrial.languageModel.create(params);
    }

    const typedUrlDiv = document.getElementById('history-data');
    if (!typedUrlDiv) {
      throw new Error('#history-data element not found');
    }

    const urls = Array.from(typedUrlDiv.querySelectorAll('li')).map((li) =>
      li.textContent.trim()
    );
    console.log('URLs:', urls);

    return session.prompt(prompt + urls.join('\n'));
  } catch (e) {
    console.error('Prompt failed:', e);
    reset();
    throw e;
  }
}

async function reset() {
  if (session) {
    session.destroy();
  }
  session = null;
}

initDefaults();

const parseLLMResponse = (response) => {
  const tasks = [];
  const lines = response.split('\n');
  let currentTask = null;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('*')) {
      if (currentTask) {
        tasks.push(currentTask);
      }
      currentTask = { title: trimmedLine.slice(1).trim(), subtasks: [] };
    } else if (trimmedLine) {
      if (currentTask) {
        currentTask.subtasks.push(trimmedLine.trim());
      }
    }
  });

  if (currentTask) {
    tasks.push(currentTask);
  }

  return tasks;
};

const ToDoList = ({ llmResponse }) => {
  const tasks = parseLLMResponse(llmResponse);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 2 }}>
      {tasks.map((task, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={<Checkbox />}
            label={<strong>{task.title}</strong>}
          />
          {task.subtasks.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 3 }}>
              {task.subtasks.map((subtask, subIndex) => (
                <FormControlLabel
                  key={subIndex}
                  control={<Checkbox />}
                  label={subtask}
                />
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

const App = () => {
  const [showTodo, setShowTodo] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [llmResponse, setLlmResponse] = useState('');
  const [showButton, setShowButton] = useState(true);

  const handleClick = async () => {
    setShowLoading(true);
    setShowButton(false);

    const prompt =
      'Generate a to-do list with top priority tasks based on the below browser history, response only in bullet points. \n';
    try {
      const params = {
        systemPrompt: 'You are a helpful and friendly assistant.',
        temperature: 1,
        topK: 8,
      };
      const response = await runPrompt(prompt, params);
      setLlmResponse(response);
      setShowTodo(true);
      console.log('Response:', response);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <React.Fragment>
      {showLoading && (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack spacing={2} direction="row" alignItems="center">
            <CircularProgress size={40} />
          </Stack>
        </Box>
      )}

      <CssBaseline />

      <Container maxWidth="sm">
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {showTodo && <ToDoList llmResponse={llmResponse} />}
          {showButton && (
            <Box sx={{ '& button': { m: 1 } }}>
              <Button variant="contained" size="large" onClick={handleClick}>
                Start your journey today!
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default App;
