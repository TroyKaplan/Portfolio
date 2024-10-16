import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tutorial } from '../data/tutorials';

interface TutorialItemProps {
    tutorial: Tutorial;
}

const TutorialItem: React.FC<TutorialItemProps> = ({ tutorial }) => {
    return (
        <div className="tutorial-item">
            <h3>{tutorial.title}</h3>
            {tutorial.type === 'code' && (
                <SyntaxHighlighter language="cpp" style={materialLight}>
                    {tutorial.content}
                </SyntaxHighlighter>
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
