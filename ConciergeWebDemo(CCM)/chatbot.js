class AI_Message {
    // Constructor method for initializing properties
    constructor(message, gesture) {
        this.message = message;
        this.gesture = gesture;
    }
}

var substring_1 = "prisoners of war";
var substring_2 = "liberation";
var substring_3 = "wayfinding";

let botMessages = {};   // Dictionary to store all preset bot messages
botMessages["start_msg"] = new AI_Message("Hello! Welcome to the Asian Civilisation Museum. How can I help you today?", "G05");
botMessages["greeting_msg"] = new AI_Message("Hi! Let me know if you have any questions, you can input your questions into the input box, or by using the \"Speak to AI\" button");
botMessages["pow_response"] = new AI_Message("Before the war, Changi had been a formidable military garrison, but with surrender it now became a place of isolation and numbing drudgery for thousands of new prisoners of war (POWs). The Japanese left the day-to-day running of the camps to the prisoners due to their sheer numbers, communicating instead through their officers or appointed representatives. To keep the camps in a liveable state, laborious chores and duties were shared among internees, from daily jobs like cooking and cleaning to the disposal of night soil. Precious little time was left over for personal activities before the lights went out each night. For the internees of Changi, the prospect of imprisonment was grim, but they were determined to endure what lay ahead.", "G02");
botMessages["liberation_response"] = new AI_Message("By mid-1945, Germany had surrendered and the Allied forces were poised for an invasion of Japan. Just days after atomic bombs devastated the Japanese cities of Hiroshima and Nagasaki, Emperor Hirohito formally announced the unconditional surrender of all Japanese forces on 15 August 1945. Stunned by their defeat, some Japanese soldiers did not immediately obey their orders, unable to accept the shame of surrender. All the soldiers were eventually imprisoned as the Allied POWs had been in 1942. The internees, who had by now waited three and a half years for liberation, experienced everything from joy to relief. The Union Jack, carefully hidden from the Japanese during imprisonment, was raised once more as Allied soldiers returned to Singapore.", "G02");
botMessages["default_msgs"] = [new AI_Message("I am not sure what you have sent, please try again."),
                                new AI_Message("I don't quite understand what you are saying, please try again."),
                                new AI_Message("I am sorry but can you please repeat the question?")
                                ];
botMessages["prompt_msgs"] = [new AI_Message("Let me know if you require any further help!", "G02"),
                            new AI_Message("If you have any other questions, don't hestiate to ask me!")
                            ];
botMessages["followup_prompt"] = new AI_Message("Here are some follow up questions you might be interested to ask!", "G02");
botMessages["tour_setup_msgs"] = [new AI_Message("Have you been to this museum before?", "G02"),
                                new AI_Message("Please enter your age group."),
                                new AI_Message("Select your interests and what you wish to see in your tour.", "G02"),
                                new AI_Message("Indicate your preferred time slots."),
                                new AI_Message("Here are you preferences for the customized tour.", "G04")
                                ];
botMessages["wayfinding_msgs"] = [new AI_Message("Where would you like to head to?"),
                                new AI_Message("This is how to get to your destination", "G04"),
                                new AI_Message("There does not seem to be a destination with that name.")
                                ];

// GO2 - Left Hand
// GO3 - Right Hand
// G04 - Both Hands
// G05 - Hands together

var bot_tone = "Professional";

// Used to store followup questions
var g_bot_response = null;
var g_follow_up_questions = null;

// True = server is open to synthesize, False = server is occupied
// The flag to control execution
let preloadFlag = false; 
// To track how many messages have been preloaded
var preloadCount = 0;
var totalMessages = 0;

let startedChat = false;

// To track whether the user is in the wayfinding mode
let wayfindingMode = false;

const bot_typing_speed = 65;

const chatBody = document.getElementById('chat-history-container');
const userInput = document.getElementById('input');

const now = new Date();
const dateString = now.toLocaleDateString();
const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// To store the destination for wayfinding
var destination = "";

// Key in destination from chatbot
// Open wayfinding modal
// Send message with destination to wayfinding iframe

