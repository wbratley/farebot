import * as discord from 'discord.js'
import * as config from './config.json'

const client = new discord.Client();
const prefix = "!";

function getFare(warpCells: number): number{
    const unroundedFare = (warpCells * 13000 + 150000) * 1.225;
    const remainder = 25000 - unroundedFare % 25000;
    return unroundedFare + remainder;

}

client.on("message", function(message : discord.Message){
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if(command == "fare"){

        if(args.length == 0) message.reply("One way fare calculations (use !fare-rt for round trip)\n**!fare** <num warp cells>\n**!fare** <weight (t)> <distance (su)>\n**!fare** <ship weight (t)> <cargo weight (t)> <distance (su)>");

        if(args.length == 1) {
           
            const fare = getFare(parseInt(args[0]));
            message.reply("Fare : " + fare + "h")    
        }

        if (args.length == 2) {
            const weight = parseFloat(args[0]);
            const distance = parseFloat(args[1]);
            const cells = Math.ceil(weight * distance * 0.00025);
            const fare = getFare(cells);
            message.reply("Fare : " + fare + "h");
        }

        if (args.length == 3) {
            const weightShip = parseFloat(args[0]);
            const weightCargo = parseFloat(args[1]);
            const distance = parseFloat(args[2]);
            const cells = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
            const fare = getFare(cells);
            message.reply("Fare : " + fare + "h");
        }
    }

    if(command == "fare-rt"){

        if(args.length == 0) message.reply("Round trip fare calculations\n**!fare-rt** <num warp cells>\n**!fare-rt** <ship weight (t)> <distance (su)>\n**!fare-rt** <ship weight (t)> <cargo weight (t)> <distance (su)>");

        if(args.length == 1) {
           
            const fare = getFare(parseInt(args[0])*2);
            message.reply("Fare : " + fare + "h")    
        }

        if(args.length == 2) {
           
            const weight = parseFloat(args[0]);
            const distance = parseFloat(args[1]);
            const cells = Math.ceil(weight * distance * 0.00025);
            const fare = getFare(cells*2);
            message.reply("Fare : " + fare + "h"); 
        }

        if (args.length == 3) {
            const weightShip = parseFloat(args[0]);
            const weightCargo = parseFloat(args[1]);
            const distance = parseFloat(args[2]);
            const cellsThere = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
            const cellsBack = Math.ceil((weightShip) * distance * 0.00025);
            const fare = getFare(cellsThere + cellsBack);
            message.reply("Fare : " + fare + "h");
        }
    }
})

client.login(config.BOT_TOKEN);

