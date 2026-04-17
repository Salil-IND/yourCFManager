import {useState, useEffect} from 'react';
import api from '../services/api.js';

function useProblems(){
    const [problems, setProblems] = useState(null)
    useEffect(()=>{
        api.get("problemset.problems")
        .then(response=> setProblems(response.data))
        .catch(error => console.error(error))
    }, [])

    return problems;
}

export default useProblems;

