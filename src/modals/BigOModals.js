import React, { useState } from 'react';
import timeComplexities from '../time_complexities.json';

const applyEquationClass = (text, force) => {
	const regex = /\$(.*?)\$/g;
	return text.split(regex).map((part, index) =>
		index % 2 === 1 || force ? (
			<span key={index} className="equation">
				{part}
			</span>
		) : (
			part
		),
	);
};

const renderRows = data => {
	if (!data) {
		return null;
	}
	return Object.keys(data).map(operation => {
		const operationData = data[operation];
		return (
			<ul key={operation}>
				<h4>{operation}</h4>
				<table>
					<tbody>
						{Object.keys(operationData).map(complexity => (
							<tr key={complexity}>
								<td style={{ width: '13%' }}>{complexity[0].toUpperCase() + complexity.slice(1)}</td>
								<ToggleBlurCell text={operationData[complexity].big_o} />
								<td>{applyEquationClass(operationData[complexity].explanation)}</td>
							</tr>
						))}
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
		<td style={{ width: '10%' }} className={isBlurred ? 'blur' : ''} onMouseEnter={handleMouseEnter}>
			{applyEquationClass(text, true)}
		</td>
	);
};

// Function to unblur all cells with the blur class
function unblurAll() {
    const blurredElements = document.querySelectorAll('.blur');
    blurredElements.forEach(element => {
        element.classList.remove('blur');
    });
}

const Modals = page => {
	return timeComplexities[page] ? (
		<div>
			<div class="button-container">
				<button onClick={unblurAll}>Reveal All Big-O</button>
			</div>
			{renderRows(timeComplexities[page])}
		</div>
	) : null;
};

export default Modals;
