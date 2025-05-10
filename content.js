// Wait for the DOM to be fully loaded

let assignments = [];
let todoAssignments = [];
let courses = [];
const domain = window.location.hostname;
let sidebar = null;
let assignmentBlock = null;
let shopBlock = null;
let assignmentList = null;
let coins = 0;
let lastUpdate = null;

const states = {
    Assignments: "Assignments",
    Shop: "Shop"
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        courses = await getAllCourses();
        assignments = await getAllAssignments();
        console.log("Assignments:", assignments);
        console.log("Courses:", courses);
        todoAssignments = filterAssignments(assignments);
        console.log("Filtered Assignments:", filterAssignments);
    } catch (error) {
        console.error("Error fetching courses or assignments:", error);
    }

    if (document.body) {
        // Create a sidebar
        sidebar = document.createElement("div");
        sidebar.style.position = "fixed";
        sidebar.style.top = "0";
        sidebar.style.right = "0"; // Align to the right
        sidebar.style.width = "40%"; // Sidebar width
        sidebar.style.height = "100%"; // Full height of the screen
        sidebar.style.backgroundColor = "#333";
        sidebar.style.color = "white";
        sidebar.style.display = "flex";
        sidebar.style.flexDirection = "column"; // Stack items vertically
        sidebar.style.alignItems = "center";
        sidebar.style.padding = "20px 0";
        sidebar.style.zIndex = "1000";
        sidebar.style.fontSize = "16px"; // Font size for the sidebar
        sidebar.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold;"><h1>Canvas Quest</h1></div>
            <div style="display: flex; flex-direction: row; align-items: center; width: 100%; justify-content: center;">
                <button id="assignmentsButton" style="
                    background-color: #555;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    margin-left: 10px;
                    margin-right: 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                    transition: background-color 0.3s ease;
                " onmouseover="this.style.backgroundColor='#666'" onmouseout="this.style.backgroundColor='#555'">Assignments</button>
                <button id="shopButton" style="
                    background-color: #555;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    margin-left: 10px;
                    margin-right: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                    transition: background-color 0.3s ease;
                " onmouseover="this.style.backgroundColor='#666'" onmouseout="this.style.backgroundColor='#555'">Shop</button>
            </div>
        `;

        // Add the sidebar to the body
        document.body.appendChild(sidebar);

        // Add event listeners for the buttons
        const assignmentsButton = document.getElementById("assignmentsButton");
        const shopButton = document.getElementById("shopButton");

        assignmentsButton.addEventListener("click", assignmentsButtonPressed);
        shopButton.addEventListener("click", shopButtonPressed);

        // Create a list of assignments
        assignmentList = document.createElement("div");
        assignmentList.style.margin = "20px"; // Add some space from the top
        assignmentList.style.width = "90%"; // Width of the list
        assignmentList.style.overflowY = "auto"; // Enable vertical scrolling
        assignmentList.style.maxHeight = "80%"; // Limit the height of the list
        assignmentList.style.padding = "10px";
        assignmentList.style.backgroundColor = "#444"; // Background color for the list
        assignmentList.style.borderRadius = "5px"; // Rounded corners
        assignmentList.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)"; // Shadow effect
        assignmentList.innerHTML = `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;"><h2>Assignments</h2></div>`;

        // Add each assignment as a separate block
        todoAssignments.forEach((assignment) => {
            const courseId = assignment.course_id;
            const course = courses.find(course => course.id === courseId);
            const courseName = course ? course.name : "Unknown Course";
            const dueDate = new Date(assignment.plannable_date).toLocaleString(); // Format the date

            assignmentBlock = document.createElement("div");
            assignmentBlock.style.marginBottom = "15px";
            assignmentBlock.style.padding = "10px";
            assignmentBlock.style.backgroundColor = "#555"; // Background color for each block
            assignmentBlock.style.borderRadius = "5px"; // Rounded corners
            assignmentBlock.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.3)"; // Shadow effect

            assignmentBlock.innerHTML = `
        <div style="font-size: 14px; font-weight: bold; color: #fff;">${courseName}</div>
        <div style="font-size: 14px; color: #ddd;">${assignment.plannable.title}</div>
        <div style="font-size: 12px; color: #aaa;">Due: ${dueDate}</div>
        <div style="font-size: 12px; color: #FFD700;">Days Left: ${assignment.days_left}</div>
        <button style="
            margin-top: 10px;
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        " class="mark-completed" data-points="${assignment.days_left} ">Mark as Completed</button>
    `;

            assignmentList.appendChild(assignmentBlock);
        });

        assignmentList.addEventListener("click", (event) => {
            if (event.target.classList.contains("mark-completed")) {
                const points = event.target.getAttribute("data-points");
                // Handle the mark as completed action here
                console.log(`Assignment marked as completed. Points: ${points}`);
                // Optionally, remove the assignment block from the list
                const assignmentBlock = event.target.closest("div");
                if (assignmentBlock) {
                    assignmentList.removeChild(assignmentBlock);
                }
            }
        });

        // Add the total assignments count
        const totalAssignments = document.createElement("div");
        totalAssignments.style.marginTop = "10px";
        totalAssignments.style.fontSize = "14px";
        totalAssignments.style.color = "#aaa";
        totalAssignments.textContent = `Total Assignments: ${todoAssignments.length}`;
        assignmentList.appendChild(totalAssignments);

        // Add the list to the sidebar

        sidebar.appendChild(assignmentList);

        
        coins = await getLocally("coins");
        if (coins === null) {
            coins = 0;
            await storeLocally("coins", coins);
        }
        let lastUpdateUnformatted = await getLocally("lastUpdate"); // Set to a week ago
        if (lastUpdateUnformatted === null) {
            lastUpdate = new Date();
            await storeLocally("lastUpdate", lastUpdate);
            updateCoins();
        } else {
            lastUpdate = new Date(lastUpdateUnformatted);
            updateCoins();
        }
        // Add padding to the body to prevent content from being covered
        document.body.style.paddingRight = "200px"; // Match the sidebar's width


    } else {
        console.error("Document body is not available.");
    }
});

