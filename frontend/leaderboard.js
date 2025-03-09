const apiUrl = "http://localhost:3000"; // Your API URL

// Function to fetch and display the leaderboard
function loadLeaderboard() {
    fetch(apiUrl + "/leaderboard")
        .then(res => res.json())
        .then(players => {
            // Sort players by points (Descending Order)
            players.sort((a, b) => b.points - a.points);

            let html = "";
            players.forEach((player, index) => {
                html += `<tr>
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.university}</td>
                    <td>${player.points}</td>
                </tr>`;
            });

            document.getElementById("leaderboard").innerHTML = html;
        })
        .catch(err => console.error("Error fetching leaderboard data:", err));
}

// Call loadLeaderboard function to display the data when the page is loaded
window.onload = loadLeaderboard;

// Reload the leaderboard every 10 seconds to reflect changes in real time
setInterval(loadLeaderboard, 10000);
