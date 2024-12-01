import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';

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
      currentTask = { title: trimmedLine.replace(/\*/g, '').slice(1).trim(), completed: false };
    }
  });

  if (currentTask) {
    tasks.push(currentTask);
  }

  return tasks;
};

const ToDoList = ({ tasks, setTasks, onAllTasksCompleted, clearTasks }) => {
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskChange = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    if (updatedTasks.every((task) => task.completed)) {
      onAllTasksCompleted();
    }
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', padding: 2, position: 'relative' }}>
      <img
        src="assets/working.png"
        alt="Motivational Banner"
        style={{
          marginBottom: '20px',
          width: '300px',
          height: '300px',
          display: 'flex',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '50px' }}>
        {tasks.map((task, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={task.completed}
                onChange={() => handleTaskChange(index)}
              />
            }
            label={task.title}
          />
        ))}
      </Box>
      <Button
        variant="contained"
        color="error"
        sx={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
        onClick={clearTasks}
      >
        Clear All
      </Button>
    </Paper>
  );
};

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = JSON.parse(localStorage.getItem('todoList'));
    return savedTasks || [];
  });
  const [showLoading, setShowLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const handleClick = async () => {
    setShowLoading(true);

    const prompt =
      'Generate a to-do list, which only contains top 3 priority tasks, based on the below browser history, response only in bullet points. \n';
    try {
      const params = {
        systemPrompt: 'You are a helpful and friendly assistant.',
        temperature: 1,
        topK: 8,
      };
      console.log('Params:', params);
      const response = await runPrompt(prompt, params);
      const parsedTasks = parseLLMResponse(response);
      setTasks(parsedTasks);
      localStorage.setItem('todoList', JSON.stringify(parsedTasks));
      console.log('Response:', response);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setShowLoading(false);
    }
  };

  const handleMidnightCheck = () => {
    const now = new Date();
    const lastClear = localStorage.getItem('lastClear');
    if (!lastClear || new Date(lastClear).getDate() !== now.getDate()) {
      localStorage.removeItem('todoList');
      localStorage.setItem('lastClear', now.toISOString());
      setTasks([]);
    }
  };

  const handleAllTasksCompleted = () => {
    setShowCongrats(true);
    setTimeout(() => setShowCongrats(false), 5000); // Hide effect after 5 seconds
  };

  const clearTasks = () => {
    localStorage.removeItem('todoList');
    setTasks([]);
  };

  useEffect(() => {
    handleMidnightCheck();
  }, []);

  return (
    <React.Fragment>
      {showLoading && (
        <Box
          sx={{
            height: '500px',
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

      {showCongrats && (
        <Alert severity="success">
          🎉 Congratulations! All tasks are completed! 🎉
        </Alert>
      )}

      <CssBaseline />

      <Container maxWidth="sm">
        <Box
          sx={{
            height: 'fit-content',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {tasks.length > 0 ? (
            <ToDoList
              tasks={tasks}
              setTasks={setTasks}
              onAllTasksCompleted={handleAllTasksCompleted}
              clearTasks={clearTasks}
            />
          ) : !showLoading && (
            <Box sx={{ '& button': { m: 1 } }}>
              <img
                src="assets/hello.png"
                alt="Motivational Banner"
                style={{
                  marginBottom: '20px',
                  width: '300px',
                  height: '300px',
                  display: 'flex',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
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