// Happens during AI_PLAYER.onAIPlayerStateChanged.state === 'playerLoadComplete'
async function preloadAllMessages() {
    // Loop through the dictionary
    preloadFlag = true; // Set flag to true to start preloading
    console.log("preloadFlag state: " + preloadFlag);
    console.log("preloading messages...");
    for (const key in botMessages) {
        if (botMessages.hasOwnProperty(key)) {
            const value = botMessages[key];
            
            if (Array.isArray(value)) {
                // If the value is an array, loop through its elements
                value.forEach(async (item, index) => {
                    //console.log(`  [${index}] ${item}`);
                    const canPreload = AI_PLAYER.canPreload(callback = () => { });
                    console.log("canPreload: " + canPreload);
                    await sendPreload(item.message, item.gesture);
                    //await AI_PLAYER.preload(item);
                });
            } else {
                // If the value is not an array, log it directly
                //console.log(`Key: ${key}, Value: ${value}`);
                const canPreload = AI_PLAYER.canPreload(callback = () => { });
                console.log("canPreload: " + canPreload);
                await sendPreload(value.message, value.gesture);
                //await AI_PLAYER.preload(value);
            }
        }
    }
}

function countDictionary() {
    // Loop through the dictionary
    for (const key in botMessages) {
        if (botMessages.hasOwnProperty(key)) {
            const value = botMessages[key];
            if (Array.isArray(value)) {
                // If the value is an array, loop through its elements
                value.forEach(async (item, index) => {
                    totalMessages++;
                });
            } else {
                totalMessages++;
            }
        }
    }
}

function preloadTest() {
    // Multi Gesture preload
    let preloadArr = []; // Initialize an empty array
    let obj;

    // Loop through the dictionary to create array of objects to preload
    for (const key in botMessages) {
        if (botMessages.hasOwnProperty(key)) {
            const value = botMessages[key];
            if (Array.isArray(value)) {
                // If the value is an array, loop through its elements
                value.forEach(async (item, index) => {
                    obj = {text: item.message, gst: item.gesture};
                    preloadArr.push(obj);
                });
            } else {
                obj = {text: value.message, gst: value.gesture};
                preloadArr.push(obj);
            }
        }
    }

    // Preload the array
    AI_PLAYER.preload(preloadArr);
}

function checkForFinishedPreloading() {
    console.log("Checking if preloaded finish against " + totalMessages + " items ...");
    if (preloadCount >= totalMessages) {
        console.log("Finished preloading all " + preloadCount + " messages");
        speak(botMessages["start_msg"].message, botMessages["start_msg"].gesture);
    }
}

function tourSetupSpeak(stage) {
    console.log("tourSetupSpeak: " + botMessages["tour_setup_msgs"][stage]);
    speak(botMessages["tour_setup_msgs"][stage].message, botMessages["tour_setup_msgs"][stage].gesture);
}

function beginChat() {
    if (!startedChat) {
        console.log("Beginning chat");
        botMessage(botMessages["greeting_msg"].message, botMessages["greeting_msg"].gesture);
        startedChat = true;
    }
}

function sendMessage() {
    console.log("Sending message to bot");
    const message = userInput.value.trim();
    if (message === '') return;

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<span>${message}</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(userMessage);

    userInput.value = '';

    botResponse(message);
}

