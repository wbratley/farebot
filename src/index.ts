import * as discord from 'discord.js'

const client = new discord.Client();
const prefix = "!";

function getFare(warpCells: number): number{
    const unroundedFare = (warpCells * 13000 + 150000) * 1.225;
    const remainder = 25000 - unroundedFare % 25000;
    return unroundedFare + remainder;

}

function warpFareCommand(args: string[]): string{
    if(args.length == 0) 
    return
        `One way fare calculations (use !warp-fare-rt for round trip):
        **!warp-fare** <num warp cells>
        **!warp-fare** <weight (t)> <distance (su)>
        **!warp-fare** <ship weight (t)> <cargo weight (t)> <distance (su)>`;

    if(args.length == 1) {
        const fare = getFare(parseInt(args[0]));
       return "Fare : " + fare + "ħ";    
    }

    if (args.length == 2) {
        const weight = parseFloat(args[0]);
        const distance = parseFloat(args[1]);
        const cells = Math.ceil(weight * distance * 0.00025);
        const fare = getFare(cells);
        return "Fare : " + fare + "ħ";
    }

    if (args.length == 3) {
        const weightShip = parseFloat(args[0]);
        const weightCargo = parseFloat(args[1]);
        const distance = parseFloat(args[2]);
        const cells = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
        const fare = getFare(cells);
        return "Fare : " + fare + "ħ";
    }
}

function sendResponse(message: discord.Message, response: string){
    message.channel.send(">>> " + response + " >>>");
}

function warpFareRoundTripCommand(args: string[]): string{
    if(args.length == 0) 
       return
            `Round trip fare calculations:
            **!warp-fare-rt** <num warp cells>
            **!warp-fare-rt** <ship weight (t)> <distance (su)>
            **!warp-fare-rt** <ship weight (t)> <cargo weight (t)> <distance (su)>`;

    if(args.length == 1) {
        const fare = getFare(parseInt(args[0])*2);
        return "Fare : " + fare + "ħ";   
    }

    if(args.length == 2) {
        
        const weight = parseFloat(args[0]);
        const distance = parseFloat(args[1]);
        const cells = Math.ceil(weight * distance * 0.00025);
        const fare = getFare(cells*2);
        return "Fare : " + fare + "ħ";
    }

    if (args.length == 3) {
        const weightShip = parseFloat(args[0]);
        const weightCargo = parseFloat(args[1]);
        const distance = parseFloat(args[2]);
        const cellsThere = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
        const cellsBack = Math.ceil((weightShip) * distance * 0.00025);
        const fare = getFare(cellsThere + cellsBack);
        return "Fare : " + fare + "ħ";
    }
}

client.on("message", function(message : discord.Message){
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ').filter(e => e!=null);
    const command = args.shift().toLowerCase();

    let response = null;
    switch(command){
        case 'warp-fare': response = warpFareCommand(args); break;
        case 'warp-fare-rt': response = warpFareRoundTripCommand(args); break;
    }

    if(response != null)
        sendResponse(message, response);
})

client.login(process.env.BOT_TOKEN);

