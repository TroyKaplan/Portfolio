import React from 'react';
import '../styles/TutorialsPage.css';
import tutorials from '../data/tutorials';
import TutorialItem from '../components/TutorialItem';

const TutorialsPage: React.FC = () => {
    const cppTutorials = tutorials.filter(tutorial => tutorial.section === 'cpp');
    const unrealTutorials = tutorials.filter(tutorial => tutorial.section === 'unreal');

    return (
        <div className="tutorials-page">
            <h1 className="page-title">Tutorials</h1>
            <section className="tutorial-section">
                <h2>C++ Tutorials</h2>
                {cppTutorials.map(tutorial => (
                    <TutorialItem key={tutorial.id} tutorial={tutorial} />
                ))}
            </section>
            <section className="tutorial-section">
                <h2>Unreal Engine Tutorials</h2>
                {unrealTutorials.map(tutorial => (
                    <TutorialItem key={tutorial.id} tutorial={tutorial} />
                ))}
            </section>
        </div>
    );
};

export default TutorialsPage;

