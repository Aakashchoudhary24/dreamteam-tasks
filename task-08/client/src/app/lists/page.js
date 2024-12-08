'use client';

import '../styles/forms.css';
import '../globals.css';
import Navbar from '../components/navbar';

export default function ListPage(){
    return(
        <div className='main'>
            <Navbar/>
            <div className='list-page'></div>
        </div>
    )
}