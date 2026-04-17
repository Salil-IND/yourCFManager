import {useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import useProblems from 'C:/Salil_ProjectsAndHackathons/yourCFManager/src/hooks/useProblems.js'

function App(){
    const data = useProblems();

    console.log(data)
    return (
        <div>

            <BrowserRouter>
                    
                <Routes>
                    
                </Routes>
            </BrowserRouter>

        </div>
    )
}

export default App;