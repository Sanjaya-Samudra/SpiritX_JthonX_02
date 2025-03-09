const apiUrl = "http://localhost:3000";
const userId = localStorage.getItem("userId");

document.getElementById("username").innerText = localStorage.getItem("username");

// Load Available Players
function loadPlayers() {
    fetch(apiUrl + "/players")
        .then(res => res.json())
        .then(players => {
            let html = "";
            players.forEach(player => {
                html += `<tr>
                    <td>${player.name}</td>
                    <td>${player.university}</td>
                    <td>${player.category}</td>
                    <td>${player.total_runs}</td>
                    <td>${player.balls_faced}</td>
                    <td>${player.innings_played}</td>
                    <td>${player.wickets}</td>
                    <td>${player.overs_bowled}</td>
                    <td>${player.runs_conceded}</td>
                    <td><button onclick="addToTeam(${player.id}, ${player.price})">Select</button></td>
                </tr>`;
            });
            document.getElementById("players-list").innerHTML = html;
        });
}

// Load User's Team
function loadTeam() {
    fetch(apiUrl + `/team/${userId}`)
        .then(res => res.json())
        .then(team => {
            let html = "";
            let totalCost = 0;
            team.forEach(player => {
                totalCost += player.price;
                html += `<tr>
                    <td>${player.name}</td>
                    <td>${player.university}</td>
                    <td>${player.category}</td>
                    <td>${player.total_runs}</td>
                    <td>${player.balls_faced}</td>
                    <td>${player.innings_played}</td>
                    <td>${player.wickets}</td>
                    <td>${player.overs_bowled}</td>
                    <td>${player.runs_conceded}</td>
                    <td><button onclick="removeFromTeam(${player.id}, ${player.price})">Remove</button></td>
                </tr>`;
            });
            document.getElementById("team-list").innerHTML = html;
            updateBudget(totalCost);
        });
}

// Update Budget
function updateBudget(totalCost) {
    const initialBudget = 9000000;
    document.getElementById("budget").innerText = initialBudget - totalCost;
}

// Add Player to Team
function addToTeam(playerId, price) {
    fetch(apiUrl + `/team/${userId}`)
        .then(res => res.json())
        .then(team => {
            if (team.length >= 11) {
                alert("Your team is full! You can only have 11 players.");
                return;
            }
            const currentBudget = parseInt(document.getElementById("budget").innerText);
            if (currentBudget < price) {
                alert("Not enough budget to add this player.");
                return;
            }
            fetch(apiUrl + "/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, playerId })
            }).then(() => {
                loadTeam(); // Reload the team list
                loadPlayers(); // Reload the available players list
            });
        });
}

// Remove Player from Team
function removeFromTeam(playerId, price) {
    fetch(apiUrl + `/team/${userId}/${playerId}`, { method: "DELETE" })
        .then(() => {
            loadTeam(); // Reload the team list
            loadPlayers(); // Reload the available players list
        });
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// Load Players & Team on Page Load
loadPlayers();
loadTeam();
