import json
from datetime import datetime

# Path to the uploaded JSON file
file_path = 'src/app/api/games/games.json'

# Load the JSON content
with open(file_path, 'r') as file:
    data = json.load(file)

# Mappings for platform and genre names to their respective IDs
platform_mapping = {
    "PC": 1,
    "GBA": 2,
    "PSP": 3,
    "PS1": 4,
    "PS2": 5,
    "PS3": 6
}

genre_mapping = {
    "Action": 1,
    "Adventure": 2,
    "Arcade": 3,
    "Board Games": 4,
    "Card": 5,
    "Casual": 6,
    "Educational": 7,
    "Family": 8,
    "Fighting": 9,
    "Indie": 10,
    "MMORPG": 11,
    "Platformer": 12,
    "Puzzle": 13,
    "RPG": 14,
    "Racing": 15,
    "Shooter": 16,
    "Simulation": 17,
    "Sports": 18,
    "Strategy": 19,
    "Misc": 20
}

# Helper function to convert releaseDate to SQLite format YYYY-MM-DD
def convert_date(date_str):
    return datetime.strptime(date_str, "%d/%m/%Y").strftime("%Y-%m-%d")

# Generating SQL INSERT statements with comments and explanations
sql_with_comments = []

for index, game in enumerate(data):
    game_id = index + 1  # Assuming this is the auto-increment ID
    title = game.get("title")
    video_id = game.get("videoId", None)
    playlist_id = game.get("playlistId", None)
    release_date = convert_date(game.get("releaseDate"))
    duration = game.get("duration", None)
    platform_id = platform_mapping.get(game.get("platform"))

    # Insert into games table with comments
    sql_with_comments.append(
        f"-- Insert data for the game '{title}'\n"
        f'INSERT INTO games (id, videoId, playlistId, title, releaseDate, duration, platform) '
        f'VALUES ({game_id}, "{video_id}", "{playlist_id}", "{title}", "{release_date}", "{duration}", {platform_id});\n'
    )

    # Insert into games_genres table with comments
    for genre in game.get("genres", []):
        genre_id = genre_mapping.get(genre)
        sql_with_comments.append(
            f"-- Associate the game '{title}' with the genre '{genre}'\n"
            f'INSERT INTO games_genres (game, genre) VALUES ({game_id}, {genre_id});\n'
        )

    # Insert into games_schedules table with comments (if available)
    available_at = game.get("availableAt")
    end_at = game.get("endAt")
    if available_at and end_at:
        sql_with_comments.append(
            f"-- Set the availability for the game '{title}'\n"
            f'INSERT INTO games_schedules (id, availableAt, endAt) '
            f'VALUES ({game_id}, "{available_at}", "{end_at}");\n'
        )

# Combine all SQL statements with comments
final_sql_script = "\n".join(sql_with_comments)

# Save the final SQL script to a file
output_file_path = 'games_insert_statements.sql'

with open(output_file_path, 'w') as file:
    file.write(final_sql_script)

print(f"SQL script has been saved to {output_file_path}")
