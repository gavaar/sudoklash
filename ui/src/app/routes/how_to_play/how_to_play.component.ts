import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'how-to-play',
  template: `
    <button class="htp__back-button" routerLink="/">🔙 Home</button>
    <small>
      ⚠️ <strong>Disclaimer:</strong> this game is in a very simple state, with as simple pages as possible.
      This page is just an explanation of the game, but probably the example images could be better, and the page could be a bit more interactive.
      Hopefully -eventually- that will come to be. But for now, this is what we have. Thanks for understanding ⚠️
    </small>
    <h1>Hit and dead</h1>
    <p>
      This is a game about <strong>guessing your oponent's selection before they guess yours.</strong>
      It takes a bit of wit to find patterns to be able to get ahead before the enemy does.
    </p>

    <h2>How to play</h2>
    <p>
      When you join a new game, you get a board to choose what number you will play with.
      <strong>You cannot choose the same number twice, and they can be in any order.</strong>
    </p>
    <p>
      You can also copy the room url to share with whomever you want to play with.
      You get assigned a name when you join the website. You can see that name at the top.
    </p>
    <img src="assets/images/how-to-play/selecting-a-number.png" alt="image of the different options to select a number" />
    <small><i>Assigned name, shortcut to copy the room url and where you can make your play.</i></small>

    <p>
      When you've made your selection, while you wait for the opponent to join / make their selection, you will be able to chat meanwhile.
      All messages (including game related) will appear in the middle.
    </p>

    <img src="assets/images/how-to-play/selection-made.png" alt="waiting for player to join and make their selection" />
    <small><i>Waiting for player to join and make their selection.</i></small>

    <h3>Game rules</h3>
    <p>
      <strong>You will take turns trying to guess the opponent's number.</strong>
    </p>
    <p>
      <strong>If you correctly guess a number, but in the wrong position, you get a "hit"💥, if you guess the number AND the position, you get a "kill" 💀.</strong>
    </p>
    <p>
      The catch is, you don't know which number you hit or killed, only the amount of hits and kills per turn.
      Using this information you will try to guess the other player's selection.
    </p>
    <p>
      To help you out with your guesses, <strong>you can long-press a number to mark it in "green"</strong> for whatever purpose (maybe you supect of it, or maybe you are sure it's not in the enemy selection?).
      If you are sure a number goes in a position, <strong>you can "lock it in" by tapping on the little lock🔒 below it.</strong>
    </p>
    <img
      src="assets/images/how-to-play/playing-turns.png"
      alt="Kills and hits, and a way to put the key green if you suspect it, or lock it if you're sure it goes there."
    />
    <small><i>Kills and hits, and a way to put the key green if you suspect it, or lock it if you're sure it goes there.</i></small>
    
    <h3>Win condition</h3>
    <p>
      When one of the two players correctly guesses the four numbers and their positions, that player wins.
    </p>
    <img src="assets/images/how-to-play/end-of-game.png" alt="When one player wins" />
    <small><i>When one player wins.</i></small>
    
    <h2>Quality of life</h2>
    <p>
      There are other tools in the chat to help see the info you want to see.
    </p>
    <p>
      You can click on the filters below the player list, to remove any type of info from the game.
      Currently you have:
    </p>
    <ul>
      <li>"[player 1's name]" to hide player 1's plays.</li>
      <li>"Room chat" to hide chat messages.</li>
      <li>"Server messages" to hide messages from the server.</li>
      <li>"[player 2's name]" to hide player 2's plays.</li>
    </ul>
    <img src="assets/images/how-to-play/quality-of-life.png" alt="Things to help navigate the view better" />
    <small><i>Filters to remove from chat, a button to hide the keypad, a notification that is your turn</i></small>

    <hr>

    <small>
      If you got this far thanks for reading.
      Game isn't perfect, but I just wanted to have a way to play this with friends.
      Hope you have a blast, and if you have suggestions or you find bugs, please let me know at <a href="mailto:oxspit@gmail.com">oxspit&#64;gmail.com</a>
    </small>
    `,
  styles: [`
    :host {
      display: flex;
      height: 100%;
      padding: 0 1rem 1rem;
      flex-direction: column;
      overflow: overlay;
      background-color: whitesmoke;
      text-align: center;

      hr {
        height: 1px;
        width: 80vw;
        margin: 1rem auto;
      }

      small, img {
        margin: auto;
        max-width: 80vw;
      }

      h1, h2, h3 {
        color: var(--solid-green);
        margin-bottom: 0;
      }

      img {
        border: 2px solid var(--black);
        border-radius: 1rem;
      }
    }

    .htp__back-button {
      font-size: 2rem;
      border: 0;
      top: 0;
      position: sticky;
      background-color: whitesmoke;
      border-bottom: 1px solid var(--lightblue);
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToPlayComponent {}
