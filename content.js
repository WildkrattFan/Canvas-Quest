// Wait for the DOM to be fully loaded

let assignments = [];
let todoAssignments = [];
let courses = [];
const domain = window.location.hostname;


document.addEventListener("DOMContentLoaded", async () => {
    if (document.body) {
        // Change the background color
        document.body.style.background = "#e04169";

        // Create a sidebar
        const sidebar = document.createElement("div");
        sidebar.style.position = "fixed";
        sidebar.style.top = "0";
        sidebar.style.right = "0"; // Align to the right
        sidebar.style.width = "20%"; // Sidebar width
        sidebar.style.height = "100%"; // Full height of the screen
        sidebar.style.backgroundColor = "#333";
        sidebar.style.color = "white";
        sidebar.style.display = "flex";
        sidebar.style.flexDirection = "column"; // Stack items vertically
        sidebar.style.alignItems = "center";
        sidebar.style.padding = "20px 0";
        sidebar.style.zIndex = "1000";
        sidebar.innerHTML = `
            <div style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">Canvas Quest</div>
            <a href="#" style="color: white; text-decoration: none; margin-bottom: 15px;">Home</a>
            <a href="#" style="color: white; text-decoration: none; margin-bottom: 15px;">Tasks</a>
            <a href="#" style="color: white; text-decoration: none;">Profile</a>
        `;

        // Add the sidebar to the body
        document.body.appendChild(sidebar);

        // Add padding to the body to prevent content from being covered
        document.body.style.paddingRight = "200px"; // Match the sidebar's width
    } else {
        console.error("Document body is not available.");
    }

    try{
    courses = await getAllCourses();
    assignments = await getAllAssignments();
    console.log("Assignments:", assignments);
    console.log("Courses:", courses);
    filterAssignments = filterAssignments(assignments);
    console.log("Filtered Assignments:", filterAssignments);
    

    } catch (error) {
        console.error("Error fetching courses or assignments:", error);
    }


});

function constructAPIURL(courseId){
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

function filterAssignments(assignments){
    let filteredAssignments = assignments.filter(assignment => {
        let dueDate = new Date(assignment.plannable_date);
        let currentDate = new Date();
        return dueDate >= currentDate && assignment.submissions.submitted == false;
    });
    return filteredAssignments;
}