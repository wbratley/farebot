import * as discord from 'discord.js'
import { Pos } from './models/position';
import * as mathjs from 'mathjs';

const client = new discord.Client();
const prefix = "!";
let quanta = "ħ";
const taxiFlagFail = 25000;
const costPerKm = 400;
const taxiFareIncrement = 100;

function getWarpFare(warpCells: number): number{
    const unroundedFare = (warpCells * 13000 + 150000) * 1.225;
    const remainder = 25000 - unroundedFare % 25000;
    return unroundedFare + remainder;
}

function roundUpFare(unroundedFare: number, increment:number): number{
    const remainder = 100 - unroundedFare % 100;
    return unroundedFare + remainder;
}


function getTaxiFare(distance: number): number{
    const unroundedFare = Math.ceil(distance * costPerKm + taxiFlagFail);
    return roundUpFare(unroundedFare, taxiFareIncrement);
}

function parsePos(pos :string) : Pos {

    //::pos{0,26,72.8767,92.6003,30.1266}

    const parts = pos.split(',');
    const result : Pos = {
         x: parseFloat(parts[2]),
         y: parseFloat(parts[3]),
         z: parseFloat(parts[4])
    };

    return result;
}

function getDistance(fromPos: Pos, toPos: Pos): number {
    const dist = mathjs.distance([fromPos.x,fromPos.y,fromPos.z],[toPos.x,toPos.y,toPos.z]);
    return mathjs.number(dist) as number;
}

function showCommandsCommand(args: string[]): discord.MessageEmbed{
    return new discord.MessageEmbed()
    .setTitle('Farebot Commands:')
    .setColor(0x00ff00)
    .setDescription(
        `**!commands** - Display this message
        **!distance-km** - Calculate distance between two ::pos on the same planet (km)
        **!warp-fare** - Calculate one way fare for travel between planets
        **!warp-fare-rt** - Calculate round trip fare for travel between planets
        **!taxi-fare** - Calculate one way fare for planary travel (passenger only)
        **!taxi-fare-rt** - Calculate round trip fare for planary travel (passenger only)
        `);

}

function warpFareCommand(args: string[]): discord.MessageEmbed{

    if(args.length == 0) {
        return new discord.MessageEmbed()
            .setTitle('One way interplanetary fare calculations:')
            .setColor(0xff0000)
            .setDescription(
                `**!warp-fare** <num warp cells>
                **!warp-fare** <weight (t)> <distance (su)>
                **!warp-fare** <ship weight (t)> <cargo weight (t)> <distance (su)>`);
    }

    if(args.length == 1) {
        const fare = getWarpFare(parseInt(args[0]));
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta);
    }

    if (args.length == 2) {
        const weight = parseFloat(args[0]);
        const distance = parseFloat(args[1]);
        const cells = Math.ceil(weight * distance * 0.00025);
        const fare = getWarpFare(cells);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta);
    }

    if (args.length == 3) {
        const weightShip = parseFloat(args[0]);
        const weightCargo = parseFloat(args[1]);
        const distance = parseFloat(args[2]);
        const cells = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
        const fare = getWarpFare(cells);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta);
    }
}

function sendResponse(message: discord.Message, response: discord.MessageEmbed){
    message.channel.send(response);
}

function warpFareRoundTripCommand(args: string[]): discord.MessageEmbed{
    if(args.length == 0) {
        return new discord.MessageEmbed()
        .setTitle('Round trip interplanetary fare calculations:')
        .setColor(0xff0000)
        .setDescription(
            `**!warp-fare-rt** <num warp cells>
            **!warp-fare-rt** <ship weight (t)> <distance (su)>
            **!warp-fare-rt** <ship weight (t)> <cargo weight (t)> <distance (su)>`);
    }

    if(args.length == 1) {
        const fare = getWarpFare(parseInt(args[0])*2);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta); 
    }

    if(args.length == 2) {
        
        const weight = parseFloat(args[0]);
        const distance = parseFloat(args[1]);
        const cells = Math.ceil(weight * distance * 0.00025);
        const fare = getWarpFare(cells*2);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta); 
    }

    if (args.length == 3) {
        const weightShip = parseFloat(args[0]);
        const weightCargo = parseFloat(args[1]);
        const distance = parseFloat(args[2]);
        const cellsThere = Math.ceil((weightShip + weightCargo) * distance * 0.00025);
        const cellsBack = Math.ceil((weightShip) * distance * 0.00025);
        const fare = getWarpFare(cellsThere + cellsBack);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta); 
    }
}


