class Card{
    constructor(rank, suit, name){
        //constructs a playing card from parameters passed in
        this.rank = rank;
        this.suit = suit;
        this.name = name;
        this.title = name + " Of " + suit;
        this.image_title = "imgs/" + name + "_Of_" + suit + ".png";
    }
}

class Scores{
    constructor(){
        this.player_score = 0;
        this.player_ace_count = 0;
        this.player_ace_bonus = false;
        this.dealer_score = 0;
        this.dealer_ace_count = 0;
        this.dealer_ace_bonus = false;
        this.player_bonus_disabled = false;
        this.dealer_bonus_disabled = false;
        this.player_natural_blackjack = false;
    }

    resetScores(){
        this.player_score = 0;
        this.player_ace_count = 0;
        this.player_ace_bonus = false;
        this.dealer_score = 0;
        this.dealer_ace_count = 0;
        this.dealer_ace_bonus = false;
        this.player_bonus_disabled = false;
        this.dealer_bonus_disabled = false;
        this.player_natural_blackjack = false;
    }
}

//global variables
var global_deck = []; //not a constant reference since this global variable may be redirected to alternate deck arrays
var current_scores = new Scores();
var current_player_hand = [];
var current_dealer_hand = [];
var player_is_standing = false;
var game_is_over = false;
var player_won = false;
var dealer_won = false;
var game_was_tie = false;
var net_games_won = 0; //decreases with losses, increases with wins
var canvas = document.getElementById("blackjack_canvas");
var ctx = canvas.getContext("2d");
var canvas_width = window.innerWidth - Math.round((window.innerWidth/100) * 5);
var canvas_height = Math.round(canvas_width/2.2);
var card_width = Math.round(canvas_width/7); //width is 14.3% of the full canvas width
var card_height = Math.round(card_width * 1.4); //height is 1.4x the card width
var x_offset = Math.round(card_width/8);
var y_offset = Math.round(card_height/20);
var player_x_offset = Math.round(canvas_width/100); //a very tiny offset for the player's cards
var dealer_x_offset = Math.round(canvas_width/2);
var hands_y_offset = Math.round(canvas_height/10);
var image_map = new Map();

//global variables related to DOM specifically
var player_score_text = document.getElementById("player_score"); //a reference to the player score HTML element
var player_card_list = document.getElementById("player_card_list"); //a reference to the player card list HTML element
var game_start_button = document.getElementById("game_start_button"); //a reference to the game start button HTML element

//global variables related to color/text color
var table_color = "rgb(47,147,0)"; //color of the canvas background/game table
var black_color = "rgb(0,0,0)";
var red_color = "rgb(255,0,0)";
var blue_color = "rgb(0,0,255)";
var yellow_color = "rgb(255,225,0)";


function preloadImageMap(event){
    let full_deck = createDeck(); //create a full deck such that image_title properties can be accessed easily
    for(let i=0; i < full_deck.length; i++){
        let current_image = new Image();
        current_image.onload = function(){
            image_map.set(full_deck[i].image_title, current_image);
        }
        current_image.src = full_deck[i].image_title;
    }

    //Add the card back to the image_map
    let card_back_image = new Image();
    card_back_image.onload = function(){
        image_map.set("imgs/card_back.png", card_back_image);
    }
    card_back_image.src = "imgs/card_back.png";
}

//Pre-load images into the image_map, triggers when the DOM is loaded
document.addEventListener('DOMContentLoaded', preloadImageMap);

/* Function: drawCanvas()
 * Description: draws a fresh canvas
 * Parameters: None
 * Returns: void
 */
