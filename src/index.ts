import * as discord from 'discord.js'

const client = new discord.Client();
const prefix = "!";

function getFare(warpCells: number): number{
    const unroundedFare = (warpCells * 13000 + 150000) * 1.225;
    const remainder = 25000 - unroundedFare % 25000;
    return unroundedFare + remainder;
}


function showCommandsCommand(args: string[]): discord.MessageEmbed{
    return new discord.MessageEmbed()
    .setTitle('Farebot Commands:')
    .setColor(0x00ff00)
    .setDescription(
        `**!commands** - Display this message
        **!warp-fare** - Calculate one way fare for travel between planets
        **!warp-fare-rt** - Calculate round trip fare for travel between planets`);

}

function warpFareCommand(args: string[]): discord.MessageEmbed{

    if(args.length == 0) {
        return new discord.MessageEmbed()
            .setTitle('One way fare calculations:')
            .setColor(0xff0000)
            .setDescription(
                `**!warp-fare** <num warp cells>
                **!warp-fare** <weight (t)> <distance (su)>
                **!warp-fare** <ship weight (t)> <cargo weight (t)> <distance (su)>`);
    }

    if(args.length == 1) {
        const fare = getFare(parseInt(args[0]));
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription("Fare : " + fare + "ħ");
    }

    if (args.length == 2) {
        const weight = parseFloat(args[0]);
        const distance = parseFloat(args[1]);
        const cells = Math.ceil(weight * distance * 0.00025);
        const fare = getFare(cells);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription("Fare : " + fare + "ħ");
    }

    if (args.length == 3) {
        const weightShip = parseFloat(args[0]);
        const weightCargo = parseFloat(args[1]);
        const distance = parseFloat(args[2]);
        const cells = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
        const fare = getFare(cells);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription("Fare : " + fare + "ħ");
    }
}

function sendResponse(message: discord.Message, response: discord.MessageEmbed){
    message.channel.send(response);
}

function warpFareRoundTripCommand(args: string[]): discord.MessageEmbed{
    if(args.length == 0) {
        return new discord.MessageEmbed()
        .setTitle('Round trip fare calculations:')
        .setColor(0xff0000)
        .setDescription(
            `**!warp-fare-rt** <num warp cells>
            **!warp-fare-rt** <ship weight (t)> <distance (su)>
            **!warp-fare-rt** <ship weight (t)> <cargo weight (t)> <distance (su)>`);
    }

    if(args.length == 1) {
        const fare = getFare(parseInt(args[0])*2);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription("Fare : " + fare + "ħ"); 
    }

    if(args.length == 2) {
        
        const weight = parseFloat(args[0]);
        const distance = parseFloat(args[1]);
        const cells = Math.ceil(weight * distance * 0.00025);
        const fare = getFare(cells*2);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription("Fare : " + fare + "ħ"); 
    }

    if (args.length == 3) {
        const weightShip = parseFloat(args[0]);
        const weightCargo = parseFloat(args[1]);
        const distance = parseFloat(args[2]);
        const cellsThere = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
        const cellsBack = Math.ceil((weightShip) * distance * 0.00025);
        const fare = getFare(cellsThere + cellsBack);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription("Fare : " + fare + "ħ"); 
    }
}

client.on("message", function(message : discord.Message){

     if(message.author.bot) return;
     if(!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    let response : discord.MessageEmbed = null;

    if(command == 'commands' || command == 'help')  response = showCommandsCommand(args);
    if(command == 'warp-fare')  response = warpFareCommand(args);
    if(command == 'warp-fare-rt')  response = warpFareRoundTripCommand(args);

   

    if(response != null)
         sendResponse(message, response);
})

client.login(process.env.BOT_TOKEN);