function taxiFareCommand(args: string[]): discord.MessageEmbed{

    if(args.length == 0) {
        return new discord.MessageEmbed()
            .setTitle('One way planetary fare calculations (passenger only):')
            .setColor(0xff0000)
            .setDescription(
                `**!taxi-fare** <distance (km)>
                **!taxi-fare** <from ::pos> <to ::pos>`);
    }

    if(args.length == 1) {
        const fare = getTaxiFare(parseFloat(args[0]));
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta);
    }

    if(args.length == 2) {

        const from = parsePos(args[0]);
        const to = parsePos(args[1]);
        const distance = getDistance(from, to);

        const fare = getTaxiFare(distance);
        return new discord.MessageEmbed()
            .setColor(0x0000ff)
            .setDescription(
`**Distance:** ${Math.round(distance * 100) / 100} km
**Fare:** ${fare + quanta}`);
    }
}

function taxiFareRoundTripCommand(args: string[]): discord.MessageEmbed{

    if(args.length == 0) {
        return new discord.MessageEmbed()
            .setTitle('Round trip planetary fare calculations (passenger only):')
            .setColor(0xff0000)
            .setDescription(
                `**!taxi-fare-rt** <distance (km)>
                **!taxi-fare** <from ::pos> <to ::pos>`);
    }

    if(args.length == 1) {
        const fare = getTaxiFare(parseFloat(args[0])*2);
        return new discord.MessageEmbed()
            .setTitle('Fare:')
            .setColor(0x0000ff)
            .setDescription(fare + quanta);
    }

    if(args.length == 2) {

        const from = parsePos(args[0]);
        const to = parsePos(args[1]);
        const distance = getDistance(from, to)*2;

        const fare = getTaxiFare(distance);
        return new discord.MessageEmbed()
            .setColor(0x0000ff)
            .setDescription(
`**Distance:** ${Math.round(distance * 100) / 100} km
**Fare:** ${fare + quanta}`);
    }
}

function getDistanceKm(args: string[]): discord.MessageEmbed{

    if(args.length == 0) {
        return new discord.MessageEmbed()
            .setTitle('Calculate distance between two ::pos (km):')
            .setColor(0xff0000)
            .setDescription(
                `**!distance-km** <from ::pos> <to ::pos>`);
    }

    if(args.length == 2) {
        const from = parsePos(args[0]);
        const to = parsePos(args[1]);
        const distance = getDistance(from, to);
        return new discord.MessageEmbed()
            .setTitle('Distance:')
            .setColor(0x0000ff)
            .setDescription(Math.round(distance * 100) / 100 +' km');
    }
}

function getDistanceSu(args: string[]): discord.MessageEmbed{

    if(args.length == 0) {
        return new discord.MessageEmbed()
            .setTitle('Calculate distance between two ::pos (su):')
            .setColor(0xff0000)
            .setDescription(
                `**!distance-su** <from ::pos> <to ::pos>`);
    }

    if(args.length == 2) {
        const from = parsePos(args[0]);
        const to = parsePos(args[1]);
        const distance = getDistance(from, to)/200;
        return new discord.MessageEmbed()
            .setTitle('Distance:')
            .setColor(0x0000ff)
            .setDescription(Math.round(distance * 100) / 100 +' su');
    }
}


client.on("message", function(message : discord.Message){

     if(message.author.bot) return;
     if(!message.content.startsWith(prefix)) return;

     const quantaEmoji = client.emojis.cache.find(emoji => emoji.name === "quanta");
     quanta = `${quantaEmoji}`;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    let response : discord.MessageEmbed = null;

    if(command == 'commands' || command == 'help')  response = showCommandsCommand(args);
    if(command == 'distance-km')  response = getDistanceKm(args);
    //if(command == 'distance-su')  response = getDistanceSu(args);
    if(command == 'warp-fare')  response = warpFareCommand(args);
    if(command == 'warp-fare-rt')  response = warpFareRoundTripCommand(args);
    if(command == 'taxi-fare')  response = taxiFareCommand(args);
    if(command == 'taxi-fare-rt')  response = taxiFareRoundTripCommand(args);

   

    if(response != null)
         sendResponse(message, response);
})

client.login(process.env.BOT_TOKEN);

