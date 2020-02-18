## cyb snap

### About

This is snap. Snaps bring endless possibilities to Metamask and rocks web3 users' experience/adoption. Read Metamask team [announcment](https://medium.com/metamask/introducing-the-next-evolution-of-the-web3-wallet-4abdf801a4ee).

cyb snap allows you to communicate with cyber - consensus supercomputer for computing relevance in The Great Web or, simply, decentralized Google. [#fuckgoogle](t.me/fuckgoogle)

cyb snap allows you to create cyberlinks and send tokens in cyber networks.

PS: as cyber based on cosmos-SDK that's the first case of using Metamask and Snaps to work with the non-Ethereum chain.

### Security

Metamask's plugin system or snaps' main core features are the advanced keys system and permissions-based access to extended API. It generates unique private keys for a given snap from your core mnemonic. Snap works using specially generated for their domain keys, contract accounts.

### Prepare
First, you need to install [MetaMask Snaps Beta](https://github.com/MetaMask/metamask-snaps-beta). Read the [Wiki](https://github.com/MetaMask/metamask-snaps-beta/wiki).

Recommend local build against developer branch (maybe broken, worked on 220784cafd2e22bed083e385ef247810660966db) and install unpacked extension to your Chrome.

Second, you need to install [Snaps-CLI](https://github.com/MetaMask/metamask-snaps-beta) to build and serve cyb snap locally.

### Install

```
git clone https://github.com/cybercongress/cyb-snap
cd cyb-snap
npm install
mm-snap build
mm-snap serve
```

Open localhost:8084 and press connect. Metamask will ask you to add snap and provide needed to snap permissions. 

Note to devs: mm-snap serve will update your front-side but to update snap's bundle code and you need to build bundle after changes, remove plugin and permissions from metamask and install them again pressing connect.

### Status
This is a useful PoC.

- [x] Communication with cyber (rpc calls / create and sign txs)
- [x] Get your account info
- [x] Get your bandwidth
- [x] Get network status
- [x] Create cyberlink
- [x] Send tokens

### Roadmap

### Gitcoin
