import React, { useState } from 'react';
import timeComplexities from '../time_complexities.json';

const applyEquationClass = (text, force) => {
    const regex = /\$(.*?)\$/g;
    return text.split(regex).map((part, index) => 
        index % 2 === 1 || force ? <span key={index} className="equation">{part}</span> : part
    );
};

const renderRows = (data) => {
	if (!data) {
		return null;
	}
    return Object.keys(data).map((operation) => {
        const operationData = data[operation];
        return (
            <ul key={operation}>  
				<h4>{data[operation].name}</h4>
				<table>
					<tbody>
						{
							Object.keys(operationData).map((complexity) => {
								if (complexity === 'name') return null;
								return (
									<tr key={complexity}>
										<td>{complexity[0].toUpperCase() + complexity.slice(1)}</td>
                                        <ToggleBlurCell text={operationData[complexity].big_o} />
										<td>{applyEquationClass(operationData[complexity].explanation)}</td>
									</tr>
								)
							})
						}
					</tbody>
				</table>
            </ul>
        );
    });
};

const ToggleBlurCell = ({ text }) => {
    const [isBlurred, setIsBlurred] = useState(true);

    const handleMouseEnter = () => {
        setIsBlurred(false);
    };

    return (
        <td 
            className={isBlurred ? 'blur' : ''} 
            onMouseEnter={handleMouseEnter}
        >
            {applyEquationClass(text, true)}
        </td>
    );
};


const Modals = (page) => {
    return renderRows(timeComplexities[page]);
};

export default Modals;
