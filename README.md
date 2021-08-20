# minecraft-sniffer
Node.js Minecraft Proxy which displays packets. Supports Minecraft >= 1.7.4

## How To:
1. Start a local minecraft server (>= 1.7.4) at localhost on 25565. **Important:** Disable *online-mode*, as this proxy does not support encryption.
2. Install node and npm
3. Run `npm install`
4. Run `npm start`
5. Open your Minecraft client and connect to localhost:25566

You will be able to play minecraft as usual. All packages sent by the client and the server will be sent to stdout. Server packets will be in blue, client packets in green.

## License
[MIT](LICENSE)

## Author
[Jan Melcher](https://github.com/Yogu)

## Credits
* Using the [minecraft-protocol](https://github.com/superjoe30/node-minecraft-protocol) package for parsing the packages
* Special thanks to the contributors to the [MinecraftCoalition Wiki](http://wiki.vg/)

