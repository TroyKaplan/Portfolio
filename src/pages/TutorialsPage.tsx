import React from 'react';
import './TutorialsPage.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import tutorials from '../data/tutorials';

const TutorialsPage: React.FC = () => {
    const cppTutorials = tutorials.filter(tutorial => tutorial.section === 'cpp');
    const unrealTutorials = tutorials.filter(tutorial => tutorial.section === 'unreal');

    return (
        <div className="tutorials-page">
            <h1 className="page-title">Tutorials</h1>
            <section className="tutorial-section">
                <h2>C++ Tutorials</h2>
                {cppTutorials.map(tutorial => (
                    <div key={tutorial.id} className="tutorial-item">
                        <h3>{tutorial.title}</h3>
                        <SyntaxHighlighter language="cpp" style={materialLight}>
                            {tutorial.content}
                        </SyntaxHighlighter>
                    </div>
                ))}
            </section>
            <section className="tutorial-section">
                <h2>Unreal Engine Tutorials</h2>
                {unrealTutorials.map(tutorial => (
                    <div key={tutorial.id} className="tutorial-item">
                        <h3>{tutorial.title}</h3>
                        {tutorial.type === 'code' && (
                            <SyntaxHighlighter language="cpp" style={materialLight}>
                                {tutorial.content}
                            </SyntaxHighlighter>
                        )}
                        {tutorial.type === 'iframe' && (
                            <iframe
                                src={tutorial.iframeSrc}
                                scrolling="no"
                                allowFullScreen
                                title={tutorial.title}
                            ></iframe>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
};

export default TutorialsPage;
