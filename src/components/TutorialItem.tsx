import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Tutorial } from '../data/tutorials';
import './TutorialItem.css';

interface TutorialItemProps {
    tutorial: Tutorial;
}

const TutorialItem: React.FC<TutorialItemProps> = ({ tutorial }) => {
    const [code, setCode] = useState(tutorial.content);
    const [output, setOutput] = useState('');

    const runCode = async () => {
        try {
            const response = await axios.post('http://localhost:5000/run-code', { code });
            setOutput(response.data.output);
        } catch (error) {
            setOutput('Error executing code.');
        }
    };

    return (
        <div className="tutorial-item">
            <h3>{tutorial.title}</h3>
            {tutorial.type === 'code' && tutorial.section === 'cpp' && (
                <>
                    <Editor
                        height="400px"
                        defaultLanguage="cpp"
                        theme="vs-dark" // Black background for the editor
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                        }}
                    />
                    <button onClick={runCode}>Run</button>
                    <pre className="output-box">{output}</pre>
                </>
            )}
            {tutorial.type === 'code' && tutorial.section !== 'cpp' && (
                // Handle other code types if needed
                <pre>{tutorial.content}</pre>
            )}
            {tutorial.type === 'iframe' && tutorial.iframeSrc && (
                <iframe
                    src={tutorial.iframeSrc}
                    scrolling="no"
                    allowFullScreen
                    title={tutorial.title}
                ></iframe>
            )}
        </div>
    );
};

export default TutorialItem;
