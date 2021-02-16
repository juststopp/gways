const util = require("util")
fs = require("fs")
readdir = util.promisify(fs.readdir)
fs = require("fs")

const Gways = require("./base/gways"),
    client = new Gways({
        partials: ["REACTION", "MESSAGE", "CHANNEL"]
    });

const init = async () => {
    let directories = await readdir("./commands/");
    directories.forEach(async (dir) => {
        let commands = await readdir("./commands/" + dir + "/");
        commands.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
            const response = client.loadCommand("./commands/" + dir, cmd);
            if (response) {
                console.log(response, "error");
            }
        });
    });

    const evtFiles = await readdir("./events/");
    evtFiles.forEach((file) => {
        const eventName = file.split(".")[0];
        const event = new (require(`./events/${file}`))(client);
        client.on(eventName, (...args) => event.run(...args));
        delete require.cache[require.resolve(`./events/${file}`)];
    });

    await client.login(client.config.token);

    require('./dashboard/index.js').run(client);

    setTimeout(() => {
        require("./timer/end.js").run(client)
        require("./timer/timer.js").run(client)
        require("./timer/check.js").run(client)
        require("./dbl.js").run(client)
    }, 5000);
};

init();