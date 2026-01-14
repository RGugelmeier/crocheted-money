import { useState } from 'react';
import axios from "axios";

function Numpad({ onEnter }){
    const [value, setValue] = useState("")

    const nums = [1,2,3,4,5,6,7,8,9]

    function appendValue(num){
        // Check if there's a decimal point
        if(value.includes('.')){
            // Count digits after the decimal
            const decimalIndex = value.indexOf('.')
            const digitsAfterDecimal = value.length - decimalIndex - 1
            // Only allow if less than 2 decimal places
            if(digitsAfterDecimal < 2){
                setValue(value + num)
            }
        } else {
            // No decimal yet, so allow the number
            setValue(value + num)
        }
    }

    function appendDecimal(){
        // Only add decimal if there isn't one already
        if(!value.includes('.')){
            setValue(value + '.')
        }
    }

    function deleteLast(){
        // Remove the last character
        setValue(value.slice(0, -1))
    }

    function enter(){
        //Here we will call setTotal from App.jsx, which will cast the text value to a float and add it to the total.
        onEnter(parseFloat(value))
        setValue("")
    }

    return(
        <main>
            <div className='numpadDisplay'>
                {value}
            </div>
            <div className='numpad'>
            {nums.map(num => 
                <button key={num} onClick={() => appendValue(num.toString())}>{num}</button>
            )}
                <button onClick={() => appendValue('0')}>0</button>
                <button onClick={appendDecimal}>.</button>
                <button onClick={deleteLast}>del</button>
            </div>
            <button onClick={enter}>Enter</button> 
        </main>
        
    )
}

export default Numpad