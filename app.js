const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on 3000");
    });
  } catch (error) {
    console.log(`DB error : ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDBtoObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// getting all the players
app.get("/players/", async (request, response) => {
  const listOfPlayersQuery = `
        SELECT * FROM cricket_team;
    `;
  const playersArray = await db.all(listOfPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDBtoObject(eachPlayer))
  );
});
// create a player in database
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
        INSERT INTO 
            cricket_team (player_name,jersey_number,role)
        VALUES(
            ${playerName},
            ${jerseyNumber},
            ${role}
        );    
    `;
  const newArray = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
//get player with player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        select * from cricket_team where player_id = ${playerId};
    `;
  const playerArray = await db.get(getPlayerQuery);
  response.send(playerArray);
});

// update a player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
        UPDATE cricket_team
        SET    
            player_name = ${playerName},
            jersey_number = ${jerseyNumber},
            role = ${role}
        where player_id = ${playerId};
    `;
  const updatePlayer = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// delete a player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team where player_id = ${playerId};
    `;
  const playerArray = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
