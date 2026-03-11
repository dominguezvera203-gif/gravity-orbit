Reflection of how i created the Gravity Orbit

For my game project, I decided to create Gravity Orbit, a simple one-button game where the player controls a planet orbiting around a moving sun. The main goal is to survive as long as possible while collecting stars to activate power-ups. I wanted to focus on making a game that’s easy to understand but still challenging and fun.

One of the biggest challenges I faced was managing the game state and interactions between the planet, the sun, and the stars. At first, I had trouble making the invincible power-up work correctly. Even when the player collected enough invincible stars, the planet would still “die” on contact with the sun. Fixing this required carefully checking the power-up state in the collision logic. Another tricky part was making the stars respawn randomly but not too frequently, so they feel rewarding but not overwhelming.

Adding power-ups was a fun part. I implemented three types: speed, invincible, and bonus. Each one requires collecting three stars of the same type. I also added a visual glow for the planet when invincible to make it clear to the player that they are temporarily safe. Watching the game come together with these features was satisfying because it added more strategy without overcomplicating the controls.

I learned a lot about React Native hooks, timing events, and animations. Using useState and useEffect properly to control game mechanics like the sun’s movement, star spawning, and power-up timers was especially important. I also learned how to use Pressable for one-button control, which fits the Game Jam style perfectly.

If I had more time, I would improve the visual feedback and animations, like making stars pulse when they spawn or adding smooth effects when the planet switches orbit. I’d also like to add a scoring multiplier for consecutive stars collected to reward skillful play.

Overall, I’m happy with how Gravity Orbit turned out. It’s a small, simple game, but it demonstrates core game mechanics, timed events, and user interaction using only one button and one life. I feel like I gained valuable experience in structuring a mini game, debugging interactive features, and making a playable mobile experience from scratch.