function drawCanvas(){
    eraseCanvas();
    canvas_width = window.innerWidth - Math.round((window.innerWidth/100) * 5);
    canvas_height = Math.round(canvas_width/2.2);
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    card_width = Math.round(canvas_width/7);
    card_height = Math.round(card_width * 1.4);
    x_offset = Math.round(card_width/8);
    y_offset = Math.round(card_height/20);
    player_x_offset = Math.round(canvas_width/100);
    dealer_x_offset = Math.round(canvas_width/2);
    hands_y_offset = Math.round(canvas_height/10);
    ctx.fillStyle = table_color; //green table fillStyle
    ctx.fillRect(0,0, canvas_width, canvas_height);

    //draw Scores
    ctx.font = "16pt serif";
    ctx.fillStyle = black_color; //Black text fillStyle
    ctx.fillText("Player Card Value: " + current_scores.player_score, Math.round(canvas_width/25), Math.round(canvas_height/20));
    if(game_is_over === false){
        if(current_dealer_hand.length > 0){
            ctx.fillText("Known Dealer Card Value: " + current_dealer_hand[0].rank, dealer_x_offset, Math.round(canvas_height/20));
        }
        else{
            ctx.fillText("Known Dealer Card Value: ", dealer_x_offset, Math.round(canvas_height/20));
        }
    }
    else{
        ctx.fillText("Dealer Card Value: " + current_scores.dealer_score, dealer_x_offset, Math.round(canvas_height/20));
    }


    //draw Player Hand
    if(current_player_hand.length !== 0){
        for(let i= 0; i < current_player_hand.length; i++){
            let card_to_paint = image_map.get(current_player_hand[i].image_title);
            console.log("Card to Paint:" + current_player_hand[i].image_title);
            ctx.drawImage(card_to_paint, dx= player_x_offset + (x_offset * i), dy= hands_y_offset + (y_offset * i), width= card_width, height= card_height);
        }
    }

    //draw Dealer Hand
    if(current_dealer_hand.length !== 0){
        for(let i= 0; i < current_dealer_hand.length; i++){
            if(i === 1 && game_is_over === false){
                let card_to_paint = image_map.get("imgs/card_back.png");
                console.log("Card to Paint:" + "imgs/card_back.png");
                ctx.drawImage(card_to_paint, dx= dealer_x_offset + (x_offset * i), dy= hands_y_offset + (y_offset * i), width= card_width, height= card_height);
            }
            else{
                let card_to_paint = image_map.get(current_dealer_hand[i].image_title);
                console.log("Card to Paint:" + current_dealer_hand[i].image_title);
                ctx.drawImage(card_to_paint, dx= dealer_x_offset + (x_offset * i), dy= hands_y_offset + (y_offset * i), width= card_width, height= card_height);
            }
        } 
    }

    //Game Over Messages
    if(game_is_over === true){
        ctx.font = "30px fantasy"
        if(dealer_won === true){
            ctx.fillStyle = red_color; //Red text
            ctx.fillText("The Dealer Wins!", Math.round((canvas_width/2) - (canvas_width/20)), Math.round(canvas_height/2));
        }
        else if(player_won === true){
            ctx.fillStyle = blue_color; //Blue text
            ctx.fillText("You Win!", Math.round((canvas_width/2) - (canvas_width/20)), Math.round(canvas_height/2));
        }
        else if(game_was_tie === true){
            ctx.fillStyle = yellow_color; //Yellow text
            ctx.fillText("It's a tie!", Math.round((canvas_width/2) - (canvas_width/20)), Math.round(canvas_height/2));
        }
    }

}

/* Function: eraseCanvas()
 * Description: Erase the canvas
 * Parameters: None
 * Returns: void
 */

function eraseCanvas(){
    ctx.clearRect(0,0, canvas_width, canvas_height);
}

/* Function: deleteCardList()
 * Description: deletes the child elements of the player_card_list HTML element
 * Parameters: None
 * Returns: void
 */
function deleteCardList(){
    while(player_card_list.hasChildNodes()){
        player_card_list.removeChild(player_card_list.childNodes[0]);
    }
}

/* Function: shuffleDeck(blackjack_deck, size)
*   Description: A function designed to randomly shuffle the specified deck
*   Parameters: blackjack_deck: An array of Card objects
*              size: An integer specifying the number of Card objects in the deck
*   Returns: void
*/
function shuffleDeck(blackjack_deck, size){

    for(let deck_size = 0; deck_size < size; deck_size++){
        var temporary_card = blackjack_deck[deck_size]; //holds a copy of the card to be swapped
        let random_num = Math.floor(Math.random() * size); //returns random number from 0 to size of deck - 1
        blackjack_deck[deck_size] = blackjack_deck[random_num];
        blackjack_deck[random_num] = temporary_card;
    }
}

