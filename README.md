## cyb snap

**Yes, you can use Metamask to communicate and create transaction in cosmos-sdk based chains.**

### About

This is snap. Snaps bring endless possibilities to Metamask and rocks web3 users' experience/adoption. Read Metamask team [announcment](https://medium.com/metamask/introducing-the-next-evolution-of-the-web3-wallet-4abdf801a4ee).

cyb snap allows you to communicate with [cyber](https://github.com/cybercongress/go-cyber) - consensus supercomputer for computing relevance in The Great Web or, simply, decentralized Google. [#fuckgoogle](t.me/fuckgoogle)

cyb snap allows you to create cyberlinks + send tokens, and perform staking, distribution and governance actions in cyber/cosmos-sdk based networks.

cyb snap going to be integrated to [cyber.page](https://cyber.page) soon, follow dot-cyber [release board](https://github.com/cybercongress/dot-cyber/projects/5)

PS: as cyber based on cosmos-SDK that's the first case of using Metamask and Snaps to work with the non-Ethereum chain and using different cryptography.

### Security

Metamask's plugin system or snaps' main core features are the advanced keys system and permissions-based access to extended API. It generates unique private keys for a given snap from your core mnemonic and snap origin url. Snap works using specially generated for their domain keys, contract accounts.

### Prepare
First, you need to install [MetaMask Snaps Beta](https://github.com/MetaMask/metamask-snaps-beta). Read the [Wiki](https://github.com/MetaMask/metamask-snaps-beta/wiki).

Recommend local build against developer branch (maybe broken, worked on 220784cafd2e22bed083e385ef247810660966db) and install unpacked extension to your Chrome.

Second, you need to install [Snaps-CLI](https://github.com/MetaMask/metamask-snaps-beta) to build and serve cyb snap locally.

### Development

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
For developers and hightly motivated users from metamask/cyber/cosmos community.

- All end-user msgs support
- Build/sign txs
- Node API/LCD calls
- State managment for multiple chain support
- Basic frontend as playground

### Implemented messages
#### Link
- cyberd/Link
#### Bank
- cosmos-sdk/MsgSend
- cosmos-sdk/MsgMultiSend
#### Staking
- cosmos-sdk/MsgDelegate
- cosmos-sdk/MsgBeginRedelegate
- cosmos-sdk/MsgUndelegate
#### Distribution
- cosmos-sdk/MsgWithdrawDelegationReward
#### Governance
- cosmos-sdk/MsgSubmitProposal
- cosmos-sdk/TextProposal
- cosmos-sdk/CommunityPoolSpendProposal
- cosmos-sdk/ParameterChangeProposal
- cosmos-sdk/MsgDeposit
- cosmos-sdk/MsgVote

### Roadmap
- [x] cyber support 
- [x] cosmos-sdk based chains support
- [x] dynamic chain configuration
- [x] dynamic node connection configuration
- [ ] apply for dev grant from cosmos community pool
- [ ] migration to full-featured cosmos client library
- [ ] versioning
- [ ] cosmwasm support
- [ ] descrease dependency list
- [ ] await official metamask release with snap support
- [ ] IKC/IBC protocols support

### Contribute
You are invited to contribute new features, fixes, or updates - large or small. We are always thrilled to receive pull requests and do our best to process them as fast as we can. 

### Gitcoin
<a href="https://gitcoin.co/explorer?q=congress">
    <img src="https://gitcoin.co/funding/embed?repo=https://github.com/cybercongress/cyb-snap">
</a>

### License
Cyber License - Don’t believe, don’t fear, don’t ask.

<div align="center">
 <sub>Built by
 <a href="https://twitter.com/cyber_devs">cyber~Congress</a> and
 <a href="https://github.com/cybercongress/cyberd/graphs/contributors">contributors</a>
</div>