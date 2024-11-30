import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

let session;

async function initDefaults() {
  if (!('aiOriginTrial' in chrome)) {
    showResponse('Error: chrome.aiOriginTrial not supported in this browser');
    return;
  }
  const defaults = await chrome.aiOriginTrial.languageModel.capabilities();
  console.log('Model default:', defaults);
  if (defaults.available !== 'readily') {
    showResponse(
      `Model not yet available (current state: "${defaults.available}")`
    );
    return;
  }
}

async function runPrompt(prompt, params) {
    try {
      if (!session) {
        session = await chrome.aiOriginTrial.languageModel.create(params);
      }
      return session.prompt(prompt + urlArray.join('\n')); // todo: parse urlArray from the content script
    } catch (e) {
      console.log('Prompt failed');
      console.error(e);
      console.log('Prompt:', prompt);
      // Reset session
      reset(); // todo: implement reset function
      throw e;
    }
  }

initDefaults();

const App = () => {
    const [showButton, setShowButton] = useState(true);
    const handleClick = async () => {
        setShowButton(false);
        const prompt = 'Generate a to-do list based on the below browser history, response in bullet points. \n';
        //showLoading();
        try {
            const params = {
                systemPrompt: 'You are a helpful and friendly daily task management assistant.',
                temperature: 0.7,
                topK: 50
            };
            const response = await runPrompt(prompt, params);
            console.log('Response:', response);
            // showResponse(response);
        } catch (e) {
            console.log('Error:', e);
            // showError(e);
        }
    };

    const checkboxes = ['Option 1', 'Option 2', 'Option 3'];

    return (
        <React.Fragment>
        <CssBaseline />
        <Container maxWidth="sm">
            <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {showButton ? (
                        <Box sx={{ '& button': { m: 1 } }}>
                            <Button variant="contained" size="large" onClick={handleClick}>
                                Start your journey today!
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {checkboxes.map((label, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={<Checkbox />}
                                    label={label}
                                />
                            ))}
                        </Box>
                    )}
            </Box>
        </Container>
      </React.Fragment>
    );
}

export default App;