const apiUrl = "http://localhost:3000";

// Load All Players
// Update Button functionality for each player
function loadAdminPlayers() {
    fetch(apiUrl + "/players")
        .then(res => res.json())
        .then(players => {
            let html = "";
            players.forEach(player => {
                html += `<tr id="player-${player.id}">
                    <td>${player.name}</td>
                    <td>${player.university}</td>
                    <td>${player.category}</td>
                    <td>${player.total_runs}</td>
                    <td>${player.balls_faced}</td>
                    <td>${player.innings_played}</td>
                    <td>${player.wickets}</td>
                    <td>${player.overs_bowled}</td>
                    <td>${player.runs_conceded}</td>
                    <td>
                        <button onclick="editPlayer(${player.id})" class="btn">Update</button>
                        <button onclick="deletePlayer(${player.id})" class="btn">Delete</button>
                    </td>
                </tr>`;
            });
            document.getElementById("admin-players-list").innerHTML = html;
        });
}

// Add New Player
function addPlayer() {
    const name = document.getElementById("new-name").value;
    const university = document.getElementById("new-university").value;
    const category = document.getElementById("new-category").value;
    const total_runs = document.getElementById("total-runs").value;
    const balls_faced = document.getElementById("balls-faced").value;
    const innings_played = document.getElementById("innings-played").value;
    const wickets = document.getElementById("wickets").value;
    const overs_bowled = document.getElementById("overs-bowled").value;
    const runs_conceded = document.getElementById("runs-conceded").value;

    fetch(apiUrl + "/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name, university, category, total_runs, balls_faced,
            innings_played, wickets, overs_bowled, runs_conceded
        })
    }).then(() => {
        loadAdminPlayers();
        showNewPlayerDetails({ name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded });
    });
}

// Show New Player Details Below
function showNewPlayerDetails(player) {
    let newPlayerHtml = `<tr>
        <td>${player.name}</td>
        <td>${player.university}</td>
        <td>${player.category}</td>
        <td>${player.total_runs}</td>
        <td>${player.balls_faced}</td>
        <td>${player.innings_played}</td>
        <td>${player.wickets}</td>
        <td>${player.overs_bowled}</td>
        <td>${player.runs_conceded}</td>
    </tr>`;
    document.getElementById("new-player-details").innerHTML = newPlayerHtml;
}

// Delete Player (Dataset Players Cannot Be Deleted)
function deletePlayer(id) {
    fetch(apiUrl + `/players/${id}`, { method: "DELETE" })
        .then(() => {
            loadAdminPlayers();
        });
}

// Open Player Stats Modal
function openPlayerStatsModal() {
    const modal = document.getElementById("player-stats-modal");
    const statsTable = document.getElementById("player-stats-table");

    fetch(apiUrl + "/players")
        .then(res => res.json())
        .then(players => {
            let html = "";
            players.forEach(player => {
                const battingStrikeRate = player.total_runs / player.balls_faced * 100;
                const battingAverage = player.total_runs / player.innings_played;
                const bowlingStrikeRate = player.balls_faced / player.wickets;
                const economyRate = player.runs_conceded / player.overs_bowled;
                const playerPoints = ((battingStrikeRate/5 + battingAverage*0.8) + (500/bowlingStrikeRate + 140/economyRate)).toFixed(2);
                const playerValue = ((9*playerPoints + 100)*1000).toFixed(2);

                html += `<tr>
                    <td>${player.name}</td>
                    <td>${playerPoints}</td>
                    <td>${battingStrikeRate.toFixed(2)}</td>
                    <td>${battingAverage.toFixed(2)}</td>
                    <td>${bowlingStrikeRate.toFixed(2)}</td>
                    <td>${economyRate.toFixed(2)}</td>
                    <td>${playerValue}</td>
                </tr>`;
            });
            statsTable.innerHTML = html;
            modal.style.display = "block";
        });
}

// Close Player Stats Modal
function closePlayerStatsModal() {
    const modal = document.getElementById("player-stats-modal");
    modal.style.display = "none";
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// Load Players on Page Load
loadAdminPlayers();

function editPlayer(playerId) {
    fetch(apiUrl + "/players/" + playerId)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch player data: ${res.statusText}`);
            }
            return res.json();  // Parse the JSON if the response is OK
        })
        .then(player => {
            document.getElementById("edit-name").value = player.name;
            document.getElementById("edit-university").value = player.university;
            document.getElementById("edit-category").value = player.category;
            document.getElementById("edit-total-runs").value = player.total_runs;
            document.getElementById("edit-balls-faced").value = player.balls_faced;
            document.getElementById("edit-innings-played").value = player.innings_played;
            document.getElementById("edit-wickets").value = player.wickets;
            document.getElementById("edit-overs-bowled").value = player.overs_bowled;
            document.getElementById("edit-runs-conceded").value = player.runs_conceded;

            // Store the player ID in the edit form to use later
            document.getElementById("edit-player-form").setAttribute("data-player-id", playerId);

            // Show the edit form
            document.getElementById("edit-player-form").style.display = "block";
        })
        .catch(error => {
            //console.error("Error fetching player data:", error);
            alert("An error occurred while fetching player data.");
        });
}


// Function to save the edited player's details
function savePlayerChanges() {
    const playerId = document.getElementById("edit-player-form").getAttribute("data-player-id");
    const name = document.getElementById("edit-name").value;
    const university = document.getElementById("edit-university").value;
    const category = document.getElementById("edit-category").value;
    const total_runs = document.getElementById("edit-total-runs").value;
    const balls_faced = document.getElementById("edit-balls-faced").value;
    const innings_played = document.getElementById("edit-innings-played").value;
    const wickets = document.getElementById("edit-wickets").value;
    const overs_bowled = document.getElementById("edit-overs-bowled").value;
    const runs_conceded = document.getElementById("edit-runs-conceded").value;

    fetch(apiUrl + "/players/" + playerId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name, university, category, total_runs, balls_faced,
            innings_played, wickets, overs_bowled, runs_conceded
        })
    }).then(() => {
        // Reload the players list
        loadAdminPlayers();

        // Hide the edit form
        document.getElementById("edit-player-form").style.display = "none";
    });
}

// Function to cancel editing and hide the form
function cancelEdit() {
    document.getElementById("edit-player-form").style.display = "none";
}

