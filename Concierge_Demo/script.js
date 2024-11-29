// Variables to store user inputs
let userExperience = null;
let userAgeGroup = null;
let userInterests = [];
let userTimeSlot = [];

// Handle the first question
function handleExperience(response) {
    userExperience = response;

    // Hide step 1 and show step 2
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}

// Handle the age group selection
function handleAgeGroup(ageGroup) {
    userAgeGroup = ageGroup;

    // Hide step 2 and show step 3
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
}

// Handle interests selection
function handleInterests() {
    const checkboxes = document.querySelectorAll('.interests:checked');
    userInterests = Array.from(checkboxes).map(checkbox => checkbox.value);

    // Hide step 3 and show step 4
    document.getElementById('step-3').classList.add('hidden');
    document.getElementById('step-4').classList.remove('hidden');
}

// Handle time slot selection
function handleTimeSlot() {
    const checkboxes = document.querySelectorAll('.time-slot:checked');
    userTimeSlot = Array.from(checkboxes).map(checkbox => checkbox.value);

    // Hide step 4 and show result
    document.getElementById('step-4').classList.add('hidden');
    document.getElementById('result').classList.remove('hidden');

    // Generate a personalized message
    const message = generateMessage();
    document.getElementById('output-message').innerText = message;
}

// Generate a personalized message based on user inputs
function generateMessage() {
    const interests = userInterests.join(', ') || 'no specific interests';
    const timeSlot = userTimeSlot.join(', ') || 'no specific time slot';

    return `Hello! 
    You have ${userExperience === 'yes' ? 'visited us before' : 'not visited us before'}. 
    As a ${userAgeGroup}, your interests include: ${interests}, and you prefer the following time slots: ${timeSlot}. 
    We hope you have a great experience!`;
}

// Back Navigation Functions
function goBackToExperience() {
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
}
function goBackToAgeGroup() {
    document.getElementById('step-3').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
}
function goBackToInterests() {
    document.getElementById('step-4').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
}

// Restart the process
function restart() {
    // Reset variables
    userExperience = null;
    userAgeGroup = null;
    userInterests = [];
    userTimeSlot = [];

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Hide all steps and show step 1
    document.getElementById('result').classList.add('hidden');
    document.getElementById('step-4').classList.add('hidden');
    document.getElementById('step-3').classList.add('hidden');
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
}