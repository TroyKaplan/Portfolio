import React, { useState, useEffect } from 'react';
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
    const [editorHeight, setEditorHeight] = useState('400px');

    useEffect(() => {
        const lineCount = code.split('\n').length;
        const height = Math.min(Math.max(lineCount, 3), 21) * 20; // 20px per line
        setEditorHeight(`${height}px`);
    }, [code]);

    const runCode = async () => {
        try {
            const response = await axios.post('/run-code', { code });
            setOutput(response.data.output);
        } catch (error) {
            setOutput('Error executing code. From runCode function inside TutorialItem.tsx: ' + process.env.CLIENT_ID);
        }
    };

    return (
        <div className="tutorial-item">
            <h3>{tutorial.title}</h3>
            {tutorial.type === 'code' && tutorial.section === 'cpp' && (
                <>
                    <Editor
                        height={editorHeight}
                        defaultLanguage="cpp"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            scrollbar: {
                                alwaysConsumeMouseWheel: false
                            }
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
