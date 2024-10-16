export interface Tutorial {
    id: string;
    title: string;
    content: string;
    section: 'cpp' | 'unreal';
    type: 'code' | 'iframe';
    iframeSrc?: string;
}

const tutorials: Tutorial[] = [
    {
        id: 'cpp-hello-world',
        title: 'Hello World in C++',
        content: 
`#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
        section: 'cpp',
        type: 'code',
    },
    //copy and paste this for more tutorials
    {
        id: 'unreal-blueprint-example',
        title: 'Blueprint Example',
        content: '',
        section: 'unreal',
        type: 'iframe',
        iframeSrc: 'https://blueprintue.com/render/264_j483/',
    },
    // Add more tutorials here
];

export default tutorials;