/* Function: createDeck()
*   Description: A function designed to randomly shuffle the specified deck
*   Parameters: None
*   Returns: An array containing 52 Card objects
*/
function createDeck(){
    const suit_array = ["Hearts", "Clubs", "Diamonds", "Spades"];
    const rank_array = [1,2,3,4,5,6,7,8,9,10,10,10,10];
    const name_array = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
    const blackjack_deck = [];

    for(let suit_count = 0; suit_count < 4; suit_count++){
        for(let rank_count = 0; rank_count < 13; rank_count++){
            var current_card = new Card(rank_array[rank_count], suit_array[suit_count], name_array[rank_count]);
            blackjack_deck.push(current_card);
            //console.log(current_card.title);
        }
    }

    //outputs initial deck order to console, should be all suits in order of rank
    for(let deck_size = 0; deck_size < 52; deck_size++){
        console.log(blackjack_deck[deck_size].title);
    }

    console.log("Shuffling deck");

    shuffleDeck(blackjack_deck, 52);

    //outputs shuffled deck, should be no repeat cards
    for(let deck_size = 0; deck_size < 52; deck_size++){
        console.log(blackjack_deck[deck_size].title);
    }

    return blackjack_deck;

}

/*  Function: checkDealerEndCondition()
 *  Description: Checks to see if the game is over, and what the result is
 *  Parameters: None
 *  Returns: void
 */
function checkDealerEndCondition(){

    //Slightly redundant, yet it is possible that the buttons need to be disabled if the dealer got a natural blackjack
    document.getElementById("hit_me_button").disabled = true;
    document.getElementById("hit_me_button").style.visibility = "hidden";
    document.getElementById("stand_button").disabled = true;
    document.getElementById("stand_button").style.visibility = "hidden";

    //Checks if it's a tie on the first turn
    if(current_scores.player_natural_blackjack === true && (current_scores.player_score === current_scores.dealer_score)){
        game_start_button.disabled = false;
        game_start_button.style.visibility = "visible";
        console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
        console.log("It's a tie");
        game_is_over = true;
        game_was_tie = true;
        drawCanvas();
        deleteCardList();
    }
    //Checks if the player won on the first turn
    else if(current_scores.player_natural_blackjack === true && (current_scores.player_score > current_scores.dealer_score)){
        game_start_button.disabled = false;
        game_start_button.style.visibility = "visible";
        console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
        console.log("Player Wins! Natural Blackjack!");
        game_is_over = true;
        player_won = true;
        drawCanvas();
        deleteCardList();
    }
    //Checks if the dealer has busted
    else if(current_scores.dealer_score > 21){
        game_start_button.disabled = false;
        game_start_button.style.visibility = "visible";
        console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
        console.log("Player wins, Dealer BUSTED");
        game_is_over = true;
        player_won = true;
        drawCanvas();
        deleteCardList();
    }

    //Otherwise, the dealer needs to hit until they hit 17 or higher
    //Doesn't require an additional loop as dealDealerCard and checkDealerEndCondition are mutually recursive
    if(current_scores.dealer_score < 17 && game_is_over === false){
        dealDealerCard();
    }
    else if(current_scores.dealer_score >= 17 && game_is_over === false){
        //Condition: Player Wins
        if(current_scores.player_score > current_scores.dealer_score){
            game_start_button.disabled = false;
            game_start_button.style.visibility = "visible";
            console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
            console.log("Player wins");
            game_is_over = true;
            player_won = true;
            drawCanvas();
            deleteCardList();

        }
        //Condition: Dealer Wins
        else if(current_scores.player_score < current_scores.dealer_score){
            game_start_button.disabled = false;
            game_start_button.style.visibility = "visible";
            console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
            console.log("Dealer wins");
            game_is_over = true;
            dealer_won = true;
            drawCanvas();
            deleteCardList();

        }
        //Condition: It's a tie
        else if(current_scores.player_score === current_scores.dealer_score){
            game_start_button.disabled = false;
            game_start_button.style.visibility = "visible";
            console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
            console.log("It's a tie");
            game_is_over = true;
            game_was_tie = true;
            drawCanvas();
            deleteCardList();

        }
    }

}