function constructAPIURL(courseId) {
    let apiLink = "/api/v1/courses/" + courseId + "/assignments"; // Canvas API endpoint for assignments
    return apiLink;
}

async function getData(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

async function getAllAssignments() {
    let weekAgo = new Date(new Date() - 604800000);
    let allAssignments = getData(`/api/v1/planner/items?start_date=${weekAgo.toISOString()}&per_page=75`);
    return allAssignments;
}

async function getAllCourses() {
    const apiLink = "/api/v1/courses"; // Canvas API endpoint for courses
    let allCourses = [];
    let nextPage = apiLink;

    try {
        while (nextPage) {
            const response = await fetch(nextPage, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            allCourses = allCourses.concat(data);

            // Check the Link header for the next page
            const linkHeader = response.headers.get("Link");
            if (linkHeader) {
                const nextLinkMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                nextPage = nextLinkMatch ? nextLinkMatch[1] : null;
            } else {
                nextPage = null; // No more pages
            }
        }
        return allCourses;
    } catch (error) {
        console.error("Error fetching courses:", error);
        return null;
    }
}

function filterAssignments(assignments) {
    let filteredAssignments = assignments.filter(assignment => {
        let dueDate = new Date(assignment.plannable_date);
        let currentDate = new Date();
        return dueDate >= currentDate && assignment.submissions.submitted == false;
    });
    filteredAssignments = filteredAssignments.map(assignment => {
        let dueDate = new Date(assignment.plannable_date);
        let currentDate = new Date();
        let daysLeft = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24)); // Calculate days left

        return {
            course_id: assignment.course_id,
            plannable: assignment.plannable,
            plannable_date: assignment.plannable_date,
            days_left: daysLeft // Add days left to the assignment object
        };
    });
    filteredAssignments.sort((a, b) => a.days_left - b.days_left); // Sort by days left
    return filteredAssignments;
}

function shopButtonPressed() {
    // Handle the shop button press
    if(sidebar){
        if(sidebar.contains(assignmentList)){
            sidebar.removeChild(assignmentList);
        }
    }
    // Add your shop logic here
}
function assignmentsButtonPressed() {
    // Handle the assignments button press
    if(sidebar){
        if(sidebar.contains(shopBlock)){
            sidebar.removeChild(shopBlock);
        }
        if(!sidebar.contains(assignmentList)){
            sidebar.appendChild(assignmentList);
        }
    }
    // Add your assignments logic here
}


async function storeLocally(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
async function getLocally(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
}

async function updateCoins(){
    let currentDate = new Date();
    let timeDiff = Math.abs(currentDate.getTime() - lastUpdate.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    let assignments = await getAllAssignments();
    let assignmentsUpdatedSinceLastUpdate = assignments.filter(assignment => {
        let updatedDate = new Date(assignment.plannable.updated_at);
        return updatedDate >= lastUpdate && assignment.submissions.submitted == true;
    });
    
    let coinsEarned = 0;

    assignmentsUpdatedSinceLastUpdate.forEach(assignment => {
        let dueDate = new Date(assignment.plannable_date);
        let submittedDate = new Date(assignment.plannable.updated_at);
        let timeDifference = Math.abs(submittedDate - dueDate);
        let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        console.log("Days Difference:", daysDifference);
        coinsEarned += daysDifference;
    });
    coins += coinsEarned;
    lastUpdate = currentDate;
    await storeLocally("coins", coins);
    await storeLocally("lastUpdate", lastUpdate);
}