// Takes in response from user input and replies based on input
// Takes in a bool 'prompt' for whether to prompt the user for more input
function botResponse(response) {
    var bot_reply = null;
    var prompt = true;
    var lowerCase_response = response.toLowerCase();
    var code = null;
    if (!wayfindingMode) {
        if (lowerCase_response.includes(substring_1)) {
            bot_reply = botMessages["pow_response"];
        } else if (lowerCase_response.includes(substring_2)) {
            bot_reply = botMessages["liberation_response"];
        } else if (includeString(response, 'wayfinding')) {
            bot_reply = botMessages['wayfinding_msgs'][0];
            wayfindingMode = true;
            prompt = false;
        } else {
            // bot_reply = getRandomElement(botMessages["default_msgs"]);
            var response = postAPI(response, bot_tone);
            prompt = false;
        }
    } else {
        code = checkDestinations(response.toLowerCase());
        if (code == null) {
            bot_reply = botMessages['wayfinding_msgs'][2];
        } else {
            bot_reply = botMessages['wayfinding_msgs'][1];
        }
        prompt = false;
    }

    if (bot_reply != null) {
        setTimeout(() => {
            speak(bot_reply.message, bot_reply.gesture);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            botMessageDiv.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
            chatBody.appendChild(botMessageDiv);
            const botSpan = botMessageDiv.querySelector('span');

            let i = 0;
            const interval = setInterval(() => {
                if (i < bot_reply.message.length) {
                    botSpan.textContent += bot_reply.message[i];
                    i++;
                } else {
                    clearInterval(interval);
                    if (prompt == true) {
                        var prompt_msg = getRandomElement(botMessages["prompt_msgs"])
                        botMessage(prompt_msg.message, prompt_msg.gesture);
                    }
                    if (wayfindingMode && code != null) {
                        openWayfinding();
                        // Handle messages from the iframe to update the URL
                        window.addEventListener('message', (event) => {
                            if (event.data.type === 'app-loaded') {
                                console.log("Iframe has loaded!");
                                setDestination(code);
                                wayfindingMode = false;
                            }
                        });
                    }
                }
            }, bot_typing_speed)

            // Scroll to the bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }
}

// Takes in a message to be sent by the bot
function botMessage(setMessage, gesture) {
    setTimeout(() => {
        speak(setMessage.toString(), gesture);
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'message bot';
        botMessageElement.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
        chatBody.appendChild(botMessageElement);
        const botSpan = botMessageElement.querySelector('span');

        let i = 0;
        let plainText = ""; // Store raw text for typing effect

        const interval = setInterval(() => {
            if (i < setMessage.length) {
                plainText += setMessage[i]; // Type character by character
                botSpan.textContent = plainText; // Show plain text while typing
                i++;
            } else {
                clearInterval(interval);

                // After typing finishes, swap to HTML with bold formatting
                botSpan.innerHTML = setMessage.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

                console.log("Follow up questions : " + g_follow_up_questions);

                if (g_follow_up_questions != null) {
                    console.log("Follow up questions found, sending follow up question...");
                    botMessage(g_follow_up_questions[0]);
                    g_follow_up_questions = null;
                }
            }
        }, bot_typing_speed);

        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    });
}


function postAPI(message, tone) {
    console.log("posting API...");

    const url = 'https://gramener.com/docsearch/summarize';
    const payload = {
        "app": "sgroots",
        "q": message,
        "context": "Add context from matches. Use the format:\n\nDOC_ID: 1\nTITLE: (title)\n(page_content)\n\nDOC_ID: 2\nTITLE: ...\n...",
        "Followup": 1,
        "Tone": tone,
        "Format": "Summary",
        "Language": "English"
    };

    // Make API call
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Handle response
        if (response.ok) {
            return response.json(); // Parse JSON response
        } else {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    })
    .then(data => {
        console.log('Success:', data);

        // Safely extract message content
        let messageContent = data.choices?.[0]?.message?.content || "No content available";

        // Remove follow-up questions header and inline references like [[1](#1)]
        messageContent = messageContent.replace(/\*\*Follow-up questions:\*\*/i, '').trim();
        messageContent = messageContent.replace(/\[\[\d+\]\(#\d+\)\]/g, '').trim();

        // Extract follow-up questions (optional, if present)
        const followUpQuestions = messageContent.match(/- \[.*?\]/g)?.map(question => question.slice(3, -1)) || [];

        // Remove follow-up questions from the main content
        if (followUpQuestions.length > 0) {
            const splitIndex = messageContent.indexOf('- ['); // Find where follow-up starts
            messageContent = messageContent.substring(0, splitIndex).trim(); // Keep only the main content
        }

        // Output results
        console.log("Cleaned Message Content:", messageContent);
        console.log("Follow-Up Questions:", followUpQuestions);

        // Send the message
        botMessage(messageContent);

        g_bot_response = messageContent;
        g_follow_up_questions = followUpQuestions;

        // setTimeout - botMessage
        // if user havent inputted anything in 20 seconds
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function includeString(source, keyword) {
    var L_src = source.toLowerCase();
    var L_key = keyword.toLowerCase();
    return (L_src.includes(L_key));
}

// Function to wait until the flag is set
function waitForFlag() {
    return new Promise((resolve) => {
        const checkFlag = setInterval(() => {
            if (preloadFlag) {
                clearInterval(checkFlag); // Stop checking once the flag is true
                resolve(); // Resolve the promise
            }
        }, 100); // Check every 100ms
    });
}