/*  Function: dealDealerCard()
 *  Description: Deals the dealer one card from the global_deck
 *  Parameters: None
 *  Returns: void
 */
function dealDealerCard(){
    let card_dealt = global_deck.pop(); //pops a card off the top of the deck
    current_dealer_hand.push(card_dealt); //push the card dealt into the player's hand
    console.log("Dealer received: " + card_dealt.title);

    //update number of aces in hand
    if(card_dealt.name==="Ace"){
        current_scores.dealer_ace_count++;
        console.log("Dealer Ace Count: " + current_scores.dealer_ace_count);
    }

    //Dealer cards won't be listed like the player cards, only one dealer card visible until the end

    console.log("Game Deck Size: " + global_deck.length);
    console.log("Dealer Hand Size: " + current_dealer_hand.length);

    //Now to update the score
    current_scores.dealer_score = current_scores.dealer_score + card_dealt.rank;
    if(current_scores.dealer_ace_count >= 1 && current_scores.dealer_ace_bonus === false){
        current_scores.dealer_score = current_scores.dealer_score + 10;
        current_scores.dealer_ace_bonus = true;
        console.log("Dealer received Ace Bonus");
    }

    //Now fix a bust off a single ace, if applicable
    if(current_scores.dealer_score > 21 && current_scores.dealer_ace_bonus === true && current_scores.dealer_bonus_disabled === false){
        current_scores.dealer_score = current_scores.dealer_score - 10;
        current_scores.dealer_bonus_disabled = true;
        console.log("Dealer Ace Bonus removed");
    }

    console.log("Dealer Score: " + current_scores.dealer_score);
    drawCanvas();

    //Insert scoreboard logic here if necessary

    //Check if the game has ended
    if(current_scores.dealer_score >= 21 || (player_is_standing === true && current_dealer_hand.length >= 2)){
        checkDealerEndCondition();
    }
}

/* Function: playerBusted()
 * Description: Ends the game with the condition that the player busted
 * Parameters: None
 * Returns: void
 */

function playerBusted(){

    player_score_text.textContent = "Total Card Value: " + current_scores.player_score + " BUSTED!";
    player_score_text.style.color = "rgb(255,0,0)";

    document.getElementById("game_start_button").disabled = false;
    document.getElementById("game_start_button").style.visibility = "visible";

    document.getElementById("hit_me_button").disabled = true;
    document.getElementById("hit_me_button").style.visibility = "hidden";

    document.getElementById("stand_button").disabled = true;
    document.getElementById("stand_button").style.visibility = "hidden";
    game_is_over = true;
    dealer_won = true;
    drawCanvas();
    deleteCardList();
}

/* Function: playerStand()
 * Description: Player chooses to stay at their current score (or hit 21 exactly)
 * Parameters: None
 * Returns: void
 */

function playerStand(){
    document.getElementById("hit_me_button").disabled = true;
    document.getElementById("hit_me_button").style.visibility = "hidden";
    document.getElementById("stand_button").disabled = true;
    document.getElementById("stand_button").style.visibility = "hidden";
    player_is_standing = true;

    if(current_scores.dealer_score < 17 && current_scores.player_natural_blackjack === false){
        checkDealerEndCondition();
    }
    //Situation where player wins
    else if(current_scores.player_score > current_scores.dealer_score && current_scores.player_natural_blackjack === false){

        game_start_button.disabled = false;
        game_start_button.style.visibility = "visible";
        console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
        console.log("Player wins");
        game_is_over = true;
        player_won = true;
        drawCanvas();
        deleteCardList();
    }
    //Situation where dealer wins
    else if(current_scores.player_score < current_scores.dealer_score){
        game_start_button.disabled = false;
        game_start_button.style.visibility = "visible";
        console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
        console.log("Dealer wins");
        game_is_over = true;
        dealer_won = true;
        drawCanvas();
        deleteCardList();
    }
    else if(current_scores.player_score === current_scores.dealer_score){
        game_start_button.disabled = false;
        game_start_button.style.visibility = "visible";
        console.log("Player Score: " + current_scores.player_score + " Dealer Score: " + current_scores.dealer_score);
        console.log("It's a tie");
        game_is_over = true;
        game_was_tie = true;
        drawCanvas();
        deleteCardList();
    }

} 

