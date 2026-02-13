// script.js
document.addEventListener('DOMContentLoaded', (event) => {
    // Display a greeting
    const greeting = document.createElement('h1');
    greeting.textContent = 'Welcome to the Agient WOW Demo!';
    document.body.appendChild(greeting);
    
    // Log current date and time
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`Current Date and Time (UTC): ${currentDateTime}`);
    
    // Add a button to refresh the date and time on the page
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Date and Time';
    document.body.appendChild(refreshButton);
    
    refreshButton.addEventListener('click', () => {
        alert(`Current Date and Time (UTC): ${currentDateTime}`);
    });
});
