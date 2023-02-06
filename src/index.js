import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'react-hook-theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<ThemeProvider
		options={{
			theme: 'light',
			save: true,
		}}
	>
		<App />
	</ThemeProvider>,
);