/*  Function: dealPlayerCard()
 *  Description: Deals the player one card from the global_deck
 *  Parameters: None
 *  Returns: void
 */
function dealPlayerCard(){
    let card_dealt = global_deck.pop(); //pops a card off the top of the deck
    current_player_hand.push(card_dealt); //push the card dealt into the player's hand

    //update number of aces in hand
    if(card_dealt.name==="Ace"){
        current_scores.player_ace_count++;
    }

    let card_text_node = document.createTextNode(card_dealt.title);
    player_card_list.appendChild(card_text_node);
    let line_break = document.createElement("br");
    player_card_list.appendChild(line_break);

    console.log("Game Deck Size: " + global_deck.length);
    console.log("Player Hand Size: " + current_player_hand.length);

    //Now to update the score
    current_scores.player_score = current_scores.player_score + card_dealt.rank;
    if(current_scores.player_ace_count >= 1 && current_scores.player_ace_bonus === false){
        current_scores.player_score = current_scores.player_score + 10;
        current_scores.player_ace_bonus = true;
    }
    player_score_text.textContent = "Total Card Value: " + current_scores.player_score;
    player_score_text.style.color = "rgb(0,0,255)";
    drawCanvas();

    //Check if the player has gone bust
    if(current_scores.player_score > 21){
        //Disable ace bonus if bonus is present
        if(current_scores.player_ace_bonus === true && current_scores.player_bonus_disabled === false){
            current_scores.player_score = current_scores.player_score - 10;
            current_scores.player_bonus_disabled = true;

            player_score_text.textContent = "Total Card Value: " + current_scores.player_score;
            player_score_text.style.color = "rgb(0,0,255)";
            drawCanvas();
        }

        //Now check again if the player has gone bust
        if(current_scores.player_score > 21){
            playerBusted();
        }
    }
    //Check if the player has 21
    else if(current_scores.player_score === 21){

        //Check if the player hit a natural blackjack before the dealer had a chance to draw
        if(current_dealer_hand.length < 2){
            current_scores.player_natural_blackjack = true;
        }
        playerStand();
    }

}

/* Function: startGame()
 * Description: Initiates the game by calling createDeck(), resets the scoreboard and associated variables, and deals cards to the player and 
 *              dealer
 * Parameters: None
 * Returns: None
 */
function startGame(){
    global_deck = createDeck(); //gets a game deck from the createDeck() function
    current_scores.resetScores();
    current_player_hand = []; //empty array for the player's hand
    current_dealer_hand = []; //empty array for the dealer's hand
    player_is_standing = false; //resets this global variable to default value
    game_is_over = false; //resets this global variable to default value
    player_won = false; //ditto
    dealer_won = false; //ditto
    game_was_tie = false; //ditto
    document.getElementById("game_start_button").disabled = true;
    document.getElementById("game_start_button").style.visibility = "hidden";
    document.getElementById("hit_me_button").disabled = false;
    document.getElementById("hit_me_button").style.visibility = "visible";
    document.getElementById("stand_button").disabled = false;
    document.getElementById("stand_button").style.visibility = "visible";

    drawCanvas();


    //deals two cards to start off the game
    dealPlayerCard();
    dealPlayerCard();

    //deals two cards to the dealer
    dealDealerCard();
    dealDealerCard();
    
}


