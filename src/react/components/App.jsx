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
import TextField from '@mui/material/TextField';

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
  const [newTask, setNewTask] = useState('');

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

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { title: newTask.trim(), completed: false }]);
      setNewTask('');
    }
  };

  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    //if updatedTask is empty, clear all tasks
    if (updatedTasks.length === 0) {
      clearTasks();
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {tasks.map((task, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleTaskChange(index)}
                  sx={{ alignSelf: 'flex-start' }}
                />
              }
              label={task.title}
            />
            <Button
              variant="text"
              color="error"
              size="small"
              sx={{ marginLeft: '10px' }}
              onClick={() => deleteTask(index)}
            >
              Delete
            </Button>
          </Box>
        ))}

        <Button
          variant="text"
          color="error"
          size="small"
          sx={{
            marginTop: '10px',
            alignSelf: 'flex-end',
          }}
          onClick={clearTasks}
        >
          Clear
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <TextField
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          label="New Task"
          variant="standard"
          fullWidth
        />
        <Button onClick={addTask} variant="text" sx={{ marginLeft: 1 }}>
          Add
        </Button>
      </Box>
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
      {showCongrats && (
        <Alert severity="success" sx={{ marginTop: 2 }}>
          🎉 Congratulations! All tasks are completed!
        </Alert>
      )}
    </React.Fragment>
  );
};

export default App;
