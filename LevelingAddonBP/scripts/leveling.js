import { system, world, player } from "@minecraft/server";
import { Storage } from "@minecraft/server-storage";
import * as ui from "@minecraft/server-ui";

const BASE_XP = 2000;
const XP_SCALING = 1.2;
const storage = new Storage("leveling_data");

let playerData = new Map();

// Load data on player join
world.events.playerJoin.subscribe((event) => {
    let player = event.player;
    let storedData = storage.get(player.name);
    if (storedData) {
        playerData.set(player.name, JSON.parse(storedData));
    } else {
        playerData.set(player.name, { level: 0, xp: 0, skillPoints: 0, Strength: 0, Agility: 0, Vitality: 0, Intellect: 0, Resolve: 0, Karma: 0 });
    }
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        let data = playerData.get(player.name) || { level: 0, xp: 0, skillPoints: 0, Strength: 0, Agility: 0, Vitality: 0, Intellect: 0, Resolve: 0, Karma: 0 };
        let requiredXP = Math.floor(BASE_XP * Math.pow(XP_SCALING, data.level));

        if (data.xp >= requiredXP) {
            data.level++;
            data.xp -= requiredXP;
            data.skillPoints += 3;
            player.sendMessage(`§aLevel Up! You are now level ${data.level} and gained 3 skill points.`);
        }

        // Apply attribute effects
        player.setDynamicProperty("minecraft:attack_damage", 1 + (data.Strength * 0.01));
        player.setDynamicProperty("minecraft:movement", 0.1 + (data.Agility * 0.01));
        player.setDynamicProperty("minecraft:health", 20 + (data.Vitality * 1));
        player.setDynamicProperty("minecraft:luck", data.Karma * 0.01);

        playerData.set(player.name, data);
        storage.set(player.name, JSON.stringify(data)); // Save data persistently
    }
}, 20);

world.events.playerExperienceChanged.subscribe((event) => {
    let player = event.player;
    let data = playerData.get(player.name) || { level: 0, xp: 0, skillPoints: 0, Strength: 0, Agility: 0, Vitality: 0, Intellect: 0, Resolve: 0, Karma: 0 };
    data.xp = event.newValue;
    playerData.set(player.name, data);
    storage.set(player.name, JSON.stringify(data)); // Save XP changes persistently
});

// Open Attribute Menu via Chat Command
world.events.beforeChat.subscribe((event) => {
    let player = event.sender;
    if (event.message === "/attributes") {
        event.cancel = true;
        openAttributeMenu(player);
    }
});

function openAttributeMenu(player) {
    let data = playerData.get(player.name) || { level: 0, skillPoints: 0, Strength: 0, Agility: 0, Vitality: 0, Intellect: 0, Resolve: 0, Karma: 0 };
    let form = new ui.ActionFormData()
        .title("Attributes")
        .body(`Skill Points Available: ${data.skillPoints}`)
        .button(`Strength: ${data.Strength}`)
        .button(`Agility: ${data.Agility}`)
        .button(`Vitality: ${data.Vitality}`)
        .button(`Intellect: ${data.Intellect}`)
        .button(`Resolve: ${data.Resolve}`)
        .button(`Karma: ${data.Karma}`);

    form.show(player).then((response) => {
        if (!response.canceled) {
            let attributes = ["Strength", "Agility", "Vitality", "Intellect", "Resolve", "Karma"];
            let attribute = attributes[response.selection];
            if (data.skillPoints > 0) {
                data.skillPoints--;
                data[attribute]++;
                player.sendMessage(`§aAdded 1 point to ${attribute}!`);
            } else {
                player.sendMessage("§cNo skill points available!");
            }
            playerData.set(player.name, data);
            storage.set(player.name, JSON.stringify(data));
        }
    });
}
